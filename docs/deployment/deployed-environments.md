# Deployed Environments - EPIC 4

## Objetivo
Registrar URLs de frontend e backend publicadas para validacao online ponta a ponta.

## Frontend (Vercel)
- Projeto: `legal-ai-factory`
- URL publica: `https://legal-ai-factory.vercel.app`
- Variaveis confirmadas no projeto frontend:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
- Variaveis removidas por seguranca:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY`
- Variavel ainda pendente:
  - nenhuma
- Variavel configurada em 2026-06-28:
  - `VITE_API_BASE_URL=https://legal-ai-factory.onrender.com`

## Backend (Render/Railway/Vercel Serverless)
- Provedor escolhido: Render (Web Service)
- URL publica: `https://legal-ai-factory.onrender.com`
- Health check esperado:
  - `GET /api/health`
- Variaveis backend esperadas:
  - `GEMINI_API_KEY`
  - `OPENAI_API_KEY` (opcional)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `CORS_ORIGIN`
  - `API_PORT` (opcional)

## Status
- Backend publicado no Render e health check validado.
- Frontend com `VITE_API_BASE_URL` configurada.
- Redeploy manual pela UI da Vercel bloqueado por permissao de colaboracao da equipe Hobby; proximo deploy por push na branch ativa aplica a variavel configurada.
