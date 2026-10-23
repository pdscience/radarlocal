<script setup lang="ts">
import type { BusinessProfile } from '../../types';

defineProps<{ profile: BusinessProfile }>();

const emit = defineEmits<{ 'update-profile': [patch: Partial<BusinessProfile>] }>();

function numberValue(event: Event): number {
  return parseFloat((event.target as HTMLInputElement).value);
}

function intValue(event: Event): number {
  return parseInt((event.target as HTMLInputElement).value, 10);
}

function checkedValue(event: Event): boolean {
  return (event.target as HTMLInputElement).checked;
}
</script>

<template>
  <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
    <div>
      <h3 class="text-lg font-bold text-white">Ajustes dos Indicadores e Métricas</h3>
      <p class="text-xs text-neutral-400">Modifique os valores para simular o score pós-otimização.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-4">
        <h4 class="text-xs font-bold uppercase tracking-wider text-blue-400">Reputação</h4>
        <div class="space-y-1">
          <span class="text-xs text-neutral-400">Nota: {{ profile.rating.toFixed(1) }} ★</span>
          <input
            :value="profile.rating"
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            class="w-full accent-blue-500"
            @input="emit('update-profile', { rating: numberValue($event) })"
          />
        </div>
        <div class="space-y-1">
          <span class="text-xs text-neutral-400">Avaliações: {{ profile.reviewsCount }}</span>
          <input
            :value="profile.reviewsCount"
            type="range"
            min="0"
            max="500"
            step="1"
            class="w-full accent-blue-500"
            @input="emit('update-profile', { reviewsCount: intValue($event) })"
          />
        </div>
      </div>

      <div class="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-4">
        <h4 class="text-xs font-bold uppercase tracking-wider text-amber-400">Fotos & Mídia</h4>
        <div class="space-y-1">
          <span class="text-xs text-neutral-400">Total de Fotos: {{ profile.photosCount }}</span>
          <input
            :value="profile.photosCount"
            type="range"
            min="1"
            max="100"
            step="1"
            class="w-full accent-amber-500"
            @input="emit('update-profile', { photosCount: intValue($event) })"
          />
        </div>
        <label class="flex items-center gap-2 cursor-pointer pt-2">
          <input
            :checked="profile.hasProfessionalPhotos"
            type="checkbox"
            class="w-4 h-4 rounded accent-blue-500"
            @change="emit('update-profile', { hasProfessionalPhotos: checkedValue($event) })"
          />
          <span class="text-xs text-neutral-300">Fotos profissionais de fachada/consultório</span>
        </label>
      </div>

      <div class="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-purple-400">Conversão</h4>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            :checked="profile.hasWhatsapp"
            type="checkbox"
            class="w-4 h-4 rounded accent-blue-500"
            @change="emit('update-profile', { hasWhatsapp: checkedValue($event) })"
          />
          <span class="text-xs text-neutral-300">Botão WhatsApp ativo</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            :checked="profile.hasRecentPosts"
            type="checkbox"
            class="w-4 h-4 rounded accent-blue-500"
            @change="emit('update-profile', { hasRecentPosts: checkedValue($event) })"
          />
          <span class="text-xs text-neutral-300">Postagens recentes (30d)</span>
        </label>
      </div>
    </div>
  </div>
</template>
