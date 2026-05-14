# Idea - Fase 15 - Terminal Persistente e Logs de Comando

## Problema

O Toug CLI pode informar para a IA que um comando foi iniciado ou executado com sucesso sem que o resultado real tenha sido confirmado. O caso observado em `log_examples/session.json` mostrou `npm run dev` sendo tratado como servidor iniciado, enquanto o terminal real retornou erro de script ausente.

Tambem existe perda de contexto operacional: comandos como `cd` nao persistem entre execucoes, e logs vistos pelo usuario no terminal nao necessariamente entram no contexto da IA.

## Intencao

Criar um terminal externo persistente por sessao, usado tanto pelo usuario quanto pelos comandos da IA, com log persistente como fonte de verdade.

## Resultado esperado

- Comandos da IA rodam sempre no mesmo terminal persistente da sessao.
- O usuario pode abrir/reabrir esse terminal com `/terminal`.
- O CLI abre automaticamente o terminal no primeiro comando da IA, se ele ainda nao estiver aberto.
- Cada sessao possui log de terminal proprio.
- A IA recebe output baseado no log real, nao em mensagens sinteticas de sucesso.
- O usuario pode anexar o log com `@terminal` ou `@terminal:N`.
- Sessoes antigas mantem acesso ao log antigo quando carregadas.
- O comando `/help` lista comandos do CLI e suas funcoes.
- A ordem de fallback de modelos passa a ser unica para todos os agentes.

## Motivacao

O objetivo e tornar a execucao de comandos auditavel, visivel e compartilhada entre usuario e IA, reduzindo falsos positivos e evitando perda de diagnostico quando comandos falham rapidamente.

