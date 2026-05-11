# Artifact Policy

## Objetivo

Este documento define quais artefatos de projeto existem no método, para que servem, como são classificados e quais regras gerais orientam sua criação, atualização e preservação.

O objetivo desta política é evitar desorganização, sobrescrita indevida, perda de contexto e contradições entre agentes durante o desenvolvimento orientado por IA.

---

## Princípios gerais

### 1. Os artefatos são a memória operacional do projeto
A conversa com o usuário ajuda a iniciar e conduzir o trabalho, mas a verdade operacional do projeto deve ser registrada em artefatos persistentes.

### 2. Nem todo artefato pode ser tratado da mesma forma
Alguns artefatos representam decisões fundacionais e não devem ser reescritos livremente. Outros são operacionais e podem ser atualizados com frequência.

### 3. Mudanças devem ser proporcionais ao impacto
Quanto mais estrutural for o artefato, mais conservadora deve ser sua atualização.

### 4. Atualização localizada é preferível à regeneração total
Sempre que possível, os agentes devem atualizar apenas a seção necessária, preservando o restante do documento.

### 5. Em caso de dúvida, preservar
Se houver incerteza sobre a necessidade de alteração, o agente deve preferir:
- propor mudança;
- criar adendo;
- registrar no decision log;
- ou solicitar reavaliação do orquestrador.

Nunca deve reescrever integralmente um artefato estrutural por conveniência.

---

## Local padrão dos artefatos

Os artefatos de projeto definidos nesta política devem ser criados e mantidos dentro da pasta `docs/`.

Exemplos:
- `docs/idea.md`
- `docs/scope.md`
- `docs/non_goals.md`
- `docs/decision_log.md`
- `docs/implementation_plan.md`
- `docs/tasks.md`
- `docs/architecture.md`
- `docs/project_status.md`
- `docs/review_report.md`
- `docs/handoff.md`

A pasta `.agents/` não deve ser usada para guardar saídas do projeto.
Ela é reservada ao método e à configuração do pipeline.

---

## Artefatos-base do projeto

A versão inicial do método reconhece os seguintes artefatos como núcleo operacional do projeto.

### 1. `idea.md`
Define a ideia central do projeto, o problema que se quer resolver e a intenção principal da solução.

**Função:**
- registrar a visão inicial;
- consolidar a proposta central do projeto;
- servir como referência de origem.

---

### 2. `scope.md`
Define o que faz parte do projeto ou da fase atual.

**Função:**
- delimitar o que está dentro do escopo;
- reduzir ambiguidades;
- evitar expansão descontrolada.

---

### 3. `non_goals.md`
Define explicitamente o que não será tratado neste momento.

**Função:**
- proteger o foco;
- evitar deriva de escopo;
- documentar exclusões conscientes.

---

### 4. `decision_log.md`
Registra decisões relevantes de produto, arquitetura, execução e mudança de direção.

**Função:**
- preservar racional por trás das escolhas;
- evitar rediscussão improdutiva;
- manter histórico de evolução.

---

### 5. `implementation_plan.md`
Define o plano macro de implementação.

**Função:**
- traduzir intenção em execução;
- organizar fases;
- apontar prioridades e blocos de entrega.

---

### 6. `tasks.md`
Lista e organiza as tarefas do projeto.

**Função:**
- decompor trabalho;
- registrar dependências;
- manter estado operacional da execução.

---

### 7. `architecture.md`
Define a estrutura técnica do sistema.

**Função:**
- registrar módulos, fluxos, contratos e decisões técnicas;
- orientar implementações;
- evitar contradições estruturais.

---

### 8. `project_status.md`
Consolida o estado atual do projeto.

**Função:**
- mostrar o que está concluído, em andamento, bloqueado e pendente;
- fornecer leitura rápida do estado operacional.

---

### 9. `review_report.md`
Registra resultados de revisão técnica, validação e bloqueios.

**Função:**
- documentar aprovação ou reprovação;
- justificar ajustes;
- registrar riscos e inconsistências detectadas.

---

### 10. `handoff.md`
Registra a passagem de contexto entre agentes e etapas.

**Função:**
- transferir contexto operacional;
- reduzir perda de informação entre etapas;
- orientar o próximo agente de forma objetiva.

---

## Classificação dos artefatos

Os artefatos são classificados em três níveis de mutabilidade.

---

## Categoria A — Imutáveis

São artefatos fundacionais. Após aprovados, não devem ser reescritos integralmente.

### Artefatos desta categoria
- `idea.md`
- `scope.md`
- `non_goals.md`

### Regra geral
Esses artefatos representam a definição original ou consolidada da intenção do projeto. Se houver necessidade de mudança, a alteração não deve apagar a formulação anterior sem registro.

### Forma correta de mudança
A mudança deve ocorrer por um dos meios abaixo:
- adendo;
- nova seção de revisão;
- nova versão explicitamente identificada;
- registro no `decision_log.md` com impacto descrito.

### Forma incorreta de mudança
- regenerar o documento inteiro sem justificativa;
- substituir silenciosamente conteúdo aprovado;
- alterar conceito central sem registrar a mudança.

---

## Categoria B — Semi-imutáveis

São artefatos estruturais. Podem mudar, mas com cuidado e justificativa.

### Artefatos desta categoria
- `implementation_plan.md`
- `architecture.md`

### Regra geral
Esses artefatos podem evoluir conforme o projeto amadurece, mas não devem ser alterados de forma impulsiva ou sem rastreabilidade.

### Forma correta de mudança
A alteração deve:
- ter motivo objetivo;
- ser preferencialmente localizada;
- ser refletida no `decision_log.md` quando gerar impacto estrutural;
- preservar coerência com escopo e não objetivos.

