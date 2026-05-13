@echo off
echo ========================================================
echo Toug CLI - Download de Modelos para o Servidor Ollama
echo ========================================================

echo Removendo modelos antigos nao utilizados...
docker exec -it toug_ollama ollama rm gemma3:4b
docker exec -it toug_ollama ollama rm deepseek-r1:8b
docker exec -it toug_ollama ollama rm qwen2.5-coder:7b
docker exec -it toug_ollama ollama rm llama3:8b

echo Verificando e baixando: qwen3:14b
docker exec -it toug_ollama ollama pull qwen3:14b

echo Verificando e baixando: qwen3:8b
docker exec -it toug_ollama ollama pull qwen3:8b

echo ========================================================
echo Download Finalizado!
echo ========================================================
pause
