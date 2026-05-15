# Project Status - Toug CLI

## Status atual

Fase 16 em Discovery concluido e Understanding Lock confirmado pelo owner em 2026-05-15. A proxima acao da pipeline e Architecture da Task 037 para projetar terminal compartilhado observavel baseado em ConPTY, memoria estruturada, contexto automatico de terminal e compressao por IA.

Fase 15 concluida e validada sem ressalvas pelo owner apos validacao manual. Hotfixes posteriores aplicados para abertura visual do terminal persistente no Windows Terminal, leitura concorrente de `terminal.log`, isolamento do gatilho de terminal antes de enviar contexto a IA, bloqueio de transicoes de pipeline iniciadas pelo modelo, atualizacao do fallback global para Gemini 3, feedback de rota bem-sucedida e preferencia de inicializacao em Windows Terminal foram confirmados.

Task 027 concluida e confirmada. Task 028 implementada e aprovada. Task 029 implementada e aprovada. Task 030 implementada e aprovada. Task 031 implementada e aprovada. Task 032 aprovada sem ressalvas.

## Concluido

- [x] Discovery inicial do MVP.
- [x] Arquitetura inicial.
- [x] Infraestrutura Node.js/TypeScript.
- [x] Setup Ollama/Docker.
- [x] Cliente Ollama com streaming.
- [x] State Machine e agentes.
- [x] REPL CLI.
- [x] Tool runners por XML.
- [x] ProjectDetector.
- [x] Persistencia de sessoes.
- [x] Gestao de artefatos.
- [x] README, package metadata e release polish.
- [x] Otimizacao de modelos locais.
- [x] Reforco de UX de ferramentas.
- [x] Fase 12 - Provedores Globais e Gemini.
- [x] Fase 13 - Fallback Multi-Modelo, Mencoes de Arquivo e Gestao de Sessoes.
- [x] Fase 14 - Thinking Display, UX Interativa e Correcoes.
- [x] Fase 15 - Discovery.
- [x] Fase 15 - Terminal Persistente, Logs e Fallback Unificado.

## Nova evolucao em Discovery - 2026-05-14

Understanding Lock confirmado para Fase 15.

### Confirmado

- Terminal externo persistente por sessao.
- Primeiro comando da IA abre o terminal automaticamente.
- `/terminal` abre ou reabre o terminal da sessao.
- Comandos da IA rodam sempre no mesmo terminal.
- Log persistente por sessao com horario.
- `run_command` deve retornar output baseado no log real.
- `@terminal` anexa o log bruto inteiro.
- `@terminal:N` anexa as ultimas N linhas.
- Sessao carregada mantem acesso ao log antigo.
- Terminal de sessao antiga reabre apenas por `/terminal` ou comando da IA.
- Reabertura usa diretorio inicial da sessao, sem restaurar estado vivo.
- `/help` lista comandos existentes.
- Fallback unico para todos os agentes: Gemini 3.1 Pro Preview, Gemini 3 Flash Preview, Gemini 2.5 Pro, Gemini 3.1 Flash-Lite, Gemini 2.5 Flash, Gemini 2.5 Flash-Lite, Gemini 2 Flash, Gemini 2 Flash-Lite, qwen3:14b, qwen3:8b.
- Logs serao enviados brutos para IA, sem redaction automatica.
- Autocomplete de mencoes fica fora desta fase.

### Resultado

- Status: **FASE 15 CONCLUIDA E VALIDADA SEM RESSALVAS**.
- Hotfix: `/terminal` passa a abrir via `wt.exe` quando disponivel, com fallback para `cmd start`, e nao usa mais runner headless silencioso.
- Hotfix: leituras de `terminal.log` agora fazem retry curto em `EBUSY`/`EPERM`/`EACCES`, evitando que `run_command` retorne erro enquanto o runner ainda escreve no log.
- Hotfix: o gatilho de terminal e consumido pelo CLI; a IA recebe apenas o log anexado e ferramentas sao bloqueadas nessa rodada salvo nova acao explicita do usuario.
- Hotfix: `/status` e perguntas sobre o estado atual da pipeline sao respondidas pelo CLI, e `transition_state` vindo do modelo e bloqueado sem alterar estado.
- Ajuste posterior: fallback global atualizado para priorizar Gemini 3 conforme disponibilidade atual da Gemini API, mantendo Qwen3 via Ollama no final.
- Ajuste posterior: quando uma rota de fallback gera resposta com sucesso, o CLI informa provider, modelo e key usada.
- Ajuste posterior: ao executar `toug` pelo `cmd.exe` classico no Windows, o CLI oferece migrar para Windows Terminal, pode instalar via `winget` com confirmacao e pode salvar preferencia interna para relancar automaticamente no Windows Terminal.
- Ressalvas: encerradas por validacao manual do owner em 2026-05-14.
- Proxima acao: push final para o GitHub, se aprovado pelo owner.

