<script setup lang="ts">
import { CheckCircle2, History, Loader2, Search, Sparkles } from '@lucide/vue';
import type { AnalysisNotification, BusinessProfile } from '../types';

const props = defineProps<{
  inputUrl: string;
  profile: BusinessProfile;
  presets: BusinessProfile[];
  isAnalyzing: boolean;
  notification: AnalysisNotification | null;
  historyCount: number;
}>();

const emit = defineEmits<{
  'update:inputUrl': [value: string];
  'update-profile': [patch: Partial<BusinessProfile>];
  analyze: [];
  'select-preset': [preset: BusinessProfile];
  'open-history': [];
  'close-notification': [];
}>();

function presetLabel(preset: BusinessProfile): string {
  if (preset.id === 'dourados-odonto') {
    return 'Dourados Odontologia (Dados Oficiais · 96 reviews · 5.0 ★)';
  }
  if (preset.id === 'pizza-nonna') return 'Pizzaria Curitiba';
  return 'Oficina BH';
}

function presetButtonClass(preset: BusinessProfile): string {
  const base = 'px-3 py-1.5 text-xs rounded-lg transition-all border';
  if (props.profile.id === preset.id) {
    if (preset.id === 'dourados-odonto') {
      return `${base} bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20 font-semibold`;
    }
    if (preset.id === 'pizza-nonna') {
      return `${base} bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold`;
    }
    return `${base} bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-semibold`;
  }
  return `${base} bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 font-medium`;
}
</script>

<template>
  <section class="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider">
          <span>Passo 1</span>
          <span>·</span>
          <span>Analisar Link ou Sincronizar Dados Reais</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight text-balance">
          Auditoria de Anúncios e Perfil do Google Maps
        </h1>
        <p class="text-sm text-neutral-400 max-w-2xl">
          Insira o link de compartilhamento do Google ou selecione o perfil da empresa para cruzar as métricas de visualizações, avaliações, interações e anúncio.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2"></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 pt-6">
      <div class="md:col-span-6 space-y-1.5">
        <label class="block text-xs font-semibold text-neutral-300">
          Link do Google Maps / Anúncio
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            <Search class="w-4 h-4" />
          </div>
          <input
            :value="inputUrl"
            type="text"
            placeholder="https://share.google/... ou maps.google.com/..."
            class="w-full pl-9 pr-28 py-2.5 text-sm bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            @input="emit('update:inputUrl', ($event.target as HTMLInputElement).value)"
            @keydown.enter.prevent="emit('analyze')"
          />
          <button
            type="button"
            :disabled="isAnalyzing"
            class="absolute inset-y-1 right-1 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white disabled:text-neutral-500 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 shadow-sm"
            @click="emit('analyze')"
          >
            <template v-if="isAnalyzing">
              <Loader2 class="w-3.5 h-3.5 animate-spin" />
              <span>Sincronizando...</span>
            </template>
            <template v-else>
              <Sparkles class="w-3.5 h-3.5" />
              <span>Analisar</span>
            </template>
          </button>
        </div>
      </div>

      <div class="md:col-span-3 space-y-1.5">
        <label class="block text-xs font-semibold text-neutral-300">Nome da Empresa</label>
        <input
          :value="profile.name"
          type="text"
          class="w-full px-3 py-2.5 text-sm bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          @input="emit('update-profile', { name: ($event.target as HTMLInputElement).value })"
        />
      </div>

      <div class="md:col-span-3 space-y-1.5">
        <label class="block text-xs font-semibold text-neutral-300">Cidade / Bairro</label>
        <input
          :value="profile.city"
          type="text"
          class="w-full px-3 py-2.5 text-sm bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          @input="emit('update-profile', { city: ($event.target as HTMLInputElement).value })"
        />
      </div>
    </div>

    <div
      v-if="notification"
      class="mt-4 p-3.5 rounded-xl border flex items-center justify-between text-xs"
      :class="
        notification.type === 'success'
          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
          : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
      "
    >
      <div class="flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{{ notification.message }}</span>
      </div>
      <button
        class="text-neutral-400 hover:text-white font-bold ml-4"
        @click="emit('close-notification')"
      >
        ✕
      </button>
    </div>
  </section>
</template>
