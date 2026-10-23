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

export default async function (req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido' }, 405);
  }

  try {
    const body = await req.json();
    const confirmed = body.confirmed === true;
    const businessName = typeof body.businessName === 'string' ? body.businessName.trim() : '';
    const city = typeof body.city === 'string' ? body.city.trim() : null;
    const category = typeof body.category === 'string' ? body.category.trim() : null;
    const website = typeof body.website === 'string' ? body.website.trim() : null;
    const phone = typeof body.phone === 'string' ? body.phone.trim() : null;
    const address = typeof body.address === 'string' ? body.address.trim() : null;
    const rating = body.rating === null || body.rating === undefined ? null : Number(body.rating);
    const reviewsCount = body.reviewsCount === null || body.reviewsCount === undefined ? null : Number(body.reviewsCount);
    const photosCount = body.photosCount === null || body.photosCount === undefined ? null : Number(body.photosCount);
    const citations = Array.isArray(body.citations) ? body.citations.slice(0, 20) : [];
    const inputUrl = typeof body.inputUrl === 'string' ? body.inputUrl.trim() : null;

    if (!confirmed || !businessName) {
      return jsonResponse({ error: 'Confirme a empresa para continuar.' }, 400);
    }

    const baseUrl = Deno.env.get('INSFORGE_BASE_URL');
    const adminKey = Deno.env.get('API_KEY');
    if (!baseUrl || !adminKey) {
      return jsonResponse({ error: 'Configuração do servidor incompleta.' }, 500);
    }

    const client = createClient({ baseUrl, anonKey: adminKey });

    const ip = getClientIp(req);
    const ipHash = await sha256Hex(ip);
    const key = `analyze:${ipHash}:${businessName}:${city}`;
    const rl = await client.database.rpc('consume_rate_limit', {
      p_key: key.slice(0, 200),
      p_limit: 5,
      p_window_seconds: 3600,
    });
    if (rl.error) {
      return jsonResponse({ error: 'Erro de limitação.' }, 429);
    }
    const rlRow = Array.isArray(rl.data) ? rl.data[0] : rl.data;
    if (!rlRow?.allowed) {
      return jsonResponse({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, 429);
    }

    const signals = {
      hasWebsite: website ? true : null,
      hasPhone: phone ? true : null,
      hasAddress: address ? true : null,
      hasHours: body.hasHours === true ? true : body.hasHours === false ? false : null,
      hasPhotos: photosCount && photosCount > 0 ? true : null,
      rating: rating,
      reviewsCount: reviewsCount,
    };

    const profile = {
      businessName,
      city,
      category,
      website,
      phone,
      address,
      rating,
      reviewsCount,
      photosCount,
      signals,
    };

    // Simple scoring inline (mirror domain/analysis without heavy deps)
    let score = 30;
    if (rating !== null && rating >= 4.9) score += 14;
    else if (rating !== null && rating >= 4.5) score += 11;
    else if (rating !== null) score += 5;
    else score += 2;
    if (reviewsCount !== null && reviewsCount >= 90) score += 10;
    else if (reviewsCount !== null && reviewsCount >= 40) score += 7;
    else if (reviewsCount !== null) score += 3;
    else score += 2;
    if (website) score += 8; else score += 2;
    if (phone) score += 6; else score += 2;
    if (address) score += 3; else score += 1;
    if (category) score += 6; else score += 2;
    score = Math.max(0, Math.min(100, score));

    const audit = {
      score,
      pillars: {
        reputation: { earned: Math.min(32, Math.round(score * 0.32)), max: 32, label: 'Reputação e Avaliações' },
        visual: { earned: Math.min(20, Math.round(score * 0.2)), max: 20, label: 'Mídia e Fotos' },
        completeness: { earned: Math.min(28, Math.round(score * 0.28)), max: 28, label: 'Completude' },
        localSeo: { earned: Math.min(20, Math.round(score * 0.2)), max: 20, label: 'Sinais Locais' },
      },
      criticalIssues: [
        ...(website ? [] : [{ title: 'Site não identificado', desc: 'Sem site público confirmado.', impact: 'ALTO', service: 'Presença web' }]),
        ...(phone ? [] : [{ title: 'Telefone não identificado', desc: 'Sem telefone público confirmado.', impact: 'ALTO', service: 'Contato' }]),
        ...(rating !== null ? [] : [{ title: 'Avaliação não verificada', desc: 'Nota pública não confirmada.', impact: 'MÉDIO', service: 'Verificação' }]),
      ],
      passedPoints: [
        ...(rating !== null && rating >= 4.5 ? [{ title: `Nota pública ${rating.toFixed(1)} ★`, desc: 'Boa reputação.' }] : []),
        ...(reviewsCount && reviewsCount >= 40 ? [{ title: `${reviewsCount} avaliações públicas`, desc: 'Volume relevante.' }] : []),
      ],
      classification: {
        level: score >= 70 ? 'Presença pública boa' : 'Presença pública a fortalecer',
        color: score >= 70 ? 'text-amber-400' : 'text-rose-400',
        bgColor: score >= 70 ? 'bg-amber-500/10' : 'bg-rose-500/10',
        borderColor: score >= 70 ? 'border-amber-500/30' : 'border-rose-500/30',
        badge: score >= 70 ? 'Oportunidades identificadas' : 'Gargalos identificados',
        summary: 'Análise com base em sinais públicos verificáveis. Dados privados exigem importação manual.',
        urgency: score >= 70 ? 'Oportunidade de melhoria' : 'Prioritário',
      },
    };

    const preview = {
      score,
      classification: audit.classification,
      topIssues: audit.criticalIssues.slice(0, 3),
    };

    const report = {
      business: profile,
      audit,
      preview,
      telemetryNotice: 'Métricas privadas não foram obtidas. Use importação manual ou simulação transparente.',
      generatedAt: new Date().toISOString(),
    };

    const insert = await client.database.from('analyses').insert([{
      source: 'public_search',
      input_url: inputUrl,
      place_query: businessName,
      business_name: businessName,
      city,
      category,
      website,
      phone,
      address,
      rating,
      reviews_count: reviewsCount,
      photos_count: photosCount,
      profile_json: profile,
      public_signals: signals,
      score,
      audit_json: audit,
      report_json: report,
      citations,
      is_demo: false,
    }]).select('id');

    if (insert.error) {
      return jsonResponse({ error: 'Erro ao salvar análise.' }, 500);
    }

    const row = Array.isArray(insert.data) ? insert.data[0] : insert.data;
    return jsonResponse({ success: true, analysisId: row?.id, preview, unlocked: false });
  } catch (e: any) {
    return jsonResponse({ error: 'Erro ao analisar empresa.', details: e?.message }, 500);
  }
}
