# Method

## Objetivo

Definir como o sistema de desenvolvimento com IA opera, garantindo:

- consistência
- controle
- previsibilidade
- rastreabilidade

Este método estabelece:

- ordem de execução
- responsabilidades dos agentes
- uso das skills
- critérios de progressão e bloqueio
- regras de ativação
- fonte de verdade do projeto

---

## Princípios fundamentais

### 1. Intenção antes de implementação
Nenhum código deve ser produzido antes da intenção estar clara e validada.

---

### 2. Clareza antes de velocidade
Velocidade não justifica ambiguidade.

---

### 3. Nada importante implícito
Toda decisão relevante deve ser registrada.

---

### 4. Execução controlada
Implementação só ocorre com contexto suficiente.

---

### 5. Validação obrigatória
Nenhuma entrega segue adiante sem revisão.

---

### 6. Progressão disciplinada
O projeto deve evoluir por etapas, sem saltos.

---

## Fonte de verdade do sistema

A única fonte confiável de estado do projeto é:

docs/

Chat NÃO é fonte de verdade.

---

## Local padrão dos artefatos

Todos os artefatos devem ser criados em:

docs/

---

## Estrutura do sistema

.agents/  
docs/  
GEMINI.md  

---

## Regras do sistema (ENFORCEMENT)

### GEMINI.md
Define regras globais obrigatórias.

### Rules (.agents/rules/)
Executam enforcement ativo.

Se houver conflito:
→ Rules prevalecem

---

## 🔴 Protocolo de ativação (CRÍTICO)

- Nenhum agente pode se auto-ativar
- Nenhum agente pode trocar de papel sozinho
- Nenhuma execução ocorre sem comando explícito

Autoridade final: usuário

Se não houver comando:
→ NÃO executar

---

## Continuidade entre sessões

Usar:

resume_session

---

## 🔴 Onboarding de projeto existente (CRÍTICO)

Projetos já iniciados NÃO devem entrar diretamente no fluxo principal.

Deve ser usado:

onboard_existing_project

---

### Quando usar onboarding

- projeto já possui código
- projeto já possui planejamento parcial
- projeto não foi iniciado com a pipeline
- contexto não está formalizado em docs/

---

### Proibido

- usar start_project em projeto existente
- assumir entendimento do projeto sem análise
- iniciar execução sem reconstruir contexto

---

### Objetivo do onboarding

- reconstruir intenção original do projeto
- analisar código existente
- identificar estado atual
- gerar ou corrigir artefatos em docs/
- alinhar o projeto com a pipeline

---

### Resultado esperado

Após onboarding, o projeto deve:

- possuir docs/ consistente
- possuir tasks.md estruturado
- possuir decision_log.md atualizado
- estar pronto para ser retomado pelo Orchestrator

---

## 🔁 Entrada do sistema

Existem dois pontos de entrada válidos:

---

### 1. Projeto novo

Fluxo:

start_project → Discovery → Architect → Executor → Reviewer

---

### 2. Projeto existente

Fluxo:

onboard_existing_project → Orchestrator → fluxo normal

---

## Ciclo de vida do projeto

1. Discovery → clarify_intent  
2. Architecture → design_architecture  
3. Execution → implement_task  
4. Review → validate_delivery  

---

## Fluxo operacional

Discovery → Architect → Executor → Reviewer → Orchestrator

---

## Orquestração

Responsável:
- Orchestrator

Função:

- determinar estado
- detectar inconsistências
- decidir próxima ação
- indicar agente

---

## Regras de transição

---

### Definição → Estruturação

- escopo claro
- sem ambiguidade
- confirmação do usuário

---

### Estruturação → Execução

- arquitetura definida
- sem lacunas

---

### Execução → Validação

- implementação concluída
- handoff presente

---

### Validação → Continuação

- aprovado → próxima task
- reprovado → voltar

---

## Controle de tasks (CRÍTICO)

docs/tasks.md é a única fonte de verdade do planejamento.

---

### Regras obrigatórias

- nenhuma task pode ser executada fora de docs/tasks.md
- nenhuma task pode ser criada fora de docs/tasks.md
- nenhuma task pode ser ignorada
- nenhuma task pode ser reordenada sem registro

---

### Relação com artifact interno (Antigravity)

O modelo pode gerar:

- tasks internas
- checklists
- planning auxiliar

Esses artifacts:

- são temporários
- são locais à sessão
- NÃO são fonte de verdade

---

### Regra crítica de alinhamento

Se houver divergência entre:

- docs/tasks.md  
- artifact interno  

→ docs/tasks.md prevalece

---

### Regra de bloqueio

Se o agente detectar que:

- está executando algo fora de docs/tasks.md  
- está seguindo planejamento interno divergente  

→ PARAR  
→ corrigir alinhamento  
→ atualizar docs/tasks.md se necessário  

---

### Regra de alteração de task

Qualquer mudança deve:

1. atualizar docs/tasks.md  
2. registrar em docs/decision_log.md  

---

## Controle de execução

Fluxo obrigatório:

Executor → Handoff → Reviewer → Orchestrator

Se qualquer etapa faltar:
→ BLOQUEAR

---

## Integração com Rules

Rules garantem:

- leitura obrigatória de contexto
- disciplina de tasks
- bloqueio de execução indevida
- controle de agente

Se Rule bloquear:
→ obedecer

---

## Comportamento em falha

Ambiguidade → Discovery  
Falta de arquitetura → Architect  
Erro → Executor  
Reprovação → corrigir  
Conflito → decision_log.md  

---

## Critério de qualidade

Sistema correto quando:

- execução segue tasks.md
- nenhuma execução ocorre fora do plano
- decisões deixam rastro
- fluxo é respeitado

---

## Regra final

Se houver dúvida entre:

- seguir o planejamento interno do modelo  
- ou seguir docs/tasks.md  

→ seguir docs/tasks.md  

---

## Versão

v4 — com onboarding integrado e pipeline completa