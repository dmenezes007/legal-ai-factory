# Security Env Review - EPIC 3

## Contexto
Durante a configuracao do projeto na Vercel, foram identificadas variaveis de ambiente incluindo `SUPABASE_SERVICE_ROLE_KEY` no mesmo projeto que publica o frontend.

## Alerta de seguranca
- `SUPABASE_SERVICE_ROLE_KEY` e credencial de privilegio elevado.
- Mesmo sem prefixo `VITE_`, manter essa chave no projeto do frontend aumenta risco operacional (uso acidental em build, logs, ou codigo serverless acoplado ao frontend).

## Recomendacao
1. Remover `SUPABASE_SERVICE_ROLE_KEY` do projeto da Vercel do frontend.
2. Manter `SUPABASE_SERVICE_ROLE_KEY` apenas no backend/API (Render), com acesso restrito.
3. No frontend, usar somente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Revisar periodicamente variaveis da Vercel para evitar segredos de backend no escopo do frontend.

## Status
- Revisao registrada.
- Acao executada em 2026-06-28 no painel da Vercel (frontend):
   - `SUPABASE_SERVICE_ROLE_KEY` removida.
   - `GEMINI_API_KEY` removida.
- Variaveis mantidas no frontend (Vercel):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
- Atualizacao EPIC 4:
   - `VITE_API_BASE_URL` configurada para `https://legal-ai-factory.onrender.com`.
