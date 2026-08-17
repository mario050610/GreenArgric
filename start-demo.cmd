@echo off
setlocal
cd /d "%~dp0"

docker compose --profile local-mqtt up -d mosquitto
if errorlevel 1 (
  echo Khong khoi dong duoc MQTT. Hay mo Docker Desktop roi chay lai file nay.
  pause
  exit /b 1
)

if not exist "backend\node_modules\express\index.js" (
  echo Dang cai thu vien backend lan dau...
  call npm.cmd --prefix backend ci --no-audit --no-fund
  if errorlevel 1 (
    echo Cai thu vien that bai. Kiem tra mang roi bam lai start-demo.cmd.
    pause
    exit /b 1
  )
)

start "GREEN ARGRIC Gateway" /min cmd /c "cd /d %~dp0iot-gateway && python main.py"
start "GREEN ARGRIC Backend" /min cmd /c "cd /d %~dp0backend && npm.cmd run start"
start "GREEN ARGRIC Frontend" /min cmd /c "cd /d %~dp0frontend && npm.cmd run dev -- --host 127.0.0.1 --port 5173"

timeout /t 6 /nobreak >nul
start "" "http://localhost:5173/devices"
endlocal