## Pendente operacional

- [ ] Architecture da Fase 16 - Task 037.
- [ ] Push final para o GitHub.
- [ ] Publicacao no npm, opcional e manual pelo owner.

## Nova evolucao em Discovery - 2026-05-15

Understanding Lock confirmado para Fase 16 - Terminal Compartilhado Observavel e Memoria Estruturada.

### Confirmado

- Base tecnica: ConPTY.
- Escopo inicial: Windows-first/Windows-only aceitavel.
- `/terminal` mantem o mesmo nome, mas troca a implementacao.
- Usuario e IA compartilham o terminal, mas nao digitam simultaneamente.
- IA e responsavel por responder prompts interativos dos comandos que iniciar.
- Usuario pode digitar comandos no terminal quando a IA nao estiver usando o terminal.
- Comandos manuais entram automaticamente no contexto da IA quando houver mudanca.
- Contexto automatico usa eventos limpos e estruturados.
- Sem redaction automatica.
- Resultados de ferramenta deixam de ser salvos como `role: "user"`.
- Novo `session.json` usa `schemaVersion`, `tougVersion`, blocos separados e `sequence` global.
- Contexto enviado a IA e uma timeline cronologica por `sequence`.
- Outputs limpos completos ficam salvos em disco.
- Contexto automatico envia output completo ate 30 linhas; acima disso primeiras 20 + ultimas 10.
- Comandos manuais enviam comando completo + ultimas 10 linhas.
- IA pode usar `read_terminal_output(commandId)` autoaprovado para ler output completo.
- Compressao de contexto usa IA em memoria estruturada.
- Limites de compressao: 120k soft, 180k hard; Qwen local 24k soft, 30k hard.
- Cadeia de compressao adequada: `gemini-3.1-pro-preview`, `gemini-3-flash-preview`, `gemini-2.5-pro`, depois `gemini-3.1-flash-lite`.
- Se necessario e aprovado pelo usuario, modelos inferiores podem ser usados para compressao.
- Sessoes antigas nao migram automaticamente e mostram aviso sempre que carregadas.

### Proxima acao

- Iniciar Architecture da Task 037 com `design-architecture`.

## Ajuste posterior - 2026-05-14

- Versao do pacote atualizada para `1.1.14`.
- Ordem global de fallback atualizada:
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
- Observacao: `gemini-3.1-pro-preview` e usado como ID real de API para Gemini 3.1 Pro; se a key nao tiver acesso/cota, o fallback segue para a proxima rota.
- Feedback de sucesso de fallback adicionado:
  - Gemini: `[Fallback] Rota bem-sucedida: Gemini (Model: <modelo>, Key: <alias>).`
  - Ollama: `[Fallback] Rota bem-sucedida: Ollama (Model: <modelo>).`

## Ajuste posterior 2 - 2026-05-14

- Versao do pacote atualizada para `1.1.16`.
- Inicializacao via `cmd.exe` classico no Windows agora:
  - detecta se ja esta em Windows Terminal por `WT_SESSION`;
  - se `wt.exe` existe, pergunta se deve prosseguir no Windows Terminal;
  - permite "Nao perguntar novamente" com confirmacao extra;
  - salva preferencia interna `windowsTerminal.autoLaunch`;
  - relanca o mesmo comando no Windows Terminal e encerra o processo atual;
  - se `wt.exe` nao existe, pergunta se deve instalar via `winget install --id Microsoft.WindowsTerminal -e`;
  - apos instalacao bem-sucedida, salva a preferencia interna e relanca no Windows Terminal quando `wt.exe` estiver disponivel.
- Essa preferencia nao aparece no `/config`.
- Hotfix `1.1.16`: a deteccao deixou de depender de `CMDCMDLINE`, que pode nao existir quando o comando global do npm chama `node ...\node_modules\toug-cli\dist\index.js`. Agora usa Windows interativo fora do Windows Terminal, ignorando `npm run`.
