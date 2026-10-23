import { createClient } from 'npm:@insforge/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

async function sha256Hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function normalizeWhatsApp(raw: string): string {
  return raw.replace(/[^0-9]/g, '');
}

function isValidWhatsApp(digits: string): boolean {
  return /^[1-9][0-9]{9,14}$/.test(digits);
}

export default async function (req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido' }, 405);
  }

  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const whatsappRaw = typeof body.whatsapp === 'string' ? body.whatsapp.trim() : '';
    const email = typeof body.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase() : null;
    const consent = body.consent === true;
    const analysisId = typeof body.analysisId === 'string' ? body.analysisId : null;
    const businessName = typeof body.businessName === 'string' ? body.businessName.trim() : null;
    const city = typeof body.city === 'string' ? body.city.trim() : null;
    const honeypot = typeof body.website === 'string' ? body.website.trim() : '';

    if (honeypot) {
      return jsonResponse({ error: 'Solicitação inválida.' }, 400);
    }
    if (name.length < 2 || name.length > 120) {
      return jsonResponse({ error: 'Nome inválido.' }, 400);
    }
    const wa = normalizeWhatsApp(whatsappRaw);
    if (!isValidWhatsApp(wa)) {
      return jsonResponse({ error: 'WhatsApp inválido.' }, 400);
    }
    if (!consent) {
      return jsonResponse({ error: 'Consentimento obrigatório.' }, 400);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'E-mail inválido.' }, 400);
    }

    const baseUrl = Deno.env.get('INSFORGE_BASE_URL');
    const adminKey = Deno.env.get('API_KEY');
    if (!baseUrl || !adminKey) {
      return jsonResponse({ error: 'Configuração do servidor incompleta.' }, 500);
    }

    const client = createClient({ baseUrl, anonKey: adminKey });

    const ip = getClientIp(req);
    const ipHash = await sha256Hex(ip);
    const key = `lead:${ipHash}:${wa}`;
    const rl = await client.database.rpc('consume_rate_limit', {
      p_key: key.slice(0, 200),
      p_limit: 3,
      p_window_seconds: 3600,
    });
    if (rl.error) {
      return jsonResponse({ error: 'Erro de limitação.' }, 429);
    }
    const rlRow = Array.isArray(rl.data) ? rl.data[0] : rl.data;
    if (!rlRow?.allowed) {
      return jsonResponse({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, 429);
    }

    const insert = await client.database.from('leads').insert([{
      analysis_id: analysisId,
      name,
      whatsapp: wa,
      email,
      business_name: businessName,
      city,
      consent: true,
      consent_version: '2026-10-23',
      consent_at: new Date().toISOString(),
      status: 'new',
      source: 'organic',
      utm_source: typeof body.utmSource === 'string' ? body.utmSource.trim().slice(0, 120) : null,
      utm_medium: typeof body.utmMedium === 'string' ? body.utmMedium.trim().slice(0, 120) : null,
      utm_campaign: typeof body.utmCampaign === 'string' ? body.utmCampaign.trim().slice(0, 160) : null,
      utm_content: typeof body.utmContent === 'string' ? body.utmContent.trim().slice(0, 160) : null,
      utm_term: typeof body.utmTerm === 'string' ? body.utmTerm.trim().slice(0, 160) : null,
      referrer: typeof body.referrer === 'string' ? body.referrer.trim().slice(0, 2048) : null,
      landing_path: typeof body.landingPath === 'string' ? body.landingPath.trim().slice(0, 500) : null,
      ip_hash: ipHash,
    }]).select('id');

    if (insert.error) {
      return jsonResponse({ error: 'Erro ao salvar lead.' }, 500);
    }

    let report = null;
    if (analysisId) {
      const a = await client.database.from('analyses').select('report_json').eq('id', analysisId).maybeSingle();
      if (a.data) report = (a.data as any).report_json;
    }

    const leadRow = Array.isArray(insert.data) ? insert.data[0] : insert.data;
    return jsonResponse({ success: true, leadId: leadRow?.id, report, unlocked: true });
  } catch (e: any) {
    return jsonResponse({ error: 'Erro ao registrar lead.', details: e?.message }, 500);
  }
}
