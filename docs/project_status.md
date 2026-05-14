# Project Status - Toug CLI

## Status atual

Fase 15 concluida e validada sem ressalvas pelo owner apos validacao manual. Hotfixes posteriores aplicados para abertura visual do terminal persistente no Windows Terminal, leitura concorrente de `terminal.log`, isolamento do gatilho de terminal antes de enviar contexto a IA e bloqueio de transicoes de pipeline iniciadas pelo modelo foram confirmados.

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
- Fallback unico para todos os agentes: Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2 Flash, Gemini 2.5 Flash Lite, Gemini 2 Flash Lite, qwen3:14b, qwen3:8b.
- Logs serao enviados brutos para IA, sem redaction automatica.
- Autocomplete de mencoes fica fora desta fase.

### Resultado

- Status: **FASE 15 CONCLUIDA E VALIDADA SEM RESSALVAS**.
- Hotfix: `/terminal` passa a abrir via `wt.exe` quando disponivel, com fallback para `cmd start`, e nao usa mais runner headless silencioso.
- Hotfix: leituras de `terminal.log` agora fazem retry curto em `EBUSY`/`EPERM`/`EACCES`, evitando que `run_command` retorne erro enquanto o runner ainda escreve no log.
- Hotfix: o gatilho de terminal e consumido pelo CLI; a IA recebe apenas o log anexado e ferramentas sao bloqueadas nessa rodada salvo nova acao explicita do usuario.
- Hotfix: `/status` e perguntas sobre o estado atual da pipeline sao respondidas pelo CLI, e `transition_state` vindo do modelo e bloqueado sem alterar estado.
- Ressalvas: encerradas por validacao manual do owner em 2026-05-14.
- Proxima acao: push final para o GitHub, se aprovado pelo owner.

## Pendente operacional

- [ ] Push final para o GitHub.
- [ ] Publicacao no npm, opcional e manual pelo owner.
