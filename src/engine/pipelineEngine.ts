import { PipelineState, AgentRole } from '../agents/types';
import { loadAgent } from '../agents/agentLoader';
import { Message } from './ollamaClient';
import { loadConfig } from '../data/configManager';
import { promptUser, COLORS } from '../cli/chatInterface';
import { executeShellCommand } from './toolRunner';
import { readArtifact, writeArtifact } from './artifactManager';
import { getModelForProviderRole } from '../agents/modelRegistry';
import { createProvider } from './providerFactory';
import { AIProvider, ProviderMessage } from '../providers/types';

export class PipelineEngine {
    private state: PipelineState = 'IDLE';
    private provider: AIProvider;
    private history: Message[] = [];

    constructor() {
        this.provider = createProvider();
    }

    public getState(): PipelineState {
        return this.state;
    }

    public transition(newState: PipelineState): void {
        console.log(`\n[PipelineEngine] State Transition: ${this.state} -> ${newState}`);
        this.state = newState;
    }

    private getRoleForState(state: PipelineState): AgentRole {
        switch (state) {
            case 'DISCOVERY': return 'discovery';
            case 'ARCHITECT': return 'architect';
            case 'EXECUTING': return 'executor';
            case 'REVIEW': return 'reviewer';
            case 'ORCHESTRATING': return 'orchestrator';
            case 'PROJECT_RESEARCH': return 'project_research';
            default: return 'orchestrator';
        }
    }

    private getModelForRole(role: AgentRole): string {
        const config = loadConfig();
        return getModelForProviderRole(config.lastProvider, role);
    }

    public injectContext(content: string): void {
        this.history.push({ role: 'system', content });
    }

    public getHistory(): Message[] {
        return this.history;
    }

    public setHistory(history: Message[]): void {
        this.history = history;
    }

    public setState(state: PipelineState): void {
        this.state = state;
    }

    public getActiveConfig() {
        const role = this.getRoleForState(this.state);
        const provider = loadConfig().lastProvider;
        const model = this.getModelForRole(role);
        return { provider, role, model };
    }

