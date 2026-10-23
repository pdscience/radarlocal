<script setup lang="ts">
import { Calendar, History, RotateCcw, Trash2, XCircle } from '@lucide/vue';
import type { AnalysisHistoryItem } from '../../types';

const props = defineProps<{
  history: AnalysisHistoryItem[];
  currentName: string;
}>();

const emit = defineEmits<{
  close: [];
  restore: [item: AnalysisHistoryItem];
  remove: [id: string];
  clear: [];
}>();

function isCurrent(item: AnalysisHistoryItem): boolean {
  return props.currentName.toLowerCase() === item.name.toLowerCase();
}

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
}

function onRemove(id: string, event: MouseEvent): void {
  event.stopPropagation();
  emit('remove', id);
}
</script>

<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-start justify-between border-b border-neutral-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <History class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-white">Histórico de Consultas</h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {{ history.length }}/5 salvas
              </span>
            </div>
            <p class="text-xs text-neutral-400 mt-0.5">
              Últimos 5 perfis analisados salvos no navegador para retomar instantaneamente sem reprocessar URLs.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          @click="emit('close')"
        >
          <XCircle class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
        <div v-if="history.length === 0" class="text-center py-12 px-4 border border-dashed border-neutral-800 rounded-xl">
          <History class="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h4 class="text-sm font-semibold text-neutral-300">Nenhuma consulta salva ainda</h4>
          <p class="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
            Ao analisar links ou selecionar modelos, os últimos 5 perfis com nome, data e score serão armazenados automaticamente aqui.
          </p>
        </div>

        <template v-else>
        <div
          v-for="(item, index) in history"
          :key="item.id"
          class="group p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
          :class="
            isCurrent(item)
              ? 'bg-neutral-800/80 border-blue-500/50 shadow-sm shadow-blue-500/10 ring-1 ring-blue-500/20'
              : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
          "
          @click="emit('restore', item)"
        >
          <div class="space-y-1 flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs text-neutral-500 font-mono font-bold">#{{ index + 1 }}</span>
              <h4 class="text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                {{ item.name }}
              </h4>
              <span
                v-if="isCurrent(item)"
                class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30"
              >
                Ativo agora
              </span>
            </div>

            <div class="flex items-center gap-2.5 text-xs text-neutral-400 flex-wrap">
              <span class="truncate">{{ item.category }} · {{ item.city }}</span>
              <span class="text-neutral-600">·</span>
              <span class="flex items-center gap-1 text-[11px] text-neutral-400">
                <Calendar class="w-3 h-3 text-neutral-500" />
                {{ item.analyzedAt }}
              </span>
            </div>

            <p v-if="item.url" class="text-[11px] text-neutral-500 truncate max-w-md font-mono">
              {{ item.url }}
            </p>
          </div>

          <div class="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <div class="px-2.5 py-1 rounded-lg border text-center" :class="scoreColor(item.score)">
              <span class="text-[9px] uppercase font-bold tracking-wider block opacity-80">Score</span>
              <span class="text-xs font-extrabold tabular-nums">{{ item.score }}/100</span>
            </div>

            <button
              type="button"
              class="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
              title="Retomar relatório salvo sem reprocessar URL"
              @click.stop="emit('restore', item)"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Retomar</span>
            </button>

            <button
              type="button"
              class="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Excluir este item do histórico"
              @click="onRemove(item.id, $event)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        </template>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-neutral-800">
        <button
          v-if="history.length > 0"
          type="button"
          class="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
          @click="emit('clear')"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Limpar histórico ({{ history.length }})</span>
        </button>
        <span v-else />

        <button
          type="button"
          class="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          @click="emit('close')"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>
