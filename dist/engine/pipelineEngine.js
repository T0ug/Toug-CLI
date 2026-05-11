"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineEngine = void 0;
const agentLoader_1 = require("../agents/agentLoader");
const ollamaClient_1 = require("./ollamaClient");
const configManager_1 = require("../data/configManager");
const chatInterface_1 = require("../cli/chatInterface");
const toolRunner_1 = require("./toolRunner");
const artifactManager_1 = require("./artifactManager");
class PipelineEngine {
    state = 'IDLE';
    ollamaClient;
    history = [];
    constructor() {
        this.ollamaClient = new ollamaClient_1.OllamaClient();
    }
    getState() {
        return this.state;
    }
    transition(newState) {
        console.log(`\n[PipelineEngine] State Transition: ${this.state} -> ${newState}`);
        this.state = newState;
    }
    getRoleForState(state) {
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
    getModelForRole(role) {
        const config = (0, configManager_1.loadConfig)();
        return config.models[role] || config.models.orchestrator;
    }
    injectContext(content) {
        this.history.push({ role: 'system', content });
    }
    getHistory() {
        return this.history;
    }
    setHistory(history) {
        this.history = history;
    }
    setState(state) {
        this.state = state;
    }
    getActiveConfig() {
        const role = this.getRoleForState(this.state);
        const model = this.getModelForRole(role);
        return { role, model };
    }
    async *processInput(userInput) {
        if (this.state === 'IDLE') {
            this.transition('ORCHESTRATING');
        }
        let keepRunning = true;
        this.history.push({ role: 'user', content: userInput });
        while (keepRunning) {
            keepRunning = false;
            const role = this.getRoleForState(this.state);
            const agent = (0, agentLoader_1.loadAgent)(role);
            const model = this.getModelForRole(role);
            const config = (0, configManager_1.loadConfig)();
            const messages = [
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
                    }
                    else if (tagBuffer.length > 40 && !hasOpeningTag) {
                        yield tagBuffer;
                        tagBuffer = '';
                        insideTag = false;
                    }
                }
                else {
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
                    const ans = await (0, chatInterface_1.promptUser)(`\n${chatInterface_1.COLORS.YELLOW}[TOOL] Executar comando: '${command}'. Permitir? Y/n: ${chatInterface_1.COLORS.RESET}`);
                    if (ans.toLowerCase() !== 'n')
                        approved = true;
                }
                if (approved) {
                    yield `\n${chatInterface_1.COLORS.YELLOW}[Executando...]${chatInterface_1.COLORS.RESET}\n`;
                    const result = await (0, toolRunner_1.executeShellCommand)(command);
                    this.history.push({ role: 'system', content: `Resultado do comando '${command}':\n${result}` });
                }
                else {
                    this.history.push({ role: 'system', content: `Usuário RECUSOU execução de '${command}'.` });
                }
                keepRunning = true;
            }
            // === TOOL: read_file ===
            const readMatch = /<read_file>([\s\S]*?)<\/read_file>/i.exec(assistantResponse);
            if (readMatch) {
                const filePath = readMatch[1].trim();
                const cwd = process.cwd();
                const content = (0, artifactManager_1.readArtifact)(filePath, cwd);
                this.history.push({ role: 'system', content: `Conteúdo de '${filePath}':\n${content}` });
                yield `\n${chatInterface_1.COLORS.CYAN}[Lido: ${filePath}]${chatInterface_1.COLORS.RESET}\n`;
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
                    yield `\n${chatInterface_1.COLORS.YELLOW}[TOOL] Gravar arquivo: '${filePath}'\nPreview: ${preview}${chatInterface_1.COLORS.RESET}\n`;
                    const ans = await (0, chatInterface_1.promptUser)(`${chatInterface_1.COLORS.YELLOW}Permitir gravação? Y/n: ${chatInterface_1.COLORS.RESET}`);
                    if (ans.toLowerCase() !== 'n')
                        approved = true;
                }
                if (approved) {
                    const cwd = process.cwd();
                    const result = (0, artifactManager_1.writeArtifact)(filePath, fileContent, cwd);
                    this.history.push({ role: 'system', content: result });
                    yield `\n${chatInterface_1.COLORS.GREEN}[Gravado: ${filePath}]${chatInterface_1.COLORS.RESET}\n`;
                }
                else {
                    this.history.push({ role: 'system', content: `Usuário RECUSOU gravação de '${filePath}'.` });
                }
                keepRunning = true;
            }
        }
    }
}
exports.PipelineEngine = PipelineEngine;
