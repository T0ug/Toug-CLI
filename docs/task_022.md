# Task

## Identificacao

- ID: 022
- Nome: Fase 13.5 - Routing Heurístico e Atualização de Modelos Docker
- Fase: 13 - Fallback Multi-Modelo, Menções e Sessões
- Agente responsavel: Executor

---

## Objetivo

Finalizar a Fase 13 implementando o sistema de **Routing Heurístico** (para evitar gastos desnecessários de API/Tokens em perguntas simples) e atualizar os scripts de infraestrutura (`pull_models`) para consolidar o uso dos novos modelos Qwen3 definidos no Registry.

---

## Contexto

Quando o CLI detecta um projeto, ele automaticamente amarra o input do usuário na complexa esteira do `Orchestrator` (que carrega as regras e invoca o Executor). Porém, se o usuário fizer uma pergunta genérica (ex: "Como funciona um loop em Python?"), o Orchestrator gastará tokens processando as regras e o status do projeto inteiro à toa. O **Routing Heurístico** deve detectar essas intenções e oferecer um "caminho rápido" (Fast Track). 
Além disso, a infraestrutura (Docker) precisa refletir a mudança do registry, substituindo o antigo `llama3` ou `qwen2` pelas versões `qwen3:14b` (primário) e `qwen3:8b` (fallback).

---

## Escopo

- Em `src/index.ts`:
  - Implementar uma heurística baseada no input do usuário:
    - Se a mensagem começar com `?` (ex: `? Como centralizar uma div`), é explicitamente classificada como "Dúvida Geral".
    - Exibir uma mensagem interceptora e enviar a requisição usando temporariamente um papel de "Assistente de Resposta Direta" (bypass no Orchestrator) ou usar o `DISCOVERY`, sem sujar o estado do projeto.
- Em `docker/pull_models.sh` (e `.bat`):
  - Limpar (via `ollama rm`) os modelos não mais utilizados.
  - Efetuar o `ollama pull qwen3:14b` e `ollama pull qwen3:8b`.

---

## Saidas esperadas

- O script de Docker agora prepara corretamente as máquinas host com a suíte Qwen3.
- Ao usar `? <mensagem>` no prompt do Toug, o CLI altera o roteamento momentaneamente, respondendo de forma crua, rápida e barata, sem disparar a cadeia de agentes formal.

---

## Criterios de aceite

- Roteamento inteligente não deve corromper a state machine principal (após responder, volta para Orchestrator/Executor se houver projeto ativo).
- O download docker reflete os mesmos nomes fixados no `modelRegistry.ts`.

---

## Estrategia de implementacao

1. Editar `pull_models.sh/bat`.
2. Em `index.ts`, capturar `if (input.trim().startsWith('?'))`, criar uma instância separada temporária do Engine apontada para o papel genérico, processar a stream e NÃO embutir esse contexto no histórico oficial da pipeline do projeto (ou embutir apenas como anotação do usuário).

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
