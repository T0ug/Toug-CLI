# Task

## Identificação

- ID: 024
- Nome: Fase 14.2 - Thinking Display nos Providers e PipelineEngine
- Fase: 14
- Agente responsável: Executor

---

## Objetivo

Implementar o suporte a thinking (raciocínio da IA) nos providers Ollama e Gemini, e renderizar no terminal em cinza escuro.

---

## Contexto

- Decisão 063: `thinking_delta` como evento separado de `text_delta`.
- Decisão 064: thinking não entra no histórico.
- Ollama: campo `message.thinking` com `think: true`.
- Gemini: `thinkingConfig: { includeThoughts: true }`.

---

## Entradas

- `docs/architecture_fase14.md`
- `src/providers/types.ts`
- `src/engine/ollamaClient.ts`
- `src/providers/ollamaProvider.ts`
- `src/providers/geminiProvider.ts`
- `src/engine/pipelineEngine.ts`
- Task 023 concluída (config `showThinking` disponível).

---

## Escopo

1. Modificar `src/providers/types.ts`:
   - Adicionar `{ type: 'thinking_delta'; text: string }` ao union `ProviderEvent`.

2. Modificar `src/engine/ollamaClient.ts`:
   - Aceitar parâmetro `think: boolean` no `streamChat`.
   - Enviar `think: true` no body JSON quando ativado.
   - Retornar `OllamaStreamChunk { type: 'thinking' | 'content'; text: string }` ao invés de `string`.
   - Parsear `parsed.message.thinking` além de `parsed.message.content`.

3. Modificar `src/providers/ollamaProvider.ts`:
   - Ler `showThinking` do config.
   - Passar `think: showThinking` ao `streamChat`.
   - Mapear chunks `thinking` para `{ type: 'thinking_delta' }`.
   - Mapear chunks `content` para `{ type: 'text_delta' }`.

4. Modificar `src/providers/geminiProvider.ts`:
   - Quando `showThinking` está ativo, adicionar `thinkingConfig: { includeThoughts: true }` ao config da request.
   - No loop de streaming, verificar thought parts e emitir `thinking_delta`.

5. Modificar `src/engine/pipelineEngine.ts`:
   - No loop `for await`, tratar `event.type === 'thinking_delta'`:
     - Se `showThinking`: yield `\x1b[90m${event.text}\x1b[0m`.
     - Se desligado: ignorar.
   - NÃO concatenar thinking no `assistantResponse`.

---

## Fora de escopo (CRÍTICO)

- Não alterar o menu do `/config` (será feito na Task 025).
- Não migrar menus para selectMenu.
- Não mexer no toolRunner.

---

## Saídas esperadas

- Providers emitem `thinking_delta` quando o modelo raciocina.
- Terminal mostra pensamento em cinza escuro antes da resposta.
- Pensamento não é salvo no histórico da sessão.

---

## Critérios de aceite

- Com Ollama qwen3, o pensamento aparece em cinza antes da resposta.
- Com Gemini (se modelo suportar thinking), idem.
- `assistantResponse` não contém conteúdo de thinking.
- `npm run build` compila sem erros.
- Toggle `showThinking: false` oculta o pensamento.

---

## Dependências

- Task 023 (campo `showThinking` no config, `COLORS.DIM`).

---

## Restrições

- Não adicionar dependências externas.
- Manter compatibilidade com providers existentes.
- Não quebrar o fallback multi-modelo.

---

## Impacto no sistema

- `types.ts`: novo tipo de evento (aditivo, sem breaking change).
- `ollamaClient.ts`: mudança de retorno do generator (breaking para ollamaProvider).
- `ollamaProvider.ts`: adaptação ao novo retorno.
- `geminiProvider.ts`: novo config na request.
- `pipelineEngine.ts`: novo handler de evento.

---

## Estratégia de implementação

1. Adicionar `thinking_delta` ao types.ts.
2. Refatorar ollamaClient para retornar chunks tipados.
3. Adaptar ollamaProvider.
4. Adaptar geminiProvider.
5. Adaptar pipelineEngine.
6. Build e teste manual.

---

## Plano de validação

- `npm run build` sem erros.
- Teste com Ollama qwen3: enviar pergunta e verificar que pensamento aparece em cinza.
- Teste com `showThinking: false`: verificar que pensamento é oculto.

---

## Artefatos a atualizar

- `src/providers/types.ts`
- `src/engine/ollamaClient.ts`
- `src/providers/ollamaProvider.ts`
- `src/providers/geminiProvider.ts`
- `src/engine/pipelineEngine.ts`

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [x] Concluída
- [ ] Bloqueada
