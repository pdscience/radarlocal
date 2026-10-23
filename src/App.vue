<script setup lang="ts">
import { computed, ref } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AnalysisPanel from './components/AnalysisPanel.vue';
import TabNav from './components/TabNav.vue';
import FooterBar from './components/FooterBar.vue';
import ReportPrintView from './components/ReportPrintView.vue';
import DiagnosisTab from './components/tabs/DiagnosisTab.vue';
import PreviewTab from './components/tabs/PreviewTab.vue';
import CommercialTab from './components/tabs/CommercialTab.vue';
import SimulatorTab from './components/tabs/SimulatorTab.vue';
import TelemetryTab from './components/tabs/TelemetryTab.vue';
import HistoryModal from './components/modals/HistoryModal.vue';

import PrintCustomizeModal from './components/modals/PrintCustomizeModal.vue';
import { PRESETS, PRESET_DOURADOS, REGIONS_DATA, cloneProfile } from './data/presets';
import { useAuditAnalysis } from './composables/useAuditAnalysis';
import { useConversionMetrics } from './composables/useConversionMetrics';
import { useRegionalComparison } from './composables/useRegionalComparison';
import { useHistory } from './composables/useHistory';
import { usePrintReport } from './composables/usePrintReport';
import { usePublicAnalysis } from './composables/usePublicAnalysis';
import { functionsBaseUrl } from './lib/insforge';
import type {
  ActiveTab,
  AnalysisHistoryItem,
  AnalysisNotification,
  BusinessProfile,
  PreviewDevice,
  PrintPreset,
} from './types';

const profile = ref<BusinessProfile>(cloneProfile(PRESET_DOURADOS));
const inputUrl = ref(PRESET_DOURADOS.url);
const activeTab = ref<ActiveTab>('ads_telemetry');
const previewDevice = ref<PreviewDevice>('ad_search');
const isAnalyzing = ref(false);
const analysisNotification = ref<AnalysisNotification | null>(null);
const copiedPitch = ref(false);
const consultantName = ref('Especialista em SEO Local');
const consultantPhone = ref('(11) 99999-8888');
const showHistoryModal = ref(false);
const showPrintCustomizeModal = ref(false);
const rawTextImport = ref('');
const ticketAverage = ref(500);
const targetConversionBoost = ref(5);
const regionFilter = ref('dentista-dourados');
const publicAnalysis = usePublicAnalysis();

const { history, save: saveToHistory, remove: removeHistoryItem, clear: clearHistory } =
  useHistory(inputUrl);

const audit = useAuditAnalysis(profile);
const conversion = useConversionMetrics(profile, ticketAverage, targetConversionBoost);

const currentScore = computed(() => audit.value.score);
const regional = useRegionalComparison(profile, currentScore, regionFilter);

const {
  printSections,
  activeSectionsCount,
  setPrintSections,
  applyPrintPreset,
  handlePrintReport,
} = usePrintReport();

const historyCount = computed(() => history.value.length);

const pitchText = computed(() => {
  const p = profile.value;
  const t = p.telemetry;
  return `Olá, Dr.(a) e gestor da ${p.name}!

Meu nome é ${consultantName.value} e analisei a presença da sua clínica no Google e no Google Ads em ${p.city}.

Parabéns pela reputação impecável: vocês conquistaram nota máxima de ${p.rating.toFixed(1)} estrelas com ${p.reviewsCount} avaliações reais. Isso é uma autoridade enorme!

Porém, analisei suas métricas de engajamento e identifiquei dois gargalos gravíssimos que estão fazendo vocês perderem dezenas de pacientes todo mês:
1. De ${t?.views.toLocaleString('pt-BR') || 0} visualizações e ${t?.interactions || 0} interações, vocês tiveram ${t?.bookings || 0} agendamentos online registrados porque o botão de agendamento não está configurado.
2. Seu anúncio de "${p.targetKeyword}" teve apenas ${t?.websiteClicks || 0} cliques no website, e está direcionando para uma URL de teste ("${p.website}"), além de não ter canal direto de WhatsApp.
3. Vocês têm R$ ${(t?.adCredit || 0).toLocaleString('pt-BR')} de crédito de anúncio pronto para ser utilizado com inteligência.

Preparei um plano prático para:
- Ativar o botão de Agendamento Imediato no Google Maps;
- Criar a página de alta conversão com WhatsApp para trocar o link do anúncio;
- Aproveitar o crédito de R$ ${(t?.adCredit || 0).toLocaleString('pt-BR')} do Google para trazer novos pacientes particulares.

Podemos agendar uma rápida conversa de 10 minutos esta semana?

Meu contato: ${consultantPhone.value}`;
});

