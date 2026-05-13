# Task

## Identificação

- ID: 008
- Nome: Fase 7 — Persistência de Sessões
- Fase: Execução
- Agente responsável: Executor

---

## Objetivo

Permitir que conversas do Toug CLI sejam salvas localmente em disco e retomadas entre reinicializações. O usuário deve poder fechar o terminal, reabrir e continuar de onde parou. Incluir compressão automática do contexto quando o histórico ultrapassar um limite seguro de tokens.

---

## Contexto

Atualmente o histórico vive apenas na RAM (`history: Message[]`). Ao fechar a aplicação, tudo se perde. Para um CLI de desenvolvimento real, a persistência é fundamental — o desenvolvedor pode trabalhar ao longo de horas ou dias no mesmo projeto.

---

## Entradas

- `src/engine/pipelineEngine.ts` (Array `history` em memória).
- `src/data/configManager.ts` (Path base do `.toug-cli/`).

---

## Escopo

- Criar `src/data/sessionManager.ts`:
  - Salvar sessões como arquivos JSON em `~/.toug-cli/sessions/`.
  - Cada sessão terá um ID único (timestamp-based, ex: `session_2026-05-11_18h50.json`).
  - Funções: `saveSession(history, state, cwd)`, `loadLatestSession(cwd)`, `listSessions(cwd)`.
  - As sessões são filtradas por `cwd` — cada diretório de projeto tem suas próprias sessões.
- Modificar `src/index.ts`:
  - Na inicialização, após a detecção de projeto, verificar se existe sessão anterior para o `cwd` atual.
  - Se existir, perguntar ao usuário: `"Sessão anterior encontrada. Retomar? (Y/n)"`.
  - Se sim, carregar o histórico e o state da sessão.
  - Ao sair (`/exit`), salvar automaticamente a sessão atual.
- Implementar compressão de contexto:
  - Quando `history.length` ultrapassar um threshold (ex: 50 mensagens), comprimir as mensagens mais antigas num resumo gerado via prompt curto ao Ollama.
  - Manter as últimas 10 mensagens intactas + resumo comprimido como mensagem `system`.

---

## Fora de escopo (CRÍTICO)

- NÃO implementar gestão de artefatos (leitura/escrita de docs/) — Fase 8.
- NÃO implementar múltiplas sessões simultâneas ou branching de sessões.

---

## Saídas esperadas

- Ao sair do CLI, a sessão é salva automaticamente em `~/.toug-cli/sessions/`.
- Ao reabrir no mesmo diretório, o CLI oferece retomar a sessão.
- Uma função rudimentar de context compression sobre o array antes de derramar pra streams do Ollama.

---

## Critérios de aceite

- Compilação limpa (`npm run build`).
- Ciclo testável: abrir → conversar → `/exit` → reabrir → retomar sessão com histórico intacto.
- Context compression ativada quando o histórico excede o threshold.

---

## Dependências

- Task 007.

---

## Restrições

- Manter serialização simples via `JSON.stringify/parse`.
- Sem banco de dados. Apenas arquivos JSON no filesystem local.

---

## Plano de validação

- Rodar o CLI, enviar 2-3 mensagens, sair com `/exit`, reabrir e verificar que o histórico foi restaurado.

---

## Artefatos a atualizar

- `docs/project_status.md`

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [ ] Concluída
- [ ] Bloqueada
