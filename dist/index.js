#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pipelineEngine_1 = require("./engine/pipelineEngine");
const ollamaClient_1 = require("./engine/ollamaClient");
const projectDetector_1 = require("./engine/projectDetector");
const configManager_1 = require("./data/configManager");
const sessionManager_1 = require("./data/sessionManager");
const chatInterface_1 = require("./cli/chatInterface");
async function configWizard() {
    console.log(`\n${chatInterface_1.COLORS.CYAN}⚙️  Configuração Inicial do Toug CLI${chatInterface_1.COLORS.RESET}\n`);
    const config = (0, configManager_1.loadConfig)();
    console.log(`${chatInterface_1.COLORS.YELLOW}Endpoint Ollama atual: ${chatInterface_1.COLORS.RESET}${config.ollamaEndpoint}`);
    console.log(`${chatInterface_1.COLORS.YELLOW}Arquivo de config:     ${chatInterface_1.COLORS.RESET}${(0, configManager_1.getConfigPath)()}\n`);
    const ans = await (0, chatInterface_1.promptUser)(`${chatInterface_1.COLORS.YELLOW}O endpoint está correto? (Y/n): ${chatInterface_1.COLORS.RESET}`);
    if (ans.toLowerCase() === 'n') {
        const newEndpoint = await (0, chatInterface_1.promptUser)(`${chatInterface_1.COLORS.CYAN}Digite o novo endpoint (ex: http://192.168.1.100:11434): ${chatInterface_1.COLORS.RESET}`);
        if (newEndpoint.trim()) {
            config.ollamaEndpoint = newEndpoint.trim();
            (0, configManager_1.saveConfig)(config);
            console.log(`${chatInterface_1.COLORS.GREEN}✅ Endpoint atualizado para: ${config.ollamaEndpoint}${chatInterface_1.COLORS.RESET}\n`);
        }
    }
    else {
        console.log(`${chatInterface_1.COLORS.GREEN}✅ Configuração mantida.${chatInterface_1.COLORS.RESET}\n`);
    }
}
async function editConfig() {
    const config = (0, configManager_1.loadConfig)();
    console.log(`\n${chatInterface_1.COLORS.CYAN}⚙️  Configuração Atual${chatInterface_1.COLORS.RESET}`);
    console.log(`${chatInterface_1.COLORS.YELLOW}  Endpoint:       ${chatInterface_1.COLORS.RESET}${config.ollamaEndpoint}`);
    console.log(`${chatInterface_1.COLORS.YELLOW}  Auto-approve:   ${chatInterface_1.COLORS.RESET}${config.autoApproveMode}`);
    console.log(`${chatInterface_1.COLORS.YELLOW}  Arquivo:        ${chatInterface_1.COLORS.RESET}${(0, configManager_1.getConfigPath)()}`);
    console.log(`${chatInterface_1.COLORS.YELLOW}  Modelos:${chatInterface_1.COLORS.RESET}`);
    for (const [role, model] of Object.entries(config.models)) {
        console.log(`    ${role}: ${model}`);
    }
    console.log('');
    const choice = await (0, chatInterface_1.promptUser)(`${chatInterface_1.COLORS.YELLOW}O que deseja alterar? (1=Endpoint, 2=Auto-approve, Enter=Voltar): ${chatInterface_1.COLORS.RESET}`);
    if (choice === '1') {
        const newEndpoint = await (0, chatInterface_1.promptUser)(`${chatInterface_1.COLORS.CYAN}Novo endpoint: ${chatInterface_1.COLORS.RESET}`);
        if (newEndpoint.trim()) {
            config.ollamaEndpoint = newEndpoint.trim();
            (0, configManager_1.saveConfig)(config);
            console.log(`${chatInterface_1.COLORS.GREEN}✅ Endpoint atualizado para: ${config.ollamaEndpoint}${chatInterface_1.COLORS.RESET}\n`);
        }
    }
    else if (choice === '2') {
        config.autoApproveMode = !config.autoApproveMode;
        (0, configManager_1.saveConfig)(config);
        console.log(`${chatInterface_1.COLORS.GREEN}✅ Auto-approve agora: ${config.autoApproveMode}${chatInterface_1.COLORS.RESET}\n`);
    }
}
async function main() {
    const logo = `
\x1b[35m████████╗ ██████╗ ██╗   ██╗ ██████╗ \x1b[0m
\x1b[35m╚══██╔══╝██╔═══██╗██║   ██║██╔════╝ \x1b[0m
\x1b[35m   ██║   ██║   ██║██║   ██║██║  ███╗\x1b[0m
\x1b[35m   ██║   ██║   ██║██║   ██║██║   ██║\x1b[0m
\x1b[35m   ██║   ╚██████╔╝╚██████╔╝╚██████╔╝\x1b[0m
\x1b[35m   ╚═╝░░░░╚═════╝░░╚═════╝░░╚═════╝░\x1b[0m
`;
    console.log(logo);
    // === Wizard de primeira execução ===
    if ((0, configManager_1.isFirstRun)()) {
        await configWizard();
    }
    // === Health Check ===
    const client = new ollamaClient_1.OllamaClient();
    const healthy = await client.isHealthy();
    if (!healthy) {
        (0, chatInterface_1.printError)("O servidor Ollama não está acessível. Inicializando em MODO OFFLINE.", null);
        console.log(`   ${chatInterface_1.COLORS.YELLOW}Requisições vão falhar até que o container Docker esteja rodando.${chatInterface_1.COLORS.RESET}\n`);
    }
    else {
        console.log(`${chatInterface_1.COLORS.GREEN}✅ Servidor Ollama operante.${chatInterface_1.COLORS.RESET}\n`);
    }
    // === Detecção Inteligente de Projeto ===
    const cwd = process.cwd();
    const projectState = (0, projectDetector_1.detectProjectState)(cwd);
    console.log(`${chatInterface_1.COLORS.CYAN}📂 Análise do diretório: ${cwd}${chatInterface_1.COLORS.RESET}`);
    console.log(projectState.summary);
    const engine = new pipelineEngine_1.PipelineEngine();
    // === Restauração de Sessão ===
    const previousSession = (0, sessionManager_1.loadLatestSession)(cwd);
    let sessionRestored = false;
    if (previousSession) {
        const ans = await (0, chatInterface_1.promptUser)(`\n${chatInterface_1.COLORS.YELLOW}💾 Sessão anterior encontrada (${previousSession.savedAt}). Retomar? (Y/n): ${chatInterface_1.COLORS.RESET}`);
        if (ans.toLowerCase() !== 'n') {
            engine.setHistory(previousSession.history);
            engine.setState(previousSession.state);
            sessionRestored = true;
            console.log(`${chatInterface_1.COLORS.GREEN}✅ Sessão restaurada com ${previousSession.history.length} mensagens.${chatInterface_1.COLORS.RESET}`);
        }
    }
    // === Estado Inicial (se não restaurou sessão) ===
    if (!sessionRestored) {
        if (projectState.isExistingProject && projectState.hasProjectStatus) {
            console.log(`\n${chatInterface_1.COLORS.GREEN}🔄 Projeto existente detectado. Entrando em modo Orchestrator.${chatInterface_1.COLORS.RESET}`);
            engine.transition('ORCHESTRATING');
            if (projectState.projectStatusContent) {
                engine.injectContext(`Estado atual do projeto (lido automaticamente de docs/project_status.md):\n${projectState.projectStatusContent}`);
            }
        }
        else if (projectState.isExistingProject) {
            console.log(`\n${chatInterface_1.COLORS.YELLOW}🔍 Projeto detectado sem documentação completa. Entrando em modo Project Research.${chatInterface_1.COLORS.RESET}`);
            engine.transition('PROJECT_RESEARCH');
        }
        else {
            console.log(`\n${chatInterface_1.COLORS.MAGENTA}🌱 Nenhum projeto detectado. Entrando em modo Discovery para novo projeto.${chatInterface_1.COLORS.RESET}`);
            engine.transition('DISCOVERY');
        }
    }
    console.log(`\nComandos: ${chatInterface_1.COLORS.YELLOW}/exit${chatInterface_1.COLORS.RESET} (sair) | ${chatInterface_1.COLORS.YELLOW}/config${chatInterface_1.COLORS.RESET} (editar configuração)\n`);
    // === REPL Loop ===
    while (true) {
        const input = await (0, chatInterface_1.promptUser)('Você: ');
        if (!input.trim())
            continue;
        if (input.trim() === '/exit')
            break;
        if (input.trim() === '/config') {
            await editConfig();
            continue;
        }
        const active = engine.getActiveConfig();
        (0, chatInterface_1.printHeader)(active.role, active.model);
        try {
            const stream = engine.processInput(input);
            for await (const chunk of stream) {
                process.stdout.write(chunk);
            }
            console.log('\n');
        }
        catch (e) {
            (0, chatInterface_1.printError)("Falha na execução do Stream.", e.message);
        }
        // === Compressão automática de contexto ===
        const currentHistory = engine.getHistory();
        if (currentHistory.length > 50) {
            const compressed = (0, sessionManager_1.compressHistory)(currentHistory, 10);
            engine.setHistory(compressed);
            console.log(`${chatInterface_1.COLORS.YELLOW}[SYSTEM] Contexto comprimido: ${currentHistory.length} → ${compressed.length} mensagens.${chatInterface_1.COLORS.RESET}\n`);
        }
    }
    // === Auto-save ao sair ===
    const savedPath = (0, sessionManager_1.saveSession)(engine.getHistory(), engine.getState(), cwd);
    console.log(`\n${chatInterface_1.COLORS.GREEN}💾 Sessão salva automaticamente.${chatInterface_1.COLORS.RESET}`);
    (0, chatInterface_1.closeChat)();
    console.log(`${chatInterface_1.COLORS.MAGENTA}Sessão Toug encerrada.${chatInterface_1.COLORS.RESET}`);
}
main().catch(e => {
    (0, chatInterface_1.printError)("Erro fatal no ambiente Node.", e);
    (0, chatInterface_1.closeChat)();
    process.exit(1);
});
