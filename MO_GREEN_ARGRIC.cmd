@echo off
setlocal EnableExtensions EnableDelayedExpansion
title GREEN ARGRIC Launcher
cd /d "%~dp0"
set "GA_ROOT=%CD%"

echo =====================================================
echo              KHOI DONG GREEN ARGRIC
echo =====================================================
echo.

where node.exe >nul 2>&1 || goto NO_NODE
where npm.cmd >nul 2>&1 || goto NO_NODE
where docker.exe >nul 2>&1 || goto NO_DOCKER
where curl.exe >nul 2>&1 || goto NO_CURL

echo [1/6] Dang kiem tra Docker Desktop...
docker info >nul 2>&1
if not errorlevel 1 goto DOCKER_READY

if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
  echo Docker Desktop chua chay. Dang mo Docker Desktop...
  start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
) else (
  goto DOCKER_NOT_RUNNING
)

for /L %%I in (1,1,90) do (
  docker info >nul 2>&1 && goto DOCKER_READY
  timeout /t 1 /nobreak >nul
)
goto DOCKER_NOT_RUNNING

:DOCKER_READY
echo [2/6] Dang khoi dong MQTT Mosquitto...
docker compose --profile local-mqtt up -d mosquitto
if errorlevel 1 goto MQTT_FAILED

echo [3/6] Dang kiem tra Ollama va qwen3:8b...
curl.exe -fsS http://127.0.0.1:11434/api/tags >nul 2>&1
if not errorlevel 1 goto OLLAMA_READY

docker inspect develop2-ollama-1 >nul 2>&1
if errorlevel 1 goto OLLAMA_MISSING
docker start develop2-ollama-1 >nul
if errorlevel 1 goto OLLAMA_FAILED

for /L %%I in (1,1,45) do (
  curl.exe -fsS http://127.0.0.1:11434/api/tags >nul 2>&1 && goto OLLAMA_READY
  timeout /t 1 /nobreak >nul
)
goto OLLAMA_FAILED

:OLLAMA_READY
curl.exe -fsS http://127.0.0.1:11434/api/tags | findstr /I /C:"qwen3:8b" >nul
if errorlevel 1 (
  echo Khong tim thay qwen3:8b trong Ollama hien tai.
  echo Dang tai model. Buoc nay co the mat nhieu thoi gian...
  docker exec develop2-ollama-1 ollama pull qwen3:8b
  if errorlevel 1 goto MODEL_FAILED
)

echo [4/6] Dang kiem tra thu vien...
if not exist "%GA_ROOT%\backend\node_modules\express\index.js" (
  echo Dang cai thu vien backend...
  call npm.cmd --prefix "%GA_ROOT%\backend" ci --no-audit --no-fund
  if errorlevel 1 goto NPM_FAILED
)
if not exist "%GA_ROOT%\frontend\node_modules\vite\bin\vite.js" (
  echo Dang cai thu vien frontend...
  call npm.cmd --prefix "%GA_ROOT%\frontend" ci --no-audit --no-fund
  if errorlevel 1 goto NPM_FAILED
)

echo [5/6] Dang mo Backend, Frontend va IoT Gateway...
curl.exe -fsS http://127.0.0.1:3000/health >nul 2>&1
if errorlevel 1 start "GREEN ARGRIC - Backend" /min /D "%GA_ROOT%\backend" cmd /k npm.cmd run start

curl.exe -fsS http://127.0.0.1:5173 >nul 2>&1
if errorlevel 1 start "GREEN ARGRIC - Frontend" /min /D "%GA_ROOT%\frontend" cmd /k npm.cmd run dev -- --host 127.0.0.1 --port 5173

where python.exe >nul 2>&1
if not errorlevel 1 (
  tasklist /V /FI "IMAGENAME eq cmd.exe" 2>nul | findstr /I /C:"GREEN ARGRIC - IoT Gateway" >nul
  if errorlevel 1 start "GREEN ARGRIC - IoT Gateway" /min /D "%GA_ROOT%\iot-gateway" cmd /k python main.py
) else (
  echo [WARN] Khong tim thay Python, bo qua IoT Gateway.
)

echo [6/6] Dang cho he thong san sang...
for /L %%I in (1,1,90) do (
  curl.exe -fsS http://127.0.0.1:3000/health >nul 2>&1 && curl.exe -fsS http://127.0.0.1:5173 >nul 2>&1 && goto READY
  timeout /t 1 /nobreak >nul
)
goto WEB_FAILED

:READY
echo.
echo =====================================================
echo GREEN ARGRIC DA SAN SANG
echo Frontend: http://localhost:5173
echo Backend : http://localhost:3000/health
echo Swagger : http://localhost:3000/api
echo =====================================================
start "" "http://localhost:5173"
timeout /t 3 /nobreak >nul
exit /b 0

:NO_NODE
echo [ERROR] Chua cai Node.js hoac Node.js chua co trong PATH.
goto FAILED

:NO_DOCKER
echo [ERROR] Chua cai Docker Desktop hoac docker.exe chua co trong PATH.
goto FAILED

:NO_CURL
echo [ERROR] Khong tim thay curl.exe trong Windows.
goto FAILED

:DOCKER_NOT_RUNNING
echo [ERROR] Docker Desktop khong khoi dong sau 90 giay.
echo Hay mo Docker Desktop, doi Engine running roi bam lai file nay.
goto FAILED

:MQTT_FAILED
echo [ERROR] Khong khoi dong duoc Mosquitto.
echo Thu chay: docker compose --profile local-mqtt up -d mosquitto
goto FAILED

:OLLAMA_MISSING
echo [ERROR] Khong tim thay container develop2-ollama-1.
echo Hay khoi dong lai Docker Compose cua develop2 truoc.
goto FAILED

:OLLAMA_FAILED
echo [ERROR] Ollama khong san sang tai http://127.0.0.1:11434.
echo Thu chay: docker start develop2-ollama-1
goto FAILED

:MODEL_FAILED
echo [ERROR] Khong tai duoc model qwen3:8b.
goto FAILED

:NPM_FAILED
echo [ERROR] Cai thu vien npm that bai. Hay kiem tra ket noi mang.
goto FAILED

:WEB_FAILED
echo [ERROR] Backend hoac Frontend khong san sang sau 90 giay.
echo Kiem tra hai cua so GREEN ARGRIC - Backend va Frontend de xem log.

:FAILED
echo.
pause
exit /b 1
