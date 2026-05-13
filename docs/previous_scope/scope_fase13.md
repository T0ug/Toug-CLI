# Scope - Fase 13

## Funcionalidades incluídas

### 1. Cadeia de fallback por modelo (modo Gemini)

Agents Pro (architect, executor, reviewer):
- gemini-2.5-pro → gemini-2.5-flash → gemini-2.5-flash-lite → troca key → repete → Ollama

Agents Flash (orchestrator, discovery, project_research):
- gemini-2.5-flash → gemini-2.5-flash-lite → gemini-1.5-flash → troca key → repete → Ollama

### 2. Fallback Ollama (último recurso no modo Gemini)

- Tenta qwen3:14b primeiro
- Se falhar: descarrega 14b via API Ollama, exibe motivo no terminal, carrega qwen3:8b
- Se Ollama offline: printa aviso, não bloqueia
- Respeita OLLAMA_MAX_LOADED_MODELS=1

### 3. Modo Ollama puro

- Sem fallback para Gemini, sem routing
- qwen3:14b → qwen3:8b (se 14b indisponível, com descarregamento)

### 4. Apelidos para API keys

- Cadastro via /config com nickname obrigatório
- Terminal exibe [modelo | nickname] ou [modelo | ollama]

### 5. Sistema de menções @

- @file.txt (com extensão) → CLI lista root, localiza, lê conteúdo, injeta no prompt
- @/pasta ou @pasta (sem extensão) → CLI lista arquivos da pasta, lê conteúdos, injeta no prompt
- @/pasta/file.txt (caminho completo) → CLI lê diretamente, injeta no prompt
- Resolução 100% pelo CLI (sem consumo de tokens)
- Deduplicação: se menção já foi carregada na sessão, CLI pergunta se quer recarregar

### 6. Gestão de sessões (/sessoes)

- Lista todas as sessões do projeto
- Exibe: nome (renomeável) + data última atualização (DD/MM/AAAA HH:mm)
- Permite retomar qualquer sessão anterior

### 7. Contexto expandido

- Threshold de compressão: 50 → 100 mensagens
- keepLast mantém 10

### 8. Atualização Docker e modelos Ollama

- Scripts pull_models.bat/.sh: apagar modelos antigos, baixar qwen3:8b + qwen3:14b
- modelRegistry.ts: todos os agents Ollama unificados em qwen3

### 9. Routing heurístico (modo Gemini → Ollama)

- CLI avalia prompt por regras (tamanho, padrões textuais, tipo de agente)
- Se detectar tarefa simples: pergunta ao usuário se quer encaminhar para Ollama
- Usuário confirma ou recusa
