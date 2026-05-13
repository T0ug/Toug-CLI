import { GoogleGenAI, Type, FunctionDeclaration, Content, Part } from '@google/genai';
import { AIProvider, ProviderEvent, ProviderRequest, ToolCall } from './types';
import { loadConfig } from '../data/configManager';

export class GeminiProvider implements AIProvider {
    public readonly name = 'gemini';

    public async isHealthy() {
        const keys = loadConfig().gemini?.apiKeys || [];
        if (keys.length === 0) {
            return { ok: false, message: 'Gemini API keys not configured.' };
        }
        return { ok: true, message: `Configured with ${keys.length} Gemini API Key(s).` };
    }

    private getStaticTools(): FunctionDeclaration[] {
        return [
            {
                name: 'run_command',
                description: 'Executa um comando no terminal do Windows.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        command: {
                            type: Type.STRING,
                            description: 'Comando a ser executado no powershell'
                        }
                    },
                    required: ['command']
                }
            },
            {
                name: 'read_file',
                description: 'Le o conteudo de um arquivo do projeto.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        path: {
                            type: Type.STRING,
                            description: 'Caminho do arquivo a ser lido'
                        }
                    },
                    required: ['path']
                }
            },
            {
                name: 'write_file',
                description: 'Escreve conteudo em um arquivo no projeto.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        path: {
                            type: Type.STRING,
                            description: 'Caminho do arquivo a ser escrito'
                        },
                        content: {
                            type: Type.STRING,
                            description: 'Conteudo do arquivo'
                        }
                    },
                    required: ['path', 'content']
                }
            }
        ];
    }

    private convertTools(requestTools: any[]): FunctionDeclaration[] {
        if (!requestTools || requestTools.length === 0) {
            return this.getStaticTools();
        }
        return requestTools.map(t => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters as undefined
        }));
    }

    public async *stream(request: ProviderRequest): AsyncGenerator<ProviderEvent, void, unknown> {
        const keys = loadConfig().gemini?.apiKeys || [];
        if (keys.length === 0) {
            yield { type: 'error', error: { message: 'Nenhuma API Key do Gemini configurada em ~/.toug-cli/toug.config.json' } };
            return;
        }

        const firstSystemMessage = request.messages.find(m => m.role === 'system');
        const systemInstruction = firstSystemMessage ? { parts: [{ text: firstSystemMessage.content }] } : undefined;

        let processedMessages = request.messages;
        if (firstSystemMessage) {
            processedMessages = request.messages.filter(m => m !== firstSystemMessage);
        }

        const contents: Content[] = [];
        for (const m of processedMessages) {
            const parts: Part[] = [];
            if (m.role === 'tool') {
                parts.push({ text: m.content });
            } else if (m.content) {
                parts.push({ text: m.content });
            }

            // Map any other systems (like tool outputs) to 'user' so Gemini accepts the execution results
            const mappedRole = m.role === 'assistant' ? 'model' : 'user';

            // To prevent Gemini API errors due to consecutive identical roles, we could merge them.
            // But the SDK usually formats them if we just pass them, as long as it's 'user' or 'model'.
            contents.push({ role: mappedRole, parts });
        }

        const safeContents: Content[] = [];

        // Merge consecutive messages of the same role (Gemini requires strict alternating user/model)
        for (const c of contents) {
            if (safeContents.length > 0 && safeContents[safeContents.length - 1].role === c.role) {
                const lastParts = safeContents[safeContents.length - 1].parts || [];
                lastParts.push(...(c.parts || []));
                safeContents[safeContents.length - 1].parts = lastParts;
            } else {
                safeContents.push(c);
            }
        }

        if (safeContents.length > 0 && safeContents[safeContents.length - 1].role === 'model') {
            safeContents.push({ role: 'user', parts: [{ text: 'Continuar.' }] });
        }

        if (safeContents.length === 0) {
            safeContents.push({ role: 'user', parts: [{ text: 'Ola' }] });
        }

        const functionDeclarations = this.convertTools(request.tools);

        try {
            const activeKeyIndex = request.metadata.apiKeyIndex || 0;
            const key = keys[activeKeyIndex % keys.length];
            const ai = new GoogleGenAI({ apiKey: key.key });

            const systemInstruction = firstSystemMessage ? { parts: [{ text: firstSystemMessage.content }] } : undefined;
            const configManager = loadConfig();

            const responseStream = await ai.models.generateContentStream({
                model: request.model,
                contents: safeContents as Content[],
                config: {
                    systemInstruction,
                    tools: [{ functionDeclarations }],
                    ...(configManager.showThinking && { thinkingConfig: { includeThoughts: true, thinkingBudget: -1 } })
                }
            });

            for await (const chunk of responseStream) {
                if (request.abortSignal?.aborted) {
                    return;
                }

                if (chunk.candidates && chunk.candidates[0]?.content?.parts) {
                    for (const part of chunk.candidates[0].content.parts) {
                        if ((part as any).thought === true && (part as any).text) {
                            yield { type: 'thinking_delta', text: (part as any).text };
                        }
                    }
                }

                if (chunk.text) {
                    yield { type: 'text_delta', text: chunk.text };
                }

                if (chunk.functionCalls && chunk.functionCalls.length > 0) {
                    for (const fc of chunk.functionCalls) {
                        yield {
                            type: 'tool_call',
                            call: {
                                id: Math.random().toString(36).substring(7),
                                name: fc.name as any,
                                args: fc.args as any,
                                source: 'function_call'
                            }
                        };
                    }
                }
            }

            yield { type: 'done' };
            return;

        } catch (error: any) {
            yield {
                type: 'error',
                error: {
                    message: error?.message || String(error),
                    raw: error
                }
            };
            return;
        }

    }
}
