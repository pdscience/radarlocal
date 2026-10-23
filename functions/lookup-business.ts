import { createClient } from 'npm:@insforge/sdk';
import { GoogleGenAI } from 'npm:@google/genai';

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

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return jsonResponse({ error: 'Chave Gemini não configurada.' }, 500);
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const query = url
      ? `Encontre informações públicas da empresa a partir desta URL: ${url}. Se não conseguir extrair com certeza, peça confirmação com nome e cidade.`
      : `Encontre informações públicas da empresa "${name}" ${city ? 'em ' + city : ''}. Retorne apenas dados verificáveis publicamente.`;

    const resp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }] as any,
        temperature: 0.1,
      },
    });

    const text = resp.text || '';
    const candidate = {
      query,
      extracted: text.slice(0, 4000),
      citations: (resp.candidates?.[0] as any)?.groundingMetadata?.groundingChunks?.map((c: any) => c?.web?.uri).filter(Boolean) || [],
      confidence: 0.6,
    };

    return jsonResponse({ success: true, candidate, needsConfirmation: true });
  } catch (e: any) {
    return jsonResponse({ error: 'Erro ao buscar informações públicas.', details: e?.message }, 500);
  }
}
