---
description: Analisa um projeto já existente com Project Research + research_existing_project para reconstruir contexto, validar a intenção atual e devolver o projeto à pipeline principal.
---

# Onboard Existing Project Workflow

## Objetivo

Colocar um projeto já existente dentro da pipeline principal, utilizando:

- Project Research + research_existing_project

Garantir:

- compreensão do estado atual do projeto
- reconstrução da intenção original ou atual
- identificação de lacunas e divergências
- atualização dos artefatos principais em `docs/`
- retorno seguro ao fluxo principal da pipeline

---

## Pré-condições

Este workflow deve ser usado quando:

- o projeto já possui código ou documentação;
- o projeto não começou dentro da pipeline atual;
- o usuário quer reorganizar o projeto dentro do método.

---

## Etapa 1 — Inspecionar o projeto existente

**Agente:** Project Research  
**Skill:** research_existing_project

Ações:

- analisar estrutura do projeto
- analisar documentação existente
- analisar planos antigos e tasks existentes
- analisar sinais relevantes no código

Regra obrigatória:

- não pedir descrição manual completa ao usuário antes da inspeção

---

## Etapa 2 — Reconstruir hipótese inicial

**Agente:** Project Research  
**Skill:** research_existing_project

Ações:

Montar hipótese provisória sobre:

- o que o projeto parece ser
- o que já está implementado
- o que ainda falta
- quais decisões parecem já tomadas
- quais lacunas existem

---

## Etapa 3 — Validar com o usuário

**Agente:** Project Research  
**Skill:** research_existing_project

Ações:

- fazer perguntas baseadas em evidência
- validar ou corrigir hipóteses
- esclarecer partes ambíguas

Regras:

- uma pergunta por vez
- não assumir intenção final
- não reconstruir o projeto só na conversa

---

## Etapa 4 — Consolidar estado reconstruído

**Agente:** Project Research  
**Skill:** research_existing_project

Produzir:

- resumo do projeto reconstruído
- assumptions
- questões em aberto

Perguntar:

> Isso representa corretamente o estado e a intenção atual do projeto?

Não avançar sem confirmação.

---

## Etapa 5 — Gerar artefatos da pipeline

**Agente:** Project Research  
**Skill:** research_existing_project

Criar ou atualizar em `docs/`:

- `idea.md`
- `scope.md`
- `non_goals.md`
- `decision_log.md`
- `implementation_plan.md`
- `tasks.md`
- `project_status.md`

Opcional:
- `project_snapshot.md`

---

## Etapa 6 — Orquestrar retorno à pipeline principal

**Agente:** Orchestrator  
**Skill:** orchestrate_project

Ações:

- analisar os artefatos gerados
- determinar se o projeto deve seguir para:
  - Discovery
  - Architect
  - Executor
- escolher a próxima ação correta

---

## Regras obrigatórias do workflow

### 1. Não tratar projeto existente como projeto novo
O foco é reconstrução, não descoberta do zero.

### 2. Não depender de explicação completa do usuário
O agente deve começar pela inspeção.

### 3. Não seguir para execução sem reancoragem
O projeto só retorna ao fluxo principal após contexto suficiente.

### 4. Nenhuma hipótese sem validação
Toda inferência importante deve ser confirmada.

### 5. Usar `docs/` como destino dos artefatos
Artefatos de projeto gerados no onboarding devem ser salvos ou atualizados em `docs/`.

---

## Critérios de saída

O workflow só pode encerrar quando:

- o projeto foi inspecionado
- a intenção foi reconstruída
- o usuário confirmou o entendimento
- os artefatos principais foram atualizados
- o Orchestrator definiu a volta ao fluxo principal

---

## Regra final

Antes de continuar um projeto antigo, primeiro reconstrua a verdade dele.