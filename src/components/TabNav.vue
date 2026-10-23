<script setup lang="ts">
import { Award, BarChart3, Eye, Send, Sliders } from '@lucide/vue';
import type { ActiveTab } from '../types';

defineProps<{ activeTab: ActiveTab }>();
const emit = defineEmits<{ 'update:activeTab': [tab: ActiveTab] }>();

const tabs: { id: ActiveTab; label: string; icon: unknown }[] = [
  { id: 'ads_telemetry', label: 'Google Insights & Anúncio (Métricas Reais)', icon: BarChart3 },
  { id: 'diagnosis', label: 'Diagnóstico & Score Radar', icon: Award },
  { id: 'preview', label: 'Prévia Visual do Anúncio', icon: Eye },
  { id: 'commercial', label: 'Script de Prospecção', icon: Send },
  { id: 'audit_matrix', label: 'Simulador', icon: Sliders },
];
</script>

<template>
  <div class="flex border-b border-neutral-800 space-x-1 sm:space-x-4">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors"
      :class="
        activeTab === tab.id
          ? 'border-blue-500 text-blue-400'
          : 'border-transparent text-neutral-400 hover:text-neutral-200'
      "
      @click="emit('update:activeTab', tab.id)"
    >
      <component :is="tab.icon" class="w-4 h-4" />
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>
