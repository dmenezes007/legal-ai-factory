# Knowledge Governance Foundation

## Objetivo

Estabelecer governanca minima do dominio de conhecimento em `knowledge/` com rastreabilidade, classificacao e relacoes entre artefatos.

## Arquivos canonicos

- `knowledge/catalog.json`: catalogo mestre de fontes de conhecimento.
- `knowledge/index.json`: indice simplificado para busca rapida.
- `knowledge/registry.json`: registro oficial de skills, workflows, mapas e templates.
- `knowledge/relationships.json`: grafo de relacoes entre fontes e ativos.
- `knowledge/ontology.yaml`: ontologia inicial do dominio.
- `knowledge/taxonomy.yaml`: taxonomia oficial de classificacao.
- `knowledge/glossary.yaml`: glossario operacional.
- `knowledge/knowledge-map.yaml`: mapa estrategico de patrimonio intelectual e migracao.

## Pipeline de ingestao

Entrada:
- `knowledge/sources/original`

Saidas:
- `knowledge/sources/processed`
- `knowledge/sources/metadata`
- atualizacao automatica de:
  - `knowledge/catalog.json`
  - `knowledge/index.json`
  - `knowledge/relationships.json`

Comando:

```bash
npm run ingest
```

## Regras

- Nao modificar originais em `knowledge/sources/original`.
- Conhecimento juridico deve permanecer em `knowledge/`, nunca embutido em codigo.
- Skills e Workflows devem permanecer referenciados por IDs estaveis no `registry.json`.
