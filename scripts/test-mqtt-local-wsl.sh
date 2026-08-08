#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_BACKEND="${GREEN_ARGRIC_RUNTIME_BACKEND:-$HOME/green-argric-run/backend}"
TEST_DIR="$(mktemp -d)"
API_PID=""
cleanup() {
  [[ -n "$API_PID" ]] && kill "$API_PID" 2>/dev/null || true
  rm -rf -- "$TEST_DIR"
}
trap cleanup EXIT

if ! docker ps --format '{{.Names}}' | grep -qx 'green-argric-mosquitto'; then
  echo 'Mosquitto chưa chạy. Chạy: docker compose --profile local-mqtt up -d mosquitto' >&2
  exit 1
fi
if [[ ! -d "$RUNTIME_BACKEND/node_modules/mqtt" ]]; then
  echo "Thiếu dependency backend tại $RUNTIME_BACKEND/node_modules" >&2
  exit 1
fi

cp -a "$ROOT_DIR/backend/config" "$ROOT_DIR/backend/core" "$ROOT_DIR/backend/data" "$ROOT_DIR/backend/database" "$ROOT_DIR/backend/middleware" "$ROOT_DIR/backend/routes" "$ROOT_DIR/backend/tests" "$TEST_DIR/"
cp "$ROOT_DIR/backend/"*.js "$ROOT_DIR/backend/package.json" "$TEST_DIR/"
ln -s "$RUNTIME_BACKEND/node_modules" "$TEST_DIR/node_modules"

cd "$TEST_DIR"
PORT=3102 DATA_MODE=memory MQTT_ENABLED=true MQTT_PROVIDER=local MQTT_BROKER=mqtt://127.0.0.1:1883 AI_PROVIDER=ollama node index.js >api.log 2>&1 &
API_PID=$!
for _ in {1..40}; do
  curl -fsS http://127.0.0.1:3102/health >/dev/null 2>&1 && break
  sleep 0.25
done
curl -fsS http://127.0.0.1:3102/health >/dev/null
node tests/mqtt-local-smoke.mjs
echo 'MQTT local integration smoke test: PASS'
