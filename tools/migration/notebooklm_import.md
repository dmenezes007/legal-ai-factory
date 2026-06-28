# Importacao de Fontes do NotebookLM para o MVP Local

Objetivo: trazer as fontes atualmente usadas no NotebookLM para o repositorio local sem dependencia do NotebookLM em tempo de execucao.

## Passo a passo recomendado

1. No NotebookLM, abra cada Notebook relevante da Skill de contestacao-saude.
2. Para cada fonte, exporte ou copie o conteudo original para arquivo local.
3. Salve os arquivos no formato mais fiel possivel em `knowledge/sources/original`.
4. Formatos aceitos no MVP: `.txt`, `.md`, `.pdf`, `.docx`.
5. Rode a ingestao local:

```bash
npm run ingest
```

6. Verifique os artefatos gerados:
- `knowledge/sources/processed` (texto normalizado)
- `knowledge/sources/metadata` (JSON com classificacao e rastreabilidade)

## Convencoes importantes

- Nao sobrescreva fontes originais; mantenha nomes e datas quando possivel.
- Nao altere o conteudo juridico na etapa de copia.
- Se houver dado sensivel, anonimizar antes de copiar para o repositorio.

## Observacao

Ha um modulo experimental separado em `tools/migration/notebooklm-playwright` para estudos de automacao de coleta. O fluxo principal do MVP nao depende dele.
