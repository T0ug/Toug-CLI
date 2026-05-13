# Idea - Fase 13: Fallback Multi-Modelo, Menções de Arquivo e Gestão de Sessões

## Problema

Os modelos Gemini no tier gratuito possuem limites severos de uso (gemini-2.5-pro: 2 RPM / 50 RPD). O CLI atual só faz fallback por API key, esgotando rapidamente todas as keys no mesmo modelo. Além disso, faltam funcionalidades básicas como referência a arquivos no prompt, navegação de sessões anteriores e identificação visual de qual API key está em uso.

## Solução

Implementar um sistema de fallback em cascata que priorize troca de modelo antes de troca de API key, com Ollama local como último recurso. Complementar com sistema de menções `@` para arquivos/diretórios (resolvido pelo CLI sem consumo de tokens), gestão completa de sessões e apelidos para API keys.

## Motivação

Maximizar o uso gratuito do Gemini API multiplicando a capacidade por modelo × keys. Reduzir fricção do usuário ao referenciar arquivos e navegar sessões.

## Origem

Solicitação direta do usuário após validação do MVP (Fase 12 completa).
