---
description: Execute a task following the full pipeline: implementation, handoff, validation, and orchestration update. Enforces strict discipline and evidence-based progression.
---

# Execute Task Workflow

## Objetivo

Executar uma task de forma disciplinada garantindo:

- implementação controlada
- geração de handoff completo
- validação baseada em evidência
- atualização correta do estado do projeto

---

## Etapa 1 — Preparar execução

**Agente:** Orchestrator  
**Skill:** orchestrate_project

Ações:

- identificar a task atual em docs/tasks.md
- verificar se há dependências pendentes
- verificar se a task pode ser executada
- confirmar escopo da task

Se houver bloqueio:
→ não prosseguir

---

## Etapa 2 — Implementação

**Agente:** Executor  
**Skill:** implement_task

Ações:

- implementar apenas o escopo da task
- respeitar limites definidos
- não antecipar próximas tasks
- não modificar artefatos fora do escopo

Regra crítica:

→ não avançar sem completar a task

---

## Etapa 3 — Gerar handoff (OBRIGATÓRIO)

**Agente:** Executor  
**Skill:** implement_task

Ações:

- preencher docs/handoff.md usando o template oficial
- incluir evidência da entrega
- listar arquivos modificados
- descrever lógica implementada
- documentar validação realizada

Regra crítica:

Sem handoff completo:
→ NÃO prosseguir

---

## Etapa 4 — Validação (OBRIGATÓRIA)

**Agente:** Reviewer  
**Skill:** validate_delivery

Ações:

- validar a entrega com base em:
  - docs/tasks.md
  - docs/handoff.md
  - evidência apresentada

Resultado possível:

- aprovado
- aprovado com ressalvas
- reprovado

---

## Etapa 5 — Decisão de continuidade

### Se APROVADO:

→ prosseguir para Orchestrator

---

### Se APROVADO COM RESSALVAS:

→ registrar problemas
→ permitir avanço com atenção

---

### Se REPROVADO:

→ retornar para Executor
→ corrigir problemas
→ repetir validação

Regra crítica:

→ não avançar com task reprovada

---

## Etapa 6 — Atualizar estado do projeto

**Agente:** Orchestrator  
**Skill:** orchestrate_project

Ações:

- atualizar docs/tasks.md
- atualizar docs/project_status.md
- registrar decisão em docs/decision_log.md (se necessário)
- preparar próxima task

---

## Etapa 7 — Preparar próxima execução

**Agente:** Orchestrator  
**Skill:** orchestrate_project

Ações:

- identificar próxima task válida
- verificar dependências
- preparar handoff de continuidade

---

## Regras obrigatórias

### 1. Handoff é obrigatório
Nenhuma task é considerada concluída sem handoff.

---

### 2. Validação é obrigatória
Nenhuma task avança sem validação.

---

### 3. Sem evidência, sem aprovação
Reviewer deve bloquear se não houver evidência.

---

### 4. Não pular etapas
Todas as etapas devem ser executadas na ordem.

---

### 5. Orchestrator não executa
Apenas coordena.

---

### 6. Executor não valida
Apenas implementa.

---

### 7. Reviewer não implementa
Apenas valida.

---

## Critério de conclusão

O workflow só termina quando:

- task está validada
- estado do projeto foi atualizado
- próxima ação foi definida