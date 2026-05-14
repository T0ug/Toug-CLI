# Task

## Identificacao

- ID: 029
- Nome: Fase 15.3 - Runner PowerShell e Execucao via Fila
- Fase: 15 - Terminal Persistente, Logs e Fallback Unificado
- Agente responsavel: Executor

---

## Objetivo

Implementar o runner PowerShell persistente por sessao, a fila de comandos e o retorno de `run_command` baseado em `terminal.log`.

---

## Contexto

A Task 028 deve entregar a base de artefatos por sessao. Esta task troca a execucao direta antiga por execucao no terminal persistente.

---

## Entradas

- `docs/architecture_fase15.md`
- `docs/task_028.md`
- `src/engine/terminalSessionManager.ts`
- `src/engine/toolRunner.ts`
- `src/engine/pipelineEngine.ts`

---

## Escopo

- Gerar `runner.ps1` por sessao.
- Abrir PowerShell externo no diretorio inicial da sessao.
- Implementar `commands.queue` em JSON Lines.
- Enfileirar comandos da IA.
- Fazer runner executar comandos pendentes.
- Gravar eventos em `terminal.log`.
- Fazer `executeShellCommand()` retornar `Output do comando executado:` com trecho real do log.
- Remover mensagens sinteticas de sucesso.
- Tratar comandos longos com log parcial e nota informativa.

---

## Fora de escopo (CRITICO)

- Implementar `/terminal` como comando de usuario.
- Implementar `@terminal`.
- Alterar fallback de modelos.
- Implementar autocomplete.

---

## Saidas esperadas

- Comandos da IA rodam no terminal persistente.
- `cd` persiste dentro da janela enquanto ela permanecer aberta.
- Erros rapidos, como `npm run dev` sem script, voltam para IA via log real.

---

## Criterios de aceite

- `npm run dev` sem script retorna o erro real do log.
- Comando sem output retorna log com comando e marcador de fim, nao "sucesso sem output".
- Comando longo retorna logs observados e nota de que continua em execucao.
- Fechar terminal e executar novo comando reabre terminal e anexa ao mesmo log.
- Build TypeScript passa.

---

## Dependencias

- Task 028 concluida.

---

## Restricoes

- Nao fazer fallback silencioso para execucao direta antiga.
- Manter foco Windows/PowerShell.
- Nao redigir logs.

---

## Impacto no sistema

- Afeta `toolRunner`.
- Afeta `PipelineEngine`.
- Afeta confiabilidade de comandos e historico da IA.

---

## Estrategia de implementacao

Implementar runner e fila no `terminalSessionManager`, depois alterar `toolRunner` para delegar a ele. Por fim, ajustar o texto salvo pelo `PipelineEngine`.

---

## Plano de validacao

- Executar `cd` seguido de `Get-Location`.
- Executar `npm run dev` sem script.
- Executar comando sem output.
- Executar comando longo.
- Fechar e reabrir terminal por novo comando.

---

## Artefatos a atualizar

- `src/engine/terminalSessionManager.ts`
- `src/engine/toolRunner.ts`
- `src/engine/pipelineEngine.ts`
- `docs/handoff.md`
- `docs/project_status.md`

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
