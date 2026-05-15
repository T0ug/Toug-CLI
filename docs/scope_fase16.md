# Scope - Fase 16 - Terminal Compartilhado Observavel e Memoria Estruturada

## Escopo funcional

- Substituir a base de terminal persistente por uma implementacao baseada em ConPTY.
- Manter o comando `/terminal` como ponto de acesso ao terminal da sessao.
- Implementar terminal compartilhado por sessao, observavel em tempo real.
- Garantir que usuario e IA nao enviem input simultaneamente ao terminal.
- Permitir que o usuario digite comandos no terminal quando a IA nao estiver usando o terminal.
- Fazer comandos manuais do usuario entrarem automaticamente no contexto da IA quando houver mudanca desde o ultimo envio.
- Fazer comandos da IA aparecerem como pendentes no terminal antes da aprovacao.
- Registrar comando recusado como evento estruturado.
- Registrar comando aprovado/executado como evento consolidado.
- Registrar comandos longos como `running`, com lock do terminal.
- Registrar interrupcao manual por `Ctrl+C` como `interrupted`.
- Remover ANSI escape codes e ruido visual dos outputs estruturados.
- Salvar output limpo completo em disco.
- Enviar ao contexto automatico:
  - output completo quando tiver ate 30 linhas;
  - primeiras 20 linhas + ultimas 10 quando tiver mais de 30 linhas;
  - comandos manuais com comando completo + ultimas 10 linhas de output.
- Criar ferramenta autoaprovada `read_terminal_output(commandId)` para a IA ler output completo limpo de um comando.
- Atualizar `@terminal` para usar eventos estruturados quando disponiveis.
- Atualizar `@terminal:<linhas>` para recortar exatamente as ultimas linhas renderizadas da timeline estruturada.
- Evoluir `session.json` para novo formato com `schemaVersion`, `tougVersion`, `conversation`, `toolEvents`, `terminalEvents`, `memory` e `contextState`.
- Usar `sequence` global para reconstruir a timeline cronologica enviada a IA.
- Nao enviar `schemaVersion` nem `tougVersion` ao provider por padrao.
- Detectar sessoes defasadas por `schemaVersion` ausente ou antigo.
- Avisar toda vez que uma sessao defasada for carregada:

```text
Essa sessão é de uma versão anterior, ao continuar nela pode experienciar erros ou comportamentos inadequados dos modelos de i.a
```

- Implementar compressao de contexto por IA.
- Disparar compressao em 120k tokens estimados.
- Bloquear nova geracao ate comprimir acima de 180k tokens estimados.
- Para Qwen local, usar 24k tokens soft e 30k tokens hard, salvo deteccao segura de contexto maior.
- Usar cadeia propria de modelos para compressao: `gemini-3.1-pro-preview`, `gemini-3-flash-preview`, `gemini-2.5-pro`, depois `gemini-3.1-flash-lite`.
- Para cada modelo Gemini, tentar a chave atual e depois todas as demais chaves cadastradas.
- Se nenhum modelo adequado funcionar, perguntar se o usuario aceita modelo inferior.
- Se aceito, tentar `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `qwen3:14b` e `qwen3:8b`.
- Se o usuario recusar modelo inferior, encerrar a sessao e tentar comprimir novamente ao retomar.
- Atualizar README e `/help`.

## Requisitos nao funcionais

- Performance: contexto automatico de terminal deve ser incremental e enviado apenas quando houver mudanca.
- Escala: compressao deve ser baseada em estimativa de tokens, nao em numero fixo de mensagens.
- Seguranca: nao ha redaction automatica; risco aceito pelo usuario.
- Disponibilidade: se ConPTY falhar, o CLI deve informar erro claro.
- Persistencia: eventos estruturados, outputs completos limpos e memoria comprimida devem sobreviver ao fechamento da sessao.
- Manutencao: separar terminal, eventos, montagem de contexto, compressao e providers em responsabilidades claras.
- Compatibilidade: foco inicial em Windows via ConPTY; multiplataforma fica fora do MVP.

## Assumptions confirmadas

- ConPTY e a base tecnica da Fase 16.
- Windows-first/Windows-only e aceitavel inicialmente.
- O terminal estruturado e fonte principal para IA; log bruto e auditoria/fallback.
- O contexto automatico do terminal nao faz redaction.
- Sessao antiga pode ser carregada sem migracao, mas sempre com aviso se defasada.
- `schemaVersion` e `tougVersion` sao metadados operacionais e nao entram no contexto da IA por padrao.
- Timeline enviada a IA usa `sequence`, nao timestamps reais.

