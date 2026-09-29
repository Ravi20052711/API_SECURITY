@echo off
title HackTheAPI Launcher (Localhost + Cloudflare Tunnel + Ollama Qwen AI)
color 0A
echo ===================================================================
echo               HACKTHEAPI FULL PLATFORM LAUNCHER
echo ===================================================================
echo.

echo [1/4] Starting Ollama Qwen AI Engine...
start "Ollama AI Engine" cmd /k "ollama serve"

echo [2/4] Starting Django Backend Server on http://127.0.0.1:8000...
start "Django Backend API" cmd /k "cd /d %~dp0 && py server/manage.py runserver 8000"

echo [3/4] Starting Vite Frontend Server on http://localhost:3009...
start "Vite Frontend UI" cmd /k "cd /d %~dp0 && npx vite --port 3009"

echo [4/4] Starting Cloudflare Tunnel Gateway...
timeout /t 3 /nobreak >nul
REM If using a custom Cloudflare Tunnel Token, replace line below with:
REM start "Cloudflare Tunnel Gateway" cmd /k "cd /d %~dp0 && .\cloudflared.exe tunnel run --token YOUR_CLOUDFLARE_TOKEN"
start "Cloudflare Tunnel Gateway" cmd /k "cd /d %~dp0 && .\cloudflared.exe tunnel --url http://localhost:3009"

echo.
echo ===================================================================
echo SUCCESS! All services are initializing:
echo  - Localhost UI: http://localhost:3009
echo  - Django Backend API: http://127.0.0.1:8000
echo  - Ollama Qwen AI Engine: Port 11434
echo  - Public Cloudflare Domain: Check the Cloudflare Tunnel window!
echo ===================================================================
echo.
pause
