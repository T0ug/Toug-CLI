#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PipelineEngine } from './engine/pipelineEngine';
import { OllamaClient } from './engine/ollamaClient';
import { detectProjectState } from './engine/projectDetector';
import { loadConfig, saveConfig, isFirstRun, getConfigPath } from './data/configManager';
import { saveSession, loadLatestSession, compressHistory } from './data/sessionManager';
import { promptUser, printHeader, printError, closeChat, COLORS, onInterrupt } from './cli/chatInterface';

async function configWizard() {
    console.log(`\n${COLORS.CYAN}Configuracao Inicial do Toug CLI${COLORS.RESET}\n`);

    const config = loadConfig();

    const providerChoice = await promptUser(`${COLORS.YELLOW}Escolha o Provider Padrao (1=Ollama, 2=Gemini): ${COLORS.RESET}`);
    if (providerChoice === '2') {
        config.lastProvider = 'gemini';
        const key = await promptUser(`${COLORS.CYAN}Digite sua API Key do Gemini (opcional, ENTER para pular): ${COLORS.RESET}`);
        if (key.trim()) {
            config.gemini.apiKeys.push({ key: key.trim(), alias: `Key_${config.gemini.apiKeys.length + 1}` });
        }
    } else {
        config.lastProvider = 'ollama';
        console.log(`${COLORS.YELLOW}Endpoint Ollama atual: ${COLORS.RESET}${config.ollama.endpoint}`);
        const ans = await promptUser(`${COLORS.YELLOW}O endpoint esta correto? (Y/n): ${COLORS.RESET}`);

        if (ans.toLowerCase() === 'n') {
            const newEndpoint = await promptUser(`${COLORS.CYAN}Digite o novo endpoint (ex: http://192.168.1.100:11434): ${COLORS.RESET}`);
            if (newEndpoint.trim()) {
                config.ollama.endpoint = newEndpoint.trim();
            }
        }
    }

    saveConfig(config);
    console.log(`${COLORS.GREEN}Configuracao salva em ${getConfigPath()}${COLORS.RESET}\n`);
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
    const choice = await promptUser(`${COLORS.YELLOW}Alterar: 1=Provider, 2=Endpoint Ollama, 3=Add Gemini Key, 4=Auto-approve, Enter=Voltar: ${COLORS.RESET}`);

    if (choice === '1') {
        const pChoice = await promptUser(`${COLORS.CYAN}Provider (1=Ollama, 2=Gemini): ${COLORS.RESET}`);
        if (pChoice === '1') config.lastProvider = 'ollama';
        else if (pChoice === '2') config.lastProvider = 'gemini';
        saveConfig(config);
        console.log(`${COLORS.GREEN}Provider atualizado para: ${config.lastProvider}${COLORS.RESET}\n`);
    } else if (choice === '2') {
        const newEndpoint = await promptUser(`${COLORS.CYAN}Novo endpoint: ${COLORS.RESET}`);
        if (newEndpoint.trim()) {
            config.ollama.endpoint = newEndpoint.trim();
            saveConfig(config);
            console.log(`${COLORS.GREEN}Endpoint atualizado para: ${config.ollama.endpoint}${COLORS.RESET}\n`);
        }
    } else if (choice === '3') {
        const key = await promptUser(`${COLORS.CYAN}Nova API Key Gemini: ${COLORS.RESET}`);
        if (key.trim()) {
            config.gemini.apiKeys.push({ key: key.trim(), alias: `Key_${config.gemini.apiKeys.length + 1}` });
            saveConfig(config);
            console.log(`${COLORS.GREEN}Chave adicionada. Total de chaves: ${config.gemini.apiKeys.length}${COLORS.RESET}\n`);
        }
    } else if (choice === '4') {
        config.autoApproveMode = !config.autoApproveMode;
        saveConfig(config);
        console.log(`${COLORS.GREEN}Auto-approve agora: ${config.autoApproveMode}${COLORS.RESET}\n`);
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

    if (isFirstRun()) {
        await configWizard();
    }

    const config = loadConfig();

    if (config.lastProvider === 'ollama') {
        const client = new OllamaClient();
        const healthy = await client.isHealthy();

        if (!healthy) {
            printError('O servidor Ollama nao esta acessivel. Inicializando em MODO OFFLINE.', null);
            console.log(`   ${COLORS.YELLOW}Requisicoes vao falhar ate que o container Docker esteja rodando.${COLORS.RESET}\n`);
        } else {
            console.log(`${COLORS.GREEN}Servidor Ollama operante.${COLORS.RESET}\n`);
        }
    } else {
        console.log(`${COLORS.GREEN}Provedor Cloud Gemini alocado (Keys registradas: ${config.gemini.apiKeys.length}).${COLORS.RESET}\n`);
    }

    const cwd = process.cwd();
    const projectState = detectProjectState(cwd);

    console.log(`${COLORS.CYAN}Analise do diretorio: ${cwd}${COLORS.RESET}`);
    console.log(projectState.summary);

    const engine = new PipelineEngine();

    onInterrupt(() => {
        if (!engine.abortCurrentStream()) {
            console.log(`\n${COLORS.MAGENTA}Sessao Toug encerrada (Ctrl+C).${COLORS.RESET}`);
            process.exit(0);
        }
    });

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
    printError('Erro fatal no ambiente Node.', e.message || String(e));
    try {
        const cwd = process.cwd();
        const logPath = path.join(cwd, 'toug-fatal-log.txt');
        const logData = `TOUG CLI FATAL ERROR LOG\nDate: ${new Date().toISOString()}\n\nError:\n${e.stack || e}\n`;
        fs.writeFileSync(logPath, logData, 'utf8');

        if (process.platform === 'win32') {
            execSync(`start "" "${logPath}"`);
        }
    } catch (logErr) {
        console.error('Falha ao gravar erro letal no disco.', logErr);
    }

    closeChat();
    process.exit(1);
});
