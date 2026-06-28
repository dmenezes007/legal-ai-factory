# NotebookLM Assistant

Automacao assistida por humano para uso operacional do NotebookLM na producao da peca.

## Principios

- Sem engenharia reversa agressiva.
- Sem armazenamento de credenciais Google.
- Sempre com checkpoints de confirmacao humana.
- Seletores com fallback e degradacao para modo manual.

## Execucao

```bash
npm run notebooklm:assistant -- --case-id case_1001029 --notebook-url "https://notebooklm.google.com/notebook/<id>"
```

Recomendado no Windows para login Google:

```bash
npm run notebooklm:assistant -- --case-id case_1001029 --browser chrome --user-data-dir ".notebooklm-assistant/profile"
```

Argumentos opcionais:

- `--notebook-name "Nome do notebook"`
- `--skill-file "knowledge/sources/original/notebooklm/skills/SKILL.txt"`
- `--output-root "knowledge/cases"`
- `--max-steps 8`
- `--browser chrome|edge|chromium|firefox` (padrao: `chrome`)
- `--user-data-dir ".notebooklm-assistant/profile"`

## Erro: "Esse navegador ou app pode nao ser seguro"

Esse erro pode ocorrer com navegadores automatizados. Mitigacao recomendada:

1. Use `--browser chrome` ou `--browser edge`.
2. Use `--user-data-dir` para manter sessao persistente.
3. Faca login manual uma vez no perfil persistente e reutilize nas proximas execucoes.
4. Se persistir, execute com browser real sem automacao de login e mantenha operacao assistida manual.

## Saidas

- `knowledge/cases/<case-id>/notebooklm-responses.json`
- `knowledge/cases/<case-id>/output/contestacao_<case-id>.docx`

## Fluxo

1. Abre NotebookLM no navegador com Playwright (modo visual).
2. Usuario confirma notebook correto e fontes carregadas.
3. Comandos da skill sao executados sequencialmente.
4. Cada resposta aguarda estabilizacao antes da captura.
5. Respostas consolidadas sao salvas em JSON.
6. DOCX final e gerado a partir das respostas capturadas.
