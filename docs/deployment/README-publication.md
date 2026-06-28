# README de Publicacao - Legal AI Factory

## 1. Criar repositorio GitHub
1. Crie um repositorio privado no GitHub.
2. Copie a URL HTTPS do repositorio.

## 2. Adicionar remote origin
```bash
git remote add origin <URL_DO_REPOSITORIO>
```

## 3. Fazer push da branch
```bash
git push -u origin <NOME_DA_BRANCH>
```

## 4. Conectar frontend no Vercel
1. No Vercel, importe o repositorio GitHub.
2. Framework: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Configure variavel de ambiente:
   - `VITE_API_BASE_URL=https://<sua-api-no-render>`

## 5. Conectar backend no Render
1. No Render, crie um Web Service apontando para o mesmo repositorio.
2. Start command: `npm run start:api`.
3. Configure variaveis de ambiente backend:
   - `API_PORT` (opcional)
   - `CORS_ORIGIN=https://<seu-projeto>.vercel.app`
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 6. Configurar Supabase
1. Crie projeto no Supabase.
2. Copie URL e chaves.
3. Configure no frontend:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Configure no backend:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 7. Validacao antes da publicacao
```bash
npm run deploy:check
npm run lint
npm test
```

## 8. Observacao
- Este repositorio foi preparado para deploy, mas nenhum deploy automatico foi executado.
