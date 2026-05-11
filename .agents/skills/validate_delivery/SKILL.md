---
name: validate-delivery
description: Use this skill to validate the delivery of a completed task. Ensures that implementation matches the task, handoff contains sufficient evidence, and the system is safe to proceed.
---

# Skill: Validate Delivery

## Objetivo

Validar a entrega de uma task com base em:

- docs/tasks.md
- docs/handoff.md
- docs/project_status.md
- evidência técnica da implementação

Garantir que:

- a task foi executada corretamente
- há evidência suficiente da entrega
- não há inconsistências
- o projeto pode avançar com segurança

---

## Princípio fundamental

Não validar por confiança.

Validar por evidência.

---

## Etapa 1 — Identificar a task

- localizar a task atual em docs/tasks.md
- verificar status esperado
- identificar escopo da task

---

## Etapa 2 — Ler o handoff

Arquivo obrigatório:

- docs/handoff.md

Extrair:

- objetivo
- escopo executado
- artefatos afetados
- evidência da entrega
- validação realizada
- pendências

---

## Etapa 3 — Verificar evidência

Regra crítica:

Se não houver evidência suficiente:

→ BLOQUEAR validação

Evidência válida inclui:

- trechos de código
- diff resumido
- descrição clara da lógica implementada
- instruções reproduzíveis

Evidência inválida:

- descrição vaga
- ausência de arquivos
- ausência de comportamento verificável

---

## Etapa 4 — Validar execução

Verificar:

- a implementação corresponde ao objetivo da task?
- o escopo foi respeitado?
- houve vazamento de escopo?
- algo importante ficou faltando?

---

## Etapa 5 — Validar coerência com o projeto

Verificar:

- consistência com architecture.md (se existir)
- consistência com decision_log.md
- impacto em outras partes do sistema

---

## Etapa 6 — Validar testabilidade

Verificar:

- existe forma clara de validar a entrega?
- os passos de validação são reproduzíveis?
- o comportamento esperado está descrito?

Se não for possível validar:

→ BLOQUEAR

---

## Etapa 7 — Identificar problemas

Classificar:

### Crítico
- ausência de evidência
- divergência com task
- inconsistência estrutural

### Médio
- falta de clareza
- validação fraca
- documentação incompleta

### Leve
- melhoria de organização
- sugestão técnica

---

## Etapa 8 — Decisão

Escolher apenas uma:

### ✅ APROVADO
Quando:

- evidência suficiente existe
- task foi cumprida corretamente
- sistema está consistente

---

### ⚠️ APROVADO COM RESSALVAS
Quando:

- entrega está correta
- mas há problemas não críticos

---

### ❌ REPROVADO
Quando:

- não há evidência suficiente
- task não foi cumprida corretamente
- não é possível validar

---

## Etapa 9 — Gerar review_report.md

Criar ou atualizar:

docs/review_report.md

Conteúdo:

- task analisada
- status (aprovado / ressalvas / reprovado)
- problemas encontrados
- justificativa técnica
- recomendações

---

## Regras obrigatórias

### 1. Sem evidência, sem validação
Nunca aprovar sem evidência concreta.

---

### 2. Não confiar no Executor
Tudo deve ser verificado.

---

### 3. Não assumir contexto do chat
Validar apenas com base nos artefatos.

---

### 4. Não suavizar problemas críticos
Problemas críticos devem bloquear avanço.

---

### 5. Não aprovar por conveniência
A aprovação deve ser técnica, não emocional.

---

## Regra final

Se não for possível provar que a task foi corretamente executada:

→ a task não está concluída