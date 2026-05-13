# Escopo - Fase 14: Thinking Display, UX Interativa e Correções

## Incluído

### Thinking Display
- Enviar `think: true` nas requests do Ollama para modelos qwen3.
- Enviar `thinkingConfig: { includeThoughts: true }` nas requests do Gemini.
- Interceptar campo `message.thinking` (Ollama) e thought parts (Gemini) no streaming.
- Renderizar pensamento em cinza escuro (`\x1b[90m`) antes da resposta final.
- Toggle `showThinking` no `/config` (padrão: true).

### Menus interativos com setas
- Implementar componente de seleção por setas (↑/↓ + Enter) via `process.stdin` raw mode.
- Sem dependências externas (implementação nativa).
- Aplicar em: menu principal, `/config`, `/sessoes`, configuração inicial, aprovação de comandos.

### Menu principal
- Após o logo TOUG (quando config já existe), exibir menu com setas: "Iniciar nova conversa", "Configurações", "Sessões anteriores".
- Remover a análise visual do diretório (✅/❌).
- Remover o prompt "Retomar sessão anterior? (Y/n)".
- A detecção interna de projeto (Orchestrator/Discovery) continua funcionando silenciosamente.

### ToolRunner com stdin
- Substituir `execAsync` por `spawn` com `stdio: 'inherit'` para comandos regulares.
- Permitir interação do usuário com scripts que pedem input (ex: `Read-Host`).

### Fix Ctrl+C
- Diagnosticar e corrigir o AbortController/signal durante streaming.
- Garantir que Ctrl+C interrompa a geração sem travar o terminal.

### Fluxo de API Keys
- Após inserir a key, pedir apelido com hint dimmed "Enter para não incluir apelido à chave API".
- Após concluir, perguntar "Deseja adicionar outra chave?" (com menu de setas: Sim/Não).

## Excluído

- UI gráfica.
- Divisão multi-modelo por prompt.
- Redesign da pipeline de agentes.
- Novas ferramentas (tools) para o LLM.
