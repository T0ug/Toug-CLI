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

- [ ] Introduzir selecao global de provedor no start do CLI: Ollama/local ou Gemini.
- [ ] Permitir alterar provedor e API keys Gemini via `/config`.
- [ ] Migrar mapeamento agent -> modelo para regras internas versionadas do CLI.
- [ ] Adicionar integracao Gemini com SDK oficial `@google/genai`.
- [ ] Implementar streaming Gemini.
- [ ] Implementar Function Calling Gemini para `run_command`, `read_file` e `write_file`.
- [ ] Manter XML como compatibilidade para Ollama/local.
- [ ] Implementar fallback entre multiplas API keys Gemini.
- [ ] Implementar matriz de tratamento de erros Gemini aprovada.
- [ ] Gerar log `.txt` para erros fatais com dialogo/Explorer no Windows.
- [ ] Salvar sessao a cada mensagem.
- [ ] Implementar `/stop` e `Ctrl+C` para interromper geracao atual sem encerrar CLI.
- [ ] Aplicar limites de seguranca para comandos e arquivos fora da pasta do projeto.
- [ ] Embutir agents, skills, regras, workflows, templates e artefatos-base no CLI.
- [ ] Garantir que novos projetos/projetos existentes sem docs so criem artefatos apos resumo de entendimento confirmado.

### Tasks formais

- [x] Task 011 - Fase 12.1 - Base de Providers, Config v2 e Model Registry (`docs/task_011.md`)

## Pendente manual

- [ ] Push final para o GitHub.
- [ ] Publicacao no npm, opcional e manual pelo owner.
