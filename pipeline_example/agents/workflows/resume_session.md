---
description: description: Retoma uma nova sessão lendo os artefatos mínimos do projeto em docs/, reconstruindo o estado atual e definindo a próxima ação correta antes de qualquer continuidade.
---


# Resume Session Workflow

## Objetivo

Retomar uma nova sessão de trabalho com segurança, reconstruindo o contexto do projeto a partir dos artefatos persistidos em `docs/`, sem depender da memória do chat anterior.

Garantir:

- leitura do estado atual do projeto
- compreensão da fase corrente
- identificação de bloqueios ou lacunas
- definição da próxima ação correta
- retomada segura da pipeline principal

---

## Regra crítica de ativação

Este workflow é uma forma válida de ativar o agente Orchestrator.

Ele NÃO autoriza:

- auto-ativação fora do workflow
- troca implícita de agente
- continuidade automática após execução

Se não for ativado explicitamente:

→ não executar

---

## Integração com Rules

Este workflow depende diretamente das seguintes Rules:

- `context_enforcement` → força leitura de `docs/`
- `task_discipline` → garante consistência com `tasks.md`
- `pipeline_enforcement` → impede salto de fluxo
- `agent_control` → impede troca de agente indevida

Se qualquer Rule bloquear execução:

→ interromper  
→ não contornar  

---

## Quando usar

Use este workflow sempre que:

- uma nova sessão for iniciada
- o contexto do chat anterior tiver sido perdido
- a conversa anterior estiver longa demais
- houver dúvida sobre o estado atual do projeto
- for necessário reancorar o trabalho antes de prosseguir

---

## Etapa 1 — Leitura obrigatória de artefatos

**Agente:** Orchestrator  
**Skill:** orchestrate_project  

Ler obrigatoriamente em `docs/`:

- `project_status.md`
- `handoff.md`
- `tasks.md`
- `decision_log.md`

Se necessário:

- `idea.md`
- `scope.md`
- `non_goals.md`
- `implementation_plan.md`
- `architecture.md`
- `review_report.md`

---

### Regras obrigatórias

- não prosseguir sem leitura mínima
- não usar chat como fonte de verdade
- não inferir contexto não documentado

---

## Etapa 2 — Reconstrução de estado

Identificar:

- fase atual
- última task concluída
- task atual ou próxima
- último handoff válido
- última decisão relevante
- existência de revisão pendente
- existência de bloqueio

---

### Saída obrigatória

Gerar resumo curto contendo:

- fase atual
- última task
- próxima task
- bloqueios
- próximo passo provável

---

## Etapa 3 — Detecção de inconsistências (HARD RULE)

Verificar:

- project_status.md vs tasks.md
- existência de handoff da última execução
- existência de review pendente
- divergência entre execução e documentação

---

### Regra crítica

Se houver inconsistência:

→ BLOQUEAR  
→ NÃO avançar  
→ reportar explicitamente  

---

## Etapa 4 — Definição da próxima ação

Selecionar exatamente UMA ação:

- continuar Discovery
- continuar Architect
- executar próxima task
- validar entrega
- corrigir inconsistência
- retornar onboarding

---

### Regras obrigatórias

- não sugerir múltiplas ações
- não escolher caminho ambíguo
- priorizar segurança do fluxo

---

## Etapa 5 — Preparação de retomada

Definir:

- agente a ser ativado
- skill a ser usada
- artefatos necessários
- objetivo da próxima etapa

---

## Etapa 6 — Confirmação obrigatória

Perguntar:

> A sessão foi retomada com sucesso. Deseja prosseguir com a próxima ação?

---

### Regra crítica

→ não executar automaticamente  
→ aguardar confirmação  

---

## Saída esperada

Ao final:

- estado atual reconstruído
- fase definida
- próxima ação clara
- agente definido
- skill definida
- retomada segura

---

## Regras obrigatórias

### 1. docs/ é a fonte única de verdade

---

### 2. Não assumir continuidade

---

### 3. Sem consistência → sem avanço

---

### 4. Leitura mínima obrigatória

---

### 5. Este workflow NÃO executa

Ele apenas:

- reconstrói contexto
- define próximo passo

---

## Situações especiais

---

### Sem project_status.md

→ reconstruir via tasks + handoff  
→ registrar problema  

---

### Sem handoff.md

→ usar tasks + review  
→ registrar risco  

---

### Sem tasks.md

→ BLOQUEAR  
→ retornar ao Orchestrator  

---

### Projeto externo

→ usar onboard_existing_project  

---

## Critério de saída

Encerrar apenas quando:

- estado reconstruído
- inconsistências resolvidas ou registradas
- próxima ação definida
- usuário confirmou

---

## Regra final

Nunca retome um projeto assumindo contexto.

Sempre reconstrua a verdade a partir de `docs/`.