#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

python3 microbit/tests/test_protocol.py
python3 iot-gateway/tests/test_switch_protocol.py
python3 -m compileall -q iot-gateway microbit

bash scripts/build-frontend-wsl.sh
bash scripts/test-backend-wsl.sh
bash scripts/test-mqtt-local-wsl.sh
bash scripts/test-mssql-wsl.sh

echo 'GREEN ARGRIC software validation suite: PASS'
