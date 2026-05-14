# Handoff

## Task

- ID: 032
- Nome: Fase 15.6 - Validacao Integrada e Polish
- Agente responsavel: Reviewer
- Status: Aprovada sem ressalvas

## Resultado

Fase 15 concluida e validada sem ressalvas pelo owner em 2026-05-14.

Foram validados terminal persistente, log persistente por sessao, retorno de `run_command` baseado no log real, comandos internos `/terminal` e `/help`, mencoes `@terminal` e `@terminal:N`, e fallback global de modelos para todos os agentes.

Ajuste posterior: fallback global atualizado para a versao `1.1.14`, priorizando Gemini 3 antes das rotas Gemini 2.5/2.0 e mantendo Qwen3 via Ollama no final. O CLI tambem informa a rota bem-sucedida apos fallback, incluindo modelo e alias da key quando o provider e Gemini.

Ajuste posterior adicional: versao `1.1.16` adiciona preferencia interna por Windows Terminal quando `toug` e iniciado em console Windows interativo fora do Windows Terminal. O CLI pode relancar no Windows Terminal, instalar via `winget` apos confirmacao e salvar auto relaunch sem expor controle no `/config`. O hotfix `1.1.16` remove a dependencia de `CMDCMDLINE`, que falhava quando o npm global invocava `node ...\dist\index.js`.

Hotfix posterior: a abertura visual do terminal persistente foi corrigida para usar `wt.exe` quando disponivel, com fallback para `cmd start`. O fallback headless silencioso foi removido para que `/terminal` nao informe sucesso quando nenhuma janela externa foi confirmada.

Hotfix posterior adicional: leituras concorrentes de `terminal.log` agora toleram locks transitorios (`EBUSY`, `EPERM`, `EACCES`) com retry curto. Isso evita que `run_command` retorne `[TOUG ERROR] EBUSY` enquanto o runner PowerShell ainda esta gravando output volumoso.

Hotfix posterior adicional: o gatilho de terminal passa a ser consumido pelo CLI antes de chegar a IA. O modelo recebe somente o log anexado e uma instrucao de leitura; o `PipelineEngine` remove o marcador interno antes de salvar/enviar o historico e bloqueia ferramentas se o modelo tentar executar comandos nessa rodada.

Hotfix posterior adicional: o estado da pipeline passa a ser consultado pelo CLI com `/status` ou perguntas naturais sobre estado atual. Solicitações `transition_state` emitidas pelo modelo sao bloqueadas e nao alteram mais a state machine.

## Evidencias principais

- `npm run build` passou apos permissao elevada para escrita em `dist/`.
- `run_command` retorna `Output do comando executado:` e inclui output real observado em `terminal.log`.
- `terminalSessionManager.readTerminalLog()` retorna log bruto inteiro, tail por numero de linhas e mensagem clara quando o log ainda nao existe.
- `@terminal` e tratado antes de `@arquivo`, evitando deduplicacao indevida como mencao de arquivo.
- `/help` lista comandos e mencoes existentes.
- `modelRegistry` usa uma lista global unica:
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
- `PipelineEngine.getActiveConfig()` deve iniciar por `gemini-3.1-pro-preview` para todos os agentes quando o provider ativo e Gemini.
- Quando fallback e acionado e uma rota responde, o CLI imprime a rota bem-sucedida com provider, modelo e key aplicavel.
- Ao iniciar pelo `cmd.exe` classico, o CLI pode migrar para Windows Terminal antes de carregar logo/menu/configuracao inicial.

## Ressalvas encerradas

- O owner validou manualmente a Fase 15 sem ressalvas em 2026-05-14.
- As ressalvas operacionais anteriores foram encerradas apos os hotfixes e a validacao manual.
- `git status` foi bloqueado por `dubious ownership` no repositorio dentro de `Program Files`; configurar `safe.directory` destrava a inspeccao Git local.

## Artefatos finais

- `docs/review_report.md`
- `docs/task_035.md`
- `docs/task_033.md`
- `docs/task_032.md`
- `docs/tasks.md`
- `docs/project_status.md`
- `docs/decision_log.md`

## Proxima Acao Sugerida

- Push final para GitHub, se aprovado pelo owner.
- Publicacao npm permanece opcional e manual pelo owner.
