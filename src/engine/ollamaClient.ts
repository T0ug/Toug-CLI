import { getOllamaEndpoint } from '../data/configManager';

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OllamaStreamChunk {
    type: 'thinking' | 'content';
    text: string;
}

export class OllamaClient {
    private endpoint: string;

    constructor() {
        this.endpoint = getOllamaEndpoint().replace(/\/$/, ""); // Remove trailing slash
    }

    /**
     * Pings the Ollama server to check if it's healthy and responding.
     */
    public async isHealthy(): Promise<boolean> {
        try {
            const response = await fetch(`${this.endpoint}/api/tags`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Unloads a model from RAM to free up memory.
     */
    public async unloadModel(model: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.endpoint}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, keep_alive: 0 })
            });
            return response.ok;
        } catch (error) {
            console.error(`Erro ao descarregar modelo ${model}:`, error);
            return false;
        }
    }

    /**
     * Retrieves the list of available model tags natively installed in the Docker server.
     */
    public async getModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.endpoint}/api/tags`);
            if (!response.ok) {
                return [];
            }
            const data: any = await response.json();
            return data.models.map((model: any) => model.name) || [];
        } catch (error) {
            console.error("Erro ao resgatar modelos do Ollama:", error);
            return [];
        }
    }

    /**
     * Creates an async generator to stream completions from the Ollama chat endpoint.
     * Yields the message content chunks recursively.
     */
    public async *streamChat(model: string, messages: Message[], think: boolean = false, abortSignal?: AbortSignal): AsyncGenerator<OllamaStreamChunk, void, unknown> {
        const response = await fetch(`${this.endpoint}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: abortSignal,
            body: JSON.stringify({
                model,
                messages,
                stream: true,
                ...(think && { think: true })
            })
        });

        if (!response.ok) {
            let errText = await response.text().catch(() => "Unknown error");
            throw new Error(`Ollama API error (${response.status}): ${errText}`);
        }

        if (!response.body) {
            throw new Error("Ollama API failed to return a readable stream.");
        }

        // To read raw streams in pure node fetch without memory leaks
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last partial chunk in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                try {
                    const parsed = JSON.parse(trimmed);
                    if (parsed.message) {
                        if (parsed.message.thinking) {
                            yield { type: 'thinking', text: parsed.message.thinking };
                        }
                        if (parsed.message.content) {
                            yield { type: 'content', text: parsed.message.content };
                        }
                    }
                } catch (e) {
                    console.error("Falha ao parsear stream JSONL", e, "Linha:", trimmed);
                }
            }
        }

        // Flush anything remaining in buffer
        if (buffer.trim()) {
            try {
                const parsed = JSON.parse(buffer.trim());
                if (parsed.message) {
                    if (parsed.message.thinking) {
                        yield { type: 'thinking', text: parsed.message.thinking };
                    }
                    if (parsed.message.content) {
                        yield { type: 'content', text: parsed.message.content };
                    }
                }
            } catch (e) {
                // Ignore final fail parsing
            }
        }
    }
}
