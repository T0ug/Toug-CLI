@echo off
echo ========================================================
echo Toug CLI - Download de Modelos para o Servidor Ollama
echo ========================================================

echo Verificando e baixando: qwen3-coder-next (Pode ser aproximado da string "qwen3-coder:latest")
docker exec -it toug_ollama ollama pull qwen3-coder:latest

echo Verificando e baixando: qwen3:14b
docker exec -it toug_ollama ollama pull qwen3:14b

echo Verificando e baixando: qwen3:30b-instruct
docker exec -it toug_ollama ollama pull qwen3:30b-instruct

echo Verificando e baixando: deepseek-r1:32b
docker exec -it toug_ollama ollama pull deepseek-r1:32b

echo Verificando e baixando: gemma3:27b
docker exec -it toug_ollama ollama pull gemma3:27b

echo Verificando e baixando: devstral-small-2
docker exec -it toug_ollama ollama pull devstral-small-2

echo ========================================================
echo Download Finalizado!
echo ========================================================
pause
