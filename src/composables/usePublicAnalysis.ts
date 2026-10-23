import { ref } from 'vue';

type Step = 'idle' | 'lookup' | 'confirm' | 'preview' | 'unlocked';

export function usePublicAnalysis() {
  const step = ref<Step>('idle');
  const loading = ref(false);
  const error = ref<string | null>(null);
  const candidate = ref<any>(null);
  const analysisId = ref<string | null>(null);
  const preview = ref<any>(null);
  const report = ref<any>(null);
  const form = ref({
    name: '',
    whatsapp: '',
    email: '',
    consent: false,
    website: '',
  });

  async function invoke(slug: string, body: any) {
    const baseUrl = import.meta.env.VITE_INSFORGE_URL;
    const res = await fetch(`${baseUrl}/functions/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Erro na solicitação');
    }
    return data;
  }

  async function lookup(payload: { url?: string; name?: string; city?: string }) {
    loading.value = true;
    error.value = null;
    try {
      const data = await invoke('lookup-business', payload);
      candidate.value = data.candidate;
      step.value = 'confirm';
      return data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function analyze(payload: any) {
    loading.value = true;
    error.value = null;
    try {
      const data = await invoke('analyze-business', payload);
      analysisId.value = data.analysisId;
      preview.value = data.preview;
      step.value = 'preview';
      return data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function capture(payload: any) {
    loading.value = true;
    error.value = null;
    try {
      const data = await invoke('capture-lead', {
        ...payload,
        analysisId: analysisId.value,
      });
      report.value = data.report;
      step.value = 'unlocked';
      return data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    step.value = 'idle';
    candidate.value = null;
    analysisId.value = null;
    preview.value = null;
    report.value = null;
    error.value = null;
  }

  return { step, loading, error, candidate, analysisId, preview, report, form, lookup, analyze, capture, reset, invoke };
}
