"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOllamaEndpoint = exports.saveConfig = exports.loadConfig = exports.isFirstRun = exports.getConfigPath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const DEFAULT_CONFIG = {
    configVersion: 2,
    lastProvider: 'ollama',
    ollama: {
        endpoint: 'http://localhost:11434'
    },
    gemini: {
        apiKeys: []
    },
    autoApproveMode: false
};
const getConfigPath = () => {
    const homeDir = os_1.default.homedir();
    const configDir = path_1.default.join(homeDir, '.toug-cli');
    if (!fs_1.default.existsSync(configDir)) {
        fs_1.default.mkdirSync(configDir, { recursive: true });
    }
    return path_1.default.join(configDir, 'toug.config.json');
};
exports.getConfigPath = getConfigPath;
const isFirstRun = () => {
    return !fs_1.default.existsSync((0, exports.getConfigPath)());
};
exports.isFirstRun = isFirstRun;
const isProviderName = (value) => {
    return value === 'ollama' || value === 'gemini';
};
const normalizeConfig = (raw) => {
    const candidate = raw;
    if (candidate && candidate.configVersion === 2) {
        return {
            configVersion: 2,
            lastProvider: isProviderName(candidate.lastProvider) ? candidate.lastProvider : DEFAULT_CONFIG.lastProvider,
            ollama: {
                endpoint: candidate.ollama?.endpoint || candidate.ollamaEndpoint || DEFAULT_CONFIG.ollama.endpoint
            },
            gemini: {
                apiKeys: Array.isArray(candidate.gemini?.apiKeys) ? candidate.gemini.apiKeys : []
            },
            autoApproveMode: typeof candidate.autoApproveMode === 'boolean'
                ? candidate.autoApproveMode
                : DEFAULT_CONFIG.autoApproveMode
        };
    }
    return {
        ...DEFAULT_CONFIG,
        ollama: {
            endpoint: candidate?.ollamaEndpoint || DEFAULT_CONFIG.ollama.endpoint
        },
        autoApproveMode: typeof candidate?.autoApproveMode === 'boolean'
            ? candidate.autoApproveMode
            : DEFAULT_CONFIG.autoApproveMode
    };
};
const loadConfig = () => {
    const configPath = (0, exports.getConfigPath)();
    if (!fs_1.default.existsSync(configPath)) {
        (0, exports.saveConfig)(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
    }
    try {
        const fileContent = fs_1.default.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '');
        const parsed = JSON.parse(fileContent);
        const config = normalizeConfig(parsed);
        if (JSON.stringify(parsed, null, 2) !== JSON.stringify(config, null, 2)) {
            (0, exports.saveConfig)(config);
        }
        return config;
    }
    catch (error) {
        console.error('Erro ao carregar o arquivo de configuracao. Utilizando padrao.', error);
        return DEFAULT_CONFIG;
    }
};
exports.loadConfig = loadConfig;
const saveConfig = (config) => {
    const configPath = (0, exports.getConfigPath)();
    fs_1.default.writeFileSync(configPath, JSON.stringify(normalizeConfig(config), null, 2), 'utf8');
};
exports.saveConfig = saveConfig;
const getOllamaEndpoint = () => {
    return (0, exports.loadConfig)().ollama.endpoint;
};
exports.getOllamaEndpoint = getOllamaEndpoint;
