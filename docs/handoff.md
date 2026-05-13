# Handoff

## Task

- ID: 026
- Nome: Fase 14.4 - Menu Principal, Migracao UX e Fluxo de API Keys
- Agente responsavel: Executor

## Objetivo

Refatorar o fluxo principal do CLI para usar `selectMenu` nas selecoes interativas, implementar o menu principal de 3 opcoes e completar o fluxo de API keys com apelido e loop.

## Escopo Executado

- Atualizado `src/index.ts` para importar e usar `selectMenu`.
- Corrigido `src/cli/selectMenu.ts` para chamar `process.stdin.resume()` apos `rl.pause()` e `setRawMode(true)`, evitando encerramento imediato do processo no PowerShell/Windows Terminal.
- Corrigido `src/cli/selectMenu.ts` para renderizar menus longos com janela paginada e redesenho limpo, evitando sobreposicao de linhas no Windows Terminal.
- Corrigido `src/cli/selectMenu.ts` para preservar blocos informativos impressos acima do menu durante navegacao por setas, limpando apenas as linhas renderizadas pelo proprio menu.
- Implementado menu principal com `Iniciar nova conversa`, `Configuracoes` e `Sessoes anteriores`.
- Removida a exibicao da analise visual do diretorio e do `projectState.summary` no start.
- Removido o prompt automatico de retomar sessao anterior.
- Mantido `detectProjectState()` de forma silenciosa ao iniciar nova conversa.
- Refatorado `configWizard()` para usar `selectMenu` em escolhas de provider e confirmacao de endpoint.
- Refatorado `/config` para usar `selectMenu` nas opcoes de Provider, Auto-approve e Mostrar pensamento da IA.
- Adicionado toggle persistente de `showThinking` no `/config`.
- Implementado fluxo de API keys Gemini com apelido, fallback `Key_N` e loop `Adicionar outra` / `Voltar`.
- Refatorado `/sessoes` para listar acoes por `selectMenu`, mantendo carregar e apagar sessoes.
- Ajustado `/sessoes` para mostrar uma sessao por linha e abrir submenu de acao (`Carregar sessao`, `Apagar sessao`, `Voltar`), evitando duplicacao de linhas.
- Ajustado `/sessoes` para exibir 5 sessoes por pagina, com navegacao `Pagina anterior` / `Proxima pagina`, total de sessoes e indicador da pagina atual.
- Ajustada a semantica de salvamento: uma sessao agora corresponde ao arquivo ativo da conversa; salvamentos seguintes atualizam esse arquivo em vez de criar snapshots com segundos de diferenca.
- Alterado o armazenamento de sessoes para estrutura em pastas: `~/.toug-cli/sessions/<hash-do-projeto>/<session_id>/session.json`.
- Adicionada migracao best-effort dos arquivos JSON legados soltos para pastas de sessao quando o CLI lista, carrega ou salva sessoes daquele projeto.
- Adicionado comando `/menu` no REPL para voltar ao menu principal sem encerrar o CLI.
- Ajustado `Iniciar nova conversa` pelo menu para limpar o historico da conversa atual antes de preparar novo estado.
- Adicionado gerenciamento de API Keys Gemini em `/config`: listar prioridade, adicionar, renomear apelido, apagar, mover prioridade para cima e mover prioridade para baixo.
- Ajustado Gemini thinking para solicitar `thinkingConfig` com `includeThoughts: true` e `thinkingBudget: -1` quando `showThinking` estiver ativo.
- Centralizado o fallback Gemini no `PipelineEngine`; o provider Gemini agora tenta apenas a key indicada pelo engine, evitando tentativas duplicadas e logs confusos.
- Ajustada a ordem de fallback Gemini para trocar todos os modelos da key atual antes de trocar para a proxima API key.
- Atualizado `src/engine/pipelineEngine.ts` para migrar aprovacoes de `run_command` e `write_file` para `selectMenu`.

## Artefatos Gerados

- `src/cli/selectMenu.ts`
- `src/index.ts`
- `src/data/sessionManager.ts`
- `src/engine/pipelineEngine.ts`
- `src/providers/geminiProvider.ts`
- `docs/task_026.md`
- `docs/handoff.md`
- `docs/project_status.md`
- `docs/tasks.md`

## Validacao / Evidencia

- `npm run build` executado com sucesso com permissao elevada para escrita em `dist/`.
- `npm run build` executado novamente com sucesso apos correcao do menu de sessoes e paginacao do `selectMenu`.
- `npm run build` executado novamente com sucesso apos paginacao dedicada de `/sessoes` e correcao da sessao ativa.
- `npm run build` executado novamente com sucesso apos migrar a persistencia para pastas de sessao.
- `npm run build` executado novamente com sucesso apos `/menu`, gerenciamento de API keys e ajuste de `thinkingConfig` Gemini.
- `npm run build` executado novamente com sucesso apos centralizar o fallback Gemini no `PipelineEngine`.
- `npm run build` executado novamente com sucesso apos ajustar a ordem de fallback para modelo antes de key.
- `npm run build` executado novamente com sucesso apos ajuste de redesenho do `selectMenu` por contagem de linhas, preservando informacoes acima sem acumular menus.
- Busca estatica executada em `src/index.ts` e `src/engine/pipelineEngine.ts` nao encontrou prompts legados:
  - `Y/n`
  - `1=`
  - `2=`
  - `numero`
  - `Escolha uma sessao`
  - `Retomar?`
  - `Permitir?`
  - `Alterar:`

## Limitacoes

- Testes manuais finais de navegacao por setas, `/sessoes`, `/config`, `/menu`, persistencia de API keys e UX de menus foram atestados pelo usuario.
- Arquivos antigos em `~/.toug-cli/sessions` sao migrados em modo best-effort para pastas quando o CLI acessa as sessoes do projeto; caso a migracao falhe, o leitor legado continua preservado.
- Gemini retorna pensamento apenas quando o modelo/API envia partes marcadas como `thought`; o CLI solicita essa capacidade, mas nao consegue forcar exibicao se o provider nao devolver pensamentos no stream.
- O fallback multi-modelo existe no `PipelineEngine`: para Gemini, ele tenta todos os modelos da key atual antes de avancar para a proxima key; ao esgotar keys e modelos, troca para Ollama local.

## Proxima Acao Sugerida

- Agente: Orchestrator
- Skill: orchestrate-project
- Objetivo: Considerar a Task 026 e a Fase 14 concluidas com validacao manual atestada; proxima acao operacional e push final para GitHub ou definicao formal de nova task em `docs/tasks.md`.
