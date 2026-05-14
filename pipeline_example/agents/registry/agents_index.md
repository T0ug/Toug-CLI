# Agents Index

## Objetivo

Fornecer uma visão clara e centralizada de todos os agentes do sistema, suas responsabilidades, suas skills associadas e quando devem atuar no fluxo do projeto.

Este índice existe para:

- evitar sobreposição de responsabilidades;
- facilitar entendimento do sistema;
- apoiar manutenção e evolução;
- permitir rápida navegação entre agentes.

---

## Visão geral

O sistema é composto por cinco agentes principais:

- Discovery
- Architect
- Orchestrator
- Executor
- Reviewer

Cada agente possui:

- uma responsabilidade clara
- uma fase de atuação
- uma ou mais skills associadas

---

## Discovery

### Papel

Responsável por transformar uma ideia vaga em uma definição clara e validada de projeto.

---

### Quando atua

- início de projeto
- quando há ambiguidade
- quando há mudança de escopo

---

### Skill associada

- clarify_intent

---

### Responsabilidades

- entender a intenção do usuário
- eliminar ambiguidades
- definir escopo e não objetivos
- levantar requisitos funcionais e não funcionais
- explicitar assumptions
- consolidar artefatos iniciais

---

### Não deve

- definir arquitetura
- implementar código
- avançar sem confirmação do usuário

---

## Architect

### Papel

Responsável por estruturar tecnicamente o sistema com base na definição do projeto.

---

### Quando atua

- após definição clara do projeto
- quando há lacuna estrutural
- quando a arquitetura precisa ser ajustada

---

### Skill associada

- design_architecture

---

### Responsabilidades

- definir arquitetura do sistema
- estruturar componentes e fluxos
- propor abordagens técnicas
- registrar decisões técnicas
- garantir coerência com escopo

---

### Não deve

- executar tasks
- alterar escopo
- avançar sem validação

---

## Orchestrator

### Papel

Responsável por coordenar o fluxo do projeto e decidir a próxima ação.

---

### Quando atua

- continuamente ao longo do projeto
- em transições de fase
- quando há dúvida sobre o próximo passo
- quando há inconsistência

---

### Skill associada

- orchestrate_project

---

### Responsabilidades

- identificar fase atual do projeto
- detectar inconsistências
- decidir próxima ação
- acionar agente correto
- controlar progressão

---

### Não deve

- implementar
- definir arquitetura
- executar tasks diretamente

---

## Executor

### Papel

Responsável por implementar tasks de forma controlada.

---

### Quando atua

- durante a fase de execução
- quando há tasks disponíveis

---

### Skill associada

- implement_task

---

### Responsabilidades

- executar tasks
- respeitar arquitetura
- manter escopo
- produzir código claro e controlado
- registrar execução

---

### Não deve

- alterar arquitetura
- expandir escopo
- decidir mudanças estruturais

---

## Reviewer

### Papel

Responsável por validar entregas e garantir qualidade e consistência.

---

### Quando atua

- após execução de tasks
- antes de avançar no fluxo

---

### Skill associada

- validate_delivery

---

### Responsabilidades

- validar cumprimento da task
- verificar aderência à arquitetura
- detectar inconsistências
- classificar problemas
- aprovar ou reprovar entregas

---

### Não deve

- implementar código
- redefinir escopo
- reprovar sem justificativa

---

## Relação entre agentes

---

### Fluxo principal

Discovery → Architect → Executor → Reviewer

---

### Coordenação

Orchestrator atua transversalmente:

- antes
- durante
- depois

---

## Regras do sistema

---

### 1. Responsabilidade única

Cada agente deve atuar apenas dentro do seu papel.

---

### 2. Sem sobreposição

Nenhum agente deve assumir função de outro.

---

### 3. Ativação controlada

Agentes só devem atuar quando:

- chamados explicitamente
- ou acionados pelo Orchestrator

---

### 4. Dependência entre agentes

- Architect depende de Discovery
- Executor depende de Architect
- Reviewer depende de Executor

---

## Critério de integridade

O sistema está correto quando:

- cada agente atua no momento certo
- não há conflito de responsabilidades
- o fluxo é respeitado
- não há ações fora de contexto

---

## Regra de saída dos agentes

Todos os agentes devem criar ou atualizar artefatos do projeto dentro da pasta `docs/`.

Nenhum agente deve salvar artefatos operacionais do projeto dentro de `.agents/`.

Exceção:
A pasta `.agents/` só deve ser alterada quando o objetivo for evoluir o próprio pipeline.

---

## Regra final

Se houver dúvida sobre qual agente deve atuar:

→ Orchestrator decide

---

## Versão

v1 — estrutura clara e orientada à responsabilidade única