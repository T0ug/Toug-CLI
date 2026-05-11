import fs from 'fs';
import path from 'path';
import os from 'os';

export interface TougConfig {
    ollamaEndpoint: string;
    models: {
        discovery: string;
        architect: string;
        executor: string;
        reviewer: string;
        orchestrator: string;
        project_research: string;
    };
    autoApproveMode: boolean;
}

const DEFAULT_CONFIG: TougConfig = {
    ollamaEndpoint: 'http://localhost:11434',
    models: {
        discovery: 'gemma3:27b',
        architect: 'deepseek-r1-distill-qwen-32b',
        executor: 'qwen3-coder:latest',
        reviewer: 'deepseek-r1-distill-qwen-32b',
        orchestrator: 'qwen3:30b-instruct',
        project_research: 'qwen3-coder:latest'
    },
    autoApproveMode: false
};

export const getConfigPath = (): string => {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.toug-cli');
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    return path.join(configDir, 'toug.config.json');
};

export const isFirstRun = (): boolean => {
    return !fs.existsSync(getConfigPath());
};

export const loadConfig = (): TougConfig => {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
        saveConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
    }

    try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(fileContent) as TougConfig;
        return { ...DEFAULT_CONFIG, ...config }; // Merge against defaults for missing properties
    } catch (error) {
        console.error("Erro ao carregar o arquivo de configuração. Utilizando padrão.", error);
        return DEFAULT_CONFIG;
    }
};

export const saveConfig = (config: TougConfig): void => {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
};
