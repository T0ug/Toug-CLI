# Task

## Identificacao

- ID: 017
- Nome: Fase 12.7 - Restrição de Artefatos Iniciais e Finalização da Fase 12
- Fase: 12 - Provedores Globais e Gemini
- Agente responsavel: Executor

---

## Objetivo

Garantir os engajamentos corretos durante a montagem das fases de Discovery, mitigando a geração precoce de conteúdo especulativo nos arquivos sem validação de aceite por parte do usuário final, e marcar o encerramento da Fase 12 infraestrutural.

---

## Contexto

A pipeline local amadureceu os frameworks interativos (streaming contínuo e callbacks automáticos) e estruturou um `agentLoader.ts` completamente embutido e livre de arquivos soltos (`.json`). Contudo, o Prompt nativo do Agente Discovery age preempitivamente gravando os artefatos `docs/` antes mesmo de interrogar integralmente o desenvolvedor. Para o modelo zero-friction, a interface estrita não deve preencher a pasta sem o endosso explícito.

---

## Entradas

- `src/agents/agentLoader.ts`
- `docs/tasks.md`

---

## Escopo

- Em `src/agents/agentLoader.ts`:
  - Editar a string atrelada à key `discovery` dentro do mapa `AGENT_PROMPTS`.
  - Inserir a restrição incondicional proibindo `write_file` antes de confirmar o alinhamento da ideia por intermédio das próprias conversas no console (exemplo prático: "Você está PROIBIDO de criar arquivos em docs/ até que o usuário confirme explicitamente um resumo de escopo").
  - Idem para `project_research`, instruí-lo a não alterar arquivos do projeto sem conversar.

---

## Fora de escopo (CRITICO)

- Nenhuma infraestrutura condicional nova baseada em regex ou no motor de pipeline (Tudo deverá ser engatado puramente pelo LLM através do framework linguístico do seu `systemPrompt`).

---

## Saidas esperadas

- Agents devidamente calibrados por IA para contenção lógica de early writes.
- Finalização conclusiva de 100% da métrica da gigantesca Fase 12.

---

## Criterios de aceite

- Nenhuma deleção nos enums antigos.
- Build nativo confirmando sintaxe sem danos.

---

## Estrategia de implementacao

1. Intervenção textual nas aspas duras do hardcode mapping das roles `discovery` e `project_research`.

---

## Plano de validacao

- Compilação via `npm run build`. Reviewer deve garantir textual match dos System Prompts restritivos.

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
