<script setup lang="ts">
import { ref } from 'vue';
import { usePublicAnalysis } from '../composables/usePublicAnalysis';

const props = defineProps<{ consultantName?: string; consultantPhone?: string }>();

const pub = usePublicAnalysis();
const inputUrl = ref('');
const inputName = ref('');
const inputCity = ref('');

async function doLookup() {
  try {
    await pub.lookup({ url: inputUrl.value || undefined, name: inputName.value || undefined, city: inputCity.value || undefined });
  } catch (e) {
    // error shown
  }
}

async function doAnalyze() {
  try {
    await pub.analyze({
      confirmed: true,
      businessName: pub.candidate.value?.extracted ? (pub.candidate.value.extracted.split('\n')[0] || inputName.value) : inputName.value,
      city: inputCity.value,
      inputUrl: inputUrl.value,
      citations: pub.candidate.value?.citations || [],
    });
  } catch (e) {
    // error shown
  }
}

async function doCapture() {
  try {
    await pub.capture({
      name: pub.form.value.name,
      whatsapp: pub.form.value.whatsapp,
      email: pub.form.value.email || undefined,
      consent: pub.form.value.consent,
      website: pub.form.value.website,
    });
  } catch (e) {
    // error shown
  }
}
</script>

<template>
  <section class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
    <header class="space-y-1">
      <h2 class="text-lg font-semibold text-white">Análise pública gratuita</h2>
      <p class="text-sm text-neutral-400">Descubra o que está travando novos clientes no Google. Dados públicos + simulações transparentes.</p>
    </header>

    <div v-if="pub.step.value === 'idle' || pub.step.value === 'lookup'" class="space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input v-model="inputUrl" placeholder="Link do Google Maps (opcional)" class="px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white" />
        <input v-model="inputName" placeholder="Nome da empresa" class="px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white" />
        <input v-model="inputCity" placeholder="Cidade/Estado (opcional)" class="px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white" />
      </div>
      <button :disabled="pub.loading.value" @click="doLookup" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg text-sm">Buscar dados públicos</button>
      <p v-if="pub.error.value" class="text-sm text-rose-400">{{ pub.error.value }}</p>
    </div>

    <div v-if="pub.step.value === 'confirm'" class="space-y-3">
      <p class="text-sm text-neutral-300">Confirme se esta é a empresa correta antes de analisar.</p>
      <div class="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-300 space-y-1">
        <p class="text-white font-medium">Sugestão</p>
        <p class="whitespace-pre-wrap">{{ pub.candidate.value?.extracted?.slice(0, 600) }}</p>
        <p v-if="pub.candidate.value?.citations?.length" class="text-xs text-neutral-500">Fontes: {{ pub.candidate.value.citations.slice(0,3).join(' | ') }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="pub.step.value = 'idle'; pub.candidate.value = null" class="px-3 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300">Corrigir</button>
        <button :disabled="pub.loading.value" @click="doAnalyze" class="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg text-sm">Confirmar e analisar</button>
      </div>
      <p v-if="pub.error.value" class="text-sm text-rose-400">{{ pub.error.value }}</p>
    </div>

    <div v-if="pub.step.value === 'preview'" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-white font-medium">Prévia gratuita</h3>
        <span class="text-2xl font-bold text-white">{{ pub.preview.value?.score }}/100</span>
      </div>
      <p class="text-sm text-neutral-300">{{ pub.preview.value?.classification?.summary }}</p>
      <ul class="space-y-2">
        <li v-for="(iss, idx) in (pub.preview.value?.topIssues || [])" :key="idx" class="bg-neutral-950 border border-amber-500/30 rounded-lg p-3">
          <p class="text-sm text-white">{{ iss.title }}</p>
          <p class="text-xs text-neutral-400">{{ iss.desc }}</p>
        </li>
      </ul>
      <p class="text-xs text-neutral-500">Métricas privadas não verificadas. Projeções financeiras são simulações.</p>
      <div class="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
        <p class="text-sm text-white font-medium">Libere o relatório completo</p>
        <input v-model="pub.form.value.name" placeholder="Nome completo" class="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white" />
        <input v-model="pub.form.value.whatsapp" placeholder="WhatsApp (com DDD)" class="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white" />
        <input v-model="pub.form.value.email" placeholder="E-mail (opcional)" class="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white" />
        <label class="flex items-start gap-2 text-xs text-neutral-400">
          <input type="checkbox" v-model="pub.form.value.consent" class="mt-0.5" />
          <span>Autorizo o contato para envio do relatório. Não envio spam.</span>
        </label>
        <input v-model="pub.form.value.website" type="text" class="hidden" tabindex="-1" autocomplete="off" />
        <button :disabled="pub.loading.value" @click="doCapture" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-lg text-sm">Receber relatório completo</button>
      </div>
      <p v-if="pub.error.value" class="text-sm text-rose-400">{{ pub.error.value }}</p>
    </div>

    <div v-if="pub.step.value === 'unlocked'" class="space-y-3">
      <p class="text-white font-medium">Relatório liberado</p>
      <p class="text-sm text-neutral-300">Lead registrado. Verifique os detalhes abaixo.</p>
      <pre class="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-300 overflow-auto max-h-80">{{ JSON.stringify(pub.report.value, null, 2) }}</pre>
      <button @click="pub.reset()" class="px-3 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300">Nova análise</button>
    </div>
  </section>
</template>
