<script setup lang="ts">
import { computed } from 'vue';
import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  MapPin,
  MousePointerClick,
  Phone,
  SlidersHorizontal,
  Star,
  TrendingUp,
  Zap,
} from '@lucide/vue';
import MetricInfoTooltip from '../ui/MetricInfoTooltip.vue';
import RevenueLineChart from '../charts/RevenueLineChart.vue';
import type {
  ActiveTab,
  BusinessProfile,
  ConversionMetrics,
  PrintPreset,
} from '../../types';
import { formatNumber } from '../../utils/format';

const props = defineProps<{
  profile: BusinessProfile;
  conversion: ConversionMetrics;
  targetConversionBoost: number;
  ticketAverage: number;
}>();

const emit = defineEmits<{
  'update:targetConversionBoost': [value: number];
  'update:ticketAverage': [value: number];
  'export-csv': [];
  'open-print': [preset?: PrintPreset];
  'update:activeTab': [tab: ActiveTab];
}>();

const telemetry = computed(() => props.profile.telemetry);
const targetLabel = computed(() => `Meta (+${props.targetConversionBoost}%)`);

const websiteLeak = computed(
  () =>
    props.profile.website.includes('example.com') ||
    (telemetry.value !== undefined && telemetry.value.websiteClicks <= 5)
);
const bookingsLeak = computed(() => telemetry.value?.bookings === 0);
const leaksCount = computed(() => (websiteLeak.value ? 1 : 0) + (bookingsLeak.value ? 1 : 0));
const hasLeaks = computed(() => leaksCount.value > 0);

const funnel = computed(() => {
  const t = telemetry.value;
  const total = Math.max(1, t?.interactions || 0);
  const pct = (value: number) => (value / total) * 100;
  const items = [
    {
      key: 'directions',
      label: 'Orientações de Rota (Maps)',
      value: t?.directions || 0,
      icon: MapPin,
      color: 'text-blue-400',
      bar: 'bg-blue-500',
    },
    {
      key: 'calls',
      label: 'Chamadas Telefônicas',
      value: t?.calls || 0,
      icon: Phone,
      color: 'text-emerald-400',
      bar: 'bg-emerald-500',
    },
    {
      key: 'websiteClicks',
      label: 'Cliques no Website (Crítico)',
      value: t?.websiteClicks || 0,
      icon: MousePointerClick,
      color: 'text-rose-400',
      bar: 'bg-rose-500',
    },
    {
      key: 'bookings',
      label: 'Agendamentos Concluídos (Crítico)',
      value: t?.bookings || 0,
      icon: Calendar,
      color: 'text-rose-400',
      bar: 'bg-rose-500',
    },
  ];
  return items.map((item) => ({
    ...item,
    pct: pct(item.value),
    width: item.value > 0 ? Math.max(2, pct(item.value)) : 0,
  }));
});

