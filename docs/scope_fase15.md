# Scope - Fase 15 - Terminal Persistente e Logs de Comando

## Escopo funcional

- Criar um terminal PowerShell externo persistente por sessao, identificado como terminal do Toug CLI quando possivel.
- Abrir o terminal automaticamente quando a IA executar o primeiro `run_command`.
- Implementar `/terminal` para abrir ou reabrir o terminal externo da sessao atual.
- Fazer comandos da IA rodarem sempre no mesmo terminal persistente da sessao.
- Manter o terminal no diretorio inicial da sessao ao abrir ou reabrir.
- Salvar log persistente por sessao, dentro da estrutura da sessao atual.
- Registrar no log horarios, comandos executados e outputs observaveis.
- Alterar o retorno de `run_command` para enviar a IA:
  - `Output do comando executado:`
  - conteudo do log relevante ao comando.
- Remover mensagens sinteticas do tipo "comando executado com sucesso" quando nao houver evidencia no log.
- Implementar `@terminal` para anexar o log bruto inteiro ao prompt.
- Implementar `@terminal:N` para anexar as ultimas `N` linhas do log bruto.
- Ao carregar uma sessao anterior, manter acesso ao log antigo via `@terminal`.
- Reabrir terminal de sessao antiga somente quando o usuario usar `/terminal` ou quando a IA executar comando.
- Implementar `/help` com lista dos comandos existentes e descricao curta.
- Ajustar fallback de modelos para todos os agentes na ordem:
  1. `gemini-2.5-pro`
  2. `gemini-2.5-flash`
  3. `gemini-2.0-flash`
  4. `gemini-2.5-flash-lite`
  5. `gemini-2.0-flash-lite`
  6. `qwen3:14b`
  7. `qwen3:8b`
- Usar o endpoint Ollama configurado para os modelos Qwen.

## Requisitos nao funcionais

- Performance: leitura de `@terminal:N` deve ser eficiente para logs grandes; `@terminal` pode ler o log inteiro por decisao explicita do usuario.
- Persistencia: logs devem sobreviver ao fechamento do Toug CLI e continuar acessiveis ao carregar a sessao.
- Seguranca: logs serao enviados brutos para a IA quando mencionados; risco aceito pelo usuario.
- Manutencao: separar responsabilidades de terminal, log e execucao de comandos em modulos claros.
- Disponibilidade: falha ao abrir terminal externo deve retornar erro claro para a IA e para o usuario.
- Compatibilidade: foco inicial em Windows/PowerShell, alinhado ao ambiente atual do projeto.

## Assumptions confirmadas

- Terminal externo e por sessao, nao por projeto.
- O terminal nao restaura estado vivo de sessoes antigas; ao reabrir, usa o diretorio inicial da sessao.
- O log bruto e a fonte de verdade e pode conter informacoes sensiveis.
- O usuario aceita envio de log bruto para providers cloud quando `@terminal` for usado.
- Autocomplete de mencoes de arquivos fica fora desta fase.

