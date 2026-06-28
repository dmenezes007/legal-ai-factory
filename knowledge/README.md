# Knowledge Domain

Este diretorio representa o patrimonio intelectual governado da Legal AI Factory.

## Principios

- Conhecimento juridico desacoplado de codigo.
- Rastreabilidade de origem para cada artefato.
- Versionamento e governanca de Skills, Workflows e fontes.

## Arquivos de governanca

- `catalog.json`: catalogo mestre das fontes de conhecimento.
- `index.json`: indice simplificado para busca rapida.
- `registry.json`: registro oficial de skills, workflows e ativos estruturantes.
- `relationships.json`: grafo inicial de relacoes entre artefatos.
- `ontology.yaml`: ontologia juridica base.
- `taxonomy.yaml`: taxonomia padrao de classificacao.
- `glossary.yaml`: glossario operacional.
- `knowledge-map.yaml`: mapa estrategico de migracao e prioridades.

## Pipeline

O pipeline de ingestao processa arquivos em `knowledge/sources/original` e atualiza automaticamente catalogo, indice e relacionamentos.

Comando:

```bash
npm run ingest
```
