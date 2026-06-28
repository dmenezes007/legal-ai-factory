# LEGAL AI FACTORY - PROTÓTIPO JURÍDICO DE ELITE

## MVP Local (contestacao-saude)

Fluxo funcional minimo entregue neste repositorio:

1. Criar caso na interface.
2. Selecionar skill `Contestacao Saude (MVP)`.
3. Importar fontes para `knowledge/sources/original`.
4. Processar fontes (pipeline local).
5. Gerar arquitetura e redacao dos capitulos.
6. Revisar blocos.
7. Baixar DOCX final (tambem salvo em `knowledge/cases/<case-id>/output/`).

### Execucao local

```bash
npm install
npm run dev:all
```

Frontend: `http://localhost:3000`
API local: `http://localhost:8787`

### Ingestao de conhecimento

```bash
npm run ingest
```

### Caso de exemplo

```bash
npm run demo:case
```

### Testes minimos

```bash
npm test
```

### Modo mock e modo real

- Modo mock: funciona sem chave de API.
- Modo real: usa `GEMINI_API_KEY` no ambiente da API.
- Se a chave nao estiver configurada, o sistema faz fallback automatico para mock.

Plataforma Web SaaS de produção jurídica assistida por Inteligência Artificial (IA), especialmente desenhada para a elaboração rápida, orientada e segura de contestações cíveis, consumeristas e trabalhistas.

---

## 🚀 Fluxo de Operação da Plataforma

1. **Novo Caso**: Cadastre o número do processo, as partes (Requerente, Requerido), o rito e a competência.
2. **Fontes de Informação**: Anexe a petição inicial e documentos complementares por upload (ou forneça links do Google Drive).
3. **Ingestão de IA**: Clique em **Processar Fontes** para simular a extração OCR e indexação vetorial.
4. **Diagnóstico Estratégico**: A IA detalhará os pedidos, fundamentos e apontará as **Lacunas de Defesa (Vulnerabilidades)**.
5. **Mapa de Teses**: Escolha quais defesas formais (preliminares) ou materiais (mérito) aplicar. Adicione teses customizadas se desejar.
6. **Arquitetura/Roteiro**: Monte e reordene a estrutura do sumário de capítulos.
7. **Redação Inteligente**: Acione o assistente para redigir o teor de cada capítulo individualmente. Modifique o texto gerado livremente.
8. **Revisão e Exportação**: Revise a peça unificada no formato clássico de petição e baixe um arquivo **Word (DOCX)** nativo e formatado ou payload **JSON**.

---

## 🛠️ Guia de Integração Futura (Roadmap Técnico)

A estrutura do código foi projetada para que você migre do modo simulação para conexões reais com o mínimo de alterações:

### 1. Substituição do Módulo Gemini (Real API)
Para realizar chamadas reais de backend utilizando o SDK oficial `@google/genai`, você pode configurar rotas no Express (em um arquivo `server.ts`) que processem as requisições enviadas pela aplicação React:
```typescript
// Exemplo de integração no backend server.ts
import { GoogleGenAI } from '@google/genai';
import express from 'express';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

app.post('/api/gemini/diagnose', async (req, res) => {
  const { caseData, documentsText } = req.body;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Analise a inicial e gere um diagnóstico de defesa jurídica para o caso: ${JSON.stringify(caseData)}. Fontes: ${documentsText}`,
    config: { responseMimeType: "application/json" }
  });
  
  res.json(JSON.parse(response.text));
});
```

### 2. Integração com Banco de Dados (Supabase / Postgres)
Substitua os estados em `localStorage` da aplicação React por conexões diretas via `@supabase/supabase-js`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Salvar novo caso no banco relacional
export async function insertCase(caseData) {
  const { data, error } = await supabase
    .from('legal_cases')
    .insert([caseData])
    .select();
  return data;
}
```

### 3. Integração com n8n Webhooks
Você pode rotear as informações do caso e os anexos processados para um fluxo de trabalho visual no n8n. No frontend React:
```typescript
export async function sendToN8n(casePayload) {
  await fetch('https://seu-n8n-url.com/webhook/legal-factory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(casePayload),
  });
}
```

### 4. Geração Autêntica de Arquivo .docx
Atualmente, o protótipo exporta um arquivo `.doc` estruturado em HTML que o Microsoft Word abre nativamente com formatação idêntica. Para gerar arquivos `.docx` no cliente, você pode instalar e integrar as bibliotecas `docx` ou `docxtemplater` via npm:
```bash
npm install docx
```
E estruturar a criação de parágrafos, cabeçalhos, rodapés e margens de 3cm diretamente em código TypeScript estruturado.

---

## 📦 Estrutura de Diretórios Criada
- `/src/types.ts`: Definições globais de interfaces de tipagem TypeScript.
- `/src/data/mockData.ts`: Dados realistas pré-hidratados (casos cíveis e trabalhistas complexos).
- `/src/services/geminiService.ts`: Orquestrador de Inteligência Artificial para OCR, diagnóstico e redação.
- `/src/components/Sidebar.tsx`: Painel de navegação contextual.
- `/src/components/Dashboard.tsx`: Dashboard analítico de acompanhamento.
- `/src/components/NewCase.tsx`: Formulário completo de cadastro de processos e fontes.
- `/src/components/CaseSources.tsx`: Ingestão documental e progresso OCR individual.
- `/src/components/Diagnostic.tsx`: Visualizador de pedidos e lacunas de contestação.
- `/src/components/ThesesMap.tsx`: Seletor inteligente de teses aplicáveis ao caso.
- `/src/components/Architecture.tsx`: Editor e reordenador de sumário de capítulos.
- `/src/components/Drafting.tsx`: Ambiente de redação e aprovação de tópicos por IA.
- `/src/components/Revision.tsx`: Revisão de minuta final de petição e exportadores de arquivos.
- `/src/components/AuditLogs.tsx`: Timeline auditável e logs detalhados do sistema.
