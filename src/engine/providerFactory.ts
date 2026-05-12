import { loadConfig } from '../data/configManager';
import { AIProvider, ProviderName } from '../providers/types';
import { OllamaProvider } from '../providers/ollamaProvider';
import { GeminiProvider } from '../providers/geminiProvider';

export const createProvider = (providerName?: ProviderName): AIProvider => {
    const selectedProvider = providerName || loadConfig().lastProvider;

    if (selectedProvider === 'gemini') {
        return new GeminiProvider();
    }

    return new OllamaProvider();
};
