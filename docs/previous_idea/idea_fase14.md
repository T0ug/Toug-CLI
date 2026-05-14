# Ideia - Fase 14: Thinking Display, UX Interativa e Correções

## Problema

O CLI funciona, mas a interface é primitiva: seleções por Y/N e números digitados, sem visibilidade do raciocínio da IA, bugs em Ctrl+C e stdin de comandos interativos, e fluxo de API keys incompleto.

## Objetivo

Evoluir a UX do Toug CLI para torná-lo moderno, transparente e robusto, com:

1. Visibilidade do pensamento da IA (chain-of-thought) em cinza escuro no terminal.
2. Menus interativos com navegação por setas do teclado.
3. Menu principal com 3 opções claras ao iniciar.
4. ToolRunner com suporte a comandos interativos (stdin conectado).
5. Correção do Ctrl+C durante streaming.
6. Fluxo completo de cadastro de API keys com apelido.

## Contexto

- Ollama suporta campo `message.thinking` com `think: true` no request.
- Gemini SDK suporta `thinkingConfig: { includeThoughts: true }`.
- Menus com setas podem ser implementados via raw mode nativo do Node.js (`process.stdin.setRawMode`).
- O toolRunner atual usa `execAsync` que não conecta stdin.
- O Ctrl+C está registrado via `rl.on('SIGINT')` mas não aborta o streaming corretamente.
- O fluxo de API keys salva `{ key, alias }` mas nunca pede o alias ao usuário.

## Resultado esperado

Um CLI que mostra o raciocínio da IA em tempo real, possui navegação intuitiva por setas, permite interagir com comandos do terminal normalmente, e tem um fluxo de configuração completo e polido.
