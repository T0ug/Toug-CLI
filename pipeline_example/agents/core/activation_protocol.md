# Activation Protocol

## Objetivo

Definir como agentes, skills e workflows são ativados durante a execução da pipeline.

Garantir:

- controle explícito de qual agente está ativo
- previsibilidade de comportamento
- prevenção de troca automática de papéis
- consistência entre sessões

---

## Princípio fundamental

O usuário é a autoridade final de ativação.

Nenhum agente pode assumir outro papel sem instrução explícita do usuário ou do workflow.

---

## Formas de ativação

Existem três formas válidas de ativação:

---

### 1. Ativação por workflow (preferencial)

Exemplo:

Use o workflow `execute_task`

O workflow deve definir internamente:

- qual agente atua
- qual skill é usada
- qual sequência deve ser seguida

Regra:

Quando um workflow é invocado, ele tem prioridade sobre instruções implícitas.

---

### 2. Ativação explícita de agente e skill

Exemplo:

Atue como o agente Architect usando a skill design_architecture

Usado quando:

- não há workflow adequado
- é necessário controle fino da execução
- é necessário corrigir comportamento do agente

---

### 3. Ativação híbrida (recomendado em casos críticos)

Exemplo:

Use o workflow `execute_task`.

Atue como o agente Executor usando a skill implement_task.

Usado quando:

- é necessário reforçar disciplina
- o comportamento precisa ser mais controlado
- há risco de ambiguidade

---

## Regras obrigatórias

### 1. Nenhum agente troca de papel sozinho

Proibido:

- Executor virar Reviewer
- Reviewer virar Orchestrator
- Architect virar Executor
- qualquer agente assumir outro papel sem comando explícito

Se necessário:

→ o agente deve sugerir a próxima ação  
→ mas nunca executar a troca

---

### 2. Sugestão não é execução

Quando um agente diz:

"Podemos seguir como Architect"

Isso é apenas sugestão.

A execução só ocorre quando o usuário confirma.

---

### 3. Workflows não podem ser ignorados

Se um workflow foi invocado:

- ele deve ser seguido integralmente
- suas etapas não podem ser puladas
- seus limites devem ser respeitados

---

### 4. O usuário sempre pode sobrepor

O usuário pode:

- mudar o agente
- mudar a skill
- interromper o fluxo
- redirecionar a execução

Essa decisão tem prioridade sobre qualquer regra interna.

---

### 5. Evitar ambiguidade de ativação

Evitar prompts vagos como:

- "continue"
- "faz aí"
- "segue"

Preferir:

- indicar workflow
- indicar agente
- indicar skill

---

## Papel do Orchestrator

O Orchestrator pode:

- sugerir qual agente deve atuar
- sugerir qual workflow seguir
- identificar a próxima ação correta

O Orchestrator não pode:

- assumir execução automaticamente
- trocar de agente sem confirmação do usuário

---

## Integração com sessões novas

Em novas sessões:

- sempre usar `resume_session` antes de qualquer ativação
- só ativar outro agente após reconstruir o estado do projeto

---

## Situações especiais

### 1. Fluxo travado
→ chamar Orchestrator explicitamente

### 2. Dúvida sobre próxima ação
→ chamar Orchestrator

### 3. Inconsistência entre artefatos
→ chamar Orchestrator

### 4. Projeto fora da pipeline
→ usar `onboard_existing_project`

---

## Exemplos corretos

Use o workflow `resume_session`

---

Use o workflow `execute_task`

Atue como o agente Executor usando a skill implement_task

---

Use o workflow `structure_project`

---

## Task Execution Alignment

Before executing any task:

- confirm alignment with docs/tasks.md

If mismatch is detected:

→ stop  
→ request clarification

---

## Exemplos incorretos

"continua aí"

---

"faz a próxima parte"

---

"pode revisar e depois implementar"

---

## Regra final

Sem ativação explícita, não há execução controlada.

---

## Versão

v1 — protocolo de ativação de agentes