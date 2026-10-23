<script setup lang="ts">
import {
  Award,
  BarChart3,
  Download,
  Eye,
  FileText,
  History,
  MapPin,
  Send,
  SlidersHorizontal,
} from '@lucide/vue';
import type { ActiveTab } from '../types';

defineProps<{
  activeTab: ActiveTab;
  historyCount: number;
}>();

const emit = defineEmits<{
  'update:activeTab': [tab: ActiveTab];
  'export-csv': [];
  'open-raw-import': [];
  'open-print': [];
  'open-history': [];
}>();
</script>

<template>
  <header class="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
      <div class="flex items-center gap-3 shrink-0">
        <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          <MapPin class="w-5 h-5" />
        </div>
        <div>
          <span class="text-lg font-bold tracking-tight text-white whitespace-nowrap">Radar Local</span>
          <span class="hidden sm:inline-block ml-2 text-xs text-neutral-400 font-normal">Auditor de Google Maps & Google Ads</span>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400"></nav>

      <div class="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
        <button
          class="px-3 py-2 text-xs font-medium text-purple-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-purple-500/40 rounded-lg transition-colors flex items-center gap-1.5"
          title="Ver os últimos 5 perfis consultados salvos no navegador"
          @click="emit('open-history')"
        >
          <History class="w-3.5 h-3.5 text-purple-400" />
          <span class="hidden sm:inline">Histórico</span>
          <span class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
            {{ historyCount }}
          </span>
        </button>
        <button
          class="px-3 py-2 text-xs font-medium text-emerald-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-emerald-500/40 rounded-lg transition-colors flex items-center gap-1.5"
          title="Baixar dados em planilha CSV (Excel / Google Planilhas)"
          @click="emit('export-csv')"
        >
          <Download class="w-3.5 h-3.5 text-emerald-400" />
          <span class="hidden sm:inline">Exportar CSV</span>
        </button>
        <button
          class="px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
          title="Colar texto do painel do Google"
          @click="emit('open-raw-import')"
        >
          <FileText class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Colar Dados do Google</span>
        </button>
        <button
          class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm shadow-blue-600/30"
          title="Personalizar seções e exportar em PDF"
          @click="emit('open-print')"
        >
          <SlidersHorizontal class="w-3.5 h-3.5 text-blue-200" />
          <span>Personalizar & Exportar PDF</span>
        </button>
      </div>
    </div>
  </header>
</template>
