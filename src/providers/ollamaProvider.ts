import { AIProvider, ProviderEvent, ProviderRequest } from './types';
import { Message, OllamaClient } from '../engine/ollamaClient';
import { loadConfig } from '../data/configManager';

export class OllamaProvider implements AIProvider {
    public readonly name = 'ollama';
    private readonly client: OllamaClient;

    constructor(client = new OllamaClient()) {
        this.client = client;
    }

    public async isHealthy() {
        const ok = await this.client.isHealthy();
        return {
            ok,
            message: ok ? 'Ollama server is reachable.' : 'Ollama server is not reachable.'
        };
    }

    public async *stream(request: ProviderRequest): AsyncGenerator<ProviderEvent, void, unknown> {
        const messages: Message[] = request.messages
            .filter((message) => message.role !== 'tool')
            .map((message) => ({
                role: message.role as Message['role'],
                content: message.content
            }));

        try {
            const config = loadConfig();
            for await (const chunk of this.client.streamChat(request.model, messages, config.showThinking, request.abortSignal)) {
                if (chunk.type === 'thinking') {
                    yield { type: 'thinking_delta', text: chunk.text };
                } else {
                    yield { type: 'text_delta', text: chunk.text };
                }
            }

            yield { type: 'done' };
        } catch (error: any) {
            yield {
                type: 'error',
                error: {
                    message: error?.message || String(error),
                    raw: error
                }
            };
        }
    }
}