### Forma incorreta de mudança
- reescrever o documento inteiro por conveniência;
- alterar arquitetura sem impacto documentado;
- mudar o plano de implementação sem refletir isso no restante do projeto.

---

## Categoria C — Mutáveis

São artefatos operacionais, atualizados continuamente durante o trabalho.

### Artefatos desta categoria
- `decision_log.md`
- `tasks.md`
- `project_status.md`
- `review_report.md`
- `handoff.md`

### Regra geral
Esses artefatos podem receber atualizações frequentes, desde que mantenham legibilidade, consistência e utilidade operacional.

### Forma correta de atualização
- adicionar entradas novas;
- atualizar status;
- registrar revisão;
- incluir handoffs claros;
- preservar histórico relevante.

### Forma incorreta de atualização
- apagar histórico útil sem motivo;
- misturar tipos de informação sem estrutura;
- transformar documento operacional em documento caótico.

---

## Task Artifact Policy

`docs/tasks.md` é um artefato operacional controlado e a fonte oficial de planejamento do projeto.

Ele deve:

- ser atualizado pelo Orchestrator;
- refletir o estado real da execução;
- permanecer consistente com `project_status.md`;
- ser usado como referência principal antes de qualquer task ser executada.

---

Artefatos internos de tasks gerados pelo modelo:

- não são autoritativos;
- não são persistentes;
- não substituem `docs/tasks.md`;
- não podem redefinir o planejamento oficial.

---

## Consistency Requirement

Em qualquer momento:

`docs/tasks.md` deve representar o estado real da execução.

Se inconsistência for detectada:

→ a execução deve parar  
→ a inconsistência deve ser resolvida antes de continuar

---

## Integração com Rules

A pasta `.agents/rules/` fornece enforcement ativo desta política.

Rules relevantes para artefatos:

- `context_enforcement.md` → força leitura de `docs/`
- `task_discipline.md` → protege `docs/tasks.md`
- `execution_safety.md` → bloqueia avanço sem evidência
- `pipeline_enforcement.md` → impede salto de fluxo

Estas Rules não substituem a política.
Elas aplicam a política de forma mais rígida durante a execução.

Se um agente agir em desacordo com esta política, mas uma Rule ativa bloquear esse comportamento:

→ a Rule deve ser respeitada  
→ a política deve ser interpretada de forma conservadora

---

## Regras de uso por natureza do artefato

### Artefatos fundacionais
Devem ser curtos, claros e estáveis.

### Artefatos estruturais
Devem ser detalhados o suficiente para orientar execução, sem virar documentação excessiva.

### Artefatos operacionais
Devem priorizar clareza, atualização rápida e leitura fácil.

---

## Regras gerais de atualização

### 1. Atualização localizada é o padrão
Todo agente deve preferir alterar apenas a parte necessária do artefato.

### 2. Regeneração total é exceção
A reescrita completa de um artefato só é aceitável quando:
- houver mudança estrutural relevante;
- a versão anterior estiver irrecuperavelmente inconsistente;
- a mudança estiver explicitamente justificada.

### 3. Mudança estrutural deve deixar rastro
Toda mudança que impacte escopo, arquitetura ou plano deve ser registrada no `decision_log.md`.

### 4. Artefato não é espaço de improviso
Nenhum agente deve usar artefatos para inserir ideias não validadas como se já fossem decisão consolidada.

### 5. O estado atual do projeto deve ser legível
Os artefatos, em conjunto, devem permitir responder:
- o que estamos construindo;
- por que estamos construindo;
- como está estruturado;
- o que está sendo feito agora;
- o que mudou;
- o que vem depois.

---

## Regras de preservação

### 1. Não apagar contexto importante
Informações relevantes para entendimento histórico ou operacional não devem ser apagadas sem motivo forte.

### 2. Preservar decisões anteriores
Mesmo quando uma decisão muda, o projeto deve manter rastreabilidade da decisão anterior e do motivo da mudança.

### 3. Evitar duplicação confusa
Se um conteúdo já tem artefato próprio, ele não deve ser replicado de maneira contraditória em vários outros arquivos.

### 4. Cada artefato deve cumprir seu papel
- ideia não é task;
- review não é arquitetura;
- handoff não é decision log;
- decision log não substitui scope.

---

## Regras para agentes

### 1. Nenhum agente deve assumir permissão ampla por padrão
A capacidade de criar, editar ou apenas ler um artefato depende da matriz de ownership do método.

### 2. Em caso de dúvida, o agente deve operar de forma conservadora
Se houver risco de sobrescrita ou inconsistência, o agente deve:
- resumir o estado atual;
- indicar a alteração pretendida;
- propor atualização localizada;
- ou escalar ao orquestrador.

### 3. O agente deve respeitar a natureza do artefato
Nem toda informação descoberta durante a execução pertence ao mesmo documento.

### 4. O agente deve respeitar as Rules ativas
Se uma Rule do sistema restringir ou bloquear determinada ação sobre artefatos:

→ o agente deve obedecer a Rule  
→ não deve tentar contorná-la por interpretação flexível

---

## Critério de qualidade da política de artefatos

Esta política estará sendo seguida corretamente quando:

- os artefatos tiverem papéis claros;
- decisões importantes não se perderem na conversa;
- mudanças relevantes deixarem rastro;
- documentos centrais não forem sobrescritos de forma impulsiva;
- o projeto puder ser compreendido por leitura dos artefatos, sem depender do histórico completo do chat;
- o comportamento dos agentes estiver coerente com as Rules ativas e com o enforcement do sistema.

---

## Versão inicial

Esta política é a versão inicial do método e poderá ser refinada com base no uso real, desde que as mudanças preservem os princípios centrais:
- clareza;
- rastreabilidade;
- preservação;
- coordenação segura entre agentes.