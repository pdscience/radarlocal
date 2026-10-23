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

export default async function (req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido' }, 405);
  }

  try {
    const body = await req.json();
    const analysisId = typeof body.analysisId === 'string' ? body.analysisId : null;
    const telemetry = body.telemetry && typeof body.telemetry === 'object' ? body.telemetry : null;

    if (!analysisId || !telemetry) {
      return jsonResponse({ error: 'Dados incompletos.' }, 400);
    }

    const baseUrl = Deno.env.get('INSFORGE_BASE_URL');
    const adminKey = Deno.env.get('API_KEY');
    if (!baseUrl || !adminKey) {
      return jsonResponse({ error: 'Configuração do servidor incompleta.' }, 500);
    }

    const client = createClient({ baseUrl, anonKey: adminKey });

    const upd = await client.database.from('analyses').update({
      telemetry_json: telemetry,
      telemetry_source: 'owner_imported',
      telemetry_updated_at: new Date().toISOString(),
    }).eq('id', analysisId);

    if (upd.error) {
      return jsonResponse({ error: 'Erro ao salvar telemetria.' }, 500);
    }

    return jsonResponse({ success: true });
  } catch (e: any) {
    return jsonResponse({ error: 'Erro ao salvar telemetria.', details: e?.message }, 500);
  }
}
