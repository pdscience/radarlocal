# Migração React → Vue 3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever o frontend do Radar Local em Vue 3 + TypeScript, preservando design, dados e fluxos.

**Architecture:** SPA Vue 3 com estado no `App.vue`, lógica de domínio em composables e UI dividida em componentes por aba/modal. Backend Express intocado.

**Tech Stack:** Vue 3, TypeScript, Vite 8, Tailwind CSS v4, @lucide/vue, Chart.js + vue-chartjs, Express, @google/genai.

**Spec:** `docs/superpowers/specs/2026-10-22-vue-migration-design.md`

## Global Constraints

- Manter exatamente os textos em português, paleta dark e classes Tailwind do original.
- Manter `server.ts`, `src/index.css`, fontes e imagens funcionais.
- Remover todo código/dependência React ao final.
- Nenhum placeholder, `any` desnecessário ou lógica de API em componentes.
- Validar com `npm run lint` (`vue-tsc --noEmit`) e `npm run build`.

---

### Task 1: Configuração Vue e dependências

**Files:**
- Modify: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- Create: `src/main.ts`, `src/vite-env.d.ts`
- Delete: `src/main.tsx`, `src/App.tsx`

**Interfaces:**
- Produces: app Vue montado em `#root`, alias `@` apontando para `src`, plugin Vue ativo e script `lint` com `vue-tsc`.

- [ ] Atualizar dependências: remover React/Recharts/motion/@types React; manter Vue, @lucide/vue, Chart.js, vue-chartjs, vue-tsc.
- [ ] Trocar `@vitejs/plugin-react` por `@vitejs/plugin-vue` em `vite.config.ts`.
- [ ] Ajustar `tsconfig.json` para Vue (`jsx` removido, `types: ["vite/client"]`, inclusão de `.vue`).
- [ ] Trocar `index.html` para `/src/main.ts` e criar `main.ts` com `createApp(App).mount('#root')`.
- [ ] Rodar `npm run lint` e `npm run build` (build pode falhar até o App existir; lint deve rodar).

### Task 2: Tipos, dados, scoring e formatação

**Files:**
- Create: `src/types.ts`, `src/data/presets.ts`, `src/utils/scoring.ts`, `src/utils/format.ts`
- Delete legacy: nenhum

**Interfaces:**
- Produces:
  - `BusinessProfile`, `TelemetryData`, `AnalysisHistoryItem`, `RegionalReference`, `ConversionTier`, `TimelinePoint`, `AuditIssue`, `PassedPoint`, `AuditAnalysis`.
  - `PRESET_DOURADOS`, `PRESET_PIZZERIA`, `PRESET_WORKSHOP`, `REGIONS_DATA`, `HISTORY_STORAGE_KEY`.
  - `calculateProfileScore(profile: BusinessProfile): number`.
  - `formatNumber`, `formatCurrency`, `formatPercent`.

- [ ] Portar os três presets com todos os campos e telemetrias.
- [ ] Importar as imagens via `import ... from '../assets/images/...'` para funcionar no build.
- [ ] Portar `calculateProfileScore` exatamente.
- [ ] Portar `REGIONS_DATA` e a chave de histórico.
- [ ] Rodar `npm run lint`.

### Task 3: Composables de domínio

**Files:**
- Create: `src/composables/useHistory.ts`, `useAuditAnalysis.ts`, `useConversionMetrics.ts`, `useRegionalComparison.ts`, `usePrintReport.ts`

**Interfaces:**
- `useHistory(inputUrl: Ref<string>)` → `{ history, save(targetProfile, score?), remove(id), clear() }`.
- `useAuditAnalysis(profile: Ref<BusinessProfile>)` → `ComputedRef<AuditAnalysis>`.
- `useConversionMetrics(profile, ticketAverage: Ref<number>, targetConversionBoost: Ref<number>)` → `ComputedRef<ConversionMetrics>`.
- `useRegionalComparison(profile, score: Ref<number>, regionFilter: Ref<string>)` → `ComputedRef<RegionalComparison>`.
- `usePrintReport()` → `{ printSections, activeSectionsCount, applyPrintPreset, handlePrintReport, closeAfterPrint }`.

- [ ] Portar toda a lógica sem JSX.
- [ ] Derivar textos/percentuais de telemetria em vez de hardcode.
- [ ] Garantir classificação idêntica para Dourados (score 77, amber).
- [ ] Rodar `npm run lint`.

### Task 4: Componentes base

