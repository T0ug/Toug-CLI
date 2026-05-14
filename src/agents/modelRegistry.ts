import { ProviderName } from '../providers/types';

export interface ModelRoute {
    provider: ProviderName;
    model: string;
}

export const GLOBAL_FALLBACK_MODELS: ModelRoute[] = [
    { provider: 'gemini', model: 'gemini-2.5-pro' },
    { provider: 'gemini', model: 'gemini-2.5-flash' },
    { provider: 'gemini', model: 'gemini-2.0-flash' },
    { provider: 'gemini', model: 'gemini-2.5-flash-lite' },
    { provider: 'gemini', model: 'gemini-2.0-flash-lite' },
    { provider: 'ollama', model: 'qwen3:14b' },
    { provider: 'ollama', model: 'qwen3:8b' }
];

export const getGlobalFallbackRoutes = (preferredProvider: ProviderName): ModelRoute[] => {
    if (preferredProvider === 'gemini') {
        return [...GLOBAL_FALLBACK_MODELS];
    }

    return GLOBAL_FALLBACK_MODELS.filter(route => route.provider === 'ollama');
};

export const getModelsForProvider = (provider: ProviderName): string[] => {
    return GLOBAL_FALLBACK_MODELS
        .filter(route => route.provider === provider)
        .map(route => route.model);
};
