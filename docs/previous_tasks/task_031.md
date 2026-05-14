# Task

## Identificacao

- ID: 031
- Nome: Fase 15.5 - Fallback Global de Modelos
- Fase: 15 - Terminal Persistente, Logs e Fallback Unificado
- Agente responsavel: Executor

---

## Objetivo

Substituir a ordem de modelos por agente por uma ordem global unica para todos os agentes.

---

## Contexto

O usuario observou que a ordem atual pula para Gemini Flash antes de usar Gemini Pro. A Fase 15 definiu fallback global igual para todos os agentes.

---

## Entradas

- `docs/architecture_fase15.md`
- `src/agents/modelRegistry.ts`
- `src/engine/pipelineEngine.ts`

---

## Escopo

- Definir rotas globais:
  1. `gemini-2.5-pro`
  2. `gemini-2.5-flash`
  3. `gemini-2.0-flash`
  4. `gemini-2.5-flash-lite`
  5. `gemini-2.0-flash-lite`
  6. `qwen3:14b`
  7. `qwen3:8b`
- Aplicar a mesma ordem para todos os agentes.
- Preservar fallback por API key Gemini.
- Usar endpoint Ollama configurado para Qwen.
- Atualizar cabecalho/status para refletir modelo atual.

---

## Fora de escopo (CRITICO)

- Alterar terminal persistente.
- Alterar config de API keys.
- Alterar prompts dos agentes.

---

## Saidas esperadas

- Todos os agentes iniciam por `gemini-2.5-pro` quando provider Gemini estiver ativo.
- Fallback segue a ordem global definida.

---

## Criterios de aceite

- `modelRegistry` nao tem listas diferentes por agente.
- Orchestrator, Discovery, Architect, Executor, Reviewer e Project Research usam mesma ordem.
- Ao esgotar Gemini, Qwen entra via Ollama.
- Build TypeScript passa.

---

## Dependencias

- Task 027 concluida.

---

## Restricoes

- Manter fallback por key conforme regra vigente.
- Nao remover fallback Ollama.

---

## Impacto no sistema

- Afeta custo/latencia de todos os agentes.
- Afeta `PipelineEngine` e exibicao de modelo ativo.

---

## Estrategia de implementacao

Trocar registry por rota global e adaptar o loop de fallback para pares `{ provider, model }`.

---

## Plano de validacao

- Verificar modelo inicial exibido para cada agente.
- Simular erro de quota.
- Confirmar ordem ate Qwen.

---

## Artefatos a atualizar

- `src/agents/modelRegistry.ts`
- `src/engine/pipelineEngine.ts`
- `docs/handoff.md`
- `docs/project_status.md`

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
