@echo off
setlocal EnableExtensions
title GREEN ARGRIC Launcher
cd /d "%~dp0"

where wsl.exe >nul 2>&1 || goto NO_WSL
for /f "usebackq delims=" %%P in (`wsl.exe -e wslpath -a "%CD%" 2^>nul`) do set "GA_WSL_ROOT=%%P"
if not defined GA_WSL_ROOT goto BAD_PATH
if not exist "%CD%\scripts\sync-runtime-wsl.sh" goto MISSING_SCRIPT

echo [1/3] Dang dong bo code moi vao WSL...
wsl.exe -e bash "%GA_WSL_ROOT%/scripts/sync-runtime-wsl.sh"
if errorlevel 1 goto SYNC_FAILED

echo [2/3] Dang khoi dong cac dich vu GREEN ARGRIC...
start "GREEN ARGRIC - Ollama" /min wsl.exe -e bash "%GA_WSL_ROOT%/scripts/run-web-service-wsl.sh" ollama
start "GREEN ARGRIC - Backend" /min wsl.exe -e bash "%GA_WSL_ROOT%/scripts/run-web-service-wsl.sh" backend
start "GREEN ARGRIC - Frontend" /min wsl.exe -e bash "%GA_WSL_ROOT%/scripts/run-web-service-wsl.sh" frontend

echo [3/3] Dang cho Backend va Frontend san sang...
for /L %%I in (1,1,45) do (
  curl.exe -fsS http://localhost:3000/health >nul 2>&1 && curl.exe -fsS http://localhost:5173 >nul 2>&1 && goto READY
  ping 127.0.0.1 -n 2 >nul
)

echo.
echo [ERROR] GREEN ARGRIC khong khoi dong day du sau 45 giay.
wsl.exe -e bash "%GA_WSL_ROOT%/scripts/status-web-wsl.sh"
echo.
echo Xem log bang cac lenh sau trong WSL:
echo tail -n 50 ~/green-argric-run/.green-argric-runtime/backend.log
echo tail -n 50 ~/green-argric-run/.green-argric-runtime/frontend.log
pause
exit /b 1

:READY
wsl.exe -e bash "%GA_WSL_ROOT%/scripts/status-web-wsl.sh"
start "" http://localhost:5173/?resetAlerts=1
echo.
echo Da mo GREEN ARGRIC tai http://localhost:5173
exit /b 0

:NO_WSL
echo [ERROR] Chua cai WSL hoac wsl.exe khong co trong PATH.
goto FAILED

:BAD_PATH
echo [ERROR] WSL khong doc duoc thu muc du an: %CD%
goto FAILED

:MISSING_SCRIPT
echo [ERROR] Thieu file scripts\sync-runtime-wsl.sh.
goto FAILED

:SYNC_FAILED
echo [ERROR] Khong the dong bo code sang WSL.
echo Hay kiem tra thu muc ~/green-argric-run va dependency da cai.

:FAILED
echo.
pause
exit /b 1
