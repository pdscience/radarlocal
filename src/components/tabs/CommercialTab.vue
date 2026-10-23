<script setup lang="ts">
import { Check, Copy, SlidersHorizontal } from '@lucide/vue';
import type { BusinessProfile, PrintPreset } from '../../types';

defineProps<{
  profile: BusinessProfile;
  consultantName: string;
  consultantPhone: string;
  copiedPitch: boolean;
  pitchText: string;
}>();

const emit = defineEmits<{
  'update:consultantName': [value: string];
  'update:consultantPhone': [value: string];
  copy: [];
  'open-print': [preset?: PrintPreset];
}>();
</script>

<template>
  <div class="space-y-6">
    <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-white">Script de Prospecção Baseado nas Métricas Reais</h3>
          <p class="text-xs text-neutral-400">
            Abordagem altamente persuasiva citando a nota {{ profile.rating.toFixed(1) }}, as
            {{ profile.telemetry?.views.toLocaleString('pt-BR') }} visualizações e a solução para os
            {{ profile.telemetry?.bookings || 0 }} agendamentos.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start flex-wrap">
          <button
            class="px-3 py-2 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-700 shadow-sm"
            title="Personalizar e imprimir o relatório em PDF com o script"
            @click="emit('open-print', 'commercial')"
          >
            <SlidersHorizontal class="w-3.5 h-3.5 text-blue-400" />
            <span>Imprimir Script em PDF</span>
          </button>
          <button
            class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2"
            @click="emit('copy')"
          >
            <Check v-if="copiedPitch" class="w-4 h-4" />
            <Copy v-else class="w-4 h-4" />
            <span>{{ copiedPitch ? 'Copiado para o WhatsApp!' : 'Copiar Script' }}</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-950 rounded-xl border border-neutral-800">
        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-1">Seu Nome / Agência</label>
          <input
            :value="consultantName"
            type="text"
            class="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white"
            @input="emit('update:consultantName', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-neutral-300 mb-1">Seu WhatsApp de Contato</label>
          <input
            :value="consultantPhone"
            type="text"
            class="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white"
            @input="emit('update:consultantPhone', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <div class="bg-neutral-950 border border-neutral-800 rounded-xl p-5 font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed select-all">{{ pitchText }}</div>
    </div>
  </div>
</template>
