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
