# NotebookLM Migration Runbook

## Objetivo

Migrar fontes utilizadas no NotebookLM para o dominio local governado em `knowledge/sources/original/notebooklm`.

## Estrutura de destino

- `knowledge/sources/original/notebooklm/skills`
- `knowledge/sources/original/notebooklm/mapas`
- `knowledge/sources/original/notebooklm/modelos`
- `knowledge/sources/original/notebooklm/jurisprudencia`
- `knowledge/sources/original/notebooklm/doutrina`
- `knowledge/sources/original/notebooklm/templates`
- `knowledge/sources/original/notebooklm/casos`

## Procedimento

1. Exportar/copiar fontes do NotebookLM para as subpastas correspondentes.
2. Garantir formatos aceitos (`.txt`, `.md`, `.pdf`, `.docx`).
3. Executar `npm run ingest`.
4. Validar se catalogo e indice foram atualizados.

## Pos-migracao

- Revisar classificacoes `desconhecido` e recategorizar se necessario.
- Associar fontes migradas a skills/workflows no `registry.json` quando aplicavel.
- Registrar pendencias em `docs/operations/TODO_MVP.md`.
