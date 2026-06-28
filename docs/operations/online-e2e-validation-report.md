# Online E2E Validation Report - EPIC 4

## Escopo
Validar em ambiente publicado o fluxo completo de producao juridica ate exportacao DOCX.

## Estado atual (2026-06-28)
- Frontend Vercel: variaveis revisadas por nome.
- `VITE_API_BASE_URL`: configurada para `https://legal-ai-factory.onrender.com`.
- Segredos removidos do frontend:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY`
- Backend online: publicado no Render (`https://legal-ai-factory.onrender.com`).
- Health check online confirmado em `GET /api/health`.
- Teste Playwright online: implementado em `tests/e2e/online-first-legal-production.spec.ts`.

## Evidencias coletadas
- Painel de variaveis do projeto frontend mostrou apenas:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
- Toast de sucesso na Vercel ao remover variaveis sensiveis do frontend.
- Resposta de health da API online:
  - `{"status":"ok","service":"legal-ai-factory-local-api","geminiConfigured":false,...}`

## Bloqueadores
- Redeploy manual na Vercel bloqueado por permissao do autor do commit no plano Hobby.
- Para aplicar imediatamente no frontend publicado, realizar novo deploy via push da branch autorizada.

## Proximos passos para conclusao do EPIC 4
1. Executar `npm run test:e2e:online` contra o frontend publicado apos novo deploy na Vercel.
2. Anexar evidencias finais (resultado do teste e screenshots sem segredos).
