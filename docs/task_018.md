# Task

## Identificacao

- ID: 018
- Nome: Fase 13.1 - Refatoração de Registry e Migração de Config de API Keys
- Fase: 13 - Fallback Multi-Modelo, Menções e Sessões
- Agente responsavel: Executor

---

## Objetivo

Preparar a base de dados em memória e em disco para suportar o fallback em cascata. Isso envolve atualizar o mapeamento de modelos para exportar Arrays ordenados em vez de strings únicas, e migrar a configuração do sistema para suportar múltiplos objetos de chave API com "apelidos".

---

## Contexto

A Fase 13 exige que o `PipelineEngine` faça retries caso o provedor (Gemini) esgote sua cota. Para que o Engine saiba qual o "próximo" modelo, o `modelRegistry.ts` precisa prover uma lista. Além disso, para gerenciar as chaves API, o arquivo `toug.config.json` deve passar a armazenar arrays de objetos do tipo `{ key, alias }`. Como já existem instalações do CLI rodando com o formato antigo (`apiKeys: string[]`), o `configManager.ts` deve migrar essas chaves legadas de forma transparente no momento do carregamento.

---

## Entradas

- `src/agents/modelRegistry.ts`
- `src/data/configManager.ts`
- `src/providers/types.ts` (definições de modelo)
- `docs/architecture.md` (para referência de arquitetura)

---

## Escopo

- Em `src/agents/modelRegistry.ts`:
  - Alterar a estrutura `GEMINI_MODELS` e `OLLAMA_MODELS` para que representem o fallback desejado (ex: OLLAMA terá apenas `qwen3:14b` e `qwen3:8b`).
  - Refatorar `getModelsForRole` (antigo `getModelForRole`) para retornar o array de strings ordenado de acordo com a `Role`.
- Em `src/data/configManager.ts`:
  - Atualizar as interfaces/types do `TougConfig` para que `apiKeys` seja `Array<{ key: string, alias: string }>`.
  - Refatorar a função `loadConfig` para injetar uma verificação de esquema. Se encontrar chaves do tipo string pura, convertê-las para `{ key: "Aiza...", alias: "Key_Legacy_1" }` e salvar o arquivo atualizado.

---

## Fora de escopo (CRITICO)

- Nenhuma alteração no `PipelineEngine` ou `GeminiProvider` para utilizar esses novos formatos agora. O foco é apenas estruturar as fundações (Registry e Config). O uso no fluxo ocorrerá em task subsequente.
- Nenhuma alteração no comando de CLI (`/config`) para gerenciar as chaves, isso será feito depois.

---

## Saidas esperadas

- O sistema passa no `npm run build` após a mudança tipográfica.
- Configurações legadas presentes no ambiente são automaticamente migradas para o novo formato de objeto sem perder a key.

---

## Criterios de aceite

- O type `TougConfig.apiKeys` é validado como Array de Objetos em todo o projeto.
- O método `getModelsForRole` compila adequadamente retornando `string[]`.

---

## Estrategia de implementacao

1. Mudar o tipo no `configManager.ts` e tratar erros de Type onde o `apiKeys` era usado.
2. Injetar o map de migração no `loadConfig`.
3. Ajustar `modelRegistry.ts` e exportar as listas.

---

## Plano de validacao

- Rodar `npm run build` garantindo que os tipos se alinham.

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
