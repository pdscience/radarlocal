<script setup lang="ts">
import { ArrowRight, SlidersHorizontal } from '@lucide/vue';
import type { ActiveTab, AuditAnalysis, BusinessProfile, PrintPreset } from '../../types';

const props = defineProps<{
  profile: BusinessProfile;
  audit: AuditAnalysis;
}>();

const emit = defineEmits<{
  'open-print': [preset?: PrintPreset];
  'update:activeTab': [tab: ActiveTab];
}>();

function pillarWidth(earned: number, max: number): string {
  return `${(earned / max) * 100}%`;
}
</script>

<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs uppercase font-bold tracking-wider text-neutral-400">
            Score de Presença Local
          </span>
          <span
            class="text-xs px-2.5 py-1 rounded-full font-semibold border"
            :class="[audit.classification.borderColor, audit.classification.bgColor, audit.classification.color]"
          >
            {{ audit.classification.badge }}
          </span>
        </div>

        <div class="my-8 flex items-baseline justify-center gap-2">
          <span class="text-7xl font-extrabold tracking-tight tabular-nums text-white">
            {{ audit.score }}
          </span>
          <span class="text-2xl text-neutral-500 font-semibold">/100</span>
        </div>

        <div class="space-y-2">
          <div class="w-full bg-neutral-800 h-3 rounded-full overflow-hidden p-0.5">
            <div
              class="h-full rounded-full transition-all duration-500 bg-amber-500"
              :style="{ width: `${Math.max(5, audit.score)}%` }"
            />
          </div>
          <div class="flex justify-between text-xs text-neutral-500">
            <span>0 (Invisível)</span>
            <span>50 (Regular)</span>
            <span>100 (Dominante)</span>
          </div>
        </div>

        <p class="mt-4 text-xs text-neutral-400 text-center">
          {{ audit.classification.summary }}
        </p>
      </div>

      <div class="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-300 mb-4">
            Desempenho por Pilares do Algoritmo do Google
          </h3>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs">
                <span class="font-semibold text-neutral-200">1. Prova Social & Avaliações</span>
                <span class="tabular-nums font-bold text-emerald-400">
                  {{ audit.pillars.reputation.earned }} / {{ audit.pillars.reputation.max }} pts (Excelente)
                </span>
              </div>
              <div class="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-emerald-500 h-full rounded-full"
                  :style="{ width: pillarWidth(audit.pillars.reputation.earned, audit.pillars.reputation.max) }"
                />
              </div>
              <div class="flex justify-between text-[11px] text-neutral-500">
                <span>{{ profile.reviewsCount }} avaliações</span>
                <span class="text-amber-400 font-bold">{{ profile.rating.toFixed(1) }} ★ Máxima</span>
                <span>{{ profile.responseRate }}% respondidas</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between text-xs">
                <span class="font-semibold text-neutral-200">2. Galeria Visual & Fotos</span>
                <span class="tabular-nums font-bold text-neutral-300">
                  {{ audit.pillars.visual.earned }} / {{ audit.pillars.visual.max }} pts
                </span>
              </div>
              <div class="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-blue-500 h-full rounded-full"
                  :style="{ width: pillarWidth(audit.pillars.visual.earned, audit.pillars.visual.max) }"
                />
              </div>
              <div class="flex justify-between text-[11px] text-neutral-500">
                <span>{{ profile.photosCount }} fotos cadastradas</span>
                <span>{{ profile.hasProfessionalPhotos ? 'Fachada e consultório registrados' : 'Fotos profissionais pendentes' }}</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between text-xs">
                <span class="font-semibold text-neutral-200">3. Completude & Conversão</span>
                <span class="tabular-nums font-bold text-rose-400">
                  {{ audit.pillars.completeness.earned }} / {{ audit.pillars.completeness.max }} pts (Gargalo Grave)
                </span>
              </div>
              <div class="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-rose-500 h-full rounded-full"
                  :style="{ width: pillarWidth(audit.pillars.completeness.earned, audit.pillars.completeness.max) }"
                />
              </div>
              <div class="flex justify-between text-[11px] text-rose-400">
                <span>{{ profile.telemetry?.bookings || 0 }} Agendamentos</span>
                <span>Site {{ profile.website.replace(/^https?:\/\//, '') }}</span>
                <span>{{ profile.hasWhatsapp ? 'Com WhatsApp direto' : 'Sem WhatsApp direto' }}</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between text-xs">
                <span class="font-semibold text-neutral-200">4. SEO Local & Palavras-chave</span>
                <span class="tabular-nums font-bold text-neutral-300">
                  {{ audit.pillars.localSeo.earned }} / {{ audit.pillars.localSeo.max }} pts
                </span>
              </div>
              <div class="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-amber-500 h-full rounded-full"
                  :style="{ width: pillarWidth(audit.pillars.localSeo.earned, audit.pillars.localSeo.max) }"
                />
              </div>
              <div class="flex justify-between text-[11px] text-neutral-500">
                <span>{{ profile.hasOptimizedDescription ? 'Slogan otimizado' : 'Descrição pendente' }}</span>
                <span>{{ profile.hasRecentPosts ? 'Posts recentes ativos' : 'Sem posts nos últimos 30 dias' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Oportunidade de Consultoria: <strong class="text-white">Alta Prioridade</strong></span>
          <button
            class="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            @click="emit('update:activeTab', 'commercial')"
          >
            <span>Gerar Proposta Comercial</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-bold text-white">Pontos Críticos para Correção Imediata</h3>
          <p class="text-xs text-neutral-400">Falhas técnicas que impedem o faturamento máximo da clínica</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            class="px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-700 shadow-sm"
            title="Personalizar e exportar relatório com foco em diagnóstico"
            @click="emit('open-print', 'diagnosis_financial')"
          >
            <SlidersHorizontal class="w-3.5 h-3.5 text-blue-400" />
            <span>Exportar Diagnóstico em PDF</span>
          </button>
          <span class="text-xs px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
            {{ audit.criticalIssues.length }} Oportunidades
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(issue, idx) in audit.criticalIssues"
          :key="idx"
          class="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
        >
          <div>
            <div class="flex items-start justify-between gap-2">
              <span class="text-sm font-semibold text-neutral-200">
                {{ idx + 1 }}. {{ issue.title }}
              </span>
              <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {{ issue.impact }}
              </span>
            </div>
            <p class="text-xs text-neutral-400 mt-2 leading-relaxed">
              {{ issue.desc }}
            </p>
          </div>

          <div class="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
            <span class="text-neutral-500 text-[11px]">Serviço Recomendado:</span>
            <span class="text-blue-400 font-semibold text-[11px]">
              {{ issue.service }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
