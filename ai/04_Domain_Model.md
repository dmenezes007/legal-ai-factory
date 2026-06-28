# LEGAL AI FACTORY

# 04_Domain_Model.md

**Domain Model**

Versão: 1.0
Status: Documento Estrutural do Domínio
Dependências:

* 01_Product_Vision.md
* 02_PRD.md
* 03_Constitution.md

---

# 1. Finalidade

Este documento descreve o modelo conceitual do domínio da Legal AI Factory.

Seu objetivo é definir as entidades fundamentais, seus significados, responsabilidades e relacionamentos, independentemente de linguagem de programação, banco de dados ou tecnologia.

Todo desenvolvimento deverá refletir este modelo.

---

# 2. Princípio Fundamental

A plataforma não modela documentos.

A plataforma modela conhecimento jurídico.

Documentos representam apenas manifestações desse conhecimento.

---

# 3. Hierarquia Conceitual

```text
Organization
    │
    ├── Workspace
    │
    ├── Users
    │
    ├── Clients
    │
    ├── Matters
    │
    │      ├── Judicial Case
    │      ├── Administrative Proceeding
    │      ├── Contract
    │      ├── Legal Opinion
    │      └── Consultation
    │
    ├── Documents
    │
    ├── Knowledge
    │
    ├── Skills
    │
    ├── Workflows
    │
    └── Intellectual Products
```

---

# 4. Entidades do Domínio

## Organization

Representa a entidade proprietária do conhecimento.

Exemplos:

* escritório de advocacia;
* departamento jurídico;
* seguradora;
* órgão público;
* empresa.

---

## Workspace

Representa um ambiente lógico de trabalho.

Cada organização pode possuir diversos Workspaces.

---

## User

Representa qualquer usuário autenticado.

Perfis possíveis:

* advogado;
* revisor;
* gestor;
* administrador;
* auditor.

---

## Client

Representa o cliente atendido.

Um cliente pode possuir diversos Matters.

---

## Matter

Representa qualquer demanda jurídica.

É a entidade central do domínio.

Tipos:

* Processo Judicial
* Procedimento Administrativo
* Arbitragem
* Parecer
* Contrato
* Consulta
* Due Diligence
* Investigação

Todo fluxo nasce em um Matter.

---

## Judicial Case

Especialização de Matter.

Possui:

* número do processo;
* tribunal;
* juízo;
* partes;
* rito;
* classe processual;
* fase processual.

---

## Party

Representa qualquer parte envolvida.

Exemplos:

* autor;
* réu;
* assistente;
* terceiro interessado.

---

## Document

Representa qualquer documento importado.

Jamais armazena apenas arquivos.

Após processamento gera conhecimento.

---

## Knowledge Object

Representa qualquer unidade de conhecimento.

Exemplos:

* tese;
* precedente;
* doutrina;
* cláusula;
* argumento;
* conceito;
* fato;
* evento;
* pedido.

---

## Fact

Representa fato juridicamente relevante.

---

## Event

Representa acontecimento cronológico.

---

## Evidence

Representa elemento probatório.

---

## Legal Issue

Representa uma questão jurídica identificada.

---

## Legal Thesis

Representa uma tese defensiva ou ofensiva.

Pode estar vinculada a:

* fatos;
* provas;
* fundamentos;
* jurisprudência;
* doutrina.

---

## Legal Strategy

Representa a estratégia construída para determinado Matter.

---

## Skill

Representa metodologia estruturada de produção intelectual.

Não depende de IA específica.

---

## Workflow

Representa execução automatizada.

Nunca contém conhecimento jurídico.

---

## Prompt Template

Representa componente utilizado pelo Prompt Engine.

Não representa conhecimento permanente.

---

## AI Session

Representa interação entre plataforma e modelo de IA.

---

## AI Task

Representa uma tarefa executada por IA.

---

## Draft

Representa documento em elaboração.

---

## Intellectual Product

Representa qualquer documento final produzido.

Exemplos:

* contestação;
* parecer;
* recurso;
* contrato;
* petição inicial.

---

# 5. Relacionamentos

Organization

↓

possui

↓

Workspace

↓

possui

↓

Users

↓

produzem

↓

Matters

↓

utilizam

↓

Documents

↓

geram

↓

Knowledge Objects

↓

alimentam

↓

Skills

↓

executadas por

↓

Workflows

↓

que produzem

↓

Drafts

↓

que originam

↓

Intellectual Products

---

# 6. Ciclo de Vida

Matter

↓

Documentos

↓

Conhecimento

↓

Diagnóstico

↓

Estratégia

↓

Skill

↓

Workflow

↓

Produção

↓

Revisão

↓

Produto Final

↓

Versionamento

↓

Aprendizado

---

# 7. Estados Fundamentais

Todo Matter possui estados.

Exemplos:

Criado

Recebido

Documentado

Analisado

Diagnóstico concluído

Arquitetura aprovada

Produção iniciada

Em revisão

Concluído

Arquivado

---

# 8. Responsabilidades

Knowledge Objects nunca executam.

Skills nunca armazenam documentos.

Workflows nunca contêm conhecimento.

IA nunca toma decisão jurídica.

Usuário permanece responsável pela aprovação final.

---

# 9. Regras do Domínio

* Todo documento deve gerar conhecimento.
* Todo conhecimento deve ser reutilizável.
* Toda Skill deve ser versionada.
* Todo Workflow deve ser rastreável.
* Todo produto intelectual deve possuir histórico.
* Todo resultado deve ser auditável.

---

# 10. Modelo Mental da Plataforma

O centro da plataforma não é o documento.

O centro da plataforma é o conhecimento.

Os documentos entram.

O conhecimento permanece.

As Skills evoluem.

Os produtos intelectuais são consequência desse processo.

Este modelo deverá orientar todas as decisões de arquitetura, banco de dados, APIs e interfaces da Legal AI Factory.
