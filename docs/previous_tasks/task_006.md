# Task

## Identificação

- ID: 006
- Nome: Fase 5 — Sistema de Execução de Ferramentas (Shell & Auto-approve)
- Fase: Execução
- Agente responsável: Executor

---

## Objetivo

Dar as "mãos" para a Inteligência Artificial. Implementar uma camada que intercepte chamadas de função (Tool Calls) da LLM, execute comandos remotamente no Shell (Terminal Windows/Linux) através do pacote nativo Node, intercepte os Standard Outputs (STDOUT/STDERR), devolva isso fisicamente ao histórico da Engine, de forma protegida por uma camada humana de aprovação (Approval gate).

---

## Contexto

Mesmo as melhores LLMs (como o Ollama operando modelos custom) apenas geram texto. Para agir no sistema do usuário de verdade (e desempenhar O pipeline Toug), o node precisará detectar se o Agente "pediu" para rodar um comando (tipo `npm install`, `mkdir`, etc), rodá-lo usando `child_process`, e devolver a saída. Tudo isso garantindo que Comandos Destrutivos exijam permissão caso `autoApproveMode=false`.

---

## Entradas

- `package.json` atual (Node.js builtin `child_process`).
- Estrutura nativa CLI de Chat (`src/cli/chatInterface.ts` para captar input `y/N`).
- `docs/architecture.md` (Camadas, Pipeline).

---

## Escopo

- Em `src/engine/toolRunner.ts`:
  - Implementar uma função `executeShellCommand(command: string): Promise<string>` envelopando o `exec` de `child_process`.
- Em `src/engine/pipelineEngine.ts`:
  - Modificar a rotina para parsear as saídas da IA em tempo real. Ex: se detectou `<run_command>mkdir test</run_command>` no stream, o Engine deve pausar.
  - Implementar o **Approval Gate**: Imprimir o comando colorido na tela, perguntar via `promptUser("(Y/n)? ")`.
  - Se 'Y' e `isApproved`, roda o `toolRunner`.
  - Injetar forçadamente uma MENSAGEM OCULTA (Role System) no History com o Payload: `Command Output:\n${resultado}`. Recursivamente devolver o Request ao Ollama usando a nova Array de History, assim o Ollama lê, reflete, e pode terminar até dar a verdadeira saída pro User.
- Em `src/data/configManager.ts`: Certificar que `autoApproveMode` é lido do `toug.config.json` e repassado para by-passar o Input caso seja `true`.

---

## Fora de escopo (CRÍTICO)

- NÃO construir 10 ferramentas de parse de JSON complexas agora. Focar SOMENTE na Tool Primária nativa: `run_command` via marcações semânticas `<run_command>`. Formatos cruos em Markdown / XML para simplificar sem precisar de Function Calling JSON complexos (Tool Calls Native do Ollama podem ser instáveis em alguns Models destilados, marcações manuais são robustas `grep-style`).

---

## Saídas esperadas

- O Agente "Executor" da StateMachine deverá se tornar capaz de realizar manipulações reais no computador do usuário que está utilizando o `toug-cli`.

---

## Critérios de aceite

- Se a IA responder "Rodando o comando `<run_command>echo Hello</run_command>`". O parser captura, esconde o bloco do usuário normal ou joga uma cor amarela especial.
- O CLI interage: `[Ollama deseja executar: 'echo Hello'. Permitir? Y/n]`.
- Output capturado é invisível devolvido pra a IA "Processo sucesso: Hello".
- A IA responde "Pronto, comando executado com sucesso."

---

## Restrições

- Manter limpo sem loops infinitos se falhar (se fail der out, devovler stderr como context limit short string para não poluir histórico max tokens). Truncar outputs gigantescos para limite de max_caracteres (ex: 2000 chars por stdout) evitando Caches Explosivos.

---

## Artefatos a atualizar

- `docs/project_status.md`

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [x] Concluída
