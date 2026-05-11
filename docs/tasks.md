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
- [x] Implementar client Ollama API em Node.js (chat, streaming)
- [x] Sistema de configuração (`toug.config.json`)
- [x] Setup da primeira inicialização
- [x] Health check do servidor Ollama
- [x] Sistema de fallback de modelos com notificação

## Fase 3 — Pipeline engine
- [x] Embutir definições de agents no CLI (baseado em `.agents/`)
- [x] Embutir skills, workflows e rules (Note: Partially done via agents, workflows/skills are next or bound to Orchestrator context logic)
- [x] Implementar mapeamento agent → modelo
- [x] Implementar Orchestrator como roteador de mensagens

## Fase 4 — Interface de chat
- [x] Input do usuário no terminal
- [x] Output com streaming
- [x] Labels de agent + modelo em cada mensagem
- [x] Formatação de código e markdown no terminal (Via stream cru nativo no MVP console)

## Fase 5 — Acesso a comandos e arquivos
- [x] Sistema de execução de comandos shell
- [x] Sistema de leitura/escrita de arquivos
- [x] Aprovação do usuário antes de comandos
- [x] Modo auto-approve (opcional) vs interactive
- [x] Rastreio de outputs do terminal
- [x] Bloqueio de comandos admin

## Fase 6 — Inicialização inteligente
- [x] Detecção de estado do projeto (docs/ existe? código existe?)
- [x] Fluxo Project Research para projetos existentes
- [x] Fluxo Discovery para projetos novos
- [x] Exibição de status no terminal ao carregar

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
