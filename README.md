# Radar Local

Auditor de presença local no Google Maps e Google Ads. Frontend em Vue 3 + TypeScript + Tailwind CSS, com backend Express.

## Rodar localmente

**Pré-requisitos:** Node.js 20+

1. Instale as dependências:
   `npm install --legacy-peer-deps`
2. Configure as variáveis de ambiente no `.env` (por exemplo `GEMINI_API_KEY`).
3. Inicie a aplicação:
   `npm run dev`

Acesse `http://localhost:3000`.

## Scripts

- `npm run dev` — inicia o servidor Express com Vite em modo desenvolvimento
- `npm run build` — gera o build de produção
- `npm run preview` — pré-visualiza o build
- `npm run lint` — executa a verificação de tipos com `vue-tsc`
- `npm run clean` — remove `dist` e artefatos antigos

## Stack

- Vue 3 + TypeScript
- Vite
- Tailwind CSS v4
- Chart.js + vue-chartjs
- Express (`server.ts`, rota `/api/analyze-url`)
