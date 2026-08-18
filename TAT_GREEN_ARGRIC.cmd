@echo off
setlocal EnableExtensions EnableDelayedExpansion
title GREEN ARGRIC Stopper
cd /d "%~dp0"

echo =====================================================
echo                TAT GREEN ARGRIC
echo =====================================================
echo.

echo [1/4] Dang tat Backend, Frontend va IoT Gateway...
call :STOP_WINDOW "GREEN ARGRIC - Backend"
call :STOP_WINDOW "GREEN ARGRIC - Frontend"
call :STOP_WINDOW "GREEN ARGRIC - IoT Gateway"

echo [2/4] Dang giai phong cac port cua GREEN ARGRIC...
call :STOP_PORT 3000
call :STOP_PORT 5173

echo [3/4] Dang tat MQTT Mosquitto...
where docker.exe >nul 2>&1
if errorlevel 1 (
  echo [WARN] Khong tim thay Docker CLI, bo qua Mosquitto.
) else (
  docker info >nul 2>&1
  if errorlevel 1 (
    echo [WARN] Docker Desktop khong chay, Mosquitto da dung san.
  ) else (
    docker stop green-argric-mosquitto >nul 2>&1
    if errorlevel 1 (
      echo [INFO] Mosquitto khong chay hoac khong ton tai.
    ) else (
      echo Da tat green-argric-mosquitto.
    )
  )
)

echo [4/4] Dang kiem tra trang thai...
set "GA_STILL_RUNNING=0"
call :CHECK_PORT 3000
call :CHECK_PORT 5173

echo.
if "%GA_STILL_RUNNING%"=="1" (
  echo [WARN] Van con tien trinh su dung port GREEN ARGRIC.
  echo Hay xem cac dong PID o tren va tat thu cong neu can.
) else (
  echo Backend, Frontend, Gateway va MQTT cua GREEN ARGRIC da tat.
)
echo.
echo [INFO] Giu container develop2-ollama-1 chay vi day la dich vu dung chung.
echo [INFO] Khong co volume hoac du lieu nao bi xoa.
pause
exit /b 0

:STOP_WINDOW
set "GA_WINDOW=%~1"
for /f "tokens=2" %%P in ('tasklist /V /FI "IMAGENAME eq cmd.exe" 2^>nul ^| findstr /I /C:"%GA_WINDOW%"') do (
  taskkill /PID %%P /T /F >nul 2>&1
)
exit /b 0

:STOP_PORT
set "GA_PORT=%~1"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%GA_PORT% .*LISTENING"') do (
  if not "%%P"=="0" (
    echo Dang tat PID %%P tren port %GA_PORT%...
    taskkill /PID %%P /T /F >nul 2>&1
  )
)
exit /b 0

:CHECK_PORT
set "GA_PORT=%~1"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%GA_PORT% .*LISTENING"') do (
  echo [WARN] Port %GA_PORT% van LISTENING tai PID %%P.
  set "GA_STILL_RUNNING=1"
)
exit /b 0
