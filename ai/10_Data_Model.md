# LEGAL AI FACTORY

# 10_Data_Model.md

**Canonical Knowledge Model (CKM)**

*(Data Model Specification)*

Versão: 1.0

Status: Documento Estrutural do Modelo Canônico de Conhecimento

Dependências:

* 01_Product_Vision.md
* 02_PRD.md
* 03_Constitution.md
* 04_Domain_Model.md
* 05_ADR_Index.md
* 06_AI_Design_Document.md
* 07_Skill_Specification.md
* 08_Workflow_Specification.md
* 09_API_Specification.md

---

# 1. Finalidade

Este documento define o Modelo Canônico de Conhecimento (Canonical Knowledge Model - CKM) da Legal AI Factory.

O CKM representa a estrutura permanente do conhecimento operacional da plataforma.

Seu objetivo não é apenas definir persistência de dados, mas representar como o conhecimento jurídico é organizado, relacionado, recuperado, versionado, interpretado e utilizado pelos agentes cognitivos.

---

# 2. Princípio Fundamental

A plataforma não armazena apenas dados.

Ela organiza conhecimento.

Todo dado persistido deverá possuir significado dentro do domínio jurídico.

---

# 3. Arquitetura de Persistência

A plataforma utilizará quatro camadas de persistência.

## Operational Database

Responsável pelos dados transacionais.

Exemplos:

* Organizations
* Users
* Matters
* Permissions
* Workflows
* Jobs
* Logs
* Configurações

Tecnologia preferencial:

PostgreSQL

---

## Knowledge Store

Responsável pelo conhecimento semântico.

Exemplos:

* Embeddings
* Doutrina
* Jurisprudência
* Modelos
* Knowledge Objects
* Resumos
* Vetores

---

## Graph Store

Responsável pelos relacionamentos.

Representa conexões entre:

* documentos;
* fatos;
* teses;
* provas;
* entidades;
* eventos;
* Skills.

---

## Event Store

Responsável pela memória operacional.

Todo evento importante deverá ser registrado.

Nunca será utilizado como banco transacional.

---

# 4. Camadas do Modelo

Toda entidade será descrita em cinco dimensões.

## Conceitual

O que representa.

---

## Operacional

Como participa dos Workflows.

---

## Cognitiva

Como é utilizada pelos agentes.

---

## Persistente

Como é armazenada.

---

## Analítica

Como gera indicadores.

---

# 5. Entidades Fundamentais

Organization

Workspace

User

Matter

Party

Document

Knowledge Object

Fact

Evidence

Event

Legal Issue

Legal Thesis

Legal Strategy

Skill

Workflow

Prompt Template

AI Session

AI Task

Draft

Intellectual Product

Audit Record

Version

Embedding

Vector Index

Knowledge Snapshot

Execution Context

---

# 6. Matter

Entidade central da plataforma.

Representa qualquer demanda jurídica.

Relaciona-se com:

Clientes

Documentos

Knowledge Objects

Skills

Workflow

Produtos Intelectuais

---

# 7. Document

Após importado deixa de representar apenas arquivo.

Passa a possuir:

Facts

Entities

Timeline

Evidence

Embeddings

Knowledge Objects

Confidence Score

Summary

Version

Audit Trail

---

# 8. Knowledge Object

Menor unidade reutilizável de conhecimento.

Tipos:

Fato

Argumento

Fundamento

Doutrina

Jurisprudência

Cláusula

Conceito

Pedido

Cronologia

---

# 9. Skill

Representa metodologia.

Nunca armazena documentos.

---

# 10. Workflow

Representa execução.

Nunca armazena conhecimento.

---

# 11. AI Session

Representa interação cognitiva.

Possui:

modelo;

tokens;

custos;

tempo;

contexto;

resultado.

---

# 12. Intellectual Product

Representa documentos finais.

Exemplos:

Contestação

Parecer

Contrato

Petição Inicial

Recurso

---

# 13. Versionamento

Todas as entidades críticas deverão possuir:

Version

Revision

Created At

Updated At

Author

Change Log

Snapshot

---

# 14. Temporalidade

Nenhuma entidade crítica será removida.

A plataforma preservará histórico completo.

---

# 15. Relacionamentos

Organization

↓

Workspace

↓

Matter

↓

Documents

↓

Knowledge Objects

↓

Skills

↓

Workflow

↓

Draft

↓

Intellectual Product

---

# 16. Knowledge Graph

Todo Knowledge Object poderá relacionar-se com:

Facts

Evidence

Legal Issues

Legal Theses

Strategies

Skills

Prompt Templates

Documents

---

# 17. Embeddings

Embeddings jamais representarão a fonte oficial.

Representam mecanismo de recuperação.

---

# 18. Audit Trail

Toda entidade deverá possuir trilha completa de auditoria.

---

# 19. Snapshots

Toda produção importante poderá gerar Snapshot.

Objetivos:

Reprodução

Comparação

Rollback

Aprendizado

---

# 20. Soft Delete

Nenhuma entidade crítica utilizará exclusão física.

---

# 21. Ownership

Todo objeto possuirá proprietário.

Organization

Workspace

Matter

Skill

Workflow

Knowledge Object

---

# 22. Multi-Tenant

Toda persistência será preparada para múltiplas organizações.

---

# 23. Observabilidade

Toda alteração produzirá evento.

---

# 24. Event Sourcing

O histórico deverá permitir reconstrução completa da execução.

---

# 25. Anti-Patterns

É proibido:

Duplicar conhecimento.

Acoplar Skills ao banco.

Acoplar Workflows à persistência.

Persistir prompts completos.

Criar tabelas específicas para modelos de IA.

Misturar dados operacionais com embeddings.

Utilizar o banco vetorial como fonte oficial do conhecimento.

---

# 26. Future Evolution

O CKM deverá permitir evolução para:

Knowledge Graph completo;

Marketplace de Skills;

Agentes especializados;

Memória institucional;

Aprendizado organizacional;

Analytics cognitivo.

---

# 27. Papel deste Documento

Este documento estabelece o Modelo Canônico de Conhecimento da Legal AI Factory.

Toda decisão relativa à persistência, modelagem de entidades, banco de dados, recuperação de conhecimento, inteligência artificial, workflows e APIs deverá derivar diretamente deste modelo.

O CKM representa a fonte única da verdade sobre como o conhecimento é estruturado, preservado e utilizado pela plataforma.
