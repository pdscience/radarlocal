# Migração do Radar Local de React para Vue 3

Data: 2026-10-22
Status: aprovado para planejamento

## Objetivo

Migrar integralmente o frontend do Radar Local de React para Vue 3 + TypeScript,
preservando o design visual, os textos, os dados, os cálculos e todos os fluxos
existentes. O backend Express (`server.ts`) permanece inalterado.

## Fora de escopo

- Alterações no endpoint `/api/analyze-url` ou em qualquer código de servidor.
- Novas funcionalidades de produto, autenticação, banco de dados ou redesenho.
- Mudanças de identidade visual, paleta, tipografia ou estrutura de layout.
- Publicação/deploy.

## Stack e dependências

Manter:

- Vite 8, Tailwind CSS v4 via `@tailwindcss/vite`, TypeScript, `tsx`, Express,
  `dotenv`, `@google/genai`.
- `index.css` (incluindo regras de impressão e scrollbar), fontes Plus Jakarta
  Sans/JetBrains Mono e metadados do `index.html`.

Adicionar:

- `vue`
- `@vitejs/plugin-vue`
- `lucide-vue-next`
- `chart.js`
- `vue-chartjs`
- `vue-tsc`

Remover:

- `react`, `react-dom`, `react-is`
- `@vitejs/plugin-react`
- `@types/react`, `@types/react-dom`
- `recharts`
- `motion` (não é referenciado em `src/`; remover para evitar dependência morta)

`package.json` passa a se chamar `radar-local` e o script `lint` passa a ser
`vue-tsc --noEmit`. O script `dev` continua `tsx server.ts`.

## Arquitetura

Aplicação SPA Vue 3 com `<script setup lang="ts">`. Estado compartilhado no
`App.vue`; lógica de domínio isolada em composables e utilitários puros;
apresentação dividida por abas e modais.

```
src/
  main.ts
  App.vue
  index.css
  types.ts
  data/presets.ts
  utils/scoring.ts
  utils/format.ts
  composables/useHistory.ts
  composables/useAuditAnalysis.ts
  composables/useConversionMetrics.ts
  composables/useRegionalComparison.ts
  composables/usePrintReport.ts
  components/AppHeader.vue
  components/AnalysisPanel.vue
  components/TabNav.vue
  components/FooterBar.vue
  components/ui/MetricInfoTooltip.vue
  components/charts/RevenueLineChart.vue
  components/tabs/TelemetryTab.vue
  components/tabs/DiagnosisTab.vue
  components/tabs/PreviewTab.vue
  components/tabs/CommercialTab.vue
  components/tabs/SimulatorTab.vue
  components/modals/HistoryModal.vue
  components/modals/RawImportModal.vue
  components/modals/PrintCustomizeModal.vue
  components/ReportPrintView.vue
```

### Responsabilidades

- `types.ts`: `TelemetryData`, `BusinessProfile`, `AnalysisHistoryItem`,
  `RegionalReference`.
- `data/presets.ts`: `PRESET_DOURADOS`, `PRESET_PIZZERIA`, `PRESET_WORKSHOP`,
  `REGIONS_DATA`, `HISTORY_STORAGE_KEY`.
- `utils/scoring.ts`: `calculateProfileScore`.
- `utils/format.ts`: formatação `pt-BR` de números/moeda e percentuais com
  vírgula decimal.
- `useHistory`: carregamento inicial, persistência, limite de 5 itens,
  deduplicação por nome/URL, restaurar, remover e limpar.
- `useAuditAnalysis`: score, 4 pilares, falhas críticas, pontos fortes e
  classificação.
- `useConversionMetrics`: taxa atual, cenários (+0/+2/+meta/+8), projeções
  mensal/anual, custo da inação e dados da linha do tempo.
- `useRegionalComparison`: deltas e forças em relação à região selecionada.
- `usePrintReport`: estado das 7 seções, presets (`all`, `client`,
  `diagnosis_financial`, `commercial`, `technical`), contagem de seções e
  acionamento de `window.print()`.
- `App.vue`: estado compartilhado, orquestração da análise/importação/CSV,
  props/emits e composição das abas, modais e relatório.

### Estado compartilhado (`App.vue`)

`profile`, `inputUrl`, `activeTab`, `previewDevice`, `isAnalyzing`,
`analysisStep`, `analysisNotification`, `copiedPitch`, `consultantName`,
`consultantPhone`, `showRawImportModal`, `rawTextImport`, `ticketAverage`,
`targetConversionBoost`, `regionFilter`, `showHistoryModal`,
`showPrintCustomizeModal` e o estado de `usePrintReport`.

Componentes filhos recebem props tipadas e emitem eventos para o `App.vue`.
Nenhum componente acessa `localStorage` ou a API diretamente.

## Fluxos preservados

1. **Análise de URL:** `POST /api/analyze-url` com `{ url, name, city }`.
   Em sucesso, monta `BusinessProfile` com os mesmos defaults por campo e salva
   no histórico. Em falha, usa `PRESET_DOURADOS` após 600 ms e notifica.
