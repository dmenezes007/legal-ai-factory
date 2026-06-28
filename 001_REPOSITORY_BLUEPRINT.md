# LEGAL AI FACTORY

# 001_REPOSITORY_BLUEPRINT.md

**Repository Blueprint**

Versão: 1.0

Status: Arquitetura Oficial do Repositório

---

# 1. Finalidade

Este documento define a estrutura oficial do repositório da Legal AI Factory.

Seu objetivo é organizar o projeto de forma que:

* agentes de IA compreendam rapidamente sua arquitetura;
* desenvolvedores encontrem facilmente qualquer artefato;
* conhecimento permaneça separado da implementação;
* documentação e código evoluam de forma sincronizada.

---

# 2. Princípios

A organização do repositório segue quatro princípios fundamentais:

* Domain First
* Knowledge First
* AI First
* Code Second

O conhecimento precede o código.

---

# 3. Estrutura Geral

```text
LEGAL-AI-FACTORY/

│
├── README.md
├── 000_MASTER_PLAN.md
├── 001_REPOSITORY_BLUEPRINT.md
│
├── ai/
├── knowledge/
├── docs/
├── schemas/
├── packages/
├── apps/
├── infrastructure/
├── examples/
├── tests/
├── scripts/
└── tools/
```

---

# 4. Pasta /ai

Representa o cérebro da plataforma.

Contém documentos consumidos prioritariamente pelos agentes de IA.

```text
ai/

01_Constitution.md
02_Product_Vision.md
03_PRD.md
04_Domain_Model.md
05_ADR_Index.md
06_AI_Design_Document.md
07_Skill_Specification.md
08_Workflow_Specification.md
09_API_Specification.md
10_Data_Model.md
11_Knowledge_Architecture_Specification.md

100_CTO_AGENT.md

adr/
glossary/
prompts/
bootstrap/
epics/
checklists/
standards/
```

---

# 5. Pasta /knowledge

Representa o patrimônio intelectual da plataforma.

```text
knowledge/

sources/
skills/
workflows/
templates/
examples/
jurisprudence/
doctrine/
legislation/
playbooks/
checklists/
maps/
cases/
```

Nenhum código deverá existir nesta pasta.

---

# 6. Pasta /schemas

Representa as linguagens formais da plataforma.

```text
schemas/

sdl/
wdl/
cal/
ckm/

json-schema/

openapi/

grammar/

protobuf/
```

---

# 7. Pasta /apps

Aplicações executáveis.

```text
apps/

web/
admin/
api/
worker/
desktop/
mobile/
```

---

# 8. Pasta /packages

Bibliotecas compartilhadas.

```text
packages/

core/

ui/

knowledge/

skills/

workflow/

ai/

rag/

database/

shared/

utils/
```

---

# 9. Pasta /infrastructure

Infraestrutura.

```text
infrastructure/

docker/

terraform/

kubernetes/

supabase/

postgres/

monitoring/

deployment/

nginx/
```

---

# 10. Pasta /docs

Documentação destinada principalmente a leitura humana.

```text
docs/

architecture/

developer-guide/

user-guide/

operations/

security/

deployment/

release-notes/
```

---

# 11. Pasta /examples

Exemplos completos.

```text
examples/

skills/

workflows/

cases/

templates/

output/
```

---

# 12. Pasta /tests

Testes.

```text
tests/

unit/

integration/

workflow/

skills/

agents/

knowledge/

performance/

reasoning/

e2e/
```

---

# 13. Pasta /tools

Ferramentas auxiliares.

```text
tools/

migration/

generators/

validators/

compilers/

converters/
```

---

# 14. Pasta /scripts

Scripts operacionais.

```text
scripts/

setup/

bootstrap/

build/

deploy/

seed/

maintenance/
```

---

# 15. Organização das Skills

Cada Skill possuirá estrutura própria.

```text
knowledge/skills/

contestacao-saude/

skill.yaml

README.md

workflow.wdl

examples/

tests/

templates/

knowledge/
```

---

# 16. Organização das Fontes

Toda fonte migrada do NotebookLM deverá manter rastreabilidade.

```text
knowledge/sources/

original/

processed/

metadata/

index/

embeddings/
```

A versão original nunca deverá ser modificada.

---

# 17. Organização dos Casos

Cada Matter poderá possuir estrutura semelhante.

```text
knowledge/cases/

CASE-000001/

documents/

knowledge/

timeline/

strategy/

drafts/

output/
```

---

# 18. Convenções

Nenhum arquivo poderá existir sem finalidade definida.

Toda pasta deverá possuir README próprio.

Todos os artefatos importantes deverão possuir metadados.

---

# 19. Responsabilidade dos Agentes

Antes de criar um novo arquivo, qualquer agente deverá verificar:

* se a pasta correta já existe;
* se há convenção estabelecida;
* se existe componente reutilizável;
* se a alteração preserva a organização do repositório.

---

# 20. Evolução

Novas pastas poderão ser criadas apenas quando representarem um novo contexto arquitetural.

Nunca por conveniência temporária.

---

# 21. Objetivo Final

A estrutura do repositório deverá refletir a arquitetura cognitiva da Legal AI Factory.

Um novo agente de IA deverá conseguir compreender o projeto apenas percorrendo esta organização e lendo os documentos do diretório `/ai`, sem depender de conhecimento externo.
