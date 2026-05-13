# Tasks - Toug CLI

## Fases concluidas

- [x] Fase 1 - Infraestrutura base
- [x] Fase 2 - Infraestrutura Ollama/Docker
- [x] Fase 3 - Pipeline engine
- [x] Fase 4 - Interface de chat
- [x] Fase 5 - Acesso a comandos e arquivos
- [x] Fase 6 - Inicializacao inteligente
- [x] Fase 7 - Persistencia de sessoes
- [x] Fase 8 - Gestao de artefatos
- [x] Fase 9 - Polish e release MVP
- [x] Fase 10 - Otimizacao de memoria e modelos locais
- [x] Fase 11 - UX de ferramentas e reforco de pipeline

## Fase 12 - Provedores Globais e Gemini

- [x] Introduzir selecao global de provedor no start do CLI: Ollama/local ou Gemini.
- [x] Permitir alterar provedor e API keys Gemini via `/config`.
- [x] Migrar mapeamento agent -> modelo para regras internas versionadas do CLI.
- [x] Adicionar integracao Gemini com SDK oficial `@google/genai`.
- [x] Implementar streaming Gemini.
- [x] Implementar Function Calling Gemini para `run_command`, `read_file` e `write_file`.
- [x] Manter XML como compatibilidade para Ollama/local.
- [x] Implementar fallback entre multiplas API keys Gemini.
- [x] Implementar matriz de tratamento de erros Gemini aprovada.
- [x] Gerar log `.txt` para erros fatais com dialogo/Explorer no Windows.
- [x] Salvar sessao a cada mensagem.
- [x] Implementar `/stop` e `Ctrl+C` para interromper geracao atual sem encerrar CLI.
- [x] Aplicar limites de seguranca para comandos e arquivos fora da pasta do projeto.
- [x] Embutir agents, skills, regras, workflows, templates e artefatos-base no CLI.
- [x] Garantir que novos projetos/projetos existentes sem docs so criem artefatos apos resumo de entendimento confirmado.

### Tasks formais

- [x] Task 011 - Fase 12.1 - Base de Providers, Config v2 e Model Registry (`docs/task_011.md`)
- [x] Task 012 - Fase 12.2 - Provedor Gemini e Function Calling (`docs/task_012.md`)
- [x] Task 013 - Fase 12.3 - Pipeline Engine com Suporte a Function Calling Nativo (`docs/task_013.md`)
- [x] Task 014 - Fase 12.4 - Interface de Seleção Global e Gemini Configs (`docs/task_014.md`)
- [x] Task 015 - Fase 12.5 - Robustez, Tratamento de Erros e Sessão Cíclica (`docs/task_015.md`)
- [x] Task 016 - Fase 12.6 - Controle de Interrupção (SIGINT) e Limites de Segurança (`docs/task_016.md`)
- [x] Task 017 - Fase 12.7 - Restrição de Artefatos Iniciais e Finalização da Fase 12 (`docs/task_017.md`)

## Pendente manual

- [ ] Push final para o GitHub.
- [ ] Publicacao no npm, opcional e manual pelo owner.

## Fase 13 - Fallback Multi-Modelo, Menções de Arquivo e Gestão de Sessões

- [x] Refatorar modelRegistry para suportar lista ordenada de fallbacks por agent/provider.
- [x] Implementar lógica de fallback por modelo no PipelineEngine (detectar 429/RESOURCE_EXHAUSTED e tentar próximo modelo).
- [x] Implementar fallback por API key após esgotar todos os modelos.
- [x] Implementar Ollama como último fallback no modo Gemini (com detecção de Ollama offline).
- [x] Implementar descarregamento explícito de modelo Ollama via API antes de carregar fallback.
- [x] Unificar modelos Ollama em qwen3:14b (primário) e qwen3:8b (fallback).
- [x] Implementar apelidos (nicknames) para API keys no /config e exibição no terminal.
- [x] Implementar sistema de menções @ para arquivos e diretórios com resolução pelo CLI.
- [x] Implementar deduplicação de menções já carregadas na sessão.
- [x] Implementar /sessoes para listar, renomear e retomar qualquer sessão anterior.
- [x] Expandir threshold de compressão de contexto de 50 para 100 mensagens.
- [x] Implementar routing heurístico (detecção de tarefa simples) com confirmação do usuário.
- [x] Atualizar scripts Docker (pull_models.bat/.sh) para apagar modelos antigos e baixar qwen3:8b + qwen3:14b.

### Tasks formais (Fase 13)

- [x] Task 018 - Fase 13.1 - Refatoração de Registry e Migração de Config de API Keys (`docs/task_018.md`)
- [x] Task 019 - Fase 13.2 - Lógica de Fallback Multi-Modelo e API Keys no PipelineEngine (`docs/task_019.md`)
- [x] Task 020 - Fase 13.3 - Resolução de Menções a Arquivos (@file) (`docs/task_020.md`)
- [x] Task 021 - Fase 13.4 - Gerenciador de Sessões (/sessoes) e Limite de Contexto (`docs/task_021.md`)
- [x] Task 022 - Fase 13.5 - Routing Heurístico e Atualização de Modelos Docker (`docs/task_022.md`)

## Fase 14 - Thinking Display, UX Interativa e Correções

Status atual: Fase 14 concluida com ressalvas. Tasks 023-026 implementadas e validadas.

- [ ] Implementar componente de menu interativo com setas (↑/↓ + Enter) via raw stdin nativo.
- [x] Implementar menu principal pós-config: "Iniciar nova conversa" / "Configurações" / "Sessões anteriores".
- [x] Remover análise visual do diretório (✅/❌) e prompt "Retomar sessão? (Y/n)".
- [x] Migrar todas as seleções Y/N e numéricas para menus com setas.
- [ ] Implementar thinking display: enviar `think: true` ao Ollama e `thinkingConfig` ao Gemini.
- [ ] Renderizar pensamento em cinza escuro (`\x1b[90m`) durante streaming.
- [x] Adicionar toggle `showThinking` no `/config`.
- [x] Corrigir Ctrl+C para interromper geração de resposta sem travar terminal.
- [x] Substituir `execAsync` por `spawn` com `stdio: 'inherit'` no toolRunner para comandos interativos.
- [x] Implementar fluxo completo de API keys: pedir apelido com hint dimmed + loop "adicionar outra?".

### Tasks formais (Fase 14)

- [x] Task 023 - Fase 14.1 - Componente selectMenu e Fundação de Config (`docs/task_023.md`)
- [x] Task 024 - Fase 14.2 - Thinking Display nos Providers e PipelineEngine (`docs/task_024.md`) - validada com ressalvas
- [x] Task 025 - Fase 14.3 - Fix Ctrl+C e ToolRunner com stdin interativo (`docs/task_025.md`) - validada com ressalvas
- [x] Task 026 - Fase 14.4 - Menu Principal, Migração UX e Fluxo de API Keys (`docs/task_026.md`) - validada com ressalvas


