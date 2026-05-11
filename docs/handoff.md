# Handoff

## Task
- ID: 007
- Nome: Fase 6 — Inicialização Inteligente e Detecção de Projeto
- Agente responsável: Executor

---

## Objetivo da Task
Adicionar ao Toug CLI a capacidade de ler o filesystem (cwd) ao iniciar e determinar automaticamente em qual State da pipeline o software deve iniciar, exibindo para o desenvolvedor um resumo visual do que foi encontrado localmente sobre o projeto.

---

## Escopo a Executar
- Criar `src/engine/projectDetector.ts` com função pura que faz `existsSync` em artefatos-chave.
- Ajustar o `src/index.ts` para chamar o detector antes do REPL, decidindo automaticamente `DISCOVERY` vs `ORCHESTRATING`.
- Se existir `docs/project_status.md`, ler seu conteúdo e injetar como mensagem `system` no `history` da Engine para warm-start do contexto.

---

## Regra Crítica
A inicialização deve ser eficiente. Leitura síncrona durante o boot é aceitável e preferível para simplicidade. A decisão de estado deve ser determinística e previsível.
