create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days'),
  source text not null default 'public_search'
    check (source in ('public_search', 'manual_import', 'demo')),
  input_url text
    check (input_url is null or char_length(input_url) <= 2048),
  place_query text
    check (place_query is null or char_length(place_query) <= 300),
  business_name text not null
    check (char_length(btrim(business_name)) between 1 and 200),
  city text
    check (city is null or char_length(city) <= 120),
  category text
    check (category is null or char_length(category) <= 160),
  website text
    check (website is null or char_length(website) <= 2048),
  phone text
    check (phone is null or char_length(phone) <= 40),
  address text
    check (address is null or char_length(address) <= 500),
  rating numeric(2, 1)
    check (rating is null or (rating >= 0 and rating <= 5)),
  reviews_count integer
    check (reviews_count is null or reviews_count >= 0),
  photos_count integer
    check (photos_count is null or photos_count >= 0),
  has_website boolean,
  has_whatsapp boolean,
  has_hours boolean,
  lookup_confidence numeric(3, 2)
    check (lookup_confidence is null or (lookup_confidence >= 0 and lookup_confidence <= 1)),
  profile_json jsonb not null
    check (jsonb_typeof(profile_json) = 'object'),
  public_signals jsonb not null
    check (jsonb_typeof(public_signals) = 'object'),
  score integer
    check (score is null or (score >= 0 and score <= 100)),
  audit_json jsonb not null
    check (jsonb_typeof(audit_json) = 'object'),
  report_json jsonb not null
    check (jsonb_typeof(report_json) = 'object'),
  citations jsonb not null default '[]'::jsonb
    check (jsonb_typeof(citations) = 'array'),
  telemetry_json jsonb
    check (telemetry_json is null or jsonb_typeof(telemetry_json) = 'object'),
  telemetry_source text
    check (telemetry_source is null or telemetry_source in ('owner_imported', 'demo')),
  telemetry_updated_at timestamptz,
  gemini_model text
    check (gemini_model is null or char_length(gemini_model) <= 120),
  is_demo boolean not null default false
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references public.analyses(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null
    check (char_length(btrim(name)) between 2 and 120),
  whatsapp text not null
    check (whatsapp ~ '^[1-9][0-9]{9,14}$'),
  email text
    check (
      email is null
      or (
        char_length(email) <= 254
        and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
      )
    ),
  business_name text
    check (business_name is null or char_length(business_name) <= 200),
  city text
    check (city is null or char_length(city) <= 120),
  consent boolean not null
    check (consent = true),
  consent_version text not null default '2026-10-23'
    check (char_length(consent_version) between 1 and 40),
  consent_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  source text not null default 'organic'
    check (char_length(source) between 1 and 80),
  utm_source text
    check (utm_source is null or char_length(utm_source) <= 120),
  utm_medium text
    check (utm_medium is null or char_length(utm_medium) <= 120),
  utm_campaign text
    check (utm_campaign is null or char_length(utm_campaign) <= 160),
  utm_content text
    check (utm_content is null or char_length(utm_content) <= 160),
  utm_term text
    check (utm_term is null or char_length(utm_term) <= 160),
  referrer text
    check (referrer is null or char_length(referrer) <= 2048),
  landing_path text
    check (landing_path is null or char_length(landing_path) <= 500),
  ip_hash text
    check (ip_hash is null or ip_hash ~ '^[a-f0-9]{64}$'),
  notes text
    check (notes is null or char_length(notes) <= 4000)
);

create table public.rate_limit_windows (
  key text primary key
    check (char_length(key) between 8 and 200),
  window_start timestamptz not null default now(),
  count integer not null default 0
    check (count >= 0),
  updated_at timestamptz not null default now()
);

create index analyses_created_at_idx on public.analyses (created_at desc);
create index analyses_expires_at_idx on public.analyses (expires_at);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);
create index leads_analysis_id_idx on public.leads (analysis_id);
create index leads_utm_source_idx on public.leads (utm_source);
create index rate_limit_windows_updated_at_idx on public.rate_limit_windows (updated_at);

alter table public.analyses enable row level security;
alter table public.leads enable row level security;
alter table public.rate_limit_windows enable row level security;

revoke all on table public.analyses from anon, authenticated;
revoke all on table public.leads from anon, authenticated;
revoke all on table public.rate_limit_windows from anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger analyses_set_updated_at
before update on public.analyses
for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count integer;
  v_window_start timestamptz;
begin
  if p_key is null or char_length(p_key) < 8 then
    raise exception 'rate limit key is invalid';
  end if;

  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'rate limit arguments are invalid';
  end if;

  insert into public.rate_limit_windows (key, window_start, count, updated_at)
  values (p_key, v_now, 1, v_now)
  on conflict (key) do update
  set
    window_start = case
      when public.rate_limit_windows.window_start <= v_now - make_interval(secs => p_window_seconds)
        then v_now
      else public.rate_limit_windows.window_start
    end,
    count = case
      when public.rate_limit_windows.window_start <= v_now - make_interval(secs => p_window_seconds)
        then 1
      else public.rate_limit_windows.count + 1
    end,
    updated_at = v_now
  returning
    public.rate_limit_windows.count,
    public.rate_limit_windows.window_start
  into v_count, v_window_start;

  return query
  select
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    v_window_start + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;

grant execute on function public.consume_rate_limit(text, integer, integer)
  to project_admin;
