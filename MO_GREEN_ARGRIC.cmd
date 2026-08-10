@echo off
setlocal
title GREEN ARGRIC Launcher
echo Dang khoi dong GREEN ARGRIC trong WSL...
start "GREEN ARGRIC - Ollama" /min wsl.exe -e bash /mnt/d/DADN/scripts/run-web-service-wsl.sh ollama
start "GREEN ARGRIC - Backend" /min wsl.exe -e bash /mnt/d/DADN/scripts/run-web-service-wsl.sh backend
start "GREEN ARGRIC - Frontend" /min wsl.exe -e bash /mnt/d/DADN/scripts/run-web-service-wsl.sh frontend

echo Dang cho Backend va Frontend san sang...
for /L %%I in (1,1,45) do (
  curl.exe -fsS http://localhost:3000/health >nul 2>&1 && curl.exe -fsS http://localhost:5173 >nul 2>&1 && goto READY
  ping 127.0.0.1 -n 2 >nul
)

echo.
echo [ERROR] GREEN ARGRIC khong khoi dong day du sau 45 giay.
wsl.exe -e bash /mnt/d/DADN/scripts/status-web-wsl.sh
echo.
echo Xem log bang cac lenh sau trong WSL:
echo tail -n 50 ~/green-argric-run/.green-argric-runtime/backend.log
echo tail -n 50 ~/green-argric-run/.green-argric-runtime/frontend.log
pause
exit /b 1

:READY
wsl.exe -e bash /mnt/d/DADN/scripts/status-web-wsl.sh
start "" http://localhost:5173
echo.
echo Da mo GREEN ARGRIC tai http://localhost:5173
exit /b 0
