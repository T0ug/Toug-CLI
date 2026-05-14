# Artifact Index

## Objetivo

Fornecer uma visão centralizada de todos os artefatos do sistema, suas funções, responsáveis e momento de uso no fluxo do projeto.

Este índice existe para:

- organizar os dados do projeto;
- evitar uso incorreto de artefatos;
- reforçar responsabilidades;
- facilitar manutenção e evolução.

---

## Visão geral

Os artefatos representam o estado do projeto ao longo do tempo.

Eles são:

- criados
- atualizados
- consultados

por diferentes agentes, em diferentes fases.

---

## Local padrão dos artefatos

Todos os artefatos listados neste índice pertencem ao projeto e devem ser armazenados na pasta:

`docs/`

Exemplos:
- `docs/idea.md`
- `docs/scope.md`
- `docs/non_goals.md`
- `docs/decision_log.md`
- `docs/implementation_plan.md`
- `docs/tasks.md`
- `docs/architecture.md`
- `docs/project_status.md`
- `docs/handoff.md`
- `docs/review_report.md`

A pasta `.agents/` não faz parte do armazenamento dos artefatos do projeto.
Ela guarda apenas a definição do método e do sistema de agentes.

---

## Artefatos de definição

---

### idea.md

#### Função
Descrever a ideia central do projeto de forma clara e direta.

---

#### Criado por
Discovery

---

#### Atualizado por
Discovery

---

#### Usado por
- Discovery
- Architect
- Orchestrator

---

#### Fase
Definição

---

---

### scope.md

#### Função
Definir o que está incluído no projeto.

---

#### Criado por
Discovery

---

#### Atualizado por
Discovery

---

#### Usado por
- todos os agentes

---

#### Fase
Definição

---

---

### non_goals.md

#### Função
Definir explicitamente o que NÃO será feito.

---

#### Criado por
Discovery

---

#### Atualizado por
Discovery

---

#### Usado por
- Architect
- Executor
- Reviewer

---

#### Fase
Definição

---

---

## Artefatos de decisão

---

### decision_log.md

#### Função
Registrar decisões importantes e suas justificativas.

---

#### Criado por
Discovery

---

#### Atualizado por
- Discovery
- Architect

---

#### Usado por
- todos os agentes

---

#### Fase
Todas

---

---

## Artefatos de planejamento

---

### implementation_plan.md

#### Função
Descrever a estrutura macro do projeto e suas fases.

---

#### Criado por
Discovery

---

#### Atualizado por
- Discovery
- Architect

---

#### Usado por
- Architect
- Orchestrator
- Executor

---

#### Fase
Definição / Estruturação

---

---

### tasks.md

#### Função
Listar e organizar as tasks do projeto.

---

#### Criado por
Discovery

---

#### Atualizado por
- Orchestrator
- Architect (quando necessário)

---

#### Usado por
- Orchestrator
- Executor
- Reviewer

---

#### Fase
Todas

---

---

## Artefatos estruturais

---

### architecture.md

#### Função
Definir a arquitetura técnica do sistema.

---

#### Criado por
Architect

---

#### Atualizado por
Architect

---

#### Usado por
- Executor
- Reviewer
- Orchestrator

---

#### Fase
Estruturação

---

---

## Artefatos de execução

---

### handoff.md

#### Função
Registrar o que foi feito durante a execução de uma task.

---

#### Criado por
Executor

---

#### Atualizado por
- Executor
- Reviewer

---

#### Usado por
- Reviewer
- Orchestrator

---

#### Fase
Execução / Validação

---

---

### project_status.md

#### Função
Representar o estado atual do projeto.

---

#### Criado por
Orchestrator

---

#### Atualizado por
- Orchestrator
- Reviewer

---

#### Usado por
- todos os agentes

---

#### Fase
Todas

---

---

## Artefatos de validação

---

### review_report.md

#### Função
Registrar o resultado da validação de uma task.

---

#### Criado por
Reviewer

---

#### Atualizado por
Reviewer

---

#### Usado por
- Orchestrator
- Executor

---

#### Fase
Validação

---

---

## Relação entre artefatos

---

### Fluxo principal

idea.md  
→ scope.md  
→ non_goals.md  
→ implementation_plan.md  
→ tasks.md  
→ architecture.md  
→ execução (handoff.md)  
→ validação (review_report.md)  

---

### Artefatos transversais

- decision_log.md
- project_status.md

Esses acompanham todo o fluxo.

---

## Regras do sistema

---

### 1. Cada artefato tem um propósito único
Nenhum artefato deve misturar responsabilidades.

---

### 2. Cada artefato tem dono definido
Respeitar `ownership_matrix.md`.

---

### 3. Atualização controlada
Seguir:

- overwrite_policy.md
- artifact_policy.md

---

### 4. Nenhum artefato crítico pode ser ignorado
Se um artefato necessário estiver ausente:
→ bloquear fluxo

---

## Critério de integridade

O sistema está consistente quando:

- todos os artefatos necessários existem
- cada artefato está atualizado
- não há contradição entre artefatos
- cada agente respeita seu domínio

---

## Regra final

Se houver dúvida sobre qual artefato usar:

→ priorizar o artefato mais específico  
→ ou escalar ao Orchestrator

---

## Versão

v1 — estrutura completa e orientada à organização do estado do projeto