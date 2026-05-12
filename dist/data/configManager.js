"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfig = exports.loadConfig = exports.isFirstRun = exports.getConfigPath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const DEFAULT_CONFIG = {
    ollamaEndpoint: 'http://localhost:11434',
    models: {
        discovery: 'gemma3:4b',
        architect: 'deepseek-r1:8b',
        executor: 'qwen2.5-coder:7b',
        reviewer: 'deepseek-r1:8b',
        orchestrator: 'qwen3:8b',
        project_research: 'qwen2.5-coder:7b'
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
const loadConfig = () => {
    const configPath = (0, exports.getConfigPath)();
    if (!fs_1.default.existsSync(configPath)) {
        (0, exports.saveConfig)(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
    }
    try {
        const fileContent = fs_1.default.readFileSync(configPath, 'utf8');
        const config = JSON.parse(fileContent);
        return { ...DEFAULT_CONFIG, ...config }; // Merge against defaults for missing properties
    }
    catch (error) {
        console.error("Erro ao carregar o arquivo de configuração. Utilizando padrão.", error);
        return DEFAULT_CONFIG;
    }
};
exports.loadConfig = loadConfig;
const saveConfig = (config) => {
    const configPath = (0, exports.getConfigPath)();
    fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
};
exports.saveConfig = saveConfig;
