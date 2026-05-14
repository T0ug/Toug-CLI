# Task

## Identificacao

- ID: 028
- Nome: Fase 15.2 - Terminal Session Manager e Artefatos por Sessao
- Fase: 15 - Terminal Persistente, Logs e Fallback Unificado
- Agente responsavel: Executor

---

## Objetivo

Implementar a base de persistencia do terminal por sessao: expor a pasta da sessao ativa, criar o `terminalSessionManager` e permitir leitura do log bruto inteiro ou por ultimas linhas.

---

## Contexto

A Task 027 aprovou a arquitetura da Fase 15 em `docs/architecture_fase15.md`. Esta task implementa apenas a fundacao de paths, metadados e leitura de logs, sem ainda executar comandos via runner PowerShell.

---

## Entradas

- `docs/architecture_fase15.md`
- `docs/scope_fase15.md`
- `docs/non_goals_fase15.md`
- `src/data/sessionManager.ts`
- `src/engine/terminalSessionManager.ts` (novo)

---

## Escopo

- Expor informacoes da sessao ativa em `sessionManager`.
- Garantir que a sessao ativa tenha uma pasta resolvivel.
- Criar `src/engine/terminalSessionManager.ts`.
- Criar estrutura `terminal/` dentro da pasta da sessao.
- Resolver paths de `terminal.log`, `commands.queue`, `terminal.state.json` e `runner.ps1`.
- Implementar leitura de log inteiro.
- Implementar leitura das ultimas `N` linhas.
- Retornar mensagem clara quando o log ainda nao existir.

---

## Fora de escopo (CRITICO)

- Abrir PowerShell externo.
- Executar comandos.
- Implementar runner PowerShell.
- Alterar `/terminal`, `/help` ou parser de mencoes.
- Alterar fallback de modelos.

---

## Saidas esperadas

- `sessionManager` consegue informar a pasta da sessao ativa.
- `terminalSessionManager` consegue criar/resolver artefatos de terminal por sessao.
- Funcoes de leitura de log estao disponiveis para tasks seguintes.

---

## Criterios de aceite

- Sessao nova cria estrutura de terminal dentro da pasta da sessao.
- Sessao carregada resolve a mesma pasta de sessao.
- `readTerminalLog()` retorna log bruto inteiro quando existe.
- `readTerminalLog({ tailLines: N })` retorna as ultimas N linhas.
- Log inexistente retorna mensagem informativa, sem erro fatal.
- Build TypeScript passa.

---

## Dependencias

- Task 027 concluida.

---

## Restricoes

- Nao criar pasta paralela fora da estrutura de sessoes.
- Manter compatibilidade com sessoes antigas.
- Nao implementar redaction de logs.

---

## Impacto no sistema

- Afeta persistencia de sessoes.
- Cria base para `/terminal`, `@terminal` e execucao por runner.

---

## Estrategia de implementacao

Implementar primeiro o contrato de sessao ativa e depois o modulo de terminal. Nenhum comando deve ser executado nesta task.

---

## Plano de validacao

- Criar ou carregar sessao.
- Verificar estrutura `terminal/`.
- Criar manualmente um `terminal.log` de teste.
- Validar leitura inteira e tail.
- Rodar build TypeScript.

---

## Artefatos a atualizar

- `src/data/sessionManager.ts`
- `src/engine/terminalSessionManager.ts`
- `docs/handoff.md`
- `docs/project_status.md`

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
