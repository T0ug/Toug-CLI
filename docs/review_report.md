# Review Report - Task 032

## Task analisada

- ID: 032
- Nome: Fase 15.6 - Validacao Integrada e Polish
- Status: Aprovado sem ressalvas

## Evidencias verificadas

- `docs/project_status.md`, `docs/handoff.md`, `docs/tasks.md` e `docs/decision_log.md` estavam alinhados antes da validacao: Task 032 liberada para Reviewer.
- `npm run build` passou com sucesso apos permissao elevada para escrever em `dist/` dentro de `Program Files`.
- Busca estatica confirmou ausencia das mensagens antigas:
  - `Comando executado com sucesso`;
  - `Comando de servidor`;
  - `isBackgroundCmd`;
  - deteccoes especiais para `npm run dev`, `npm start`, `vite` ou `expo start`.
- `src/engine/toolRunner.ts` retorna `Output do comando executado:` com base no log real do terminal.
- `src/index.ts` contem `/terminal`, `/help`, `appendTerminalMentions()` e trata `@terminal` antes do parser generico de `@arquivo`.
- `src/index.ts` lista no `/help`: `/exit`, `/menu`, `/config`, `/sessoes`, `/terminal`, `/help`, `?pergunta`, `@arquivo`, `@terminal` e `@terminal:N`.
- Busca estatica confirmou ausencia de listas diferentes por agente em `modelRegistry`.
- `src/agents/modelRegistry.ts` exporta a ordem global. A ordem posterior atualizada para `1.1.13` e:
  1. `gemini-3.1-pro-preview`
  2. `gemini-3-flash-preview`
  3. `gemini-2.5-pro`
  4. `gemini-3.1-flash-lite`
  5. `gemini-2.5-flash`
  6. `gemini-2.5-flash-lite`
  7. `gemini-2.0-flash`
  8. `gemini-2.0-flash-lite`
  9. `qwen3:14b`
  10. `qwen3:8b`
- Validacao com `PipelineEngine.getActiveConfig()` e config Gemini temporaria confirmou o modelo inicial para:
  - Orchestrator;
  - Discovery;
  - Project Research;
  - Architect;
  - Executor;
  - Reviewer.
- Validacao de `readTerminalLog()` confirmou:
  - mensagem clara quando nao existe log;
  - leitura bruta inteira;
  - `tailLines` retornando apenas as ultimas linhas.
- Validacao operacional curta de `executeShellCommand()` confirmou:
  - retorno contem `Output do comando executado:`;
  - retorno contem output real emitido pelo PowerShell;
  - `terminal.log` contem o mesmo output real;
  - runner temporario foi encerrado apos o teste.

## Verificacao de escopo

Escopo cumprido:

- Terminal persistente por sessao possui artefatos e log persistente.
- `run_command` foi delegado ao terminal persistente e deixou de retornar sucesso sintetico.
- `/terminal` e `/help` existem no REPL.
- `@terminal` e `@terminal:N` leem o log bruto por sessao.
- Fallback global e unico para todos os agentes foi aplicado.
- Qwen permanece como fallback via provider Ollama.

Fora de escopo preservado:

- Autocomplete de mencoes nao foi implementado.
- Publicacao npm nao foi feita.
- Push GitHub nao foi feito.
- Nenhuma nova feature fora da Fase 15 foi adicionada nesta validacao.

## Ressalvas encerradas

- O owner validou manualmente a Fase 15 sem ressalvas em 2026-05-14.
- As ressalvas operacionais anteriores foram encerradas apos os hotfixes e a validacao manual.
- `git status` nao foi obtido porque o Git bloqueou o repositorio como `dubious ownership` em `Program Files`; isso nao bloqueia a validacao tecnica da Fase 15, mas afeta inspecoes Git locais ate configurar `safe.directory`.

## Atualizacao posterior

- Usuario reportou que `/terminal` criou log/sessao, mas nao abriu janela externa.
- Hotfix aplicado em `src/engine/terminalSessionManager.ts`:
  - removido fallback headless silencioso;
  - abertura passa a preferir `wt.exe`;
  - fallback visual usa `cmd start`;
  - estado do runner registra `visibleWindow`;
  - runners antigos sem janela sao limpos em best effort.
- `npx tsc --noEmit` passou.
- `npm run build` passou.
- Validacao controlada confirmou escrita de `terminal.log` e `visibleWindow: true`.

## Atualizacao posterior 2

- Usuario reportou teste com `terminal.log` volumoso em `log_examples`.
- Evidencia: `session.json` registrou `[TOOL RESULT] Output do comando executado:\n[TOUG ERROR] EBUSY: resource busy or locked, open ...terminal.log`.
- Diagnostico: o runner PowerShell escrevia no log enquanto o CLI tentava ler o mesmo arquivo para retornar output a IA.
- Hotfix aplicado em `src/engine/terminalSessionManager.ts`:
  - retry curto para `fs.readFileSync` e `fs.statSync`;
  - tratamento de `EBUSY`, `EPERM` e `EACCES`;
  - `waitForCommandLog()` continua observando ate o timeout em caso de lock transitorio;
  - `@terminal` retorna mensagem operacional clara se o log continuar ocupado apos retries.
