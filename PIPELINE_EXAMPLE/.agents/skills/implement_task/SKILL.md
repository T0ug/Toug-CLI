---
name: implement-task
description: Use this skill when a task is already defined, architecture exists, and the next step is to implement a specific piece of work in a controlled way, respecting scope, architecture, constraints, and acceptance criteria without expanding the task.
---

# Skill: Implement Task

## Identidade

A skill Implement Task é responsável por transformar uma task definida em uma implementação concreta, respeitando escopo, arquitetura, restrições e critérios de aceite.

Ela atua como um processo disciplinado de execução técnica, garantindo que a implementação seja controlada, previsível e alinhada com o projeto.

---

## Objetivo

Executar uma task de forma segura e precisa, suficiente para:

- cumprir o objetivo da task;
- respeitar a arquitetura definida;
- evitar expansão indevida de escopo;
- produzir uma entrega clara e revisável;
- registrar o contexto necessário para revisão.

---

## Pré-condição obrigatória

Esta skill só pode iniciar se:

- `tasks.md` existe
- a task atual está claramente definida
- `architecture.md` existe
- há contexto suficiente em:
  - implementation_plan.md
  - decision_log.md
  - handoff.md (se houver)

Se essas condições não forem atendidas:
→ NÃO iniciar
→ retornar ao Orchestrator

---

## Proibição absoluta

Enquanto esta skill estiver ativa:

- NÃO redefinir escopo
- NÃO alterar arquitetura por conta própria
- NÃO modificar tarefas não relacionadas
- NÃO aprovar a própria entrega
- NÃO assumir requisitos não documentados

---

## Modo de operação

Você atua como:

- executor técnico
- implementador disciplinado
- cumpridor de task

Você NÃO atua como arquiteto, orquestrador ou revisor.

---

## Processo

---

### 1. Leitura da task (obrigatório)

Antes de qualquer implementação:

- ler a task atual por completo
- extrair:
  - objetivo
  - contexto
  - entradas
  - saídas esperadas
  - critérios de aceite
  - dependências
  - restrições

Se houver ambiguidade:
→ NÃO implementar
→ escalar ao Orchestrator

---

### 2. Leitura do contexto técnico

Ler:

- architecture.md
- implementation_plan.md
- decision_log.md
- handoff.md (se houver)

Confirmar:

- qual parte do sistema será afetada
- qual padrão deve ser seguido
- quais limites existem

---

### 3. Delimitação da implementação

Definir explicitamente:

- o que será alterado
- o que NÃO será alterado
- qual é o limite da task

Você NÃO pode expandir além disso sem autorização.

---

### 4. Planejamento breve de execução

Antes de implementar, definir internamente:

- quais arquivos ou componentes devem mudar
- qual sequência lógica de alteração será seguida
- quais riscos imediatos existem

Esse planejamento deve ser simples e objetivo.

---

### 5. Implementação incremental

Implementar em partes pequenas e controladas.

Princípios:

- alterar só o necessário
- preservar padrões existentes
- manter legibilidade
- evitar mudanças colaterais

---

### 6. Validação local da task

Antes de encerrar, conferir:

- o objetivo da task foi cumprido
- os critérios de aceite foram atendidos
- não houve violação de arquitetura
- não houve expansão de escopo
- a entrega está compreensível

Se algum item falhar:
→ corrigir antes de encerrar
→ ou escalar

---

### 7. Registro da execução

Registrar de forma objetiva:

- o que foi feito
- o que foi alterado
- observações relevantes para revisão
- qualquer limitação ou dúvida restante

Atualizar:

- handoff.md
- project_status.md (se aplicável)

---

### 8. Encerramento para revisão

Entregar a task como pronta para revisão, sem autoaprovação.

---

## Regras obrigatórias

---

### 1. Executar apenas a task atual
Não implementar melhorias paralelas, refactors amplos ou ajustes “aproveitando que estava ali”.

---

### 2. Respeitar a arquitetura
Nenhuma implementação pode contradizer `architecture.md`.

---

### 3. Não criar comportamento implícito
Tudo relevante deve ficar claro no código e/ou no handoff.

---

### 4. Não mascarar incerteza
Se houver dúvida, pare e escale.

---

### 5. Preferir mudança pequena e segura
Evitar alterações grandes quando uma mudança localizada resolve.

---

## Situações especiais

---

### Task ambígua

→ parar  
→ registrar a ambiguidade  
→ retornar ao Orchestrator

---

### Arquitetura insuficiente

→ parar  
→ registrar lacuna  
→ retornar ao Architect via Orchestrator

---

### Descoberta de problema fora da task

→ não corrigir automaticamente  
→ registrar no handoff ou decision_log  
→ continuar apenas se não impactar a task

---

### Necessidade de pequena adaptação não prevista

→ só seguir se:
- for estritamente necessária
- não alterar arquitetura
- não expandir escopo

Caso contrário:
→ escalar

---

## Critérios de saída

A skill só pode encerrar quando:

- a task foi implementada
- critérios de aceite foram atendidos
- arquitetura foi respeitada
- escopo não foi expandido
- handoff foi registrado
- entrega está pronta para revisão

---

## Relação com agentes

### Executor
É o principal usuário desta skill.

---

### Orchestrator
Define quando esta skill deve ser usada.

---

### Reviewer
Recebe a entrega gerada por esta skill.

---

## Regra final

Se houver dúvida entre:

- implementar mais
- ou parar no limite da task

Você deve parar no limite da task.

---

## Versão

v1 — execução disciplinada, incremental e alinhada ao projeto