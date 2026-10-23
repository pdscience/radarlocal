<script setup lang="ts">
import { computed } from 'vue';
import type {
  AuditAnalysis,
  BusinessProfile,
  ConversionMetrics,
  PrintSections,
} from '../types';

const props = defineProps<{
  profile: BusinessProfile;
  audit: AuditAnalysis;
  conversion: ConversionMetrics;
  targetConversionBoost: number;
  ticketAverage: number;
  sections: PrintSections;
  consultantName: string;
  consultantPhone: string;
}>();

const callsShare = computed(() => {
  const interactions = props.profile.telemetry?.interactions || 0;
  if (!interactions) return '0';
  return (((props.profile.telemetry?.calls || 0) / interactions) * 100).toFixed(1).replace('.', ',');
});

const bookingsShare = computed(() => {
  const interactions = props.profile.telemetry?.interactions || 0;
  if (!interactions) return '0';
  return (((props.profile.telemetry?.bookings || 0) / interactions) * 100).toFixed(1).replace('.', ',');
});
</script>

<template>
  <div class="hidden print:block p-8 bg-white text-neutral-900 min-h-screen">
    <div class="border-b-2 border-neutral-800 pb-6 mb-6 flex justify-between items-start">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-2xl font-bold tracking-tight text-neutral-950">RADAR LOCAL</span>
          <span class="text-xs px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 font-semibold uppercase">
            Dossiê Técnico & Google Ads
          </span>
        </div>
        <p class="text-sm text-neutral-600">
          Auditoria de Presença, Métricas Reais do Google Ads e Conversão Local
        </p>
      </div>
      <div class="text-right text-xs text-neutral-600">
        <p class="font-semibold text-neutral-900">Data: {{ new Date().toLocaleDateString('pt-BR') }}</p>
        <p>Consultor: {{ consultantName }}</p>
        <p>Contato: {{ consultantPhone }}</p>
      </div>
    </div>

    <div v-if="sections.overview" class="bg-neutral-100 p-4 rounded-lg mb-6 flex justify-between items-center border border-neutral-300">
      <div>
        <h2 class="text-xl font-bold text-neutral-950">{{ profile.name }}</h2>
        <p class="text-sm text-neutral-700">{{ profile.category }} · {{ profile.city }}</p>
        <p class="text-xs text-neutral-500 mt-1">{{ profile.address }}</p>
        <p class="text-xs font-semibold text-emerald-700 mt-1">
          Nota no Google: {{ profile.rating.toFixed(1) }} ★ ({{ profile.reviewsCount }} avaliações reais) · {{ profile.responseRate }}% taxa de resposta
        </p>
      </div>
      <div class="text-center bg-white px-6 py-3 rounded-lg border border-neutral-300 shadow-sm">
        <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Score Radar Local</span>
        <span class="text-3xl font-extrabold text-neutral-950 tabular-nums">{{ audit.score }}/100</span>
        <span class="block text-xs font-medium text-amber-700 mt-0.5">{{ audit.classification.level }}</span>
      </div>
    </div>

    <div v-if="sections.telemetry && profile.telemetry" class="mb-6 p-4 rounded-lg border border-neutral-300 bg-neutral-50">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-800">
          Métricas Oficiais do Perfil & Anúncio (Google Insights)
        </h3>
        <span
          v-if="profile.telemetry.adCredit > 0"
          class="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200"
        >
          Crédito Disponível: R$ {{ profile.telemetry.adCredit.toLocaleString('pt-BR') }}
        </span>
      </div>
      <div class="grid grid-cols-4 gap-3 text-center text-xs mb-3">
        <div class="p-2 bg-white rounded border border-neutral-200">
          <span class="text-neutral-500 block">Visualizações</span>
          <strong class="text-base font-bold text-neutral-900">{{ profile.telemetry.views.toLocaleString('pt-BR') }}</strong>
          <span class="text-[10px] text-emerald-600 font-semibold block">+{{ profile.telemetry.viewsGrowth }}%</span>
        </div>
        <div class="p-2 bg-white rounded border border-neutral-200">
          <span class="text-neutral-500 block">Interações Totais</span>
          <strong class="text-base font-bold text-neutral-900">{{ profile.telemetry.interactions }}</strong>
          <span class="text-[10px] text-emerald-600 font-semibold block">+{{ profile.telemetry.interactionsGrowth }}%</span>
        </div>
        <div class="p-2 bg-white rounded border border-neutral-200">
          <span class="text-neutral-500 block">Chamadas / Ligações</span>
          <strong class="text-base font-bold text-neutral-900">{{ profile.telemetry.calls }}</strong>
          <span class="text-[10px] text-neutral-600 block">{{ callsShare }}% das interações</span>
        </div>
        <div class="p-2 bg-rose-50 rounded border border-rose-200">
          <span class="text-rose-700 font-bold block">Agendamentos</span>
          <strong class="text-base font-bold text-rose-700">{{ profile.telemetry.bookings }}</strong>
          <span class="text-[10px] text-rose-600 font-semibold block">Gargalo Crítico: {{ bookingsShare }}%</span>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center text-[11px] text-neutral-600 pt-2 border-t border-neutral-200">
        <div>Orientações de Rota: <strong class="text-neutral-900">{{ profile.telemetry.directions }}</strong></div>
        <div>Cliques no Website: <strong class="text-rose-700">{{ profile.telemetry.websiteClicks }}</strong> (URL: {{ profile.website }})</div>
        <div>Pesquisas Mensais: <strong class="text-neutral-900">{{ profile.telemetry.monthlySearches.toLocaleString('pt-BR') }}</strong></div>
      </div>
    </div>

    <div v-if="sections.pillars" class="mb-6 p-4 rounded-lg border border-neutral-300 bg-neutral-50">
      <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">
        Avaliação por Pilares do Algoritmo do Google
      </h3>
      <div class="grid grid-cols-4 gap-3 text-xs">
        <div class="p-2 bg-white rounded border border-neutral-200">
          <span class="text-neutral-500 block text-[11px]">1. Prova Social & Reviews</span>
          <strong class="text-sm font-bold text-neutral-900">{{ audit.pillars.reputation.earned }}/{{ audit.pillars.reputation.max }} pts</strong>
          <span class="text-[10px] text-emerald-700 block">{{ profile.reviewsCount }} avaliações ({{ profile.rating.toFixed(1) }} ★)</span>
        </div>
        <div class="p-2 bg-white rounded border border-neutral-200">
          <span class="text-neutral-500 block text-[11px]">2. Presença Visual</span>
          <strong class="text-sm font-bold text-neutral-900">{{ audit.pillars.visual.earned }}/{{ audit.pillars.visual.max }} pts</strong>
          <span class="text-[10px] text-neutral-600 block">{{ profile.photosCount }} fotos cadastradas</span>
        </div>
        <div class="p-2 bg-white rounded border border-neutral-200">
          <span class="text-neutral-500 block text-[11px]">3. Completude & Conversão</span>
          <strong class="text-sm font-bold text-neutral-900">{{ audit.pillars.completeness.earned }}/{{ audit.pillars.completeness.max }} pts</strong>
          <span class="text-[10px] text-rose-600 font-semibold block">Gargalo de Agendamentos</span>
        </div>
        <div class="p-2 bg-white rounded border border-neutral-200">
          <span class="text-neutral-500 block text-[11px]">4. Relevância & SEO</span>
          <strong class="text-sm font-bold text-neutral-900">{{ audit.pillars.localSeo.earned }}/{{ audit.pillars.localSeo.max }} pts</strong>
          <span class="text-[10px] text-neutral-600 block">{{ profile.category }}</span>
        </div>
      </div>
    </div>

    <div v-if="sections.diagnosis" class="mb-6">
      <h3 class="text-sm font-bold uppercase tracking-wider text-rose-800 mb-3 border-b border-rose-200 pb-1">
        Diagnóstico: Gargalos de Conversão Identificados
      </h3>
      <div class="space-y-2">
        <div v-for="(issue, idx) in audit.criticalIssues" :key="idx" class="border border-neutral-200 p-3 rounded-lg bg-neutral-50">
          <div class="flex items-start justify-between">
            <span class="font-semibold text-sm text-neutral-900">{{ idx + 1 }}. {{ issue.title }}</span>
            <span class="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">{{ issue.impact }}</span>
          </div>
          <p class="text-xs text-neutral-700 mt-1">{{ issue.desc }}</p>
          <p class="text-xs text-blue-700 font-semibold mt-1">Solução Recomendada: {{ issue.service }}</p>
        </div>
      </div>
    </div>

    <div v-if="sections.financialStudy" class="mb-6 p-4 rounded-lg border border-neutral-300 bg-neutral-50">
      <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
        Simulação Financeira: Impacto de +{{ targetConversionBoost }}% de Conversão
      </h3>
      <p class="text-xs text-neutral-600 mb-3">
        Com base em {{ conversion.totalInteractions }} interações registradas e ticket médio estimado de R$ {{ ticketAverage.toLocaleString('pt-BR') }}:
      </p>
      <div class="grid grid-cols-3 gap-3 text-center text-xs mb-3">
        <div class="p-2 bg-white rounded border border-neutral-200">
          <span class="text-neutral-500 block">Novos Pacientes</span>
          <strong class="text-base font-bold text-neutral-900">+{{ conversion.additionalMonthlyBookings }} / mês</strong>
          <span class="text-[10px] text-neutral-600 block">via agendamento direto</span>
        </div>
        <div class="p-2 bg-white rounded border border-emerald-300 bg-emerald-50/50">
          <span class="text-emerald-700 font-semibold block">Faturamento Mensal Adicional</span>
          <strong class="text-base font-bold text-emerald-800">+R$ {{ conversion.additionalMonthlyRevenue.toLocaleString('pt-BR') }}</strong>
          <span class="text-[10px] text-emerald-600 block">receita nova recorrente</span>
        </div>
        <div class="p-2 bg-white rounded border border-neutral-200">
          <span class="text-neutral-500 block">Faturamento Anual Projetado</span>
          <strong class="text-base font-bold text-neutral-900">+R$ {{ conversion.additionalAnnualRevenue.toLocaleString('pt-BR') }}</strong>
          <span class="text-[10px] text-neutral-600 block">em 12 meses</span>
        </div>
      </div>

      <div class="border border-neutral-200 rounded overflow-hidden">
        <table class="w-full text-left text-[11px]">
          <thead class="bg-neutral-200 text-neutral-800">
            <tr>
              <th class="p-1.5 font-semibold">Cenário</th>
              <th class="p-1.5 font-semibold">Taxa</th>
              <th class="p-1.5 font-semibold">Pacientes/mês</th>
              <th class="p-1.5 font-semibold">Faturamento/mês</th>
              <th class="p-1.5 font-semibold">Faturamento/ano</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 bg-white">
            <tr v-for="(tier, i) in conversion.tiers" :key="i" :class="tier.isTarget ? 'bg-emerald-50 font-semibold text-emerald-900' : ''">
              <td class="p-1.5">{{ tier.label }}</td>
              <td class="p-1.5">{{ tier.rateDisplay }}</td>
              <td class="p-1.5">{{ tier.bookings }}</td>
              <td class="p-1.5">R$ {{ tier.monthlyRev.toLocaleString('pt-BR') }}</td>
              <td class="p-1.5">R$ {{ tier.annualRev.toLocaleString('pt-BR') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="sections.commercialScript" class="mb-6 p-4 rounded-lg border border-blue-300 bg-blue-50/40">
      <h3 class="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
        Script de Apresentação Comercial & Proposta Executiva
      </h3>
      <div class="text-xs text-neutral-800 space-y-2.5 leading-relaxed bg-white p-4 rounded border border-blue-200">
        <p>
          <strong>Prezado(a) Gestor(a) e Diretor(a) da {{ profile.name }},</strong>
        </p>
        <p>
          Apresentamos este dossiê técnico de posicionamento digital e conversão local em {{ profile.city }}.
          A clínica possui autoridade admirável na região, com
          <strong>nota máxima de {{ profile.rating.toFixed(1) }} estrelas e {{ profile.reviewsCount }} avaliações reais</strong>.
        </p>
        <p>
          Contudo, identificamos falhas pontuais que estão drenando pacientes particulares potenciais:
        </p>
        <ul class="list-disc list-inside space-y-1 pl-2 text-neutral-700">
          <li>
            <strong>Zero Agendamentos Online Registrados:</strong> De
            {{ profile.telemetry?.views.toLocaleString('pt-BR') }} visualizações e
            {{ profile.telemetry?.interactions }} interações,
            {{ profile.telemetry?.bookings || 0 }} agendamentos diretos foram gerados porque o botão de agendamento online está ausente no perfil do Google Maps.
          </li>
          <li>
            <strong>Gargalo Grave no Anúncio:</strong> A campanha de "{{ profile.targetKeyword }}" teve apenas
            {{ profile.telemetry?.websiteClicks || 0 }} cliques no website, e direciona para a URL "{{ profile.website }}", sem direcionamento direto para WhatsApp.
          </li>
          <li>
            <strong>Oportunidade Imediata:</strong> Vocês contam com R$
            {{ (profile.telemetry?.adCredit || 0).toLocaleString('pt-BR') }} de crédito de anúncio pronto para uso estratégico.
          </li>
        </ul>
        <div class="p-2.5 bg-neutral-50 rounded border border-neutral-200 text-neutral-800 text-[11px]">
          <strong>Plano de Ativação em 3 Etapas:</strong>
          <ol class="list-decimal list-inside mt-1 space-y-0.5">
            <li>Ativar o botão de Agendamento Imediato no Google Maps;</li>
            <li>Substituir a URL do anúncio por uma Landing Page com botão WhatsApp direto;</li>
            <li>
              Alavancar o crédito de R$ {{ (profile.telemetry?.adCredit || 0).toLocaleString('pt-BR') }}
              em campanhas de alta intenção com palavras-chave de serviços premium.
            </li>
          </ol>
        </div>
        <div class="pt-3 border-t border-neutral-200 flex justify-between items-center text-[11px] text-neutral-600">
          <span>Validade da Proposta: 15 dias corridos</span>
          <span>Aceite do Responsável: _______________________________</span>
        </div>
      </div>
    </div>

    <div v-if="sections.consultantFooter" class="mt-8 pt-4 border-t-2 border-neutral-800 flex justify-between items-center text-xs text-neutral-600">
      <div>
        <p class="font-semibold text-neutral-950">Relatório emitido pela ferramenta Radar Local</p>
        <p>Entre em contato para aprovar o plano de recuperação e otimização do perfil.</p>
      </div>
      <div class="text-right">
        <p class="font-bold text-neutral-900">{{ consultantName }}</p>
        <p class="text-neutral-700">{{ consultantPhone }}</p>
      </div>
    </div>
  </div>
</template>
