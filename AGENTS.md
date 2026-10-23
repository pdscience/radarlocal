# Radar Local

## Backend

This project uses InsForge. The linked project metadata lives in `.insforge/project.json`, which must never be committed.

Always run the CLI through `npx -y @insforge/cli <command>`. Do not install or call a global `insforge` binary.

Useful commands:

- `npx -y @insforge/cli current`
- `npx -y @insforge/cli db migrations new <name>`
- `npx -y @insforge/cli db migrations up --all`
- `npx -y @insforge/cli functions deploy <slug> --file <path>`
- `npx -y @insforge/cli functions invoke <slug> --data '<json>'`
- `npx -y @insforge/cli diagnose advisor`

Use the `insforge` skill for SDK and app integration work. Use the `insforge-cli` skill for database, functions, secrets, deployments, and diagnostics.

## Security

- Keep `GEMINI_API_KEY` and the InsForge admin API key server-side only.
- Only `VITE_INSFORGE_URL` and `VITE_INSFORGE_ANON_KEY` may be exposed to the browser.
- Never commit `.env`, `.env.local`, or `.insforge/project.json`.
- Do not introduce fabricated business data or silent fallbacks. Missing data must be shown as unverified.

## Verification

Run these before claiming work is complete:

```bash
npm run lint
npm run test
npm run build
```
