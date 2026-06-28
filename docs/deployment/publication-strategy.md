# EPIC 2 - Publication Strategy

## Objetivo
Preparar a publicacao do MVP da Legal AI Factory com separacao clara de responsabilidades entre frontend, backend e dados, mantendo o codigo em repositorio privado.

## Arquitetura de publicacao

### 1) Codigo-fonte em GitHub privado
- Repositorio privado para proteger propriedade intelectual e ativos de conhecimento.
- Branch principal para release controlada.
- Branches de epicos para evolucao incremental.

### 2) Frontend no Vercel
- Aplicacao React/Vite publicada no Vercel.
- Build command: `npm run build`.
- Output directory: `dist`.
- Variavel obrigatoria de ambiente:
  - `VITE_API_BASE_URL` apontando para a URL publica do backend no Render.

### 3) Backend/API no Render
- API Express publicada como Web Service no Render.
- Start command: `npm run start:api`.
- Porta controlada por `API_PORT` (fallback interno para 8787).
- CORS habilitado para:
  - dominio configurado em `CORS_ORIGIN` (CSV), e
  - dominios `https://*.vercel.app`.

### 4) Supabase para banco e storage
- Persistencia relacional e armazenamento de artefatos.
- Variaveis de ambiente:
  - Frontend: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Separacao de variaveis por camada

### Frontend
- `VITE_API_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Backend
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGIN`
- `API_PORT`

## Fluxo recomendado de runtime
1. Usuario acessa frontend no Vercel.
2. Frontend chama API externa definida em `VITE_API_BASE_URL`.
3. Backend no Render processa skills/workflows e integra LLMs.
4. Backend persiste e consulta dados/arquivos no Supabase.

## Observacoes operacionais
- Nenhum deploy automatico foi configurado neste epico.
- Publicacao depende de configuracao manual dos provedores e segredos.
- O script `npm run deploy:check` valida artefatos e variaveis esperadas antes da publicacao.
