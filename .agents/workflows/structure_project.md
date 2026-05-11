---
description: Define a arquitetura do projeto com Architect + design_architecture, garantindo decisões estruturais claras antes da execução.
---

# Structure Project Workflow

## Objetivo

Transformar a definição do projeto em uma arquitetura técnica clara, validada e executável, utilizando:

- Architect + design_architecture

Garantir:

- estrutura consistente do sistema
- definição de componentes e responsabilidades
- alinhamento com requisitos funcionais e não funcionais
- registro de decisões técnicas
- preparação segura para execução

---

## Pré-condições

Só iniciar este workflow se:

- `idea.md` existe
- `scope.md` existe
- `non_goals.md` existe
- `implementation_plan.md` existe
- `decision_log.md` existe
- a fase de definição foi concluída

Se qualquer item estiver ausente:
→ NÃO iniciar  
→ retornar ao Discovery via Orchestrator

---

## Etapa 1 — Iniciar arquitetura

**Agente:** Architect  
**Skill:** design_architecture

Ações:

- ler todos os artefatos de definição
- compreender:
  - escopo
  - não objetivos
  - NFRs
  - restrições
  - assumptions

Regras obrigatórias:

- não assumir decisões
- não propor solução sem entender contexto completo

---

## Etapa 2 — Identificar lacunas

**Agente:** Architect  
**Skill:** design_architecture

Ações:

- identificar:
  - inconsistências
  - decisões não tomadas
  - riscos técnicos
  - lacunas estruturais

Se houver lacuna crítica:
→ fazer uma pergunta ao usuário  
→ não avançar

---

## Etapa 3 — Explorar abordagens

**Agente:** Architect  
**Skill:** design_architecture

Ações:

Propor:

- 2 a 3 abordagens possíveis

Para cada abordagem:

- descrever estrutura geral
- explicar funcionamento
- analisar trade-offs:
  - complexidade
  - escalabilidade
  - manutenção
  - risco

Indicar abordagem recomendada.

---

## Etapa 4 — Escolher abordagem

**Agente:** Architect  
**Skill:** design_architecture

Perguntar:

> Podemos seguir com a abordagem recomendada ou prefere outra?

Regras:

- não avançar sem confirmação
- registrar decisão no `decision_log.md`

---

## Etapa 5 — Definir arquitetura

**Agente:** Architect  
**Skill:** design_architecture

Ações:

Definir arquitetura de forma incremental, cobrindo:

---

### Estrutura geral

- camadas
- organização do sistema

---

### Componentes

- frontend
- backend (se houver)
- serviços

---

### Fluxo de dados

- entrada → processamento → saída

---

### Persistência

- onde os dados vivem
- como são acessados

---

### Integrações

- APIs externas
- serviços terceiros

---

### Tratamento de erro

- falhas esperadas
- comportamento em erro

---

### Escalabilidade

- crescimento do sistema
- limitações atuais

---

Regras obrigatórias:

- validar progressivamente
- não apresentar tudo sem validação

---

## Etapa 6 — Validação incremental

**Agente:** Architect  
**Skill:** design_architecture

Após cada parte relevante:

Perguntar:

> Isso faz sentido até aqui?

Se houver ajuste:
→ corrigir antes de avançar

---

## Etapa 7 — Registrar decisões

**Agente:** Architect  
**Skill:** design_architecture

Ações:

Atualizar `decision_log.md` com:

- decisões técnicas
- alternativas consideradas
- justificativas

---

## Etapa 8 — Consolidar arquitetura

**Agente:** Architect  
**Skill:** design_architecture

Criar ou atualizar:

- `architecture.md`

Garantir:

- coerência com escopo
- alinhamento com NFRs
- ausência de lacunas críticas

---

## Etapa 9 — Confirmação final

**Agente:** Architect  
**Skill:** design_architecture

Perguntar:

> A arquitetura está correta e podemos seguir para execução?

Não encerrar sem confirmação.

---

## Etapa 10 — Orquestrar próxima ação

**Agente:** Orchestrator  
**Skill:** orchestrate_project

Ações:

- analisar arquitetura definida
- validar consistência
- decidir próxima etapa

Próxima ação esperada:

→ iniciar execução de tasks com Executor

Se houver problema:
→ retornar ao Architect

---

## Regras obrigatórias do workflow

---

### 1. Não avançar sem definição clara
Arquitetura só começa com escopo definido.

---

### 2. Não pular escolha de abordagem
Sempre explorar alternativas antes de decidir.

---

### 3. Não assumir decisões técnicas
Tudo deve ser confirmado ou registrado como assumption.

---

### 4. Não permitir lacunas estruturais
Se faltar definição crítica:
→ bloquear

---

### 5. Não executar código
Este workflow não envolve implementação.

---

## Situações especiais

---

### Escopo insuficiente

→ retornar ao Discovery

---

### NFRs não definidos

→ retornar ao Discovery

---

### Arquitetura inconsistente

→ corrigir antes de avançar

---

### Descoberta de mudança de escopo

→ interromper  
→ retornar ao Discovery via Orchestrator

---

## Critérios de saída

O workflow só pode encerrar quando:

- abordagem foi escolhida
- arquitetura está definida
- decisões estão registradas
- não há lacunas críticas
- usuário confirmou

---

## Regra final

Se houver dúvida entre:

- avançar para execução
- ou refinar arquitetura

Você deve refinar arquitetura.