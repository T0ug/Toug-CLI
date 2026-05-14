# Task

## Identificacao

- ID: 030
- Nome: Fase 15.4 - Comandos `/terminal`, `/help` e Mencoes `@terminal`
- Fase: 15 - Terminal Persistente, Logs e Fallback Unificado
- Agente responsavel: Executor

---

## Objetivo

Adicionar comandos de usuario `/terminal` e `/help`, e implementar mencoes `@terminal` e `@terminal:N`.

---

## Contexto

As Tasks 028 e 029 devem disponibilizar terminal persistente e leitura de logs por sessao. Esta task expõe essas capacidades no REPL.

---

## Entradas

- `docs/architecture_fase15.md`
- `src/index.ts`
- `src/engine/terminalSessionManager.ts`

---

## Escopo

- Adicionar `/terminal`.
- Adicionar `/help`.
- Atualizar lista impressa de comandos.
- Implementar parser de `@terminal`.
- Implementar parser de `@terminal:N`.
- Garantir que `@terminal` seja tratado antes de `@arquivo`.
- Garantir que `@terminal` nao seja deduplicado como arquivo.

---

## Fora de escopo (CRITICO)

- Alterar runner PowerShell.
- Alterar fallback de modelos.
- Implementar autocomplete.
- Redigir logs.

---

## Saidas esperadas

- Usuario consegue abrir/reabrir o terminal com `/terminal`.
- Usuario consegue ver ajuda com `/help`.
- Usuario consegue anexar log bruto com `@terminal` e tail com `@terminal:N`.

---

## Criterios de aceite

- `/help` lista todos os comandos existentes e o que fazem.
- `/terminal` abre ou reabre o terminal da sessao.
- `@terminal` anexa log inteiro.
- `@terminal:10` anexa ultimas 10 linhas.
- `@terminal` sem log retorna mensagem informativa.
- Build TypeScript passa.

---

## Dependencias

- Task 028 concluida.
- Task 029 concluida para validacao completa de terminal real.

---

## Restricoes

- Nao enviar logs automaticamente em loop continuo.
- Manter logs brutos.

---

## Impacto no sistema

- Afeta REPL em `src/index.ts`.
- Afeta mecanismo de mencoes.

---

## Estrategia de implementacao

Adicionar comandos internos antes do fluxo normal de prompt. Tratar `@terminal` antes da regex generica de arquivos.

---

## Plano de validacao

- Rodar `/help`.
- Rodar `/terminal`.
- Digitar prompt com `@terminal`.
- Digitar prompt com `@terminal:10`.
- Confirmar que `@terminal` nao tenta ler arquivo chamado `terminal`.

---

## Artefatos a atualizar

- `src/index.ts`
- `docs/handoff.md`
- `docs/project_status.md`

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
