# LEGAL AI FACTORY

# 07_Skill_Specification.md

**Skill Specification**

Versão: 1.0
Status: Documento Estrutural da Linguagem de Skills

Dependências:

* 01_Product_Vision.md
* 02_PRD.md
* 03_Constitution.md
* 04_Domain_Model.md
* 05_ADR_Index.md
* 06_AI_Design_Document.md

---

# 1. Finalidade

Este documento define o padrão oficial de especificação das Skills da Legal AI Factory.

Uma Skill representa uma metodologia estruturada de execução de uma atividade intelectual.

Ela descreve **o conhecimento operacional**, e não a implementação tecnológica.

A mesma Skill poderá ser executada por diferentes modelos de IA, diferentes Workflows e diferentes versões da plataforma.

---

# 2. Princípio Fundamental

Uma Skill é um ativo intelectual.

Ela não é:

* um prompt;
* um script;
* um workflow;
* um template;
* um documento.

Ela representa conhecimento estruturado.

---

# 3. Skill Definition Language (SDL)

Toda Skill será descrita utilizando uma linguagem declarativa denominada **Skill Definition Language (SDL)**.

A SDL será interpretada pelo AI Orchestrator.

A implementação técnica poderá variar.

A semântica da Skill permanecerá estável.

---

# 4. Estrutura Geral

Toda Skill deverá conter obrigatoriamente:

* Metadata
* Identity
* Purpose
* Scope
* Inputs
* Outputs
* Preconditions
* Context
* Knowledge Sources
* Capabilities
* Cognitive Pipeline
* Agents
* States
* Validation Rules
* Prompt Templates
* Workflows
* Events
* Quality Rules
* Human Review
* Version
* Dependencies

---

# 5. Metadata

Campos mínimos:

* ID
* Nome
* Categoria
* Área Jurídica
* Autor
* Organização
* Data de Criação
* Versão
* Status
* Licença
* Tags

---

# 6. Identity

Define a identidade permanente da Skill.

Exemplo:

Contestação SulAmérica

---

# 7. Purpose

Define claramente:

"O que esta Skill produz?"

---

# 8. Scope

Define:

* o que faz;
* o que não faz;
* limitações.

---

# 9. Inputs

Toda Skill deverá declarar explicitamente:

Entradas obrigatórias.

Entradas opcionais.

Entradas derivadas.

Entradas produzidas por outras Skills.

---

# 10. Outputs

Define todos os produtos gerados.

Exemplos:

Contestação

Relatório

Parecer

Contrato

JSON

DOCX

PDF

---

# 11. Preconditions

Condições necessárias antes da execução.

Exemplos:

Inicial disponível.

Documentos processados.

OCR concluído.

Knowledge Index atualizado.

---

# 12. Context

Toda Skill deverá declarar:

Contexto permanente.

Contexto jurídico.

Contexto processual.

Contexto do cliente.

Contexto da sessão.

---

# 13. Knowledge Sources

Lista das fontes obrigatórias.

Exemplo:

Doutrina

Jurisprudência

Mapa de Teses

Modelos

Documentos

Normas

---

# 14. Capabilities

Cada Skill deverá declarar quais capacidades necessita.

Exemplos:

OCR

Embeddings

Web Search

RAG

Timeline

DOCX

PDF

Workflow

---

# 15. Cognitive Pipeline

Toda Skill deverá declarar seu pipeline cognitivo.

Exemplo:

Diagnóstico

↓

Planejamento

↓

Arquitetura

↓

Produção

↓

Revisão

↓

Entrega

---

# 16. Agents

Lista dos agentes envolvidos.

Exemplo:

Document Analyst

Knowledge Analyst

Legal Strategist

Skill Executor

Quality Reviewer

Audit Agent

---

# 17. States

Toda Skill possui estados.

Draft

Validated

Approved

Deprecated

Archived

---

# 18. Validation Rules

Critérios mínimos de aceitação.

Exemplos:

Coerência

Completude

Aderência

Rastreabilidade

Consistência

---

# 19. Prompt Templates

Prompts nunca serão armazenados completos.

Serão descritos como templates parametrizados.

A composição final será realizada pelo Prompt Engine.

---

# 20. Workflow Binding

Uma Skill poderá estar associada a um ou mais Workflows.

Nunca dependerá exclusivamente deles.

---

# 21. Events

Toda Skill produzirá eventos.

Exemplos:

SkillStarted

SkillCompleted

SkillFailed

SkillReviewed

SkillApproved

---

# 22. Human Review

A Skill deverá declarar:

se exige revisão;

quem revisa;

quando revisa;

quais critérios utiliza.

---

# 23. Versionamento

Toda Skill possuirá:

versão;

histórico;

changelog;

compatibilidade;

dependências.

---

# 24. Herança

Skills poderão herdar comportamento.

Exemplo:

Skill Jurídica

↓

Contestações

↓

Contestações Saúde

↓

Contestação SulAmérica

---

# 25. Composição

Uma Skill poderá utilizar outras Skills.

Exemplo:

Contestação

↓

Resumo da Inicial

↓

Delimitação da Controvérsia

↓

Preliminares

↓

Mérito

↓

Prequestionamento

↓

Requerimentos

---

# 26. Reutilização

Toda Skill deverá ser reutilizável.

Nenhuma Skill será criada exclusivamente para um único caso.

---

# 27. Marketplace

A arquitetura deverá permitir compartilhamento de Skills.

---

# 28. Compilação

Uma Skill poderá ser convertida automaticamente em:

Workflow

Prompt

JSON

Grafo

Plano de Execução

Checklist

Documentação

---

# 29. Independência Tecnológica

A Skill jamais dependerá:

de um modelo específico;

de um fornecedor específico;

de uma tecnologia específica.

---

# 30. Papel deste Documento

Este documento define oficialmente a Skill Definition Language da Legal AI Factory.

Toda metodologia jurídica implementada na plataforma deverá ser descrita por meio dessa linguagem declarativa.

As Skills representam o principal patrimônio intelectual da plataforma e constituem a camada de conhecimento permanente sobre a qual atuarão o AI Orchestrator, os agentes cognitivos, os workflows e os modelos de Inteligência Artificial.