function updateProfile(patch: Partial<BusinessProfile>): void {
  Object.assign(profile.value, patch);
}

function selectPreset(preset: BusinessProfile): void {
  const demoProfile = cloneProfile(preset);
  (demoProfile as any).id = `demo-${demoProfile.id}`;
  profile.value = demoProfile;
  inputUrl.value = preset.url;
  saveToHistory(demoProfile);

  if (preset.id === 'dourados-odonto') regionFilter.value = 'dentista-dourados';
  else if (preset.id === 'pizza-nonna') regionFilter.value = 'pizzaria-curitiba';
  else if (preset.id === 'workshop-precision') regionFilter.value = 'oficina-bh';
  else regionFilter.value = 'dentista-dourados';

  analysisNotification.value = {
    type: 'success',
    message: `Exemplo (demonstração): "${preset.name}" (${preset.city}). Dados públicos/fictícios, não é análise real.`,
  };
}

function extractBusinessFromCandidate(extracted: string): { businessName: string | null; city: string | null } {
  if (!extracted) return { businessName: null, city: null };
  const lines = extracted
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('Fonte:') && !l.toLowerCase().includes('citação'));
  const first = lines[0] || '';
  const nameMatch = first.match(/(?:Empresa|Nome|Local)[:\-]\s*(.+)/i);
  const businessName = nameMatch ? nameMatch[1].trim() : first.replace(/[\[\]()]/g, '').trim() || null;
  const cityMatch = extracted.match(/(?:Cidade|Localização|Endereço)[^,\n]*,?\s*([^,\n]+(?:-[A-Z]{2})?)/i);
  const city = cityMatch ? cityMatch[1].trim() : null;
  return { businessName: businessName && businessName.length > 2 ? businessName : null, city };
}