function pctLabel(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

function setBoost(value: number): void {
  emit('update:targetConversionBoost', value);
}

function setTicket(value: number): void {
  emit('update:ticketAverage', value);
}
</script>

<template>
  <div v-if="telemetry" class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <div class="flex items-center gap-1.5">
              <span>Visualizações no Google</span>
              <MetricInfoTooltip
                title="Visualizações no Google"
                text="Total de vezes que o perfil foi exibido na Pesquisa Google e no Google Maps. No SEO Local, mede o alcance orgânico da empresa para palavras-chave da sua área de atuação."
                impact="Quanto maior a autoridade no mapa, mais impressões gratuitas o negócio conquista."
                align="left"
              />
            </div>
            <TrendingUp class="w-4 h-4 text-emerald-400" />
          </div>
          <span class="text-3xl font-extrabold text-white tabular-nums">
            {{ formatNumber(telemetry.views) }}
          </span>
        </div>
        <div class="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <span>+{{ telemetry.viewsGrowth }}%</span>
          <span class="text-neutral-500 font-normal">vs. período anterior</span>
        </div>
      </div>

      <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <div class="flex items-center gap-1.5">
              <span>Interações Concretas</span>
              <MetricInfoTooltip
                title="Interações Concretas (CTR Local)"
                text="Soma de ações diretas dos clientes (rotas, ligações, cliques e agendamentos). Para o algoritmo do Google, alto engajamento comprova relevância e impulsiona a posição no Local 3-Pack."
                impact="Sinal comportamental decisivo para superar concorrentes locais."
                align="left"
              />
            </div>
            <TrendingUp class="w-4 h-4 text-emerald-400" />
          </div>
          <span class="text-3xl font-extrabold text-white tabular-nums">
            {{ telemetry.interactions }}
          </span>
        </div>
        <div class="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <span>+{{ telemetry.interactionsGrowth }}%</span>
          <span class="text-neutral-500 font-normal">crescimento sustentado</span>
        </div>
      </div>

      <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <div class="flex items-center gap-1.5">
              <span>Avaliação no Google</span>
              <MetricInfoTooltip
                title="Avaliação & Prova Social"
                text="Nota média e quantidade de avaliações verificadas. Representa o pilar de Proeminência (Prominence) do algoritmo local do Google e o principal fator de decisão do cliente."
                impact="Perfis com 4.8+ estrelas e respostas contínuas atraem muito mais cliques e rotas."
                align="center"
              />
            </div>
            <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-amber-400 tabular-nums">
              {{ profile.rating.toFixed(1) }}
            </span>
            <span class="text-xs text-neutral-400">★ ★ ★ ★ ★</span>
          </div>
        </div>
        <div class="mt-3 text-xs text-neutral-300 font-medium">
          <strong class="text-white tabular-nums">{{ profile.reviewsCount }} avaliações</strong> verificadas
        </div>
      </div>

      <div class="bg-neutral-900 border border-blue-900/60 rounded-xl p-5 flex flex-col justify-between bg-gradient-to-br from-blue-950/20 to-neutral-900">
        <div>
          <div class="flex items-center justify-between text-xs text-blue-300 mb-1">
            <div class="flex items-center gap-1.5">
              <span>Crédito p/ Anúncio Ativo</span>
              <MetricInfoTooltip
                title="Crédito Google Ads & Campanhas Locais"
                text="Verba promocional ou saldo ativo para anúncios locais. Serve para impulsionar a visibilidade no topo do Google Maps enquanto o SEO Local orgânico ganha tração."
                impact="Trabalha em sinergia com o perfil do Google Meu Negócio para capturar tráfego de alta urgência."
                align="right"
              />
            </div>
            <DollarSign class="w-4 h-4 text-blue-400" />
          </div>
          <span class="text-3xl font-extrabold text-blue-400 tabular-nums">
            R$ {{ formatNumber(telemetry.adCredit) }}
          </span>
        </div>
        <div class="mt-3 text-xs text-blue-200">
          Disponível para ativar novos pacientes
        </div>
      </div>
    </div>

    <div
      v-if="hasLeaks"
      class="bg-gradient-to-r from-rose-950/40 via-neutral-900 to-amber-950/30 border border-rose-800/80 rounded-2xl p-6 shadow-xl"
    >
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400">
          <AlertOctagon class="w-6 h-6" />
        </div>
        <div class="space-y-2 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase">
              Diagnóstico de Falhas Graves Detectadas
            </span>
            <span class="text-xs text-neutral-400">Origem: Google Meu Negócio & Anúncio Ativo</span>
          </div>

          <h3 class="text-lg font-bold text-white">
            Reputação {{ profile.rating.toFixed(1) }} ★, mas Perda Severa de Pacientes por Gargalo Técnico
          </h3>

          <p class="text-sm text-neutral-300 leading-relaxed">
            O negócio possui atratividade local com
            <strong class="text-white">{{ formatNumber(telemetry.views) }} visualizações</strong> e
            <strong class="text-white">{{ telemetry.interactions }} interações</strong>, porém apresenta
            {{ leaksCount === 2 ? 'duas falhas' : 'uma falha' }} que anula o retorno financeiro:
          </p>

          <div class="grid grid-cols-1" :class="leaksCount === 2 ? 'md:grid-cols-2' : ''">
            <div
              v-if="bookingsLeak"
              class="bg-neutral-950/80 p-4 rounded-xl border border-rose-900/60"
            >
              <span class="text-xs font-bold text-rose-400 uppercase block mb-1">
                Gargalo 1: Agendamentos = 0 (Zero)
              </span>
              <p class="text-xs text-neutral-400 leading-relaxed">
                Nenhum agendamento foi registrado. Sem dados privados verificados, esta análise é uma simulação e não representa valores reais. Os dados de agendamento só aparecem com importação manual ou via integração autorizada.
              </p>
            </div>

            <div
              v-if="websiteLeak"
              class="bg-neutral-950/80 p-4 rounded-xl border border-amber-900/60"
            >
              <span class="text-xs font-bold text-amber-400 uppercase block mb-1">
                Gargalo 2: Apenas {{ telemetry.websiteClicks }} Cliques no Website & URL "{{ profile.website.replace(/^https?:\/\//, '') }}"
              </span>
              <p class="text-xs text-neutral-400 leading-relaxed">
                O anúncio patrocinado está configurado para o domínio
                <code class="text-amber-300 bg-neutral-900 px-1 py-0.5 rounded">{{ profile.website.replace(/^https?:\/\//, '') }}</code>!
                Em 5 meses foram apenas {{ telemetry.websiteClicks }} cliques no site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider">
            <Zap class="w-3.5 h-3.5" />
            <span>Painel de Evolução de Conversão</span>
            <span>·</span>
            <span>Interações Totais vs. Agendamentos</span>
          </div>
          <h3 class="text-xl font-bold text-white tracking-tight">
            Simulação Financeira: O Impacto de +{{ targetConversionBoost }}% de Conversão
          </h3>
          <p class="text-xs text-neutral-400 max-w-2xl">
            Cálculo automatizado do retorno sobre o tráfego atual de {{ conversion.totalInteractions }} interações registradas no Google.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="bg-rose-500/10 border border-rose-500/30 px-3.5 py-1.5 rounded-lg text-left">
            <div class="flex items-center justify-between gap-1.5 mb-0.5">
              <span class="text-[10px] uppercase font-bold text-rose-400 block">Taxa Atual (Interações vs. Agendamentos)</span>
              <MetricInfoTooltip
                title="Taxa de Conversão Atual"
                text="Percentual de visitantes locais que realizam agendamentos efetivos. Como o perfil não possui botão de agendamento online, a taxa é de 0,0%, provocando perda de pacientes em potencial."
                impact="Gargalo crítico que impede a conversão das mais de 4.000 visualizações orgânicas conquistadas."
                align="right"
              />
            </div>
            <strong class="text-base font-extrabold text-white tabular-nums">
              {{ conversion.currentConversionRate.toFixed(1) }}% ({{ conversion.currentBookings }} agendamentos)
            </strong>
          </div>
          <div class="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-lg text-left">
            <div class="flex items-center justify-between gap-1.5 mb-0.5">
              <span class="text-[10px] uppercase font-bold text-emerald-400 block">Meta Otimizada</span>
              <MetricInfoTooltip
                title="Meta Otimizada de Conversão"
                text="Projeção realista de aumento na taxa de conversão após a correção técnica da URL do website e a integração do canal direto de agendamento/WhatsApp."
                impact="Multiplica o retorno sobre o tráfego que já chega organicamente ao perfil no Google."
                align="right"
              />
            </div>
            <strong class="text-base font-extrabold text-emerald-300 tabular-nums">
              +{{ targetConversionBoost }},0% de Conversão
            </strong>
          </div>
          <button
            class="px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            title="Baixar planilha CSV com todos os dados brutos"
            @click="emit('export-csv')"
          >
            <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            class="px-3.5 py-2 text-xs font-semibold text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            title="Personalizar seções e exportar relatório em PDF"
            @click="emit('open-print', 'diagnosis_financial')"
          >
            <SlidersHorizontal class="w-3.5 h-3.5 text-blue-400" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col justify-between">
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs text-neutral-400 font-medium">
              <div class="flex items-center gap-1.5">
                <span>Novos Pacientes Agendados / Mês</span>
                <MetricInfoTooltip
                  title="Projeção de Agendamentos Mensais"
                  text="Volume de novos clientes agendados diretamente pelo Google Meu Negócio ao converter uma fatia das interações mensais."
                  impact="Comprova a eficácia prática da consultoria de SEO Local em volume de atendimento."
                  align="left"
                />
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-white tabular-nums">
                +{{ conversion.additionalMonthlyBookings }}
              </span>
              <span class="text-xs text-emerald-400 font-semibold">pacientes/mês</span>
            </div>
          </div>
          <p class="text-[11px] text-neutral-500 mt-2">
            Baseado na média mensal de {{ conversion.averageMonthlyInteractions }} interações no perfil.
          </p>
        </div>

        <div class="bg-neutral-950 p-4 rounded-xl border border-emerald-900/60 flex flex-col justify-between bg-gradient-to-br from-emerald-950/20 to-neutral-950">
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <div class="flex items-center gap-1.5">
                <span>Faturamento Mensal Adicional Estimado</span>
                <MetricInfoTooltip
                  title="Faturamento Mensal Adicional"
                  text="Receita nova mensal gerada pelas melhorias de conversão e posicionamento local com base no ticket médio configurado."
                  impact="Transforma métricas técnicas de SEO (impressões e cliques) em moeda real."
                  align="center"
                />
              </div>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-3xl font-extrabold text-emerald-400 tabular-nums">
                +R$ {{ formatNumber(conversion.additionalMonthlyRevenue) }}
              </span>
              <span class="text-xs text-neutral-400 font-medium">/mês</span>
            </div>
          </div>
          <p class="text-[11px] text-emerald-300/80 mt-2">
            Receita nova direta decorrente da ativação do agendamento.
          </p>
        </div>

        <div class="bg-neutral-950 p-4 rounded-xl border border-blue-900/60 flex flex-col justify-between bg-gradient-to-br from-blue-950/20 to-neutral-950">
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs text-blue-400 font-semibold">
              <div class="flex items-center gap-1.5">
                <span>Faturamento Anual Projetado</span>
                <MetricInfoTooltip
                  title="Faturamento Anual Projetado"
                  text="Acúmulo de receita em 12 meses obtido ao manter a ficha no topo dos resultados locais e com canais de contato otimizados."
                  impact="Justifica o investimento recorrente em gestão e otimização de SEO Local contínuo."
                  align="right"
                />
              </div>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-3xl font-extrabold text-blue-400 tabular-nums">
                +R$ {{ formatNumber(conversion.additionalAnnualRevenue) }}
              </span>
              <span class="text-xs text-neutral-400 font-medium">/ano</span>
            </div>
          </div>
          <p class="text-[11px] text-blue-300/80 mt-2">
            Projeção acumulada em 12 meses (+R$ {{ (conversion.additionalAnnualRevenue / 1000).toFixed(0) }}k novos).
          </p>
        </div>
      </div>

      <div class="bg-neutral-950 p-5 rounded-xl border border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <div class="flex justify-between items-center text-xs">
            <div class="flex items-center gap-1.5">
              <span class="font-semibold text-neutral-300">Aumento na Taxa de Conversão:</span>
              <MetricInfoTooltip
                title="Boost na Conversão Local"
                text="Simula o efeito de otimizar a experiência da ficha (adicionar fotos profissionais, responder reviews, ativar agendamento e consertar o site)."
                impact="Cada +1% de conversão sobre o tráfego do Google Maps gera pacientes sem aumentar investimento em anúncios."
                align="left"
              />
            </div>
            <strong class="text-emerald-400 tabular-nums text-sm">+{{ targetConversionBoost }}%</strong>
          </div>
          <input
            :value="targetConversionBoost"
            type="range"
            min="1"
            max="15"
            step="1"
            class="w-full accent-emerald-500 cursor-pointer"
            @input="setBoost(parseInt(($event.target as HTMLInputElement).value))"
          />
          <div class="flex flex-wrap gap-2">
            <button
              v-for="rate in [2, 5, 8, 10]"
              :key="rate"
              type="button"
              class="px-2.5 py-1 text-xs rounded font-medium transition-colors border"
              :class="
                targetConversionBoost === rate
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              "
              @click="setBoost(rate)"
            >
              +{{ rate }}% {{ rate === 5 ? '(Recomendado)' : '' }}
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between items-center text-xs">
            <div class="flex items-center gap-1.5">
              <span class="font-semibold text-neutral-300">Ticket Médio por Paciente/Consulta:</span>
              <MetricInfoTooltip
                title="Ticket Médio do Serviço Local"
                text="Valor médio gerado por cada novo cliente ou consulta no negócio local, permitindo calcular o valor real do cliente no ciclo de vida (LTV)."
                impact="Negócios com ticket mais alto obtêm retorno de ROI exponencial mesmo com pequenas melhorias no ranking local."
                align="left"
              />
            </div>
            <strong class="text-white tabular-nums text-sm">R$ {{ formatNumber(ticketAverage) }}</strong>
          </div>
          <input
            :value="ticketAverage"
            type="range"
            min="150"
            max="2000"
            step="50"
            class="w-full accent-blue-500 cursor-pointer"
            @input="setTicket(parseInt(($event.target as HTMLInputElement).value))"
          />
          <div class="flex flex-wrap gap-2">
            <button
              v-for="price in [300, 500, 800, 1200]"
              :key="price"
              type="button"
              class="px-2.5 py-1 text-xs rounded font-medium transition-colors border"
              :class="
                ticketAverage === price
                  ? 'bg-blue-600/20 border-blue-500/60 text-blue-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              "
              @click="setTicket(price)"
            >
              R$ {{ price }} {{ price === 500 ? '(Padrão Odonto)' : '' }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp class="w-4 h-4 text-emerald-400" />
                <span>Gráfico Interativo: Projeção de Faturamento Mensal (Chart.js)</span>
              </h4>
              <MetricInfoTooltip
                title="Projeção Temporal Semestral"
                text="Simula a curva de faturamento nos próximos 6 meses com base na evolução da maturidade do perfil local e no efeito acumulativo das melhorias de SEO."
                impact="Prevê o ponto de equilíbrio e o retorno sobre o investimento (ROI) em SEO Local."
                align="left"
              />
            </div>
            <p class="text-xs text-neutral-400">
              Evolução estimada ao longo dos próximos 6 meses com ticket médio de R$ {{ formatNumber(ticketAverage) }} e meta de +{{ targetConversionBoost }}% de conversão.
            </p>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-neutral-400">
            <span>Linha verde destacada: <strong>{{ targetLabel }}</strong></span>
          </div>
        </div>

        <RevenueLineChart
          :data="conversion.timelineData"
          :ticket-average="ticketAverage"
          :target-boost="targetConversionBoost"
        />
      </div>

      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Comparativo Visual de Cenários de Faturamento
        </h4>
        <div class="space-y-2.5">
          <div
            v-for="(tier, idx) in conversion.tiers"
            :key="idx"
            class="p-3.5 rounded-xl border transition-all"
            :class="
              tier.isTarget
                ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                : tier.isCurrent
                  ? 'bg-neutral-950 border-rose-900/40'
                  : 'bg-neutral-950/60 border-neutral-800'
            "
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
              <div class="flex items-center gap-2">
                <span
                  class="font-bold"
                  :class="
                    tier.isTarget
                      ? 'text-emerald-300'
                      : tier.isCurrent
                        ? 'text-rose-400'
                        : 'text-neutral-200'
                  "
                >
                  {{ tier.label }}
                </span>
                <span class="text-neutral-500">·</span>
                <span class="text-neutral-400 font-mono">{{ tier.rateDisplay }}</span>
              </div>
              <div class="flex items-center gap-4 text-xs">
                <span class="text-neutral-300">
                  <strong class="text-white tabular-nums">{{ tier.bookings }}</strong> pacientes/mês
                </span>
                <span class="text-neutral-500">·</span>
                <span
                  class="font-bold tabular-nums"
                  :class="
                    tier.isTarget
                      ? 'text-emerald-400 font-extrabold text-sm'
                      : tier.isCurrent
                        ? 'text-rose-400'
                        : 'text-white'
                  "
                >
                  +R$ {{ formatNumber(tier.monthlyRev) }} / mês
                </span>
                <span class="hidden sm:inline text-neutral-500 font-mono">
                  (+R$ {{ formatNumber(tier.annualRev) }} / ano)
                </span>
              </div>
            </div>
            <div class="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="tier.isTarget ? 'bg-emerald-500' : tier.isCurrent ? 'bg-rose-500' : 'bg-blue-500'"
                :style="{ width: `${Math.max(tier.isCurrent ? 2 : 12, (tier.rate / 8) * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
            <AlertTriangle class="w-4 h-4" />
            <span>O Custo da Inação (Dinheiro Deixado na Mesa)</span>
          </div>
          <p class="text-xs text-neutral-300 leading-relaxed max-w-2xl">
            Nas <strong>{{ conversion.totalInteractions }} interações</strong> que a clínica já recebeu no Google, ter uma taxa de conversão saudável de +5% teria gerado cerca de
            <strong class="text-rose-300">+{{ conversion.missedAccumulatedBookings }} pacientes particulares</strong>
            e aproximadamente <strong class="text-rose-300">R$ {{ formatNumber(conversion.missedAccumulatedRevenue) }}</strong> em faturamento não capturado.
          </p>
        </div>
        <button
          class="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center shadow-md shadow-rose-900/30"
          @click="emit('update:activeTab', 'commercial')"
        >
          Usar no Pitch Comercial
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-base font-bold text-white">Detalhamento das {{ telemetry.interactions }} Interações</h4>
            <p class="text-xs text-neutral-400">Para onde estão indo as pessoas que encontram a empresa</p>
          </div>
          <span class="text-xs font-bold text-blue-400 tabular-nums">Total: {{ telemetry.interactions }}</span>
        </div>

        <div class="space-y-3.5 pt-2">
          <div v-for="item in funnel" :key="item.key">
            <div class="flex justify-between text-xs mb-1">
              <span
                class="font-semibold flex items-center gap-1.5"
                :class="item.key === 'websiteClicks' || item.key === 'bookings' ? 'text-rose-300' : 'text-neutral-200'"
              >
                <component :is="item.icon" class="w-3.5 h-3.5" :class="item.color" />
                <span>{{ item.label }}</span>
              </span>
              <span
                class="font-bold tabular-nums"
                :class="item.key === 'websiteClicks' || item.key === 'bookings' ? 'text-rose-400' : 'text-white'"
              >
                {{ item.value }} ({{ pctLabel(item.pct) }}%)
              </span>
            </div>
            <div class="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div class="h-full rounded-full" :class="item.bar" :style="{ width: `${item.width}%` }" />
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-base font-bold text-white">Evolução Mensal de Interações</h4>
            <p class="text-xs text-neutral-400">Dados consolidados do registro oficial de 2026</p>
          </div>
          <span class="text-xs text-emerald-400 font-semibold">+{{ String(telemetry.interactionsGrowth).replace('.', ',') }}% de alta</span>
        </div>

        <div v-if="telemetry.monthlyHistory.length" class="space-y-3 pt-2">
          <div v-for="(item, idx) in telemetry.monthlyHistory" :key="idx" class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="text-neutral-300">{{ item.month }}</span>
              <span class="font-bold text-white tabular-nums">{{ item.interactions }} interações</span>
            </div>
            <div class="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                class="bg-blue-500 h-full rounded-full transition-all"
                :style="{ width: `${(item.interactions / 160) * 100}%` }"
              />
            </div>
          </div>
        </div>
        <p v-else class="text-xs text-neutral-500 pt-2">
          Sem histórico mensal consolidado para este perfil.
        </p>
      </div>
    </div>

    <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-base font-bold text-white">Anúncio Ativo no Google Ads</h4>
          <p class="text-xs text-neutral-400">Palavra-chave configurada: "{{ profile.targetKeyword }}"</p>
        </div>
        <span class="text-xs px-2.5 py-1 rounded bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30">
          Anúncio Patrocinado
        </span>
      </div>

      <div class="bg-white text-neutral-900 p-5 rounded-xl border border-neutral-300 max-w-2xl space-y-2">
        <div class="flex items-center gap-1.5 text-xs text-neutral-700">
          <span class="font-bold uppercase tracking-wider text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded">
            Anúncio
          </span>
          <span>·</span>
          <span class="text-neutral-600 font-mono text-[11px]" :class="websiteLeak ? 'text-rose-600 font-bold' : ''">
            {{ profile.website }} {{ websiteLeak ? '⚠️ (URL de teste!)' : '' }}
          </span>
        </div>

        <h5 class="text-lg font-bold text-blue-700 hover:underline cursor-pointer">
          {{ profile.adHeadline }}
        </h5>

        <p class="text-xs text-neutral-700 leading-relaxed">
          {{ profile.adDescription }}
        </p>

        <div class="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-blue-700">
          <span>Ligue para {{ profile.phone }}</span>
          <span>·</span>
          <span>Rotas em {{ profile.city }}</span>
          <span>·</span>
          <span v-if="!profile.hasWhatsapp" class="text-rose-600 font-bold">❌ Sem link de WhatsApp direto</span>
          <span v-else class="text-emerald-700 font-bold">✓ WhatsApp direto ativo</span>
        </div>
      </div>
    </div>
  </div>
</template>