2. **Seleção de preset:** troca o perfil, a URL, salva no histórico, ajusta o
   `regionFilter` correspondente e notifica.
3. **Importação de texto do Google:** mesma extração por regex de avaliações,
   nota, visualizações, interações, chamadas, rotas, cliques no site,
   agendamentos e crédito; mescla com o perfil atual e salva no histórico.
4. **Histórico:** chave `radar_local_query_history_v1`, seed inicial com
   Dourados, máximo 5, mais recente primeiro, restauração sem reprocessar URL.
5. **CSV:** mesmas linhas/seções atuais, BOM UTF-8, delimitador `;`, nome
   `radar_local_telemetria_<slug>.csv`.
6. **Relatório PDF:** relatório oculto em tela (`hidden print:block`) com as
   seções `overview`, `telemetry`, `pillars`, `diagnosis`, `financialStudy`,
   `commercialScript`, `consultantFooter`; modal de personalização e presets.
7. **Script comercial:** texto atual com nome, cidade, métricas e contato do
   consultor; cópia para a área de transferência com feedback por 3 s.
8. **Simulador:** sliders de nota, avaliações, fotos, checkboxes e sliders de
   conversão/ticket recalculam score e projeções em tempo real.

## Fidelidade visual

- Todas as classes Tailwind, cores, bordas, gradientes, sombras, grids e
  breakpoints do original são mantidos.
- Ícones Lucide mantêm os mesmos nomes/imports via `lucide-vue-next`.
- `MetricInfoTooltip` reproduz hover, clique, foco, seta, alinhamentos
  `left/center/right` e posição `top/bottom`.
- O gráfico Recharts é substituído por `LineChart` do Chart.js com as mesmas
  quatro séries:
  - `Atual (0%)` — rosa `#f43f5e`;
  - `Cenário +2%` — âmbar `#f59e0b`, tracejado;
  - `Meta (+X%)` — verde `#10b981`, linha grossa;
  - `Cenário +8%` — azul `#3b82f6`, tracejado.
  Grade escura, eixos cinza, legenda inferior e tooltip escuro em R$ por mês.
- A impressão continua usando as classes utilitárias já existentes em
  `index.css` e a classe `no-print`.

## Correções obrigatórias durante a port

1. Remover o `};` extra após `handleSelectPreset` no código React.
2. Reconstruir o fechamento da aba “Prévia do Anúncio”: o bloco “Filtro
   Geográfico” deixa de ficar aninhado dentro do card do Maps e passa a ser uma
   seção irmã abaixo da prévia.
3. Substituir rótulos fixos de Dourados por valores derivados do perfil ativo:
   - título “Detalhamento das {interactions} Interações”;
   - total de interações, rotas, chamadas, cliques e agendamentos;
   - percentuais do funil calculados;
   - nota/avaliações nos cards de prévia;
   - telefone e cidade no anúncio simulado;
   - textos “Sem posts”/“Slogan” dos pilares conforme flags do perfil.
   Para `PRESET_DOURADOS`, os valores exibidos permanecem idênticos aos atuais.
4. Garantir que o gráfico use a meta dinâmica `targetConversionBoost` no rótulo
   da série, tooltip e legenda.
5. Corrigir a tipagem do tooltip do gráfico para aceitar `number | string` sem
   recorrer a `any` desnecessário.

## Erros e estados

- Notificações de sucesso/erro mantêm o banner atual, com botão de fechar.
- URL vazia exibe erro e não chama a API.
- Falha de rede cai no fallback e informa sucesso com dados de Dourados.
- `localStorage` indisponível é tratado com `try/catch` e `console.warn`,
  sem quebrar a UI.
- Histórico vazio mostra o estado vazio atual.
- Erros de clipboard são capturados e não interrompem a UI.

## Validação

- `npm run lint` (`vue-tsc --noEmit`) sem erros.
- `npm run build` concluindo e gerando `dist/`.
- Smoke test em `npm run dev`:
  - analisar uma URL e ver o fallback;
  - alternar os 3 presets;
  - navegar pelas 5 abas;
  - salvar/restaurar/remover/limpar histórico;
  - importar texto bruto;
  - exportar CSV e conferir conteúdo;
  - abrir modal de PDF, alternar presets/seções e imprimir;
  - copiar script comercial;
  - mover sliders e conferir recálculo do score e do gráfico em todas as abas.
- Conferência visual lado a lado com a versão React para garantir equivalência.

## Critérios de aceite

- Nenhum arquivo React permanece em `src/`.
- Nenhuma dependência React/Recharts permanece no `package.json`.
- O app inicia via `npm run dev`, compila via `npm run build` e tipa via
  `npm run lint`.
- Todos os fluxos listados funcionam com os três presets.
- O layout, as cores, os textos e o comportamento responsivo são
  equivalentes ao original.
- `server.ts`, `index.css` e os arquivos de imagem permanecem funcionais.