async function startAnalysis(): Promise<void> {
  const rawUrl = inputUrl.value.trim();
  if (!rawUrl) {
    analysisNotification.value = {
      type: 'error',
      message: 'Por favor, digite ou cole um link do Google Maps ou link de compartilhamento.',
    };
    return;
  }

  try {
    const u = new URL(rawUrl);
    const host = u.hostname.toLowerCase();
    if (
      !host.includes('google.com') &&
      !host.includes('maps.app.goo.gl') &&
      !host.includes('goo.gl') &&
      !host.includes('share.google')
    ) {
      analysisNotification.value = {
        type: 'error',
        message: 'URL deve ser do Google Maps ou link de compartilhamento do Google.',
      };
      return;
    }
  } catch {
    analysisNotification.value = {
      type: 'error',
      message: 'URL inválida.',
    };
    return;
  }

  isAnalyzing.value = true;
  analysisNotification.value = null;

  try {
    const baseUrl = functionsBaseUrl || import.meta.env.VITE_INSFORGE_URL;
    if (!baseUrl) {
      throw new Error('Configuração InsForge ausente.');
    }

    const lookupRes = await fetch(`${baseUrl}/functions/lookup-business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: rawUrl, name: profile.value.name || undefined, city: profile.value.city || undefined }),
    });

    const lookupData = await lookupRes.json().catch(() => ({}));
    if (!lookupRes.ok || !lookupData.success) {
      throw new Error(lookupData.error || 'Não foi possível obter dados públicos deste link.');
    }

    const c = lookupData.candidate || {};
    if (!c.businessName) {
      throw new Error('Não foi possível identificar o nome da empresa a partir deste link. Ajuste o nome e tente novamente.');
    }

    const rating = typeof c.rating === 'number' ? c.rating : 0;
    const reviewsCount = typeof c.reviewsCount === 'number' ? c.reviewsCount : 0;
    const photosCount = typeof c.photosCount === 'number' ? c.photosCount : 0;
    const website = c.website || '';
    const phone = c.phone || '';
    const address = c.address || '';
    const category = c.category || 'Presença pública';
    const city = c.city || 'Cidade não informada';

    const newProfile: BusinessProfile = {
      id: `analyzed-${Date.now()}`,
      name: c.businessName,
      city,
      category,
      url: rawUrl,
      phone,
      address,
      website,
      adHeadline: `${c.businessName} - Presença pública`,
      adDescription: c.summary || 'Análise com base em dados públicos verificáveis.',
      targetKeyword: category ? `${category} em ${city}` : 'Empresa local',
      hasWebsite: Boolean(website),
      hasWhatsapp: c.hasWhatsapp === true,
      reviewsCount,
      rating,
      responseRate: 0,
      photosCount,
      hasProfessionalPhotos: photosCount >= 5,
      hasRegularHours: c.hasHours === true,
      hasSpecialHours: false,
      hasServicesList: false,
      hasRecentPosts: false,
      hasOptimizedDescription: false,
      hasNapConsistency: Boolean(address && phone),
      image: PRESET_DOURADOS.image,
    };

    profile.value = newProfile;
    saveToHistory(newProfile);

    const missing: string[] = [];
    if (!rating) missing.push('avaliação');
    if (!reviewsCount) missing.push('nº de avaliações');
    if (!website) missing.push('site');
    if (!phone) missing.push('telefone');

    analysisNotification.value = {
      type: 'success',
      message: missing.length === 0
        ? `Dados públicos verificados: "${newProfile.name}" — ${reviewsCount} avaliações (${rating.toFixed(1)} ★), site e telefone confirmados. Métricas privadas (visualizações/interações) não estão disponíveis publicamente.`
        : `Dados públicos de "${newProfile.name}" sincronizados. Não verificado: ${missing.join(', ')}. Métricas privadas (visualizações/interações) não estão disponíveis publicamente.`,
    };
    activeTab.value = 'diagnosis';
    isAnalyzing.value = false;
    return;
  } catch (err: any) {
    console.warn('Erro ao analisar link com dados públicos:', err);
    analysisNotification.value = {
      type: 'error',
      message: err?.message || 'Não foi possível obter dados públicos deste link. Verifique se é um link válido do Google Maps ou link de compartilhamento.',
    };
    isAnalyzing.value = false;
    return;
  }
}



function restoreHistory(item: AnalysisHistoryItem): void {
  profile.value = cloneProfile(item.profile);
  if (item.url) inputUrl.value = item.url;
  showHistoryModal.value = false;
  analysisNotification.value = {
    type: 'success',
    message: `Consulta retomada com sucesso: "${item.name}" (Score ${item.score}/100) carregada do histórico local sem reprocessar URL!`,
  };
  activeTab.value = 'ads_telemetry';
}

function removeHistory(id: string): void {
  removeHistoryItem(id);
}

function clearAllHistory(): void {
  clearHistory();
  analysisNotification.value = {
    type: 'success',
    message: 'Histórico de consultas locais esvaziado.',
  };
}

function copyPitch(): void {
  navigator.clipboard.writeText(pitchText.value);
  copiedPitch.value = true;
  setTimeout(() => {
    copiedPitch.value = false;
  }, 3000);
}

function exportCSV(): void {
  const p = profile.value;
  const t = p.telemetry;
  const nowStr = new Date().toLocaleDateString('pt-BR');
  const sanitizedName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const lines: string[] = [
    'sep=;',
    'RELATORIO DE TELEMETRIA E CONVERSAO - RADAR LOCAL',
    `Data da Exportacao;${nowStr}`,
    `Consultor Responsavel;${consultantName.value}`,
    `Contato Consultor;${consultantPhone.value}`,
    '',
    '--- DADOS CADASTRAIS DA EMPRESA ---',
    `Nome da Empresa;${p.name}`,
    `Cidade / Estado;${p.city}`,
    `Categoria Principal;${p.category}`,
    `Endereco;${p.address}`,
    `Telefone;${p.phone}`,
    `Website Oficial;${p.website}`,
    `Avaliacao no Google;${p.rating.toFixed(1).replace('.', ',')} estrelas`,
    `Total de Avaliacoes;${p.reviewsCount}`,
    `Taxa de Resposta do Dono;${p.responseRate}%`,
    `Credito para Anuncio Google Ads;R$ ${(t?.adCredit || 0).toLocaleString('pt-BR')}`,
    '',
    '--- METRICAS DE ENGAJAMENTO (GOOGLE INSIGHTS) ---',
    `Visualizacoes Totais no Google;${(t?.views || 0).toLocaleString('pt-BR')};Crescimento: +${(t?.viewsGrowth || 0).toString().replace('.', ',')}%`,
    `Interacoes Totais;${t?.interactions || 0};Crescimento: +${(t?.interactionsGrowth || 0).toString().replace('.', ',')}%`,
    `Taxa Atual de Conversao (Agendamentos / Interacoes);${conversion.value.currentConversionRate.toFixed(2).replace('.', ',')}%;Gargalo critico identificado`,
    '',
    '--- FUNIL DETALHADO DE INTERACOES ---',
    'Canal de Interacao;Quantidade;Participacao (%)',
    `Orientacoes de Rota (Google Maps);${t?.directions || 0};${(((t?.directions || 0) / Math.max(1, t?.interactions || 1)) * 100).toFixed(1).replace('.', ',')}%`,
    `Chamadas Telefonicas;${t?.calls || 0};${(((t?.calls || 0) / Math.max(1, t?.interactions || 1)) * 100).toFixed(1).replace('.', ',')}%`,
    `Cliques no Website;${t?.websiteClicks || 0};${(((t?.websiteClicks || 0) / Math.max(1, t?.interactions || 1)) * 100).toFixed(1).replace('.', ',')}%`,
    `Agendamentos Concluidos;${t?.bookings || 0};${(((t?.bookings || 0) / Math.max(1, t?.interactions || 1)) * 100).toFixed(1).replace('.', ',')}%`,
    '',
    '--- HISTORICO MENSAL DE INTERACOES (2026) ---',
    'Mes;Interacoes Registradas',
    ...(t?.monthlyHistory?.map((h) => `${h.month};${h.interactions}`) || []),
    '',
    '--- ESTUDO DE IMPACTO FINANCEIRO ---',
    `Ticket Medio Configurado;R$ ${ticketAverage.value.toLocaleString('pt-BR')}`,
    `Meta de Conversao Adicional;+${targetConversionBoost.value}%`,
    `Novos Pacientes Estimados / Mes;+${conversion.value.additionalMonthlyBookings} pacientes`,
    `Faturamento Mensal Adicional Estimado;R$ ${conversion.value.additionalMonthlyRevenue.toLocaleString('pt-BR')}`,
    `Faturamento Anual Projetado;R$ ${conversion.value.additionalAnnualRevenue.toLocaleString('pt-BR')}`,
    `Custo da Inacao (Dinheiro Deixado na Mesa no Acumulado);R$ ${conversion.value.missedAccumulatedRevenue.toLocaleString('pt-BR')}`,
    '',
    '--- COMPARATIVO ENTRE CENARIOS DE CONVERSAO ---',
    'Cenario;Taxa de Conversao;Pacientes / Mes;Faturamento Mensal (R$);Faturamento Anual (R$)',
    ...conversion.value.tiers.map(
      (tier) =>
        `${tier.label};${tier.rateDisplay};${tier.bookings};R$ ${tier.monthlyRev.toLocaleString('pt-BR')};R$ ${tier.annualRev.toLocaleString('pt-BR')}`
    ),
    '',
    '--- PROJECAO DE 6 MESES DE TRAJETORIA (R$/MES) ---',
    `Mes;Cenario Atual (0%);Cenario +2%;Meta (+${targetConversionBoost.value}%);Cenario +8%`,
    ...conversion.value.timelineData.map(
      (d) =>
        `${d.month};R$ ${d.current.toLocaleString('pt-BR')};R$ ${d.scenario2.toLocaleString('pt-BR')};R$ ${d.target.toLocaleString('pt-BR')};R$ ${d.scenario8.toLocaleString('pt-BR')}`
    ),
  ];

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `radar_local_telemetria_${sanitizedName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  analysisNotification.value = {
    type: 'success',
    message: `Planilha CSV "radar_local_telemetria_${sanitizedName}.csv" exportada com sucesso!`,
  };
}

function openPrint(preset?: PrintPreset): void {
  if (preset) applyPrintPreset(preset);
  showPrintCustomizeModal.value = true;
}

function printReport(): void {
  showPrintCustomizeModal.value = false;
  handlePrintReport();
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased">
    <ReportPrintView
      :profile="profile"
      :audit="audit"
      :conversion="conversion"
      :target-conversion-boost="targetConversionBoost"
      :ticket-average="ticketAverage"
      :sections="printSections"
      :consultant-name="consultantName"
      :consultant-phone="consultantPhone"
    />

    <div class="no-print flex-1 flex flex-col">
      <AppHeader
        :active-tab="activeTab"
        :history-count="historyCount"
        @update:active-tab="activeTab = $event"
        @export-csv="exportCSV"
        @open-print="openPrint()"
        @open-history="showHistoryModal = true"
      />

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <AnalysisPanel
          :input-url="inputUrl"
          :profile="profile"
          :presets="PRESETS"
          :is-analyzing="isAnalyzing"
          :notification="analysisNotification"
          :history-count="historyCount"
          @update:input-url="inputUrl = $event"
          @update-profile="updateProfile"
          @analyze="startAnalysis"
          @select-preset="selectPreset"
          @open-history="showHistoryModal = true"
          @close-notification="analysisNotification = null"
        />

        <TabNav :active-tab="activeTab" @update:active-tab="activeTab = $event" />

        <TelemetryTab
          v-if="activeTab === 'ads_telemetry' && profile.telemetry"
          :profile="profile"
          :conversion="conversion"
          :target-conversion-boost="targetConversionBoost"
          :ticket-average="ticketAverage"
          @update:target-conversion-boost="targetConversionBoost = $event"
          @update:ticket-average="ticketAverage = $event"
          @export-csv="exportCSV"
          @open-print="openPrint"
          @update:active-tab="activeTab = $event"
        />

        <DiagnosisTab
          v-else-if="activeTab === 'diagnosis'"
          :profile="profile"
          :audit="audit"
          @open-print="openPrint"
          @update:active-tab="activeTab = $event"
        />

        <PreviewTab
          v-else-if="activeTab === 'preview'"
          :profile="profile"
          :preview-device="previewDevice"
          :regions="REGIONS_DATA"
          :region-filter="regionFilter"
          :regional="regional"
          @update:preview-device="previewDevice = $event"
          @update:region-filter="regionFilter = $event"
        />

        <CommercialTab
          v-else-if="activeTab === 'commercial'"
          :profile="profile"
          :consultant-name="consultantName"
          :consultant-phone="consultantPhone"
          :copied-pitch="copiedPitch"
          :pitch-text="pitchText"
          @update:consultant-name="consultantName = $event"
          @update:consultant-phone="consultantPhone = $event"
          @copy="copyPitch"
          @open-print="openPrint"
        />

        <SimulatorTab
          v-else-if="activeTab === 'audit_matrix'"
          :profile="profile"
          @update-profile="updateProfile"
        />
      </main>

      <FooterBar />
    </div>

    <HistoryModal
      v-if="showHistoryModal"
      :history="history"
      :current-name="profile.name"
      @close="showHistoryModal = false"
      @restore="restoreHistory"
      @remove="removeHistory"
      @clear="clearAllHistory"
    />



    <PrintCustomizeModal
      v-if="showPrintCustomizeModal"
      :sections="printSections"
      :active-count="activeSectionsCount"
      :profile="profile"
      :conversion="conversion"
      :target-conversion-boost="targetConversionBoost"
      :consultant-name="consultantName"
      :consultant-phone="consultantPhone"
      @update:sections="setPrintSections"
      @apply-preset="applyPrintPreset"
      @update:consultant-name="consultantName = $event"
      @update:consultant-phone="consultantPhone = $event"
      @print="printReport"
      @close="showPrintCustomizeModal = false"
    />
  </div>
</template>
