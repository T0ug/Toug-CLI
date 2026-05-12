# Task

## Identificacao

- ID: 013
- Nome: Fase 12.3 - Pipeline Engine com Suporte a Function Calling Nativo
- Fase: 12 - Provedores Globais e Gemini
- Agente responsavel: Executor

---

## Objetivo

Tornar o `PipelineEngine` agnóstico ao método de chamada de ferramentas, permitindo que ele execute logicamente tanto requisições Regex por XML (Ollama) quanto requisições formais e empacotadas via Function Calling `tool_call` event (Gemini).

---

## Contexto

A integração do Provider do Gemini foi concluída com um gerador que repassa ToolCalls. O arquivo `pipelineEngine.ts` atualmente descarta (`continue;`) silenciosamente os eventos `.type === 'tool_call'` aguardando apenas `text_delta` do Ollama e quebrando os fluxos da rede remota do Toug. Isso precisa ser resolvido permitindo fluidez.

---

## Entradas

- `src/engine/pipelineEngine.ts`
- `src/providers/types.ts` (Formato ToolCall)
- `docs/tasks.md`

---

## Escopo

- Adaptar o `for await (const event of stream)` para acatar respostas estendidas do provedor quando tratar-se de invocação de tool explícita.
- Ler propriedades de `event.call.name` para identificar `run_command`, `read_file` e `write_file`.
- Reutilizar ou mapear parâmetros json recebidos do Gemini equivalendo às flags extraídas nos antigos Regex. (ex: args.command, args.path, args.content).
- Preservar a rotina visual interativa de bloqueio manual do usuário antes do script e `System` return historigráfico.

---

## Fora de escopo (CRITICO)

- Nao criar as restricoes rigidas e letais do diretorio (Sera TBD, Task 014+).
- Nao quebrar o fallback de tags de transicao XML.

---

## Saidas esperadas

- Logica no `pipelineEngine.ts` atualizada para operar com multiplas pontas.
- Compilador TypeScript passando sem erros.

---

## Criterios de aceite

- O Build retorna 0.
- A máquina de estado não morre silenciosamente após emitir um Request que retorna Function Calling.
- Funções interagem e confirmam a ação para o log.

---

## Dependencias

- Task 012 concluída (já aprovada).

---

## Restricoes

- Reutilizar a logica já aprovada da factory prompt/System. Nenhuma reengenharia enorme no arquivo. Apenas um condicional para parse do objeto.

---

## Estrategia de implementacao

1. Localizar o loop interceptador no Engine atual de Text_Delta.
2. Criar ramo equivalente se `event.type === 'tool_call'`.
3. Processar `run_command` puxando de `<any>event.call.args.command`.
4. Repetir aprovação manual. Definir flag iterativa `keepRunning = true` ao fim e efetuar o `break`.
5. Fazer a logica de gravação write e read equivalentes. 

---

## Plano de validacao

- Validacao estática via build pelo tsc. O revisor conferira o switch condition incluso em `pipelineEngine.ts`.

---

## Artefatos a atualizar

- `src/engine/pipelineEngine.ts`
- `docs/handoff.md`

---

## Observacoes

A Pipeline da Task 011 removeu transition_state das tools. Sendo assim, o `pipelineEngine.ts` vai processá-las nas respostas de texto (já que a pipeline continuará parseando tags XML se caírem no modo fallback para Ollama local).
---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
