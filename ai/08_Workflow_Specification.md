# LEGAL AI FACTORY

# 08_Workflow_Specification.md

**Workflow Specification**

Versão: 1.0
Status: Documento Oficial da Linguagem de Workflows

Dependências:

* 01_Product_Vision.md
* 02_PRD.md
* 03_Constitution.md
* 04_Domain_Model.md
* 05_ADR_Index.md
* 06_AI_Design_Document.md
* 07_Skill_Specification.md

---

# 1. Finalidade

Este documento define o padrão oficial para especificação dos Workflows da Legal AI Factory.

Um Workflow representa a sequência operacional necessária para executar uma ou mais Skills.

O Workflow não contém conhecimento jurídico.

Ele descreve exclusivamente:

* estados;
* transições;
* eventos;
* integrações;
* dependências;
* execução;
* monitoramento.

---

# 2. Princípio Fundamental

A Skill responde:

**"Como pensar?"**

O Workflow responde:

**"Como executar?"**

---

# 3. Workflow Definition Language (WDL)

Todos os Workflows deverão ser descritos utilizando uma linguagem declarativa denominada **Workflow Definition Language (WDL)**.

A WDL será interpretada pelo Workflow Engine.

Sua implementação poderá ocorrer em:

* n8n;
* Temporal;
* LangGraph;
* orquestradores próprios;
* motores futuros.

---

# 4. Estrutura Geral

Todo Workflow deverá declarar obrigatoriamente:

* Metadata
* Identity
* Purpose
* Trigger
* Inputs
* Outputs
* Dependencies
* Preconditions
* Steps
* Decision Points
* Events
* External Services
* Human Approval Points
* Retry Policies
* Error Handling
* Monitoring
* Metrics
* Version

---

# 5. Metadata

Campos mínimos:

* ID
* Nome
* Categoria
* Área
* Versão
* Autor
* Organização
* Status
* Tags

---

# 6. Trigger

Todo Workflow deverá possuir um gatilho inicial.

Exemplos:

* Novo processo criado
* Upload concluído
* Documento indexado
* Aprovação humana
* Agendamento
* API
* Webhook
* Evento interno

---

# 7. Inputs

O Workflow deverá declarar todas as entradas necessárias.

Exemplos:

Matter

Documentos

Skills

Configurações

Usuário

Contexto

---

# 8. Outputs

Todo Workflow deverá produzir saídas claramente definidas.

Exemplos:

DOCX

PDF

JSON

Relatório

Logs

Evento

---

# 9. Preconditions

Condições obrigatórias antes da execução.

Exemplos:

OCR concluído.

Knowledge Index atualizado.

Skill aprovada.

Matter ativo.

---

# 10. Workflow States

Todo Workflow possuirá estados.

Exemplo:

Created

Ready

Running

Waiting

Review

Completed

Cancelled

Failed

Archived

---

# 11. Workflow Steps

Cada Workflow será composto por Steps independentes.

Cada Step deverá declarar:

* objetivo;
* entradas;
* saídas;
* agente responsável;
* Skill utilizada;
* eventos produzidos.

---

# 12. Decision Points

Workflows poderão conter decisões.

Exemplos:

Existe OCR?

↓

Sim

↓

Prosseguir

↓

Não

↓

Executar OCR

---

Existe revisão obrigatória?

↓

Sim

↓

Solicitar aprovação

↓

Não

↓

Continuar

---

# 13. Human Approval

Todo Workflow poderá declarar pontos obrigatórios de intervenção humana.

Exemplos:

* aprovação da arquitetura;
* aprovação da estratégia;
* aprovação da versão final;
* validação documental.

---

# 14. Workflow Events

Todo Workflow produzirá eventos.

Exemplos:

WorkflowStarted

StepCompleted

ApprovalRequested

ApprovalGranted

WorkflowCompleted

WorkflowFailed

---

# 15. External Services

Todo Workflow deverá declarar explicitamente os serviços externos utilizados.

Exemplos:

Gemini

OpenAI

Supabase

Google Drive

OCR

n8n

E-mail

Webhooks

---

# 16. Retry Policy

Todo Step deverá declarar política de repetição.

Campos mínimos:

* tentativas máximas;
* intervalo;
* estratégia de backoff;
* condição de interrupção.

---

# 17. Error Handling

Todo Workflow deverá definir tratamento de falhas.

Exemplos:

Falha recuperável

↓

Retry

Falha permanente

↓

Log

↓

Notificação

↓

Encerramento controlado

---

# 18. Monitoring

Todo Workflow deverá registrar:

tempo;

consumo;

modelo utilizado;

custo estimado;

tokens;

resultado.

---

# 19. Metrics

Cada Workflow deverá possuir métricas.

Exemplos:

tempo médio;

taxa de sucesso;

custo médio;

tempo por etapa;

retrabalho;

aprovações.

---

# 20. Versionamento

Todo Workflow possuirá:

versão;

histórico;

compatibilidade;

changelog.

---

# 21. Composição

Workflows poderão chamar outros Workflows.

Exemplo:

Produção da Contestação

↓

Indexação

↓

Diagnóstico

↓

Arquitetura

↓

Produção

↓

Revisão

↓

Exportação

---

# 22. Paralelismo

O Workflow Engine deverá suportar execução paralela.

Exemplos:

OCR

↓

Extração

↓

Embeddings

↓

Indexação

executados simultaneamente.

---

# 23. Idempotência

Toda etapa deverá poder ser executada novamente sem produzir inconsistências.

---

# 24. Observabilidade

Todo Step produzirá logs estruturados.

Todos os eventos serão rastreáveis.

---

# 25. Integração com Skills

Nenhum Workflow poderá substituir uma Skill.

Workflows executam.

Skills raciocinam.

---

# 26. Integração com o AI Orchestrator

Toda decisão envolvendo IA deverá ser delegada ao AI Orchestrator.

O Workflow nunca escolherá diretamente:

* modelo;
* prompt;
* estratégia jurídica.

---

# 27. Exemplo Conceitual

Workflow:

Produção de Contestação

Trigger

↓

Novo Matter

↓

Receber Documentos

↓

OCR

↓

Indexação

↓

Diagnóstico

↓

Selecionar Skill

↓

Executar Skill

↓

Revisão

↓

Gerar DOCX

↓

Versionar

↓

Encerrar

---

# 28. Papel deste Documento

Este documento estabelece a Workflow Definition Language (WDL) da Legal AI Factory.

Os Workflows representam a camada operacional da plataforma.

Eles descrevem exclusivamente a execução dos processos, permanecendo independentes da lógica jurídica, dos modelos de IA e das tecnologias de orquestração utilizadas.

Toda implementação futura — em n8n, Temporal, LangGraph ou outro mecanismo — deverá ser considerada apenas uma materialização técnica da WDL definida neste documento.
