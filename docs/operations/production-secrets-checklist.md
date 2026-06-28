# Production Secrets Checklist

## Frontend (Vercel)
- [x] `SUPABASE_URL` configurada
- [x] `SUPABASE_ANON_KEY` configurada
- [x] `SUPABASE_SERVICE_ROLE_KEY` removida
- [x] `GEMINI_API_KEY` removida
- [x] `VITE_API_BASE_URL` configurada com URL real do backend

## Backend (provider de API)
- [ ] `GEMINI_API_KEY` configurada
- [ ] `OPENAI_API_KEY` configurada (se usada)
- [ ] `SUPABASE_URL` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [x] `CORS_ORIGIN` coberto por regex para dominios `*.vercel.app` na API
- [ ] `API_PORT` definida (quando necessario)

## Operacional
- [x] Nao expor valores de segredo em docs, logs ou screenshots
- [x] Confirmar health check online em `GET /api/health`
- [ ] Confirmar fluxo E2E online completo com exportacao DOCX (execucao pendente)
