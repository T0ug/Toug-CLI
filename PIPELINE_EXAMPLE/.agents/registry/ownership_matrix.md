# Ownership Matrix

## Objetivo

Este documento define quais agentes possuem permissão para interagir com cada artefato do projeto, especificando:

- quem pode criar;
- quem pode editar;
- quem pode revisar;
- quem pode apenas ler.

O objetivo é evitar conflitos, sobrescritas indevidas, ambiguidades de responsabilidade e perda de controle operacional.

---

## Regra de localização

Todas as permissões desta matriz se aplicam aos artefatos localizados dentro da pasta `docs/`.

Exemplos:
- `docs/idea.md`
- `docs/architecture.md`
- `docs/tasks.md`

A matriz não se aplica aos arquivos internos da pasta `.agents/`, exceto quando o objetivo for editar o próprio pipeline.

---

## Agentes do sistema

- Discovery
- Architect
- Orchestrator
- Executor
- Reviewer

---

## Tipos de permissão

- **C (Create)** → pode criar o artefato
- **E (Edit)** → pode editar diretamente
- **R (Review)** → pode revisar e sugerir mudanças
- **L (Read)** → apenas leitura

---

## Matriz de ownership

| Artefato                | Discovery | Architect | Orchestrator | Executor | Reviewer |
|------------------------|----------|----------|-------------|----------|----------|
| idea.md                | C/E      | L        | L           | L        | L        |
| scope.md               | C/E      | L        | L           | L        | L        |
| non_goals.md           | C/E      | L        | L           | L        | L        |
| decision_log.md        | C/E      | E        | E           | L        | R        |
| implementation_plan.md | C/E      | E        | E           | L        | R        |
| tasks.md               | C        | L        | E           | L        | R        |
| architecture.md        | L        | C/E      | L           | L        | R        |
| project_status.md      | L        | L        | C/E         | E*       | E        |
| review_report.md       | L        | L        | L           | L        | C/E      |
| handoff.md             | L        | L        | C/E         | E        | E        |

---

## Regras por artefato

### idea.md / scope.md / non_goals.md
- Controle exclusivo do Discovery
- Não devem ser alterados por outros agentes
- Revisão só ocorre via nova rodada de descoberta ou decisão explícita

---

### decision_log.md
- Discovery cria base
- Architect e Orchestrator podem registrar decisões
- Reviewer pode comentar ou sugerir ajustes
- Nunca apagar decisões antigas

---

### implementation_plan.md
- Discovery cria versão inicial
- Architect refina tecnicamente
- Orchestrator ajusta execução
- Reviewer pode sugerir melhorias

---

### tasks.md
- Discovery pode propor estrutura inicial
- Orchestrator é responsável pela manutenção contínua
- Executor não altera tasks diretamente
- Reviewer pode apontar inconsistências

---

### architecture.md
- Controle do Architect
- Outros agentes não editam diretamente
- Mudanças devem passar por decisão registrada

---

### project_status.md
- Orchestrator mantém o estado geral
- Executor pode atualizar progresso (*apenas status de execução*)
- Reviewer pode atualizar status de aprovação

---

### review_report.md
- Exclusivo do Reviewer
- Outros agentes não editam
- Pode ser lido por todos

---

### handoff.md
- Orchestrator cria handoffs
- Executor registra execução
- Reviewer pode complementar com observações

---

## Regras gerais de ownership

### 1. Nenhum agente tem controle total do sistema
Cada agente tem um escopo limitado para evitar conflitos e perda de consistência.

---

### 2. Quem cria não necessariamente mantém
Exemplo:
- Discovery cria o plano
- Orchestrator mantém a execução

---

### 3. Executor não altera estrutura
Executor é responsável por executar tarefas, não por redefinir:
- escopo
- arquitetura
- planejamento global

---

### 4. Reviewer não executa
Reviewer não corrige código diretamente como regra.
Ele valida, bloqueia ou aprova.

---

### 5. Alterações fora de permissão devem ser indiretas
Se um agente precisar influenciar um artefato fora de sua permissão, ele deve:

- registrar no decision_log.md
- propor alteração via handoff
- ou acionar o Orchestrator

---

### 6. O Orchestrator não reescreve definição de produto
Ele coordena execução, não redefine:
- ideia
- escopo
- não objetivos

---

### 7. O Architect não altera intenção
Ele traduz intenção em estrutura, não cria intenção nova.

---

## Regra de conflito

Se dois agentes tiverem visões conflitantes:

1. Registrar no `decision_log.md`
2. Orchestrator analisa impacto
3. Se for estrutural → Architect
4. Se for de produto → Discovery
5. Se for de execução → Orchestrator decide

---

## Regra de escalonamento

Um agente deve escalar ao Orchestrator quando:

- não tiver permissão para alterar algo necessário;
- identificar conflito entre artefatos;
- perceber inconsistência estrutural;
- não tiver contexto suficiente para decidir.

---

## Critério de qualidade da matriz

Esta matriz está funcionando corretamente quando:

- não há sobrescrita indevida de artefatos;
- cada agente atua dentro do seu papel;
- decisões deixam rastro;
- conflitos são resolvidos de forma estruturada;
- o projeto mantém consistência mesmo com múltiplos agentes atuando.

---

## Versão inicial

Esta é a versão v1 da matriz de ownership e poderá ser refinada com o uso, desde que mantenha:

- clareza de responsabilidade;
- separação de papéis;
- segurança operacional;
- previsibilidade de comportamento dos agentes.