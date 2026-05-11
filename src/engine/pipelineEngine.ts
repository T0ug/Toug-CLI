import { PipelineState, AgentRole } from '../agents/types';
import { loadAgent } from '../agents/agentLoader';
import { OllamaClient, Message } from './ollamaClient';
import { loadConfig } from '../data/configManager';
import { promptUser, COLORS } from '../cli/chatInterface';
import { executeShellCommand } from './toolRunner';
import { readArtifact, writeArtifact } from './artifactManager';

export class PipelineEngine {
    private state: PipelineState = 'IDLE';
    private ollamaClient: OllamaClient;
    private history: Message[] = [];

    constructor() {
        this.ollamaClient = new OllamaClient();
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
        return config.models[role] || config.models.orchestrator;
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
        const model = this.getModelForRole(role);
        return { role, model };
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

            const messages: Message[] = [
                { role: 'system', content: agent.systemPrompt },
                ...this.history
            ];

            const stream = this.ollamaClient.streamChat(model, messages);
            let assistantResponse = '';

            let tagBuffer = '';
            let insideTag = false;

            for await (const chunk of stream) {
                assistantResponse += chunk;

                if (chunk.includes('<') || insideTag) {
                    insideTag = true;
                    tagBuffer += chunk;

                    const hasClosingTag = tagBuffer.includes('</run_command>') ||
                        tagBuffer.includes('</read_file>') ||
                        tagBuffer.includes('</write_file>');
                    const hasOpeningTag = tagBuffer.includes('<run_command>') ||
                        tagBuffer.includes('<read_file>') ||
                        tagBuffer.includes('<write_file');

                    if (hasClosingTag) {
                        insideTag = false;
                    } else if (tagBuffer.length > 40 && !hasOpeningTag) {
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
        }
    }
}
