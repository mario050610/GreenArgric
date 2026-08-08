#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node tests/mock-ollama.mjs >/tmp/ga-ollama-test.log 2>&1 &
ollama_pid=$!
PORT=3101 DATA_MODE=memory MQTT_ENABLED=false AI_PROVIDER=ollama OLLAMA_URL=http://127.0.0.1:11435 node index.js >/tmp/ga-api-test.log 2>&1 &
api_pid=$!
trap 'kill "$api_pid" "$ollama_pid" 2>/dev/null || true' EXIT
sleep 2
TEST_API_URL=http://127.0.0.1:3101 node tests/smoke-user.mjs
