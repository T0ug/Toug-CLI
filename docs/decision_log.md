# Decision Log — Toug CLI

## Formato

| # | Data | Decisão | Justificativa | Agent |
|---|------|---------|---------------|-------|

---

## Decisões

| # | Data | Decisão | Justificativa | Agent |
|---|------|---------|---------------|-------|
| 001 | 2026-05-11 | Stack: Node.js / TypeScript | Escala futura para IDE com interface gráfica; bom para CLI no MVP | Discovery |
| 002 | 2026-05-11 | API: Ollama | Runtime padrão para modelos locais, API compatível com OpenAI | Discovery |
| 003 | 2026-05-11 | Pipeline fixa e embutida no CLI | Garantir enforcement total — modelos não podem desviar do fluxo | Discovery |
| 004 | 2026-05-11 | Servidor dedicado na rede local | Separar carga dos modelos do PC de desenvolvimento | Discovery |
| 005 | 2026-05-11 | Streaming de respostas | UX superior — feedback imediato, sem sensação de travamento | Discovery |
| 006 | 2026-05-11 | Aprovação de comandos + auto-approve configurável | Segurança por padrão, flexibilidade quando desejado | Discovery |
| 007 | 2026-05-11 | Persistência de sessões em pasta local | Continuidade entre sessões sem depender só de docs/ | Discovery |
| 008 | 2026-05-11 | Compressão de contexto a ~200k tokens | Modelos locais têm context window limitado; docs/ garante continuidade | Discovery |
| 009 | 2026-05-11 | Distribuição via npm global | Padrão para CLIs TypeScript; facilita instalação e versionamento | Discovery |
| 010 | 2026-05-11 | Sem autenticação no Ollama | MVP em rede local confiável; simplifica implementação | Discovery |
| 012 | 2026-05-11 | Labels agent+modelo em cada mensagem | Transparência sobre qual IA está respondendo e com qual modelo | Discovery |
| 013 | 2026-05-11 | Arquitetura de Máquina de Estados Finita | Melhor enforcement da pipeline vs. Event-driven, mais fácil rastrear falhas do modelo | Architect |
| 014 | 2026-05-11 | Persistência de sessões no AppData (SQLite/JSONL) | Isolar histórico sujo de CWD do usuário, mantendo apenas `docs/` visível e fresco | Architect |
| 015 | 2026-05-11 | HTTP nativo via fetch/undici com SSE parsing | Evitar SDKs opacos como openai/sdk para ter fail-safe customizado no streaming | Architect |
| 016 | 2026-05-11 | Self-healing em falhas de STDERR de subprocessos | Não crashar CLI; devolver log de erro pra IA iterar na correção sem intervir | Architect |
| 017 | 2026-05-11 | Context Auto-Compression | Compactar o histórico da DB local aos 200k chars, sem impactar o context `docs/` lido em runtime | Architect |
| 018 | 2026-05-11 | Controle do Docker pelo projeto | Usuário exigiu que a configuração do Ollama Server no Docker seja versionada junto ao projeto (correção de Assunção) | Orchestrator |
| 019 | 2026-05-11 | Downsizing dos modelos padrão para escala 7B/8B e estrangulamento de RAM no Docker | Evitar esgotamento de memória no servidor e travamentos na troca de agentes (`OLLAMA_KEEP_ALIVE=1m` e `OLLAMA_MAX_LOADED_MODELS=1`) | Discovery |
