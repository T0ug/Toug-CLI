# Tasks — Toug CLI (Macro)

> Visão macro — detalhamento será feito pelo Architect e Executor.

## Fase 1 — Infraestrutura base
- [x] Inicializar projeto Node.js/TypeScript
- [x] Configurar build, lint, e estrutura de pastas
- [x] Criar repositório GitHub "Toug CLI"
- [x] Configurar npm package para instalação global

## Fase 2 — Infraestrutura Ollama (Docker + Client)
- [x] Configurar `docker-compose.yml` para o Ollama
- [x] Criar script de setup para baixar os modelos listados
- [ ] Implementar client Ollama API em Node.js (chat, streaming)
- [ ] Sistema de configuração (`toug.config.json`)
- [ ] Setup da primeira inicialização
- [ ] Health check do servidor Ollama
- [ ] Sistema de fallback de modelos com notificação

## Fase 3 — Pipeline engine
- [ ] Embutir definições de agents no CLI (baseado em `.agents/`)
- [ ] Embutir skills, workflows e rules
- [ ] Implementar mapeamento agent → modelo
- [ ] Implementar Orchestrator como roteador de mensagens

## Fase 4 — Interface de chat
- [ ] Input do usuário no terminal
- [ ] Output com streaming
- [ ] Labels de agent + modelo em cada mensagem
- [ ] Formatação de código e markdown no terminal

## Fase 5 — Acesso a comandos e arquivos
- [ ] Sistema de execução de comandos shell
- [ ] Sistema de leitura/escrita de arquivos
- [ ] Aprovação do usuário antes de comandos
- [ ] Modo auto-approve configurável
- [ ] Bloqueio de comandos admin

## Fase 6 — Inicialização inteligente
- [ ] Detecção de estado do projeto (docs/ existe? código existe?)
- [ ] Fluxo Project Research para projetos existentes
- [ ] Fluxo Discovery para projetos novos
- [ ] Exibição de status no terminal ao carregar

## Fase 7 — Persistência de sessões
- [ ] Salvar histórico de mensagens em pasta local
- [ ] Retomar sessões anteriores
- [ ] Compressão automática de contexto a ~200k tokens

## Fase 8 — Gestão de artefatos
- [ ] Leitura de artefatos de `docs/`
- [ ] Escrita/atualização de artefatos
- [ ] Integração com contexto dos modelos

## Fase 9 — Polish e release
- [ ] Testes e validação end-to-end
- [ ] Documentação (README)
- [ ] Primeira release no GitHub
- [ ] Publicação no npm