**Files:**
- Create: `src/components/ui/MetricInfoTooltip.vue`, `AppHeader.vue`, `AnalysisPanel.vue`, `TabNav.vue`, `FooterBar.vue`, `charts/RevenueLineChart.vue`

**Interfaces:**
- `MetricInfoTooltip`: props `title?`, `text`, `impact?`, `align?`, `position?`.
- `AppHeader`: props `activeTab`, `historyCount`; emits `update:activeTab`, `export-csv`, `open-raw-import`, `open-print`, `open-history`.
- `AnalysisPanel`: props `inputUrl`, `profile`, `presets`, `isAnalyzing`, `notification`; emits `update:inputUrl`, `update-profile`, `analyze`, `select-preset`, `open-history`, `close-notification`.
- `TabNav`: props `activeTab`; emits `update:activeTab`.
- `RevenueLineChart`: props `data: TimelinePoint[]`, `ticketAverage`, `targetBoost`.

- [ ] Portar markup e estilos com fidelidade visual.
- [ ] Registrar Chart.js e construir as 4 séries com cores/tracejados originais.
- [ ] Rodar `npm run lint`.

### Task 5: Abas

**Files:**
- Create: `src/components/tabs/TelemetryTab.vue`, `DiagnosisTab.vue`, `PreviewTab.vue`, `CommercialTab.vue`, `SimulatorTab.vue`

**Interfaces:**
- `TelemetryTab`: props `profile`, `conversion`, `targetConversionBoost`, `ticketAverage`; emits `update:targetConversionBoost`, `update:ticketAverage`, `export-csv`, `open-print`, `update:activeTab`.
- `DiagnosisTab`: props `profile`, `audit`; emits `open-print`, `update:activeTab`.
- `PreviewTab`: props `profile`, `previewDevice`, `regions`, `regionFilter`, `regional`; emits `update:previewDevice`, `update:regionFilter`.
- `CommercialTab`: props `profile`, `consultantName`, `consultantPhone`, `copiedPitch`, `pitchText`; emits `update:consultantName`, `update:consultantPhone`, `copy`, `open-print`.
- `SimulatorTab`: props `profile`; emits `update-profile`.

- [ ] Portar todas as seções, corrigindo o bloco geográfico para fora do card do Maps.
- [ ] Derivar métricas e percentuais do perfil ativo.
- [ ] Rodar `npm run lint`.

### Task 6: Modais e relatório impresso

**Files:**
- Create: `src/components/modals/HistoryModal.vue`, `RawImportModal.vue`, `PrintCustomizeModal.vue`, `src/components/ReportPrintView.vue`

**Interfaces:**
- `HistoryModal`: props `history`, `currentName`; emits `close`, `restore`, `remove`, `clear`.
- `RawImportModal`: props `modelValue`; emits `update:modelValue`, `close`, `import`.
- `PrintCustomizeModal`: props `sections`, `activeCount`, `profile`, `conversion`, `targetConversionBoost`, `consultantName`, `consultantPhone`; emits `update:sections`, `apply-preset`, `update:consultantName`, `update:consultantPhone`, `print`, `close`.
- `ReportPrintView`: props `profile`, `audit`, `conversion`, `sections`, `targetConversionBoost`, `ticketAverage`, `consultantName`, `consultantPhone`.

- [ ] Portar os 3 modais com todos os textos, presets e estados vazios.
- [ ] Portar as 7 seções do relatório impresso.
- [ ] Rodar `npm run lint`.

### Task 7: App.vue e integração

**Files:**
- Create: `src/App.vue`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes todos os composables e componentes.
- Produces handlers: `handleStartAnalysis`, `handleImportRawText`, `handleSelectPreset`, `handleExportCSV`, `handleCopyPitch`, `handleRestoreHistory`, `handleRemoveHistoryItem`, `handleClearHistory`, `handlePrintReport`.

- [ ] Portar estado compartilhado, análise via `/api/analyze-url` e fallback.
- [ ] Portar importação por regex, CSV, cópia do pitch e histórico.
- [ ] Montar Abas, Header, Footer, modais e `ReportPrintView`.
- [ ] Rodar `npm run lint` e `npm run build`.

### Task 8: Limpeza e validação final

**Files:**
- Modify: `README.md`, `package.json`
- Delete: `src/App.tsx`, `src/main.tsx`

- [ ] Remover arquivos e dependências React remanescentes.
- [ ] Atualizar README com stack e comandos.
- [ ] Rodar `npm run lint` e `npm run build` e corrigir qualquer erro.
- [ ] Smoke test no `npm run dev` (presets, abas, histórico, importação, CSV, PDF, sliders, gráfico).
