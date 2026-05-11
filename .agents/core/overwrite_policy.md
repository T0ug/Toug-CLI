# Overwrite Policy

## Objetivo

Este documento define as regras que impedem sobrescrita indevida de artefatos durante o desenvolvimento com agentes de IA.

O objetivo é preservar:
- decisões importantes;
- consistência do projeto;
- histórico de evolução;
- integridade dos artefatos.

---

## Princípio central

Sobrescrever é sempre mais perigoso do que atualizar.

Portanto, a regra padrão do sistema é:

> Atualizar incrementalmente é o comportamento padrão.  
> Reescrever integralmente é exceção controlada.

---

## Escopo desta política

Esta política se aplica aos artefatos do projeto armazenados em `docs/`.

Ela não rege os arquivos da pasta `.agents/`, exceto quando o objetivo explícito for modificar o próprio pipeline.

---

## Modos de alteração permitidos

Toda modificação em artefatos deve ocorrer em um dos seguintes modos:

### 1. Atualização localizada (padrão)
Alterar apenas uma seção específica do documento.

Exemplo:
- atualizar uma task
- ajustar um trecho da arquitetura
- complementar um plano

---

### 2. Adição (append)
Adicionar novas informações sem remover conteúdo existente.

Exemplo:
- adicionar entrada no decision log
- incluir nova task
- registrar novo handoff

---

### 3. Proposta de alteração
Sugerir mudança sem alterar diretamente o artefato.

Exemplo:
- propor nova arquitetura
- sugerir mudança de escopo
- indicar inconsistência

---

### 4. Reescrita controlada (exceção)
Substituir integralmente um artefato.

Só permitido quando:
- o documento está inconsistente;
- houve mudança estrutural relevante;
- há justificativa explícita;
- há registro no decision_log.md.

---

## Regras por categoria de artefato

---

## Categoria A — Imutáveis

### Artefatos
- idea.md
- scope.md
- non_goals.md

### Regras

1. Não podem ser reescritos integralmente após aprovação.
2. Não podem ser alterados silenciosamente.
3. Mudanças devem ser feitas por:
   - adendo;
   - nova versão;
   - decisão registrada.

### Comportamento esperado do agente

- nunca substituir conteúdo existente;
- propor alteração quando necessário;
- registrar impacto no decision_log.md.

---

## Categoria B — Semi-imutáveis

### Artefatos
- implementation_plan.md
- architecture.md

### Regras

1. Alterações devem ser localizadas sempre que possível.
2. Mudanças estruturais exigem:
   - justificativa clara;
   - registro no decision_log.md.
3. Reescrita completa é exceção.

### Comportamento esperado do agente

- alterar apenas o necessário;
- evitar regeneração completa;
- manter coerência com o restante do projeto.

---

## Categoria C — Mutáveis

### Artefatos
- decision_log.md
- tasks.md
- project_status.md
- review_report.md
- handoff.md

### Regras

1. Podem ser atualizados frequentemente.
2. Não devem perder histórico relevante.
3. Devem manter clareza e organização.

### Comportamento esperado do agente

- adicionar novas entradas;
- atualizar status;
- evitar apagar contexto útil.

---

## Regras gerais de segurança

### 1. Nunca apagar sem motivo forte
Remover informação só é permitido quando:
- for redundante;
- estiver incorreta;
- houver justificativa explícita.

---

### 2. Nunca regenerar por conveniência
O agente não deve reescrever um documento inteiro apenas porque:
- o contexto ficou grande;
- uma versão "melhor" pode ser gerada;
- perdeu parte da memória da conversa.

---

### 3. Sempre preservar decisões anteriores
Mesmo quando uma decisão muda, a anterior deve permanecer registrada.

---

### 4. Alteração deve ser proporcional
Pequenas mudanças → pequenas alterações  
Grandes mudanças → justificativa + registro

---

### 5. Evitar efeito cascata
Alterar um artefato não deve automaticamente causar reescrita de outros sem necessidade.

---

## Modo conservador (obrigatório em contexto incerto)

Quando o agente estiver com:

- contexto muito grande;
- ambiguidade;
- risco de inconsistência;

Ele deve operar no modo conservador:

1. Resumir o estado atual
2. Identificar o artefato alvo
3. Indicar a alteração específica
4. Executar apenas a alteração mínima necessária

---

## Regra de fallback

Se o agente não tiver certeza sobre como alterar:

Ele deve escolher uma das opções:

- propor mudança em vez de executar;
- registrar dúvida no handoff.md;
- escalar para o Orchestrator.

Nunca deve agir com confiança artificial.

---

## Regras para conflitos

Se uma alteração entrar em conflito com:

- escopo;
- arquitetura;
- plano;
- decisões anteriores;

O agente deve:

1. Não aplicar a alteração diretamente
2. Registrar no decision_log.md
3. Acionar o Orchestrator

---

## Regra de integridade

Após qualquer alteração, o agente deve garantir:

- o documento continua coerente;
- não há contradição interna;
- a mudança não quebrou contexto importante.

---

## Regra de consistência entre artefatos

Nenhum artefato deve contradizer outro.

Se houver divergência, o agente deve:

1. Identificar a inconsistência
2. Não sobrescrever automaticamente
3. Escalar para decisão

---

## Critério de qualidade da política

A política está sendo seguida corretamente quando:

- documentos não são sobrescritos indevidamente;
- mudanças deixam rastro;
- artefatos permanecem coerentes;
- histórico relevante é preservado;
- agentes operam com cautela em vez de impulso.

---

## Regra final

Se houver dúvida entre:

- preservar ou sobrescrever

O agente deve sempre escolher preservar.

---

## Versão inicial

Esta política é a versão v1 e poderá evoluir com o uso real, mantendo os princípios:

- preservação de contexto;
- rastreabilidade;
- atualização incremental;
- segurança operacional.