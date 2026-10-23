<script setup lang="ts">
import { Calendar, Clock, Globe, MapPin, Phone, Star } from '@lucide/vue';
import type {
  BusinessProfile,
  PreviewDevice,
  RegionalComparison,
  RegionalReference,
} from '../../types';

const props = defineProps<{
  profile: BusinessProfile;
  previewDevice: PreviewDevice;
  regions: Record<string, RegionalReference>;
  regionFilter: string;
  regional: RegionalComparison;
}>();

const emit = defineEmits<{
  'update:previewDevice': [device: PreviewDevice];
  'update:regionFilter': [value: string];
}>();

function onRegionChange(event: Event): void {
  emit('update:regionFilter', (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
      <div>
        <h3 class="text-sm font-bold text-white">Simulador do Anúncio Patrocinado e Perfil no Google</h3>
        <p class="text-xs text-neutral-400">Como o paciente de {{ profile.city }} visualiza sua empresa ao buscar por dentista.</p>
      </div>

      <div class="flex items-center gap-2 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
        <button
          class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
          :class="previewDevice === 'ad_search' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'"
          @click="emit('update:previewDevice', 'ad_search')"
        >
          Anúncio Patrocinado
        </button>
        <button
          class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
          :class="previewDevice === 'maps' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'"
          @click="emit('update:previewDevice', 'maps')"
        >
          Google Maps Card
        </button>
      </div>
    </div>

    <div
      v-if="previewDevice === 'ad_search'"
      class="max-w-2xl mx-auto bg-white text-neutral-900 p-6 rounded-2xl shadow-xl border border-neutral-300 space-y-4"
    >
      <div class="border-b border-neutral-200 pb-2">
        <p class="text-xs text-neutral-500 font-mono">
          google.com/search?q={{ profile.targetKeyword?.replace(/\s+/g, '+') }}
        </p>
      </div>

      <div class="p-4 rounded-xl border border-blue-200 bg-blue-50/20 space-y-2">
        <div class="flex items-center gap-1.5 text-xs text-neutral-600">
          <span class="font-bold text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded">
            Patrocinado
          </span>
          <span>·</span>
          <span class="text-rose-600 font-semibold font-mono">{{ profile.website }}</span>
        </div>

        <h4 class="text-lg font-bold text-blue-700 hover:underline cursor-pointer">
          {{ profile.adHeadline }}
        </h4>

        <div class="flex items-center gap-1.5 text-xs">
          <span class="font-bold text-neutral-900">{{ profile.rating.toFixed(1) }}</span>
          <div class="flex text-amber-500">
            <Star v-for="s in [1, 2, 3, 4, 5]" :key="s" class="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          </div>
          <span class="text-neutral-600">({{ profile.reviewsCount }})</span>
          <span class="text-neutral-400">·</span>
          <span class="text-neutral-600">{{ profile.category }}</span>
        </div>

        <p class="text-xs text-neutral-700 leading-relaxed">
          {{ profile.adDescription }}
        </p>

        <div class="pt-2 flex items-center gap-4 text-xs font-semibold text-blue-700">
          <span>Ligue: {{ profile.phone }}</span>
          <span>·</span>
          <span>Rotas para o consultório</span>
        </div>
      </div>
    </div>

    <div
      v-else
      class="max-w-md mx-auto bg-white text-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-neutral-300"
    >
      <div class="relative h-48 bg-neutral-200">
        <img
          :src="profile.image"
          :alt="profile.name"
          referrerpolicy="no-referrer"
          class="w-full h-full object-cover"
        />
        <div class="absolute top-3 right-3 bg-neutral-900/80 text-white px-2 py-0.5 rounded text-xs backdrop-blur font-mono">
          {{ profile.photosCount }} fotos
        </div>
      </div>

      <div class="p-5 space-y-4">
        <div>
          <h4 class="text-xl font-bold text-neutral-950">{{ profile.name }}</h4>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="font-bold text-sm text-neutral-900 tabular-nums">{{ profile.rating.toFixed(1) }}</span>
            <div class="flex text-amber-500">
              <Star v-for="s in [1, 2, 3, 4, 5]" :key="s" class="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            </div>
            <span class="text-xs text-neutral-500">({{ profile.reviewsCount }})</span>
            <span class="text-xs text-neutral-400">·</span>
            <span class="text-xs text-neutral-600">{{ profile.category }}</span>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2 pt-2 pb-1 border-y border-neutral-100">
          <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-700">
            <Phone class="w-5 h-5 mb-1" />
            <span class="text-[11px] font-semibold">Ligar ({{ profile.telemetry?.calls || 0 }})</span>
          </div>
          <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-700">
            <MapPin class="w-5 h-5 mb-1" />
            <span class="text-[11px] font-semibold">Rotas ({{ profile.telemetry?.directions || 0 }})</span>
          </div>
          <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-700">
            <Globe class="w-5 h-5 mb-1" />
            <span class="text-[11px] font-semibold">Website ({{ profile.telemetry?.websiteClicks || 0 }})</span>
          </div>
          <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-rose-50 text-rose-700">
            <Calendar class="w-5 h-5 mb-1" />
            <span class="text-[11px] font-semibold">Agendar ({{ profile.telemetry?.bookings || 0 }})</span>
          </div>
        </div>

        <div class="space-y-2.5 text-xs text-neutral-700">
          <div class="flex items-start gap-2.5">
            <MapPin class="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <span>{{ profile.address }}</span>
          </div>
          <div class="flex items-start gap-2.5">
            <Clock class="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <span class="text-emerald-700 font-semibold">Aberto agora · Fecha às 18:00</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 class="text-sm font-bold text-white">Filtro Geográfico</h3>
          <p class="text-xs text-neutral-400">Perfis da mesma categoria em cidades vizinhas</p>
        </div>
        <select
          :value="regionFilter"
          class="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
          @change="onRegionChange"
        >
          <option v-for="(region, key) in regions" :key="key" :value="key">
            {{ region.regionLabel }}
          </option>
        </select>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-neutral-800/50 rounded-xl p-4">
          <span class="text-xs text-neutral-400 block">Score do perfil atual</span>
          <span class="text-2xl font-extrabold text-white tabular-nums">
            {{ regional.currentScore }}/100
          </span>
        </div>
        <div class="bg-neutral-800/50 rounded-xl p-4">
          <span class="text-xs text-neutral-400 block">
            Média da região ({{ regional.region.cityCount }} cidades · {{ regional.region.profileCount }} perfis)
          </span>
          <span class="text-2xl font-extrabold text-neutral-300 tabular-nums">
            {{ regional.region.averageScore }}/100
          </span>
        </div>
      </div>
      <div class="text-xs text-neutral-400">
        Cidades: {{ regional.region.representativeCities.join(', ') }}
      </div>
      <div
        class="text-sm font-bold"
        :class="regional.scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'"
      >
        {{ regional.scoreDelta >= 0 ? '+' : '' }}{{ regional.scoreDelta }} pts vs. média regional
      </div>
    </div>
  </div>
</template>
