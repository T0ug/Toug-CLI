import { loadConfig } from '../data/configManager';
import { AIProvider, ProviderName } from '../providers/types';
import { OllamaProvider } from '../providers/ollamaProvider';

class PlaceholderGeminiProvider implements AIProvider {
    public readonly name = 'gemini';

    public async *stream(): AsyncGenerator<never, void, unknown> {
        throw new Error('Gemini provider is not implemented in Task 011.');
    }
}

export const createProvider = (providerName?: ProviderName): AIProvider => {
    const selectedProvider = providerName || loadConfig().lastProvider;

    if (selectedProvider === 'gemini') {
        return new PlaceholderGeminiProvider();
    }

    return new OllamaProvider();
};
