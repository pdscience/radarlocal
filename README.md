# Radar Local

Auditor de presença local no Google Maps e Google Ads. Frontend em Vue 3 + TypeScript + Tailwind CSS, com backend InsForge.

## Rodar localmente

**Pré-requisitos:** Node.js 20+

1. Instale as dependências:
   `npm install --legacy-peer-deps`
2. Autentique e vincule o projeto InsForge:
   `npx -y @insforge/cli current`
   `npx -y @insforge/cli link --project-id <project-id>`
3. Crie `.env.local` a partir de `.env.example` e preencha `VITE_INSFORGE_URL` e `VITE_INSFORGE_ANON_KEY`.
4. Mantenha `GEMINI_API_KEY` como secret do InsForge. Nunca use prefixo `VITE_` nessa chave.
5. Inicie a aplicação:
   `npm run dev`

O servidor Express em `server.ts` permanece temporariamente como legado até a migração da análise para as Edge Functions.

## Scripts

- `npm run dev` — inicia o servidor Express com Vite em modo desenvolvimento
- `npm run build` — gera o build de produção
- `npm run preview` — pré-visualiza o build
- `npm run lint` — executa a verificação de tipos com `vue-tsc`
- `npm run test` — executa os testes com Vitest
- `npm run test:watch` — executa os testes em modo watch
- `npm run clean` — remove `dist` e artefatos antigos

## Stack

- Vue 3 + TypeScript
- Vite
- Tailwind CSS v4
- Chart.js + vue-chartjs
- InsForge (SDK, banco, Edge Functions e deploy)
- Vitest + happy-dom + Vue Test Utils
