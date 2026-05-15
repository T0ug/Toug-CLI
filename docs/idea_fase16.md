# Idea - Fase 16 - Terminal Compartilhado Observavel e Memoria Estruturada

## Problema

A Fase 15 criou terminal persistente por sessao, mas o comportamento ainda e baseado em runner PowerShell, fila de comandos e `terminal.log` bruto. Isso nao entrega a experiencia desejada de terminal compartilhado: o usuario nao ve claramente os comandos da IA sendo digitados em tempo real, comandos manuais nao entram automaticamente no contexto da IA, e resultados de ferramenta ainda sao persistidos como mensagens `user`.

Tambem existe um problema de memoria: a API de IA nao possui contexto persistente real. O Toug CLI precisa reconstruir, estruturar, comprimir e reenviar o contexto a cada chamada, preservando conversa, ferramentas, terminal e memoria operacional sem poluir o prompt.

## Intencao

Criar uma nova base de terminal compartilhado observavel usando ConPTY, Windows-first/Windows-only inicialmente, e substituir o historico linear simples por uma sessao estruturada com eventos cronologicos, contexto automatico de terminal e compressao por IA.

## Resultado esperado

- `/terminal` continua existindo, mas passa a abrir/acessar o terminal compartilhado da sessao.
- Usuario e IA usam o mesmo terminal, com controle de posse para evitar input simultaneo.
- A IA pede permissao antes de executar comandos, salvo `autoApproveMode`.
- Comandos pendentes da IA aparecem no terminal antes da aprovacao.
- Comandos recusados entram no contexto como eventos estruturados.
- Comandos longos entram como `running` e bloqueiam novos comandos da IA ate o terminal ficar livre.
- O usuario libera o terminal manualmente, por exemplo com `Ctrl+C`.
- Comandos manuais do usuario no terminal entram automaticamente no contexto da IA.
- Terminal passa a gerar eventos limpos e estruturados; log bruto fica como auditoria/fallback.
- Resultados de ferramenta deixam de ser salvos como `role: "user"`.
- O `session.json` passa a ter `schemaVersion`, `tougVersion` e blocos separados.
- O contexto enviado a IA e montado como timeline cronologica por `sequence`.
- Compressao de contexto passa a ser feita por IA em memoria estruturada.

## Motivacao

O objetivo e aproximar o Toug CLI de uma experiencia de IDE agente, onde terminal, usuario e IA compartilham o mesmo estado operacional de forma verificavel, sem depender de logs brutos ilegíveis nem de mensagens sinteticas no historico.