    public async *processInput(userInput: string): AsyncGenerator<string, void, unknown> {
        if (this.state === 'IDLE') {
            this.transition('ORCHESTRATING');
        }

        let keepRunning = true;
        this.history.push({ role: 'user', content: userInput });

        while (keepRunning) {
            keepRunning = false;

            const role = this.getRoleForState(this.state);
            const agent = loadAgent(role);
            const model = this.getModelForRole(role);
            const config = loadConfig();
            this.provider = createProvider(config.lastProvider);

            const messages: ProviderMessage[] = [
                { role: 'system', content: agent.systemPrompt },
                ...this.history
            ];

            const stream = this.provider.stream({
                provider: config.lastProvider,
                model,
                messages,
                tools: [],
                metadata: {
                    cwd: process.cwd(),
                    state: this.state,
                    agentRole: role
                }
            });
            let assistantResponse = '';

            let tagBuffer = '';
            let insideTag = false;

            for await (const event of stream) {
                if (event.type === 'error') {
                    throw new Error(event.error.message);
                }

                if (event.type === 'done') {
                    break;
                }

                if (event.type !== 'text_delta') {
                    continue;
                }

                const chunk = event.text;
                assistantResponse += chunk;

                if (chunk.includes('<') || insideTag) {
                    if (!insideTag) {
                        insideTag = true;
                        const splitIdx = chunk.indexOf('<');
                        if (splitIdx > 0) {
                            yield chunk.substring(0, splitIdx);
                            tagBuffer += chunk.substring(splitIdx);
                        } else {
                            tagBuffer += chunk;
                        }
                    } else {
                        tagBuffer += chunk;
                    }

                    const isOpening = /<(run_command|read_file|write_file|transition_state)/.test(tagBuffer);
                    const isClosing = /<\/(run_command|read_file|write_file|transition_state)>/.test(tagBuffer);

                    if (isClosing) {
                        insideTag = false;
                        yield `\n${COLORS.MAGENTA}[Ferramenta detectada. Interceptando e executando...]${COLORS.RESET}\n`;
                        break; // Stop stream and process tool immediately
                    } else if (tagBuffer.length > 35 && !isOpening) {
                        yield tagBuffer;
                        tagBuffer = '';
                        insideTag = false;
                    }
                } else {
                    yield chunk;
                }
            }

            this.history.push({ role: 'assistant', content: assistantResponse });

            // === TOOL: run_command ===
            const cmdMatch = /<run_command>([\s\S]*?)<\/run_command>/i.exec(assistantResponse);
            if (cmdMatch) {
                const command = cmdMatch[1].trim();
                let approved = config.autoApproveMode;
                if (!approved) {
                    const ans = await promptUser(`\n${COLORS.YELLOW}[TOOL] Executar comando: '${command}'. Permitir? Y/n: ${COLORS.RESET}`);
                    if (ans.toLowerCase() !== 'n') approved = true;
                }
                if (approved) {
                    yield `\n${COLORS.YELLOW}[Executando...]${COLORS.RESET}\n`;
                    const result = await executeShellCommand(command);
                    this.history.push({ role: 'system', content: `Resultado do comando '${command}':\n${result}` });
                } else {
                    this.history.push({ role: 'system', content: `Usuário RECUSOU execução de '${command}'.` });
                }
                keepRunning = true;
            }

            // === TOOL: read_file ===
            const readMatch = /<read_file>([\s\S]*?)<\/read_file>/i.exec(assistantResponse);
            if (readMatch) {
                const filePath = readMatch[1].trim();
                const cwd = process.cwd();
                const content = readArtifact(filePath, cwd);
                this.history.push({ role: 'system', content: `Conteúdo de '${filePath}':\n${content}` });
                yield `\n${COLORS.CYAN}[Lido: ${filePath}]${COLORS.RESET}\n`;
                keepRunning = true;
            }

            // === TOOL: write_file ===
            const writeMatch = /<write_file\s+path="([^"]+)">(([\s\S]*?))<\/write_file>/i.exec(assistantResponse);
            if (writeMatch) {
                const filePath = writeMatch[1].trim();
                const fileContent = writeMatch[2];
                let approved = config.autoApproveMode;
                if (!approved) {
                    const preview = fileContent.length > 200 ? fileContent.substring(0, 200) + '...' : fileContent;
                    yield `\n${COLORS.YELLOW}[TOOL] Gravar arquivo: '${filePath}'\nPreview: ${preview}${COLORS.RESET}\n`;
                    const ans = await promptUser(`${COLORS.YELLOW}Permitir gravação? Y/n: ${COLORS.RESET}`);
                    if (ans.toLowerCase() !== 'n') approved = true;
                }
                if (approved) {
                    const cwd = process.cwd();
                    const result = writeArtifact(filePath, fileContent, cwd);
                    this.history.push({ role: 'system', content: result });
                    yield `\n${COLORS.GREEN}[Gravado: ${filePath}]${COLORS.RESET}\n`;
                } else {
                    this.history.push({ role: 'system', content: `Usuário RECUSOU gravação de '${filePath}'.` });
                }
                keepRunning = true;
            }

            // === TOOL: transition_state ===
            const transMatch = /<transition_state>([\s\S]*?)<\/transition_state>/i.exec(assistantResponse);
            if (transMatch) {
                const newState = transMatch[1].trim().toUpperCase() as PipelineState;
                this.transition(newState);
                this.history.push({ role: 'system', content: `[SYSTEM] Transição efetuada com sucesso para o estado: ${newState}. O novo agente agora assume o controle da conversa.` });
                yield `\n${COLORS.CYAN}[Estado alterado para: ${newState}]${COLORS.RESET}\n`;
                keepRunning = true;
            }
        }
    }
}
