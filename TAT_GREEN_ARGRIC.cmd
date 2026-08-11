@echo off
setlocal EnableExtensions
title GREEN ARGRIC Stopper
cd /d "%~dp0"

where wsl.exe >nul 2>&1 || goto NO_WSL
for /f "usebackq delims=" %%P in (`wsl.exe -e wslpath -a "%CD%" 2^>nul`) do set "GA_WSL_ROOT=%%P"
if not defined GA_WSL_ROOT goto BAD_PATH
if not exist "%CD%\scripts\stop-web-wsl.sh" goto MISSING_SCRIPT

echo Dang tat Frontend, Backend va Ollama cua GREEN ARGRIC...
wsl.exe -e bash "%GA_WSL_ROOT%/scripts/stop-web-wsl.sh"
if errorlevel 1 goto STOP_FAILED
echo.
echo Da tat cac dich vu GREEN ARGRIC.
pause
exit /b 0

:NO_WSL
echo [ERROR] Chua cai WSL hoac wsl.exe khong co trong PATH.
goto FAILED

:BAD_PATH
echo [ERROR] WSL khong doc duoc thu muc du an: %CD%
goto FAILED

:MISSING_SCRIPT
echo [ERROR] Thieu file scripts\stop-web-wsl.sh.
goto FAILED

:STOP_FAILED
echo [ERROR] Khong the tat day du cac dich vu GREEN ARGRIC.

:FAILED
echo.
pause
exit /b 1
