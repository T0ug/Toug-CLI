#!/usr/bin/env node
import { PipelineEngine } from './engine/pipelineEngine';
import { OllamaClient } from './engine/ollamaClient';
import { detectProjectState } from './engine/projectDetector';
import { loadConfig, saveConfig, isFirstRun, getConfigPath } from './data/configManager';
import { saveSession, loadLatestSession, compressHistory } from './data/sessionManager';
import { promptUser, printHeader, printError, closeChat, COLORS } from './cli/chatInterface';

async function configWizard() {
    console.log(`\n${COLORS.CYAN}⚙️  Configuração Inicial do Toug CLI${COLORS.RESET}\n`);

    const config = loadConfig();

    console.log(`${COLORS.YELLOW}Endpoint Ollama atual: ${COLORS.RESET}${config.ollamaEndpoint}`);
    console.log(`${COLORS.YELLOW}Arquivo de config:     ${COLORS.RESET}${getConfigPath()}\n`);

    const ans = await promptUser(`${COLORS.YELLOW}O endpoint está correto? (Y/n): ${COLORS.RESET}`);

    if (ans.toLowerCase() === 'n') {
        const newEndpoint = await promptUser(`${COLORS.CYAN}Digite o novo endpoint (ex: http://192.168.1.100:11434): ${COLORS.RESET}`);
        if (newEndpoint.trim()) {
            config.ollamaEndpoint = newEndpoint.trim();
            saveConfig(config);
            console.log(`${COLORS.GREEN}✅ Endpoint atualizado para: ${config.ollamaEndpoint}${COLORS.RESET}\n`);
        }
    } else {
        console.log(`${COLORS.GREEN}✅ Configuração mantida.${COLORS.RESET}\n`);
    }
}

async function editConfig() {
    const config = loadConfig();

    console.log(`\n${COLORS.CYAN}⚙️  Configuração Atual${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}  Endpoint:       ${COLORS.RESET}${config.ollamaEndpoint}`);
    console.log(`${COLORS.YELLOW}  Auto-approve:   ${COLORS.RESET}${config.autoApproveMode}`);
    console.log(`${COLORS.YELLOW}  Arquivo:        ${COLORS.RESET}${getConfigPath()}`);
    console.log(`${COLORS.YELLOW}  Modelos:${COLORS.RESET}`);
    for (const [role, model] of Object.entries(config.models)) {
        console.log(`    ${role}: ${model}`);
    }

    console.log('');
    const choice = await promptUser(`${COLORS.YELLOW}O que deseja alterar? (1=Endpoint, 2=Auto-approve, Enter=Voltar): ${COLORS.RESET}`);

    if (choice === '1') {
        const newEndpoint = await promptUser(`${COLORS.CYAN}Novo endpoint: ${COLORS.RESET}`);
        if (newEndpoint.trim()) {
            config.ollamaEndpoint = newEndpoint.trim();
            saveConfig(config);
            console.log(`${COLORS.GREEN}✅ Endpoint atualizado para: ${config.ollamaEndpoint}${COLORS.RESET}\n`);
        }
    } else if (choice === '2') {
        config.autoApproveMode = !config.autoApproveMode;
        saveConfig(config);
        console.log(`${COLORS.GREEN}✅ Auto-approve agora: ${config.autoApproveMode}${COLORS.RESET}\n`);
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
    if (isFirstRun()) {
        await configWizard();
    }

    // === Health Check ===
    const client = new OllamaClient();
    const healthy = await client.isHealthy();

    if (!healthy) {
        printError("O servidor Ollama não está acessível. Inicializando em MODO OFFLINE.", null);
        console.log(`   ${COLORS.YELLOW}Requisições vão falhar até que o container Docker esteja rodando.${COLORS.RESET}\n`);
    } else {
        console.log(`${COLORS.GREEN}✅ Servidor Ollama operante.${COLORS.RESET}\n`);
    }

    // === Detecção Inteligente de Projeto ===
    const cwd = process.cwd();
    const projectState = detectProjectState(cwd);

    console.log(`${COLORS.CYAN}📂 Análise do diretório: ${cwd}${COLORS.RESET}`);
    console.log(projectState.summary);

    const engine = new PipelineEngine();

    // === Restauração de Sessão ===
    const previousSession = loadLatestSession(cwd);
    let sessionRestored = false;

    if (previousSession) {
        const ans = await promptUser(`\n${COLORS.YELLOW}💾 Sessão anterior encontrada (${previousSession.savedAt}). Retomar? (Y/n): ${COLORS.RESET}`);
        if (ans.toLowerCase() !== 'n') {
            engine.setHistory(previousSession.history);
            engine.setState(previousSession.state);
            sessionRestored = true;
            console.log(`${COLORS.GREEN}✅ Sessão restaurada com ${previousSession.history.length} mensagens.${COLORS.RESET}`);
        }
    }

    // === Estado Inicial (se não restaurou sessão) ===
    if (!sessionRestored) {
        if (projectState.isExistingProject && projectState.hasProjectStatus) {
            console.log(`\n${COLORS.GREEN}🔄 Projeto existente detectado. Entrando em modo Orchestrator.${COLORS.RESET}`);
            engine.transition('ORCHESTRATING');

            if (projectState.projectStatusContent) {
                engine.injectContext(
                    `Estado atual do projeto (lido automaticamente de docs/project_status.md):\n${projectState.projectStatusContent}`
                );
            }
        } else if (projectState.isExistingProject) {
            console.log(`\n${COLORS.YELLOW}🔍 Projeto detectado sem documentação completa. Entrando em modo Project Research.${COLORS.RESET}`);
            engine.transition('PROJECT_RESEARCH');
        } else {
            console.log(`\n${COLORS.MAGENTA}🌱 Nenhum projeto detectado. Entrando em modo Discovery para novo projeto.${COLORS.RESET}`);
            engine.transition('DISCOVERY');
        }
    }

    console.log(`\nComandos: ${COLORS.YELLOW}/exit${COLORS.RESET} (sair) | ${COLORS.YELLOW}/config${COLORS.RESET} (editar configuração)\n`);

    // === REPL Loop ===
    while (true) {
        const input = await promptUser('Você: ');
        if (!input.trim()) continue;
        if (input.trim() === '/exit') break;

        if (input.trim() === '/config') {
            await editConfig();
            continue;
        }

        const active = engine.getActiveConfig();
        printHeader(active.role, active.model);

        try {
            const stream = engine.processInput(input);
            for await (const chunk of stream) {
                process.stdout.write(chunk);
            }
            console.log('\n');
        } catch (e: any) {
            printError("Falha na execução do Stream.", e.message);
        }

        // === Compressão automática de contexto ===
        const currentHistory = engine.getHistory();
        if (currentHistory.length > 50) {
            const compressed = compressHistory(currentHistory, 10);
            engine.setHistory(compressed);
            console.log(`${COLORS.YELLOW}[SYSTEM] Contexto comprimido: ${currentHistory.length} → ${compressed.length} mensagens.${COLORS.RESET}\n`);
        }
    }

    // === Auto-save ao sair ===
    const savedPath = saveSession(engine.getHistory(), engine.getState(), cwd);
    console.log(`\n${COLORS.GREEN}💾 Sessão salva automaticamente.${COLORS.RESET}`);

    closeChat();
    console.log(`${COLORS.MAGENTA}Sessão Toug encerrada.${COLORS.RESET}`);
}

main().catch(e => {
    printError("Erro fatal no ambiente Node.", e);
    closeChat();
    process.exit(1);
});
