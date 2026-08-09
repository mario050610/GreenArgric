@echo off
title GREEN ARGRIC Launcher
echo Dang khoi dong GREEN ARGRIC trong WSL...
start "GREEN ARGRIC - Ollama" /min wsl bash /mnt/d/DADN/scripts/run-web-service-wsl.sh ollama
start "GREEN ARGRIC - Backend" /min wsl bash /mnt/d/DADN/scripts/run-web-service-wsl.sh backend
start "GREEN ARGRIC - Frontend" /min wsl bash /mnt/d/DADN/scripts/run-web-service-wsl.sh frontend
timeout /t 6 /nobreak >nul
wsl bash /mnt/d/DADN/scripts/status-web-wsl.sh
start "" http://localhost:5173
echo.
echo Da mo GREEN ARGRIC tai http://localhost:5173
timeout /t 3 >nul
