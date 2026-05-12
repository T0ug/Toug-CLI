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
- [x] Salvar histórico de mensagens em pasta local
- [x] Retomar sessões anteriores
- [x] Compressão automática de contexto a ~200k tokens

## Fase 8 — Gestão de artefatos
- [x] Leitura de artefatos de `docs/`
- [x] Escrita/atualização de artefatos
- [x] Integração com contexto dos modelos

## Fase 9 — Polish e release
- [x] Testes e validação end-to-end
- [x] Documentação (README)
- [x] Primeira release no GitHub
- [ ] Publicação no npm (manual pelo owner)

## Fase 10 — Otimização de Memória e Modelos
- [x] Atualizar default config para modelos enxutos (escala 4B a 8B).
- [x] Limitar Docker para suportar apenas 1 modelo na RAM simultaneamente.
- [x] Configurar `OLLAMA_KEEP_ALIVE` para 1 minuto a fim de poupar memória do servidor.
- [x] Atualizar scripts de `pull_models` para refletir as versões menores.

## Fase 11 — UX de Ferramentas e Reforço de Pipeline
- [x] Implementar tag `<transition_state>` no `pipelineEngine.ts` para forçar a State Machine a girar e passar o bastão entre agentes.
- [x] Ocultar tags XML do usuário durante o streaming, pedindo permissão de ferramenta imediatamente ao fechar a tag.
- [x] Modificar `toolRunner.ts` para usar `spawn` em background para comandos de servidor (ex: `npm run dev`), exibindo os logs no chat, mas destravando a IA.
