import { AIProvider, ProviderEvent, ProviderRequest } from './types';
import { Message, OllamaClient } from '../engine/ollamaClient';

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
            for await (const text of this.client.streamChat(request.model, messages, request.abortSignal)) {
                yield { type: 'text_delta', text };
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
