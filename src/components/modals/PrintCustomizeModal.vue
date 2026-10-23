<script setup lang="ts">
import { Printer, SlidersHorizontal } from '@lucide/vue';
import type {
  BusinessProfile,
  ConversionMetrics,
  PrintPreset,
  PrintSections,
} from '../../types';

const props = defineProps<{
  sections: PrintSections;
  activeCount: number;
  profile: BusinessProfile;
  conversion: ConversionMetrics;
  targetConversionBoost: number;
  consultantName: string;
  consultantPhone: string;
}>();

const emit = defineEmits<{
  'update:sections': [sections: PrintSections];
  'apply-preset': [preset: PrintPreset];
  'update:consultantName': [value: string];
  'update:consultantPhone': [value: string];
  print: [];
  close: [];
}>();

const sectionItems: { key: keyof PrintSections; label: string; badge?: string; description: string }[] = [
  {
    key: 'diagnosis',
    label: 'Diagnóstico de Falhas & Oportunidades',
    badge: 'Recomendado',
    description:
      'Exibe os gargalos identificados (falha de 0 agendamentos, URL www.example.com no anúncio) e soluções sugeridas.',
  },
  {
    key: 'financialStudy',
    label: 'Simulação Financeira (Evolução de Conversão & ROI)',
    badge: 'Alto Impacto',
    description: `Mostra o ganho com +${props.targetConversionBoost}% de conversão (+${props.conversion.additionalMonthlyBookings} pacientes/mês e +R$ ${props.conversion.additionalMonthlyRevenue.toLocaleString('pt-BR')}/mês) e tabela de cenários.`,
  },
  {
    key: 'commercialScript',
    label: 'Script Comercial / Carta Proposta de Recuperação',
    badge: 'Proposta',
    description:
      'Apresentação executiva formal para o tomador de decisão (Dr.(a)) elogiando a reputação 5.0 estrelas e propondo plano de 3 etapas com campo para aceite.',
  },
  {
    key: 'telemetry',
    label: 'Métricas de Telemetria (Google Ads / Insights)',
    description: `Visualizações (${props.profile.telemetry?.views.toLocaleString('pt-BR')}), ${props.profile.telemetry?.interactions || 0} interações, ${props.profile.telemetry?.calls || 0} chamadas e crédito de R$ ${(props.profile.telemetry?.adCredit || 0).toLocaleString('pt-BR')} do Google Ads.`,
  },
  {
    key: 'pillars',
    label: 'Matriz dos 4 Pilares de Posicionamento (SEO Local)',
    description:
      'Pontuações divididas em Prova Social, Galeria Visual, Completude & Conversão e Relevância no algoritmo.',
  },
  {
    key: 'overview',
    label: 'Cabeçalho com Dados da Empresa & Score',
    description: `Nome (${props.profile.name}), endereço, categoria, nota ${props.profile.rating.toFixed(1)} ★ e Score Radar Local.`,
  },
  {
    key: 'consultantFooter',
    label: 'Rodapé de Autoria e Validação do Consultor',
    description: 'Assinatura formal do consultor, data e número de WhatsApp para contato.',
  },
];

const allOn: PrintSections = {
  overview: true,
  telemetry: true,
  diagnosis: true,
  financialStudy: true,
  commercialScript: true,
  pillars: true,
  consultantFooter: true,
};

const essential: PrintSections = {
  overview: true,
  telemetry: false,
  diagnosis: false,
  financialStudy: false,
  commercialScript: false,
  pillars: false,
  consultantFooter: true,
};

function toggleSection(key: keyof PrintSections, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  emit('update:sections', { ...props.sections, [key]: checked });
}

function badgeClass(badge: string): string {
  if (badge === 'Recomendado') return 'bg-rose-500/20 text-rose-300';
  if (badge === 'Alto Impacto') return 'bg-emerald-500/20 text-emerald-300';
  return 'bg-blue-500/20 text-blue-300';
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
      <div class="flex justify-between items-start pb-4 border-b border-neutral-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <SlidersHorizontal class="w-4 h-4" />
            </span>
            <h3 class="text-lg font-bold text-white">Personalizar Relatório PDF</h3>
          </div>
          <p class="text-xs text-neutral-400 mt-1">
            Selecione quais seções devem ser incluídas no documento impresso / PDF exportado para o cliente.
          </p>
        </div>
        <button
          class="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Modelos Rápidos (Presets):
        </label>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors" @click="emit('apply-preset', 'all')">
            📑 Completo (Todas)
          </button>
          <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors" @click="emit('apply-preset', 'client')">
            🤝 Para o Cliente (Sem Script)
          </button>
          <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/80 transition-colors font-medium" @click="emit('apply-preset', 'diagnosis_financial')">
            🎯 Diagnóstico + Financeiro
          </button>
          <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors" @click="emit('apply-preset', 'commercial')">
            📝 Script Comercial & Proposta
          </button>
          <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors" @click="emit('apply-preset', 'technical')">
            ⚙️ Auditoria Técnica
          </button>
        </div>
      </div>

      <div class="space-y-2.5 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
        <div class="flex items-center justify-between pb-2 border-b border-neutral-800/80">
          <span class="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Seções do Documento ({{ activeCount }} de 7 ativas)
          </span>
          <div class="flex gap-2 text-xs">
            <button type="button" class="text-blue-400 hover:underline" @click="emit('update:sections', allOn)">
              Marcar todas
            </button>
            <span class="text-neutral-600">·</span>
            <button type="button" class="text-neutral-400 hover:underline" @click="emit('update:sections', essential)">
              Apenas essencial
            </button>
          </div>
        </div>

        <div class="space-y-2 pt-1">
          <label
            v-for="item in sectionItems"
            :key="item.key"
            class="flex items-start gap-3 p-2.5 rounded-lg hover:bg-neutral-900 border border-neutral-800/60 cursor-pointer transition-colors"
          >
            <input
              :checked="sections[item.key]"
              type="checkbox"
              class="w-4 h-4 mt-0.5 rounded accent-blue-600 shrink-0"
              @change="toggleSection(item.key, $event)"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white">{{ item.label }}</span>
                <span
                  v-if="item.badge"
                  class="text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase"
                  :class="badgeClass(item.badge)"
                >
                  {{ item.badge }}
                </span>
              </div>
              <p class="text-[11px] text-neutral-400 mt-0.5">
                {{ item.description }}
              </p>
            </div>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-950/40 rounded-xl border border-neutral-800 text-xs">
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Nome do Consultor / Agência no PDF</label>
          <input
            :value="consultantName"
            type="text"
            class="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            @input="emit('update:consultantName', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Telefone / WhatsApp de Contato</label>
          <input
            :value="consultantPhone"
            type="text"
            class="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            @input="emit('update:consultantPhone', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <div class="flex justify-between items-center pt-2 border-t border-neutral-800">
        <span class="text-xs text-neutral-400">
          {{ activeCount }} {{ activeCount === 1 ? 'seção selecionada' : 'seções selecionadas' }} para impressão
        </span>
        <div class="flex items-center gap-3">
          <button type="button" class="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white" @click="emit('close')">
            Fechar
          </button>
          <button
            type="button"
            class="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-600/30 flex items-center gap-2"
            @click="emit('print')"
          >
            <Printer class="w-4 h-4" />
            <span>Imprimir / Gerar PDF</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
