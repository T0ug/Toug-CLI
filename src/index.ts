#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PipelineEngine } from './engine/pipelineEngine';
import { OllamaClient } from './engine/ollamaClient';
import { detectProjectState } from './engine/projectDetector';
import { loadConfig, saveConfig, isFirstRun, getConfigPath } from './data/configManager';
import { saveSession, loadLatestSession, compressHistory, listSessions, loadSessionFile, deleteSession } from './data/sessionManager';
import { promptUser, printHeader, printError, closeChat, COLORS, onInterrupt } from './cli/chatInterface';
import { readArtifact } from './engine/artifactManager';

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

async function manageSessions(engine: PipelineEngine, cwd: string) {
    while (true) {
        const sessions = listSessions(cwd);
        if (sessions.length === 0) {
            console.log(`\n${COLORS.YELLOW}Nenhuma sessao salva encontrada para este projeto.${COLORS.RESET}\n`);
            return;
        }

        console.log(`\n${COLORS.CYAN}--- Sessoes Salvas ---${COLORS.RESET}`);
        sessions.forEach((s, idx) => {
            console.log(`[${COLORS.YELLOW}${idx + 1}${COLORS.RESET}] ${s.savedAt.toLocaleString()} (${s.count} mensagens) - ${s.filename}`);
        });

        const choice = await promptUser(`\n${COLORS.CYAN}Escolha uma sessao para carregar (numero), "rm <num>" para apagar, ou ENTER para cancelar: ${COLORS.RESET}`);
        const trimmed = choice.trim();
        
        if (!trimmed) return;

        if (trimmed.startsWith('rm ')) {
            const num = parseInt(trimmed.substring(3));
            if (!isNaN(num) && num > 0 && num <= sessions.length) {
                const s = sessions[num - 1];
                if (deleteSession(cwd, s.filename)) {
                    console.log(`${COLORS.GREEN}Sessao ${num} apagada com sucesso.${COLORS.RESET}`);
                } else {
                    console.log(`${COLORS.RED}Falha ao apagar sessao ${num}.${COLORS.RESET}`);
                }
            } else {
                console.log(`${COLORS.RED}Numero invalido.${COLORS.RESET}`);
            }
            continue;
        }

        const num = parseInt(trimmed);
        if (!isNaN(num) && num > 0 && num <= sessions.length) {
            const s = sessions[num - 1];
            const data = loadSessionFile(cwd, s.filename);
            if (data) {
                engine.setHistory(data.history);
                engine.setState(data.state);
                console.log(`${COLORS.GREEN}Sessao restaurada com ${data.history.length} mensagens.${COLORS.RESET}\n`);
                return;
            } else {
                console.log(`${COLORS.RED}Falha ao carregar o arquivo da sessao.${COLORS.RESET}`);
            }
        } else {
            console.log(`${COLORS.RED}Opcao invalida.${COLORS.RESET}`);
        }
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

    console.log(`\nComandos: ${COLORS.YELLOW}/exit${COLORS.RESET} (sair) | ${COLORS.YELLOW}/config${COLORS.RESET} (configuracao) | ${COLORS.YELLOW}/sessoes${COLORS.RESET} (historico)\n`);

    const mentionedFilesCache: Set<string> = new Set();

    while (true) {
        let input = await promptUser('Voce: ');
        if (!input.trim()) continue;
        if (input.trim() === '/exit') break;

        if (input.trim() === '/config') {
            await editConfig();
            continue;
        }

        if (input.trim() === '/sessoes') {
            await manageSessions(engine, cwd);
            continue;
        }

        if (input.trim().startsWith('?')) {
            console.log(`\n${COLORS.CYAN}[Heuristica] Tarefa simples detectada. Acionando bypass de roteamento rapido...${COLORS.RESET}`);
            const query = input.trim().substring(1).trim();
            if (!query) {
                console.log(`${COLORS.YELLOW}Por favor digite uma pergunta apos o '?'.${COLORS.RESET}`);
                continue;
            }

            const tempEngine = new PipelineEngine();
            tempEngine.transition('DISCOVERY');
            const activeTemp = tempEngine.getActiveConfig();
            printHeader(activeTemp.role, activeTemp.model, activeTemp.provider);

            try {
                const stream = tempEngine.processInput(query);
                for await (const chunk of stream) {
                    process.stdout.write(chunk);
                }
                console.log('\n');
            } catch (e: any) {
                printError('Falha na execucao Heuristica.', e.message);
            }
            continue;
        }

        const mentionRegex = /@([\w./\-\\]+)/g;
        let match;
        let appendedContext = '';

        while ((match = mentionRegex.exec(input)) !== null) {
            const filepath = match[1];
            if (mentionedFilesCache.has(filepath)) {
                console.log(`${COLORS.YELLOW}[Anexado: ${filepath} (ja na memoria)]${COLORS.RESET}`);
                continue;
            }

            const content = readArtifact(filepath, cwd);
            if (content.startsWith('[ERRO]')) {
                console.log(`${COLORS.YELLOW}[Aviso: Falha ao ler '${filepath}']${COLORS.RESET}`);
            } else {
                mentionedFilesCache.add(filepath);
                console.log(`${COLORS.GREEN}[Anexado: ${filepath}]${COLORS.RESET}`);
                appendedContext += `\n\n--- Conteudo de ${filepath} ---\n${content}\n`;
            }
        }

        if (appendedContext) {
            input += `\n\n(Contexto anexado pelo usuario via @)\n${appendedContext}`;
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
        if (currentHistory.length > 100) {
            const compressed = compressHistory(currentHistory, 20);
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
