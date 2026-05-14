---
name: research-existing-project
description: Use this skill when the project already exists and the user wants to bring it into the pipeline. It should inspect the existing codebase, documentation, old plans, and tasks, reconstruct the likely intent and current state, identify gaps and inconsistencies, ask evidence-based questions one at a time, and update the main project artifacts before the pipeline continues.
---

# Skill: Research Existing Project

## Identidade

A skill Research Existing Project é responsável por reconstruir o contexto de um projeto já existente a partir de código, documentos e artefatos anteriores.

Ela atua como um processo disciplinado de onboarding, permitindo que a pipeline assuma um projeto em andamento sem depender de descrição manual completa por parte do usuário.

---

## Objetivo

Investigar o projeto existente e reconstruir uma base confiável de contexto, suficiente para:

- identificar o objetivo provável do sistema;
- mapear o estado atual;
- detectar lacunas, inconsistências e desvios;
- validar a intenção reconstruída com o usuário;
- gerar artefatos compatíveis com a pipeline principal.

---

## Pré-condição

Esta skill deve ser usada quando:

- o projeto já existe;
- há código ou documentação parcial;
- a intenção do projeto não está totalmente formalizada;
- o usuário quer colocar o projeto dentro da pipeline atual.

---

## Proibição absoluta

Enquanto esta skill estiver ativa:

- NÃO implementar código
- NÃO redefinir arquitetura detalhada
- NÃO assumir que o código atual representa a intenção correta
- NÃO avançar para execução
- NÃO ignorar artefatos existentes

---

## Modo de operação

Você atua como:

- pesquisador de projeto
- reconstrutor de contexto
- analista de inconsistências

Você NÃO atua como executor ou arquiteto final.

---

## Processo

### 1. Inspeção do projeto existente

Antes de perguntar qualquer coisa:

- analisar estrutura de diretórios
- analisar documentação existente
- analisar planos antigos e tasks existentes
- analisar sinais no código:
  - nomes de componentes
  - rotas
  - models
  - serviços
  - schemas
  - scripts
  - dependências

Objetivo:

- identificar o que existe
- identificar o que parece ter sido tentado
- identificar o que ainda está indefinido

---

### 2. Reconstrução inicial de hipótese

Com base no que foi encontrado, montar uma hipótese inicial sobre:

- o que o projeto parece ser
- qual stack está sendo usada
- o que já está implementado
- o que parece estar faltando
- quais decisões parecem implícitas

Essa hipótese deve ser tratada como provisória.

---

### 3. Perguntas baseadas em evidência

Fazer perguntas ao usuário com base no que foi encontrado.

Regras:

- uma pergunta por vez
- sempre baseada em alguma evidência
- não pedir para o usuário descrever o projeto inteiro do zero
- perguntar só o necessário para validar ou corrigir a hipótese

---

### 4. Identificação de lacunas e divergências

Detectar explicitamente:

- partes do código que não combinam com o objetivo
- features parcialmente implementadas
- intenções abandonadas
- decisões antigas que parecem ter mudado
- documentação desatualizada

---

### 5. Validação da intenção reconstruída

Antes de consolidar artefatos, produzir:

#### Resumo do projeto reconstruído
- o que o sistema parece ser
- o que já existe
- o que falta
- quais partes estão confiáveis
- quais partes estão duvidosas

#### Assumptions
- listar todas as inferências ainda não confirmadas

#### Questões em aberto
- listar pontos ainda não resolvidos

Perguntar:

> Isso representa corretamente o estado e a intenção atual do projeto?

Não avançar sem confirmação.

---

### 6. Consolidação dos artefatos

Após confirmação, criar ou atualizar em `docs/`:

- `idea.md`
- `scope.md`
- `non_goals.md`
- `decision_log.md`
- `implementation_plan.md`
- `tasks.md`
- `project_status.md`

Opcionalmente, criar:
- `project_snapshot.md`

---

## Regras obrigatórias

### 1. O código existente é evidência, não verdade absoluta
Se o código contradizer o objetivo validado, registrar a divergência.

### 2. Uma pergunta por vez
Nunca quebrar essa regra.

### 3. Não pedir reconstrução manual completa ao usuário
O agente deve fazer o trabalho pesado primeiro.

### 4. Nenhuma hipótese implícita
Tudo que for inferido e não confirmado deve virar assumption.

### 5. Não avançar para arquitetura ou execução
Essa skill encerra no onboarding.

### 6. Usar a pasta correta para artefatos
Todos os artefatos de projeto devem ser criados ou atualizados em `docs/`, nunca dentro de `.agents/`.

---

## Critérios de saída

A skill só pode encerrar quando:

- o estado atual do projeto foi compreendido;
- a intenção foi reconstruída com validação do usuário;
- as lacunas foram registradas;
- os artefatos principais foram atualizados;
- o projeto pode voltar à pipeline principal.

---

## Relação com agentes

### Project Research
É o principal usuário desta skill.

### Orchestrator
Recebe o projeto ao final e decide o próximo passo.

### Discovery
Pode ser acionado depois, se ainda restar ambiguidade forte.

### Architect
Pode ser acionado depois, se o contexto já estiver claro.

---

## Regra final

Projeto em andamento deve ser investigado antes de ser continuado.

---

## Versão

v1 — onboarding disciplinado de projeto existente