import { AgentRole } from './types';
import { ProviderName } from '../providers/types';

const OLLAMA_MODELS: Record<AgentRole, string> = {
    discovery: 'gemma3:4b',
    architect: 'deepseek-r1:8b',
    executor: 'qwen2.5-coder:7b',
    reviewer: 'deepseek-r1:8b',
    orchestrator: 'qwen3:8b',
    project_research: 'qwen2.5-coder:7b'
};

const GEMINI_MODELS: Record<AgentRole, string> = {
    discovery: 'gemini-2.5-flash',
    architect: 'gemini-2.5-pro',
    executor: 'gemini-2.5-pro',
    reviewer: 'gemini-2.5-pro',
    orchestrator: 'gemini-2.5-flash',
    project_research: 'gemini-2.5-flash'
};

const MODEL_REGISTRY: Record<ProviderName, Record<AgentRole, string>> = {
    ollama: OLLAMA_MODELS,
    gemini: GEMINI_MODELS
};

export const getModelForProviderRole = (provider: ProviderName, role: AgentRole): string => {
    return MODEL_REGISTRY[provider][role];
};

export const getModelsForProvider = (provider: ProviderName): Record<AgentRole, string> => {
    return { ...MODEL_REGISTRY[provider] };
};
