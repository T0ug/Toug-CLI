#!/bin/bash

echo "========================================================"
echo "Toug CLI - Download de Modelos para o Servidor Ollama"
echo "========================================================"

echo "Verificando e baixando: gemma3:4b"
docker exec -it toug_ollama ollama pull gemma3:4b

echo "Verificando e baixando: deepseek-r1:8b"
docker exec -it toug_ollama ollama pull deepseek-r1:8b

echo "Verificando e baixando: qwen2.5-coder:7b"
docker exec -it toug_ollama ollama pull qwen2.5-coder:7b

echo "Verificando e baixando: qwen3:8b"
docker exec -it toug_ollama ollama pull qwen3:8b

echo "========================================================"
echo "Download Finalizado!"
echo "========================================================"
