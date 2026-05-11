"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaClient = void 0;
const configManager_1 = require("../data/configManager");
class OllamaClient {
    endpoint;
    constructor() {
        const config = (0, configManager_1.loadConfig)();
        this.endpoint = config.ollamaEndpoint.replace(/\/$/, ""); // Remove trailing slash
    }
    /**
     * Pings the Ollama server to check if it's healthy and responding.
     */
    async isHealthy() {
        try {
            const response = await fetch(`${this.endpoint}/api/tags`);
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Retrieves the list of available model tags natively installed in the Docker server.
     */
    async getModels() {
        try {
            const response = await fetch(`${this.endpoint}/api/tags`);
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return data.models.map((model) => model.name) || [];
        }
        catch (error) {
            console.error("Erro ao resgatar modelos do Ollama:", error);
            return [];
        }
    }
    /**
     * Creates an async generator to stream completions from the Ollama chat endpoint.
     * Yields the message content chunks recursively.
     */
    async *streamChat(model, messages) {
        const response = await fetch(`${this.endpoint}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages,
                stream: true
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
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            // Keep the last partial chunk in the buffer
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed)
                    continue;
                try {
                    const parsed = JSON.parse(trimmed);
                    if (parsed.message && parsed.message.content) {
                        yield parsed.message.content;
                    }
                }
                catch (e) {
                    console.error("Falha ao parsear stream JSONL", e, "Linha:", trimmed);
                }
            }
        }
        // Flush anything remaining in buffer
        if (buffer.trim()) {
            try {
                const parsed = JSON.parse(buffer.trim());
                if (parsed.message && parsed.message.content) {
                    yield parsed.message.content;
                }
            }
            catch (e) {
                // Ignore final fail parsing
            }
        }
    }
}
exports.OllamaClient = OllamaClient;