- `npx tsc --noEmit` passou.
- `npm run build` passou.
- `executeInTerminal('Write-Output toug-lock-fix-ok')` retornou output real com sucesso.
- Instalacao global local atualizada para `toug-cli@1.1.10` para teste imediato.

## Atualizacao posterior 3

- Usuario observou que o uso de terminal deve funcionar como gatilho do CLI, nao como texto literal para a IA.
- Hotfix aplicado:
  - contexto anexado nao descreve mais a origem como mencao literal;
  - `PipelineEngine` detecta marcador interno de contexto de terminal;
  - marcador interno e removido antes de salvar/enviar historico ao modelo;
  - se o modelo tentar usar ferramentas nessa rodada, o CLI bloqueia e pede resposta baseada apenas no log anexado.
- `npx tsc --noEmit` passou.
- `npm run build` passou.
- Instalacao global local atualizada para `toug-cli@1.1.11` para teste imediato.

## Atualizacao posterior 4

- Usuario reportou que a pergunta "Em qual estado da pipeline estamos agora" foi enviada ao modelo, que transicionou indevidamente para `ARCHITECT` e iniciou gravações.
- Hotfix aplicado:
  - adicionado comando `/status`;
  - perguntas naturais sobre estado/status da pipeline sao respondidas diretamente pelo CLI;
  - prompts dos agentes nao anunciam mais `transition_state` como ferramenta disponivel;
  - `PipelineEngine` bloqueia qualquer `transition_state` emitido pelo modelo e preserva o estado atual.
- `npx tsc --noEmit` passou.
- `npm run build` passou.
- Instalacao global local atualizada para `toug-cli@1.1.12` para teste imediato.

## Atualizacao posterior 5

- Owner confirmou a Fase 15 como validada sem ressalvas.
- Estado documental consolidado em `project_status.md`, `handoff.md`, `tasks.md`, `review_report.md` e `decision_log.md`.

## Atualizacao posterior 6

- Fallback global atualizado para priorizar Gemini 3:
  - `gemini-3.1-pro-preview`;
  - `gemini-3-flash-preview`;
  - `gemini-3.1-flash-lite`.
- Rotas Gemini 2.5/2.0 e Qwen3 permanecem como fallback.
- Pacote versionado para `1.1.13`.
- `npx tsc --noEmit` passou.
- `npm run build` passou apos permissao elevada para escrita em `dist/`.
- Validacao runtime em `dist/agents/modelRegistry.js` confirmou a ordem exportada.

## Atualizacao posterior 7

- `PipelineEngine` passou a informar a rota bem-sucedida apos fallback:
  - Gemini: provider, modelo e alias da key;
  - Ollama: provider e modelo.
- Pacote versionado para `1.1.14`.
- `npx tsc --noEmit` passou.
- `npm run build` passou apos permissao elevada para escrita em `dist/`.
- `dist/engine/pipelineEngine.js` contem as mensagens `Rota bem-sucedida` para Gemini e Ollama.

## Atualizacao posterior 8

- Inicializacao via `cmd.exe` classico no Windows passou a preferir Windows Terminal.
- `windowsTerminal.autoLaunch` foi adicionado ao config global como preferencia interna, sem entrada no `/config`.
- Fluxo com `wt.exe` instalado:
  - pergunta se aceita prosseguir para Windows Terminal;
  - opcao "Nao perguntar novamente" exige confirmacao extra;
  - em caso afirmativo, relanca no Windows Terminal e encerra o processo atual.
- Fluxo sem `wt.exe`:
  - pergunta se deseja instalar Windows Terminal;
  - se confirmado, executa `winget install --id Microsoft.WindowsTerminal -e`;
  - apos sucesso, salva auto launch e tenta relancar.
- Pacote versionado para `1.1.15`.
- `npx tsc --noEmit` passou.
- `npm run build` passou apos permissao elevada para escrita em `dist/`.
- `dist/index.js` contem `ensureWindowsTerminalHost`, `TOUG_WT_RELAUNCHED`, `winget` e `windowsTerminal.autoLaunch`.
- `dist/data/configManager.js` contem normalizacao de `windowsTerminal.autoLaunch`.

## Atualizacao posterior 9

- Hotfix aplicado para o caso real do pacote npm global em Windows 10.
- A deteccao anterior dependia de `CMDCMDLINE`, mas o shim global do npm pode iniciar `node ...\node_modules\toug-cli\dist\index.js` sem essa variavel confiavel.
- A deteccao agora usa:
  - Windows;
  - fora do Windows Terminal;
  - fora de `npm run`;
  - stdin/stdout interativos;
  - flag anti-loop ausente.
- Pacote versionado para `1.1.16`.
- `npx tsc --noEmit` passou.
- `npm run build` passou apos permissao elevada para escrita em `dist/`.
- `dist/index.js` contem `shouldPreferWindowsTerminalHost` sem dependencia de `CMDCMDLINE`.

## Decisao

APROVADO SEM RESSALVAS.

## Recomendacao

Considerar a Fase 15 concluida sem ressalvas. Proximos passos operacionais: push final para GitHub e publicacao npm apenas se o owner decidir.
