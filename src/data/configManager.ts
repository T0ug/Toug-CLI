import fs from 'fs';
import path from 'path';
import os from 'os';
import { ProviderName } from '../providers/types';

export interface TougConfig {
    configVersion: 2;
    lastProvider: ProviderName;
    ollama: {
        endpoint: string;
    };
    gemini: {
        apiKeys: { key: string; alias: string }[];
    };
    autoApproveMode: boolean;
    showThinking: boolean;
    windowsTerminal: {
        autoLaunch: boolean;
    };
}

interface LegacyTougConfig {
    ollamaEndpoint?: string;
    models?: Record<string, string>;
    autoApproveMode?: boolean;
}

const DEFAULT_CONFIG: TougConfig = {
    configVersion: 2,
    lastProvider: 'ollama',
    ollama: {
        endpoint: 'http://localhost:11434'
    },
    gemini: {
        apiKeys: []
    },
    autoApproveMode: false,
    showThinking: true,
    windowsTerminal: {
        autoLaunch: false
    }
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

const isProviderName = (value: unknown): value is ProviderName => {
    return value === 'ollama' || value === 'gemini';
};

const normalizeConfig = (raw: unknown): TougConfig => {
    const candidate = raw as Partial<TougConfig> & LegacyTougConfig;

    let parsedApiKeys: { key: string; alias: string }[] = [];
    if (candidate && candidate.configVersion === 2 && Array.isArray(candidate.gemini?.apiKeys)) {
        parsedApiKeys = candidate.gemini.apiKeys.map((item: any, index: number) => {
            if (typeof item === 'string') {
                return { key: item, alias: `Key_Legacy_${index + 1}` };
            }
            if (item && typeof item.key === 'string' && typeof item.alias === 'string') {
                return { key: item.key, alias: item.alias };
            }
            return null;
        }).filter(Boolean) as { key: string; alias: string }[];
    }

    if (candidate && candidate.configVersion === 2) {
        return {
            configVersion: 2,
            lastProvider: isProviderName(candidate.lastProvider) ? candidate.lastProvider : DEFAULT_CONFIG.lastProvider,
            ollama: {
                endpoint: candidate.ollama?.endpoint || candidate.ollamaEndpoint || DEFAULT_CONFIG.ollama.endpoint
            },
            gemini: {
                apiKeys: parsedApiKeys
            },
            autoApproveMode: typeof candidate.autoApproveMode === 'boolean'
                ? candidate.autoApproveMode
                : DEFAULT_CONFIG.autoApproveMode,
            showThinking: typeof candidate.showThinking === 'boolean'
                ? candidate.showThinking
                : DEFAULT_CONFIG.showThinking,
            windowsTerminal: {
                autoLaunch: typeof candidate.windowsTerminal?.autoLaunch === 'boolean'
                    ? candidate.windowsTerminal.autoLaunch
                    : DEFAULT_CONFIG.windowsTerminal.autoLaunch
            }
        };
    }

    return {
        ...DEFAULT_CONFIG,
        ollama: {
            endpoint: candidate?.ollamaEndpoint || DEFAULT_CONFIG.ollama.endpoint
        },
        autoApproveMode: typeof candidate?.autoApproveMode === 'boolean'
            ? candidate.autoApproveMode
            : DEFAULT_CONFIG.autoApproveMode,
        showThinking: typeof candidate?.showThinking === 'boolean'
            ? candidate.showThinking
            : DEFAULT_CONFIG.showThinking,
        windowsTerminal: {
            autoLaunch: typeof candidate?.windowsTerminal?.autoLaunch === 'boolean'
                ? candidate.windowsTerminal.autoLaunch
                : DEFAULT_CONFIG.windowsTerminal.autoLaunch
        }
    };
};

export const loadConfig = (): TougConfig => {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
        saveConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
    }

    try {
        const fileContent = fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '');
        const parsed = JSON.parse(fileContent);
        const config = normalizeConfig(parsed);

        if (JSON.stringify(parsed, null, 2) !== JSON.stringify(config, null, 2)) {
            saveConfig(config);
        }

        return config;
    } catch (error) {
        console.error('Erro ao carregar o arquivo de configuracao. Utilizando padrao.', error);
        return DEFAULT_CONFIG;
    }
};

export const saveConfig = (config: TougConfig): void => {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(normalizeConfig(config), null, 2), 'utf8');
};

export const getOllamaEndpoint = (): string => {
    return loadConfig().ollama.endpoint;
};
