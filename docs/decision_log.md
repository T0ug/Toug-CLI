# Decision Log - Toug CLI

| # | Data | Decisao | Justificativa | Agent |
|---|------|---------|---------------|-------|
| 001 | 2026-05-11 | Stack: Node.js / TypeScript | Escala futura para IDE com interface grafica; bom para CLI no MVP | Discovery |
| 002 | 2026-05-11 | API inicial: Ollama | Runtime padrao para modelos locais | Discovery |
| 003 | 2026-05-11 | Pipeline fixa e embutida no CLI | Garantir enforcement total | Discovery |
| 004 | 2026-05-11 | Servidor dedicado na rede local | Separar carga dos modelos do PC de desenvolvimento | Discovery |
| 005 | 2026-05-11 | Streaming de respostas | Feedback imediato no terminal | Discovery |
| 006 | 2026-05-11 | Aprovacao de comandos + auto-approve configuravel | Seguranca por padrao, flexibilidade quando desejado | Discovery |
| 007 | 2026-05-11 | Persistencia de sessoes em pasta local | Continuidade entre sessoes sem depender so de docs/ | Discovery |
| 008 | 2026-05-11 | Compressao de contexto | Manter sessoes longas operaveis | Architect |
| 009 | 2026-05-11 | Distribuicao via npm global | Padrao para CLIs TypeScript | Discovery |
| 010 | 2026-05-11 | Sem autenticacao no Ollama | MVP em rede local confiavel | Discovery |
| 011 | 2026-05-11 | Labels agent + modelo em cada mensagem | Transparencia sobre qual IA esta respondendo | Discovery |
| 012 | 2026-05-11 | Arquitetura de State Machine | Melhor enforcement da pipeline | Architect |
| 013 | 2026-05-11 | Controle do Docker pelo projeto | Configuracao do Ollama Server versionada junto ao projeto | Orchestrator |
| 014 | 2026-05-11 | Downsizing dos modelos locais | Evitar esgotamento de memoria no servidor | Discovery |
| 015 | 2026-05-12 | Understanding Lock aprovado para suporte inicial a Gemini | Usuario confirmou provedores globais Ollama/Gemini, Gemini via SDK oficial, streaming, function calling, fallback por API key e configuracao global | Discovery |
| 016 | 2026-05-12 | Modelos por agente deixam de ser configuracao do usuario | A verdade dos modelos por agente deve ficar fechada no codigo/regras versionadas do CLI | Discovery |
| 017 | 2026-05-12 | Mapeamento Gemini aprovado por custo-beneficio | `orchestrator`, `discovery` e `project_research` usam `gemini-2.5-flash`; `architect`, `executor` e `reviewer` usam `gemini-2.5-pro` | Discovery |
| 018 | 2026-05-12 | Configuracao especifica por projeto descartada | Nao havera configuracoes por projeto; apenas configuracao global em `~/.toug-cli` | Discovery |
| 019 | 2026-05-12 | Confirmacao obrigatoria antes de gerar artefatos | Novos projetos dependem de Discovery + `clarify-intent`; projetos existentes sem docs dependem de Project Research + `research-existing-project`; ambos exigem resumo confirmado antes de criar `docs/` | Discovery |
| 020 | 2026-05-12 | Arquitetura escolhida: Provider Layer + Tool Dispatcher + Safety Guard | Mantem o `PipelineEngine` como state machine, mas separa providers, tools, seguranca, persistencia e erros para evitar acoplamento excessivo | Architect |
| 021 | 2026-05-12 | Transicao de agentes e privada do PipelineController | O modelo nao deve decidir quando sua fase acabou nem escolher o proximo agente; o CLI valida criterios, artefatos e confirmacoes | Architect |
| 022 | 2026-05-12 | `transition_state` removido das ferramentas publicas do modelo | Gemini deve receber apenas function calls para tools operacionais; transicao de pipeline fica fora do alcance do LLM | Architect |
| 023 | 2026-05-12 | Handoff passa a ser artefato validado por template | Cada fase principal deve produzir handoff valido; transicao e bloqueada se campos minimos ou artefatos obrigatorios estiverem ausentes | Architect |
| 024 | 2026-05-12 | Config v2 separa preferencias de regras versionadas | Config global guarda provider, endpoint, API keys e auto-approve; modelos por agente ficam no `modelRegistry` do CLI | Architect |
| 025 | 2026-05-12 | Providers emitem eventos normalizados | Ollama/XML e Gemini/Function Calling convergem para `ProviderEvent` e `ToolCall`, reduzindo diferencas no `PipelineEngine` | Architect |
| 026 | 2026-05-12 | Task 011 formalizada como primeira execucao da Fase 12 | Orchestrator dividiu a implementacao em uma fundacao executavel: Provider abstraction, Config v2 e Model Registry antes de integrar Gemini real | Orchestrator |
| 027 | 2026-05-12 | Inconsistencia documental corrigida antes da execucao | Reviewer bloqueou o avanco por divergencias entre scope, implementation_plan e handoff; Orchestrator coordenou correcao minima para revalidacao | Orchestrator |
| 028 | 2026-05-12 | Revalidacao documental aprovada para Task 011 | Reviewer confirmou que scope, implementation_plan, handoff, project_status, tasks e decision_log estao alinhados para liberar Executor mediante confirmacao do usuario | Reviewer |
| 029 | 2026-05-12 | Entrega da Task 011 aprovada | Reviewer verificou as evidências no código-fonte, status de compilação e limites de escopo e aprovou a implementação da Fase 12.1. | Reviewer |
| 030 | 2026-05-12 | Task 012 modelada | Orchestrator definiu as regras precisas para fundar o provider do Gemini, focadas em `@google/genai`, Streaming e Tool calling sem impactar a rede ou interfaces legadas | Orchestrator |
| 031 | 2026-05-12 | Entrega da Task 012 aprovada | Reviewer certificou a build TS do provedor implementado com SDK do Gemini e confirmou que atende fielmente o escopo e contrato sem quebrar dependências nativas | Reviewer |
| 032 | 2026-05-12 | Task 013 planejada | Orchestrator definiu a necessidade imediata de atualizar a lógica procedural do Pipeline Engine para executar os eventos FunctionCall que o provedor emite. | Orchestrator |
| 033 | 2026-05-12 | Entrega da Task 013 aprovada | Reviewer atestou incondicionalmente a sintonia segura gerada que converte Function Calls para os matchers regex originais de aprovação interativa. | Reviewer |
| 034 | 2026-05-12 | Task 014 orquestrada | Orchestrator isolou as refatorações de UI e menu `/config` (`index.ts`) para evitar poluição visual de verificações cruas do Ollama atuando no Gemini | Orchestrator |
| 035 | 2026-05-12 | Entrega da Task 014 aprovada | Reviewer verificou as adaptações de interface nativa em `index.ts` que suprimem loggers desnecessários. Código compilado com sucesso. | Reviewer |
| 036 | 2026-05-12 | Task 015 definida e projetada | Orchestrator modelou a estrutura rígida contra crashe silencioso englobando OS command interativo para fatal error no Windows e persistência loop infinita para o contexto | Orchestrator |
| 037 | 2026-05-12 | Entrega da Task 015 aprovada | Reviewer validou a injeção do catch node via fs file-dump. Sessão Cíclica ratificada e sem loops bloqueantes no iterador do engine. | Reviewer |
| 038 | 2026-05-12 | Task 016 orquestrada | Orchestrator delimitou limites de OS para Path Traversal em files nativos e previu o uso de thead lock por evento Ctlr+c | Orchestrator |
| 039 | 2026-05-12 | Entrega da Task 016 aprovada | Reviewer validou estaticamente as seguranças implementáveis pelo Executor para a quebra de instâncias (AbortController vs SIGINT) sem bugs. | Reviewer |
| 040 | 2026-05-12 | Task 017 orquestrada | Orchestrator mapeou a mitigação de early-writes nos agentes de Discovery e decretou fundação terminal para a Fase 12 | Orchestrator |
| 041 | 2026-05-12 | Entrega da Task 017 aprovada e Conclusão da Fase 12 | Reviewer validou os escapes impositivos dentro das injeções puramente textuais de `agentLoader.ts`. Nenhuma colisão estrutural observada, atestando Fase 12 com êxito final | Reviewer |
| 042 | 2026-05-12 | Fallback por modelo antes de fallback por API key | Modelos Gemini free tier esgotam rápido (2.5-pro: 2 RPM/50 RPD). Trocar modelo antes de key multiplica capacidade | Discovery |
| 043 | 2026-05-12 | Modelos Ollama unificados em qwen3 | Descarte de gemma3:4b, deepseek-r1:8b, qwen2.5-coder:7b. Apenas qwen3:14b (primário) e qwen3:8b (fallback) mantidos | Discovery |
| 044 | 2026-05-12 | Ollama como último fallback no modo Gemini | Cadeia: modelos Gemini → troca API key → repete → Ollama. Ollama offline apenas printa aviso | Discovery |
| 045 | 2026-05-12 | Descarregamento explícito de modelo Ollama antes de fallback | Servidor CPU-only 32GB RAM não suporta 2 modelos simultâneos. CLI descarrega via API antes de carregar próximo | Discovery |
| 046 | 2026-05-12 | Divisão multi-modelo por prompt adiada | Complexidade arquitetural incompatível com escopo atual. Registrada como evolução futura | Discovery |
| 047 | 2026-05-12 | gemini-1.5-flash mantido como terceiro fallback Flash | Benchmarks confirmam superioridade sobre qwen3:14b local (HumanEval 74% vs 55-60%) | Discovery |
| 048 | 2026-05-12 | Sistema de menções @ resolvido pelo CLI | Resolução de arquivos/diretórios feita pelo CLI sem consumo de tokens. Deduplicação por sessão | Discovery |
| 049 | 2026-05-12 | Gestão de sessões com /sessoes | Listar, renomear e retomar qualquer sessão anterior, não apenas a mais recente | Discovery |
| 050 | 2026-05-12 | Apelidos obrigatórios para API keys | Nickname no cadastro, exibido no terminal ao lado do modelo para identificação | Discovery |
| 051 | 2026-05-12 | Contexto expandido de 50 para 100 mensagens | Threshold de compressão dobrado. keepLast mantém 10 | Discovery |
| 052 | 2026-05-12 | Routing heurístico com confirmação do usuário | CLI detecta tarefa simples por regras, pergunta se quer desviar para Ollama. Sem automação silenciosa | Discovery |
| 053 | 2026-05-12 | Pré-processamento de menções isolado no CLI | Resolução de arquivos `@` fará injeção de texto direto no prompt em vez de Tool Calling oculto no Gemini. Preserva tokens e isola provider | Architect |
| 054 | 2026-05-12 | Lógica de fallback residente no PipelineEngine | O loop de retentativas ficará no orquestrador global para centralizar o fallback de API keys, modelos e até queda para o Ollama | Architect |
| 055 | 2026-05-12 | Migração de Config nativa | Atualização do tipo array de strings para array de objetos `{key, alias}` com compatibilidade legada silenciosa | Architect |
| 056 | 2026-05-13 | Thinking display em cinza escuro | Raciocínio da IA exibido em `\x1b[90m` antes da resposta final, com toggle no /config | Discovery |
| 057 | 2026-05-13 | Menus interativos com setas do teclado | Substituir todas as seleções Y/N e numéricas por navegação ↑/↓ + Enter via raw stdin nativo | Discovery |
| 058 | 2026-05-13 | Menu principal com 3 opções | Remover análise do diretório visual e prompt de retomar sessão; exibir "Nova conversa / Configurações / Sessões anteriores" | Discovery |
| 059 | 2026-05-13 | ToolRunner com stdin conectado | Usar spawn com stdio inherit para permitir comandos interativos como Read-Host | Discovery |
| 060 | 2026-05-13 | Fix Ctrl+C durante streaming | Corrigir AbortController para interromper geração sem travar terminal | Discovery |
| 061 | 2026-05-13 | Fluxo completo de API keys com apelido | Pedir alias após key com hint dimmed, perguntar se quer adicionar outra | Discovery |
| 062 | 2026-05-13 | Abordagem A: Componentes isolados | selectMenu.ts como módulo reutilizável + thinking_delta como novo ProviderEvent | Architect |
| 063 | 2026-05-13 | thinking_delta separado de text_delta | Não polui o evento de texto, permite toggle sem modificar providers | Architect |
| 064 | 2026-05-13 | Thinking não entra no histórico | Economiza tokens, raciocínio é efêmero e serve apenas para visualização | Architect |
| 065 | 2026-05-13 | Raw mode nativo sem dependência externa | selectMenu simples o suficiente para implementar com process.stdin.setRawMode | Architect |
| 066 | 2026-05-13 | spawn com stdio inherit perde captura de output | Trade-off aceito: interatividade do usuário vale mais que captura de texto para devolver ao modelo | Architect |

