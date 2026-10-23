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
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const city = typeof body.city === 'string' ? body.city.trim() : '';

    if (!url && !name) {
      return jsonResponse({ error: 'Informe uma URL ou nome da empresa.' }, 400);
    }

    if (url) {
      try {
        const u = new URL(url);
        const host = u.hostname.toLowerCase();
        if (!host.includes('google.com') && !host.includes('maps.app.goo.gl') && !host.includes('goo.gl') && !host.includes('share.google')) {
          return jsonResponse({ error: 'URL deve ser do Google Maps ou compartilhamento do Google.' }, 400);
        }
      } catch {
        return jsonResponse({ error: 'URL inválida.' }, 400);
      }
    }

    const baseUrl = Deno.env.get('INSFORGE_BASE_URL');
    const adminKey = Deno.env.get('API_KEY');
    if (!baseUrl || !adminKey) {
      return jsonResponse({ error: 'Configuração do servidor incompleta.' }, 500);
    }

    const client = createClient({ baseUrl, anonKey: adminKey });

    const ip = getClientIp(req);
    const ipHash = await sha256Hex(ip);
    const key = `lookup:${ipHash}:${url || name}:${city}`;
    const rl = await client.database.rpc('consume_rate_limit', {
      p_key: key.slice(0, 200),
      p_limit: 10,
      p_window_seconds: 3600,
    });

    if (rl.error) {
      return jsonResponse({ error: 'Erro de limitação.' }, 429);
    }
    const rlRow = Array.isArray(rl.data) ? rl.data[0] : rl.data;
    if (!rlRow?.allowed) {
      return jsonResponse({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, 429);
    }

    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterKey) {
      return jsonResponse({ error: 'Chave OpenRouter não configurada.' }, 500);
    }

    const model = Deno.env.get('OPENROUTER_MODEL') || 'google/gemini-2.5-flash:online';
    const query = url
      ? `Busque informações públicas verificáveis desta empresa no Google Maps a partir do link: ${url}. Retorne APENAS dados que você conseguir confirmar com certeza nas fontes. Não invente valores.`
      : `Busque informações públicas verificáveis desta empresa: "${name}"${city ? ' em ' + city : ''}. Retorne APENAS dados que você conseguir confirmar com certeza nas fontes. Não invente valores.`;

    const userPrompt = `${query}

Responda em JSON válido com exatamente esta estrura (sem markdown, sem comentários):
{
  "businessName": "nome completo da empresa como aparece no Google Maps",
  "city": "cidade - UF",
  "category": "categoria principal exibida no Google (ex: Dentista, Pizzaria, Oficina Mecânica)",
  "address": "endereço completo público",
  "phone": "telefone público formatado ou null se não encontrado",
  "website": "URL do site oficial ou null se não encontrado",
  "rating": número de 0 a 5 com 1 casa decimal, ou null se não encontrado,
  "reviewsCount": número inteiro de avaliações públicas, ou null se não encontrado,
  "photosCount": número aproximado de fotos públicas, ou null se não encontrado,
  "hasHours": true ou false se o horário de funcionamento está público,
  "hasWhatsapp": true ou false se há link de WhatsApp público,
  "summary": "resumo factual de 2-3 frases sobre a presença pública desta empresa"
}

Regras:
- Use null quando não tiver certeza absoluta de um campo. NUNCA invente valores.
- rating e reviewsCount devem ser números, não strings.
- Se o link não corresponder a nenhuma empresa clara, retorne "businessName": null.`;

    const orResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('APP_ORIGIN') || 'https://localhost',
        'X-Title': 'Radar Local',
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente que extrai apenas dados públicos e verificáveis sobre empresas do Google Maps. Responda somente com JSON válido, sem markdown nem comentários. Nunca invente valores: use null quando não tiver certeza.',
          },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!orResp.ok) {
      const errText = await orResp.text().catch(() => '');
      return jsonResponse({ error: 'Erro ao consultar OpenRouter.', details: `HTTP ${orResp.status}: ${errText.slice(0, 300)}` }, 502);
    }

    const orData = await orResp.json().catch(() => ({}));
    const content: string = orData?.choices?.[0]?.message?.content || '';
    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { parsed = null; }
      }
    }

    const annotations = orData?.choices?.[0]?.message?.annotations;
    const urlCitations: string[] = Array.isArray(annotations)
      ? annotations.map((a: any) => a?.url_certificate?.url || a?.url).filter(Boolean)
      : [];
    const contentUrls = content.match(/https?:\/\/[^\s"')]+/g) || [];
    const citations = Array.from(new Set([...urlCitations, ...contentUrls])).slice(0, 20);

    if (!parsed || !parsed.businessName) {
      return jsonResponse({ success: false, error: 'Não foi possível identificar a empresa neste link. Verifique o link ou informe o nome e a cidade.' });
    }

    const candidate = {
      businessName: parsed.businessName || null,
      city: parsed.city || null,
      category: parsed.category || null,
      address: parsed.address || null,
      phone: parsed.phone || null,
      website: parsed.website || null,
      rating: typeof parsed.rating === 'number' ? parsed.rating : null,
      reviewsCount: typeof parsed.reviewsCount === 'number' ? parsed.reviewsCount : null,
      photosCount: typeof parsed.photosCount === 'number' ? parsed.photosCount : null,
      hasHours: parsed.hasHours === true,
      hasWhatsapp: parsed.hasWhatsapp === true,
      summary: parsed.summary || '',
      extracted: content.slice(0, 4000),
      citations,
      confidence: parsed.rating !== null || parsed.reviewsCount !== null ? 0.8 : 0.5,
    };

    return jsonResponse({ success: true, candidate, needsConfirmation: true });
  } catch (e: any) {
    return jsonResponse({ error: 'Erro ao buscar informações públicas.', details: e?.message }, 500);
  }
}
