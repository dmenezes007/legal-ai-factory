# Importacao de Fontes do NotebookLM para a Knowledge Foundation

Objetivo: migrar fontes do NotebookLM para a base local governada sem dependencia do NotebookLM em tempo de execucao.

## Diretorio de destino obrigatorio

Posicione os arquivos em:

`knowledge/sources/original/notebooklm/`

Subpastas recomendadas:

- `knowledge/sources/original/notebooklm/skills`
- `knowledge/sources/original/notebooklm/mapas`
- `knowledge/sources/original/notebooklm/modelos`
- `knowledge/sources/original/notebooklm/jurisprudencia`
- `knowledge/sources/original/notebooklm/doutrina`
- `knowledge/sources/original/notebooklm/templates`
- `knowledge/sources/original/notebooklm/casos`

## Passo a passo

1. Abra o NotebookLM e localize as fontes relevantes.
2. Exporte ou copie cada fonte para arquivo local no formato mais fiel possivel.
3. Salve o arquivo na subpasta correspondente em `knowledge/sources/original/notebooklm`.
4. Formatos aceitos no MVP: `.txt`, `.md`, `.pdf`, `.docx`.
5. Execute ingestao:

```bash
npm run ingest
```

6. Verifique os resultados:
- `knowledge/sources/processed`
- `knowledge/sources/metadata`
- `knowledge/catalog.json`
- `knowledge/index.json`
- `knowledge/relationships.json`

## Regras de seguranca e governanca

- Nunca sobrescreva arquivos originais manualmente.
- Nao altere conteudo juridico na etapa de migracao.
- Anonimize dados sensiveis antes de adicionar ao repositorio.

## Observacao

Modulo experimental desacoplado: `tools/migration/notebooklm-playwright`.
Ele nao faz parte do fluxo principal do MVP.
