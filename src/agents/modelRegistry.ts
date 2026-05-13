import { AgentRole } from './types';
import { ProviderName } from '../providers/types';

const OLLAMA_MODELS: Record<AgentRole, string[]> = {
    discovery: ['qwen3:14b', 'qwen3:8b'],
    architect: ['qwen3:14b', 'qwen3:8b'],
    executor: ['qwen3:14b', 'qwen3:8b'],
    reviewer: ['qwen3:14b', 'qwen3:8b'],
    orchestrator: ['qwen3:14b', 'qwen3:8b'],
    project_research: ['qwen3:14b', 'qwen3:8b']
};

const GEMINI_MODELS: Record<AgentRole, string[]> = {
    discovery: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'],
    architect: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
    executor: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
    reviewer: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
    orchestrator: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'],
    project_research: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite']
};

const MODEL_REGISTRY: Record<ProviderName, Record<AgentRole, string[]>> = {
    ollama: OLLAMA_MODELS,
    gemini: GEMINI_MODELS
};

export const getModelsForProviderRole = (provider: ProviderName, role: AgentRole): string[] => {
    return MODEL_REGISTRY[provider][role];
};

export const getModelsForProvider = (provider: ProviderName): Record<AgentRole, string[]> => {
    return { ...MODEL_REGISTRY[provider] };
};
