# LEGAL AI FACTORY

# 05_ADR_Index.md

**Architecture Decision Records Index**

Versão: 1.0
Status: Documento de Governança Arquitetural

Dependências:

* 01_Product_Vision.md
* 02_PRD.md
* 03_Constitution.md
* 04_Domain_Model.md

---

# 1. Finalidade

Este documento estabelece a política de registro das decisões arquiteturais da Legal AI Factory.

Todo componente estrutural da plataforma deverá possuir uma decisão arquitetural documentada sempre que:

* afetar múltiplos módulos;
* alterar princípios da Constituição;
* modificar o domínio;
* introduzir nova tecnologia;
* criar dependência externa;
* alterar padrões de desenvolvimento;
* modificar regras de segurança;
* alterar persistência de dados;
* modificar a estratégia de Inteligência Artificial.

---

# 2. Objetivos dos ADRs

Os Architecture Decision Records possuem cinco objetivos principais:

1. preservar a memória técnica do projeto;
2. justificar decisões relevantes;
3. evitar retrabalho;
4. orientar agentes de IA durante o desenvolvimento;
5. facilitar futuras revisões arquiteturais.

---

# 3. Princípios

Um ADR nunca descreve apenas "o que foi decidido".

Ele deverá explicar:

* o problema;
* o contexto;
* as alternativas avaliadas;
* a decisão adotada;
* suas consequências;
* os riscos assumidos.

---

# 4. Estrutura Padrão

Todo ADR deverá seguir obrigatoriamente a seguinte estrutura.

---

## Título

Descrição objetiva da decisão.

---

## Status

Exemplos:

Proposto

Aceito

Substituído

Obsoleto

Experimental

---

## Contexto

Descrição do problema.

---

## Decisão

Descrição objetiva da solução escolhida.

---

## Alternativas Consideradas

Lista das demais possibilidades.

---

## Consequências

Impactos positivos.

Impactos negativos.

Trade-offs.

---

## Relação com outros ADRs

Referências cruzadas.

---

## Referências

Links internos.

Documentos.

Bibliografia.

---

# 5. Organização dos ADRs

Os ADRs serão organizados por contexto arquitetural.

## ADR-Core

Decisões estruturais da plataforma.

---

## ADR-Architecture

Arquitetura geral.

---

## ADR-Domain

Modelo de domínio.

---

## ADR-Database

Persistência.

---

## ADR-AI

Inteligência Artificial.

---

## ADR-Workflows

Engine de Workflows.

---

## ADR-Skills

Engine de Skills.

---

## ADR-RAG

Recuperação de conhecimento.

---

## ADR-Documents

Document Intelligence.

---

## ADR-API

APIs.

---

## ADR-Frontend

Interface.

---

## ADR-UX

Experiência do usuário.

---

## ADR-Authentication

Autenticação.

---

## ADR-Security

Segurança.

---

## ADR-Deployment

Infraestrutura.

---

## ADR-DevOps

CI/CD.

---

## ADR-Observability

Logs.

Métricas.

Tracing.

---

## ADR-Performance

Escalabilidade.

---

## ADR-Cost

Custos operacionais.

---

## ADR-Testing

Estratégia de testes.

---

# 6. ADRs Planejados

A seguir encontra-se o conjunto inicial de ADRs previstos para a primeira versão da plataforma.

---

## ADR-Architecture-001

Arquitetura Modular.

---

## ADR-Architecture-002

Arquitetura baseada em Contextos (DDD).

---

## ADR-Architecture-003

Arquitetura orientada a eventos.

---

## ADR-Core-001

Knowledge Operating System como núcleo da plataforma.

---

## ADR-Core-002

Separação entre Domínio, IA e Infraestrutura.

---

## ADR-Core-003

API First.

---

## ADR-Domain-001

Matter como entidade central.

---

## ADR-Domain-002

Knowledge Objects.

---

## ADR-Domain-003

Intellectual Products.

---

## ADR-AI-001

Modelo de IA agnóstico.

---

## ADR-AI-002

AI Orchestrator.

---

## ADR-AI-003

Estratégia Multi-Model.

---

## ADR-AI-004

Fallback entre modelos.

---

## ADR-AI-005

Prompt Engine desacoplado.

---

## ADR-RAG-001

Estratégia de recuperação de conhecimento.

---

## ADR-RAG-002

Banco vetorial.

---

## ADR-RAG-003

Estratégia híbrida de busca.

---

## ADR-Skills-001

Skill First.

---

## ADR-Skills-002

Versionamento de Skills.

---

## ADR-Skills-003

Marketplace de Skills.

---

## ADR-Workflow-001

n8n como orquestrador.

---

## ADR-Workflow-002

Eventos de domínio.

---

## ADR-Workflow-003

Integração com agentes externos.

---

## ADR-Documents-001

Pipeline de OCR.

---

## ADR-Documents-002

Pipeline de extração semântica.

---

## ADR-Documents-003

Pipeline de indexação.

---

## ADR-Database-001

Modelo híbrido relacional + vetorial.

---

## ADR-Database-002

Separação entre dados transacionais e conhecimento.

---

## ADR-Database-003

Versionamento documental.

---

## ADR-API-001

REST como interface principal.

---

## ADR-API-002

Webhooks.

---

## ADR-API-003

Streaming.

---

## ADR-Security-001

LGPD.

---

## ADR-Security-002

Controle de acesso.

---

## ADR-Security-003

Auditoria.

---

## ADR-Frontend-001

Aplicação Web SPA.

---

## ADR-Frontend-002

Design System.

---

## ADR-Frontend-003

Arquitetura por Bounded Contexts.

---

## ADR-Testing-001

Pirâmide de testes.

---

## ADR-Testing-002

Testes de IA.

---

## ADR-Deployment-001

Cloud Native.

---

## ADR-Deployment-002

Containerização.

---

## ADR-Deployment-003

Ambientes de desenvolvimento, homologação e produção.

---

# 7. Fluxo de Aprovação

Toda decisão arquitetural seguirá o fluxo:

Problema

↓

Discussão

↓

ADR Proposto

↓

Validação

↓

Implementação

↓

Revisão

↓

Aceitação

---

# 8. Relação com Agentes de IA

Todo agente de IA deverá consultar os ADRs pertinentes antes de propor alterações estruturais.

Quando houver conflito entre duas soluções tecnicamente viáveis, deverá prevalecer aquela alinhada aos ADRs aceitos.

Na ausência de ADR aplicável, o agente deverá sugerir a criação de um novo registro antes da implementação.

---

# 9. Critérios para Criação de Novos ADRs

Um novo ADR deverá ser criado quando:

* uma decisão impactar mais de um contexto;
* houver substituição de tecnologia estratégica;
* um princípio constitucional precisar ser interpretado;
* surgir um novo padrão arquitetural;
* ocorrer mudança significativa na estratégia de IA;
* houver alteração do modelo de domínio.

---

# 10. Papel deste Documento

Este índice constitui o catálogo oficial das decisões arquiteturais da Legal AI Factory.

Ele deverá evoluir continuamente ao longo da vida do projeto.

Nenhuma decisão estrutural relevante deverá existir sem um ADR correspondente.
