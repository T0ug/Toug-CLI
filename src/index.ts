#!/usr/bin/env node
import { PipelineEngine } from './engine/pipelineEngine';
import { OllamaClient } from './engine/ollamaClient';
import { detectProjectState } from './engine/projectDetector';
import { loadConfig, saveConfig, isFirstRun, getConfigPath } from './data/configManager';
import { saveSession, loadLatestSession, compressHistory } from './data/sessionManager';
import { promptUser, printHeader, printError, closeChat, COLORS } from './cli/chatInterface';

async function configWizard() {
    console.log(`\n${COLORS.CYAN}Configuracao Inicial do Toug CLI${COLORS.RESET}\n`);

    const config = loadConfig();

    console.log(`${COLORS.YELLOW}Provider atual:         ${COLORS.RESET}${config.lastProvider}`);
    console.log(`${COLORS.YELLOW}Endpoint Ollama atual: ${COLORS.RESET}${config.ollama.endpoint}`);
    console.log(`${COLORS.YELLOW}Arquivo de config:     ${COLORS.RESET}${getConfigPath()}\n`);

    const ans = await promptUser(`${COLORS.YELLOW}O endpoint esta correto? (Y/n): ${COLORS.RESET}`);

    if (ans.toLowerCase() === 'n') {
        const newEndpoint = await promptUser(`${COLORS.CYAN}Digite o novo endpoint (ex: http://192.168.1.100:11434): ${COLORS.RESET}`);
        if (newEndpoint.trim()) {
            config.ollama.endpoint = newEndpoint.trim();
            saveConfig(config);
            console.log(`${COLORS.GREEN}Endpoint atualizado para: ${config.ollama.endpoint}${COLORS.RESET}\n`);
        }
    } else {
        console.log(`${COLORS.GREEN}Configuracao mantida.${COLORS.RESET}\n`);
    }
}

async function editConfig() {
    const config = loadConfig();

    console.log(`\n${COLORS.CYAN}Configuracao Atual${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}  Provider:       ${COLORS.RESET}${config.lastProvider}`);
    console.log(`${COLORS.YELLOW}  Endpoint:       ${COLORS.RESET}${config.ollama.endpoint}`);
    console.log(`${COLORS.YELLOW}  Gemini keys:    ${COLORS.RESET}${config.gemini.apiKeys.length}`);
    console.log(`${COLORS.YELLOW}  Auto-approve:   ${COLORS.RESET}${config.autoApproveMode}`);
    console.log(`${COLORS.YELLOW}  Arquivo:        ${COLORS.RESET}${getConfigPath()}`);

    console.log('');
    const choice = await promptUser(`${COLORS.YELLOW}O que deseja alterar? (1=Endpoint, 2=Auto-approve, Enter=Voltar): ${COLORS.RESET}`);

    if (choice === '1') {
        const newEndpoint = await promptUser(`${COLORS.CYAN}Novo endpoint: ${COLORS.RESET}`);
        if (newEndpoint.trim()) {
            config.ollama.endpoint = newEndpoint.trim();
            saveConfig(config);
            console.log(`${COLORS.GREEN}Endpoint atualizado para: ${config.ollama.endpoint}${COLORS.RESET}\n`);
        }
    } else if (choice === '2') {
        config.autoApproveMode = !config.autoApproveMode;
        saveConfig(config);
        console.log(`${COLORS.GREEN}Auto-approve agora: ${config.autoApproveMode}${COLORS.RESET}\n`);
    }
}

async function main() {
    console.log(`\n${COLORS.MAGENTA}TOUG CLI${COLORS.RESET}\n`);

    if (isFirstRun()) {
        await configWizard();
    }

    const client = new OllamaClient();
    const healthy = await client.isHealthy();

    if (!healthy) {
        printError('O servidor Ollama nao esta acessivel. Inicializando em MODO OFFLINE.', null);
        console.log(`   ${COLORS.YELLOW}Requisicoes vao falhar ate que o container Docker esteja rodando.${COLORS.RESET}\n`);
    } else {
        console.log(`${COLORS.GREEN}Servidor Ollama operante.${COLORS.RESET}\n`);
    }

    const cwd = process.cwd();
    const projectState = detectProjectState(cwd);

    console.log(`${COLORS.CYAN}Analise do diretorio: ${cwd}${COLORS.RESET}`);
    console.log(projectState.summary);

    const engine = new PipelineEngine();

    const previousSession = loadLatestSession(cwd);
    let sessionRestored = false;

    if (previousSession) {
        const ans = await promptUser(`\n${COLORS.YELLOW}Sessao anterior encontrada (${previousSession.savedAt}). Retomar? (Y/n): ${COLORS.RESET}`);
        if (ans.toLowerCase() !== 'n') {
            engine.setHistory(previousSession.history);
            engine.setState(previousSession.state);
            sessionRestored = true;
            console.log(`${COLORS.GREEN}Sessao restaurada com ${previousSession.history.length} mensagens.${COLORS.RESET}`);
        }
    }

    if (!sessionRestored) {
        if (projectState.isExistingProject && projectState.hasProjectStatus) {
            console.log(`\n${COLORS.GREEN}Projeto existente detectado. Entrando em modo Orchestrator.${COLORS.RESET}`);
            engine.transition('ORCHESTRATING');

            if (projectState.projectStatusContent) {
                engine.injectContext(
                    `Estado atual do projeto (lido automaticamente de docs/project_status.md):\n${projectState.projectStatusContent}`
                );
            }
        } else if (projectState.isExistingProject) {
            console.log(`\n${COLORS.YELLOW}Projeto detectado sem documentacao completa. Entrando em modo Project Research.${COLORS.RESET}`);
            engine.transition('PROJECT_RESEARCH');
        } else {
            console.log(`\n${COLORS.MAGENTA}Nenhum projeto detectado. Entrando em modo Discovery para novo projeto.${COLORS.RESET}`);
            engine.transition('DISCOVERY');
        }
    }

    console.log(`\nComandos: ${COLORS.YELLOW}/exit${COLORS.RESET} (sair) | ${COLORS.YELLOW}/config${COLORS.RESET} (editar configuracao)\n`);

    while (true) {
        const input = await promptUser('Voce: ');
        if (!input.trim()) continue;
        if (input.trim() === '/exit') break;

        if (input.trim() === '/config') {
            await editConfig();
            continue;
        }

        const active = engine.getActiveConfig();
        printHeader(active.role, active.model, active.provider);

        try {
            const stream = engine.processInput(input);
            for await (const chunk of stream) {
                process.stdout.write(chunk);
            }
            console.log('\n');
        } catch (e: any) {
            printError('Falha na execucao do Stream.', e.message);
        }

        const currentHistory = engine.getHistory();
        if (currentHistory.length > 50) {
            const compressed = compressHistory(currentHistory, 10);
            engine.setHistory(compressed);
            console.log(`${COLORS.YELLOW}[SYSTEM] Contexto comprimido: ${currentHistory.length} -> ${compressed.length} mensagens.${COLORS.RESET}\n`);
        }
    }

    saveSession(engine.getHistory(), engine.getState(), cwd);
    console.log(`\n${COLORS.GREEN}Sessao salva automaticamente.${COLORS.RESET}`);

    closeChat();
    console.log(`${COLORS.MAGENTA}Sessao Toug encerrada.${COLORS.RESET}`);
}

main().catch(e => {
    printError('Erro fatal no ambiente Node.', e);
    closeChat();
    process.exit(1);
});
