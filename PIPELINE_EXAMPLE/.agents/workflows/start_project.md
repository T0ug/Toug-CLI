---
description: Inicia um projeto a partir de uma ideia inicial usando Discovery + clarify_intent, garantindo definição completa antes de avançar.
---

# Start Project Workflow

## Objetivo

Transformar uma ideia inicial em uma definição completa e validada de projeto, utilizando:

- Discovery + clarify_intent

Garantir:

- eliminação de ambiguidades
- definição clara de escopo
- definição de não objetivos
- levantamento de requisitos funcionais e não funcionais
- explicitação de assumptions
- validação com o usuário antes de avançar

---

## Pré-condição

Este workflow pode iniciar com:

- uma ideia vaga
- uma descrição inicial
- ou apenas um objetivo geral

Não exige artefatos prévios.

---

## Etapa 1 — Iniciar descoberta

**Agente:** Discovery  
**Skill:** clarify_intent

Ações:

- ler a ideia inicial fornecida
- identificar lacunas iniciais
- iniciar processo de clarificação

Regras obrigatórias:

- fazer uma pergunta por vez
- não assumir informações
- não avançar sem resposta
- não propor soluções técnicas completas

---

## Etapa 2 — Explorar intenção

**Agente:** Discovery  
**Skill:** clarify_intent

Ações:

- entender profundamente:
  - problema
  - objetivo
  - usuário
  - uso esperado
- levantar requisitos funcionais
- levantar requisitos não funcionais (obrigatório)
- identificar restrições
- definir não objetivos
- explicitar assumptions

Regras obrigatórias:

- nenhuma suposição implícita
- todas as decisões devem ser confirmadas
- NFRs devem ser explicitados

Se houver ambiguidade:
→ continuar perguntando

---

## Etapa 3 — Consolidar entendimento

**Agente:** Discovery  
**Skill:** clarify_intent

Ações:

Gerar:

- resumo de entendimento
- lista de assumptions
- lista de questões em aberto (se houver)

---

## Etapa 4 — Validação obrigatória

**Agente:** Discovery  
**Skill:** clarify_intent

Perguntar:

> Isso representa corretamente sua intenção?

Regras:

- não avançar sem confirmação explícita
- permitir ajustes antes de consolidar

Se houver correção:
→ voltar para etapa 2

---

## Etapa 5 — Gerar artefatos de definição

**Agente:** Discovery  
**Skill:** clarify_intent

Criar ou atualizar:

- `idea.md`
- `scope.md`
- `non_goals.md`
- `decision_log.md`
- `implementation_plan.md` (macro)
- `tasks.md` (macro)

Regras obrigatórias:

- todos os artefatos devem estar consistentes entre si
- nenhuma decisão relevante deve ficar fora dos artefatos

---

## Etapa 6 — Verificação de completude

**Agente:** Discovery  
**Skill:** clarify_intent

Validar:

- não há ambiguidade crítica
- escopo está claro
- não objetivos estão definidos
- NFRs estão definidos
- assumptions estão explícitas

Se qualquer item falhar:
→ voltar para etapa 2

---

## Etapa 7 — Encerrar descoberta

**Agente:** Discovery  
**Skill:** clarify_intent

Ações:

- sinalizar conclusão da fase de definição
- preparar contexto para próxima fase

---

## Etapa 8 — Orquestrar próxima ação

**Agente:** Orchestrator  
**Skill:** orchestrate_project

Ações:

- analisar artefatos gerados
- confirmar que a definição está completa
- decidir próxima etapa

Próxima ação esperada:

→ iniciar design_architecture com Architect

Se houver inconsistência:
→ retornar ao Discovery

---

## Regras obrigatórias do workflow

---

### 1. Não avançar sem confirmação
A definição só é válida após confirmação explícita do usuário.

---

### 2. Não gerar arquitetura
Este workflow NÃO define arquitetura.

---

### 3. Não executar código
Este workflow NÃO envolve implementação.

---

### 4. Não aceitar ambiguidade
Qualquer ambiguidade crítica deve ser resolvida antes de avançar.

---

### 5. NFRs são obrigatórios
Mesmo para MVP, devem ser definidos ou assumidos explicitamente.

---

## Situações especiais

---

### Ideia muito vaga

→ continuar clarificação até obter definição mínima

---

### Usuário não sabe responder

→ propor alternativas  
→ marcar como assumption  
→ confirmar

---

### Mudança de ideia durante o processo

→ voltar para etapa 2  
→ atualizar artefatos

---

## Critérios de saída

O workflow só pode encerrar quando:

- intenção está clara
- escopo está definido
- não objetivos estão definidos
- NFRs estão definidos
- assumptions estão explícitas
- artefatos foram gerados
- usuário confirmou

---

## Regra final

Se houver dúvida entre:

- avançar para arquitetura
- ou continuar clarificando

Você deve continuar clarificando.