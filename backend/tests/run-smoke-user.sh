#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -f /tmp/ga-users-smoke.json /tmp/ga-users-smoke.json.tmp /tmp/ga-areas-smoke.json /tmp/ga-areas-smoke.json.tmp /tmp/ga-thresholds-smoke.json /tmp/ga-thresholds-smoke.json.tmp
node tests/mock-ollama.mjs >/tmp/ga-ollama-test.log 2>&1 &
ollama_pid=$!
PORT=3101 DATA_MODE=memory USER_DATA_FILE=/tmp/ga-users-smoke.json AREA_DATA_FILE=/tmp/ga-areas-smoke.json THRESHOLD_DATA_FILE=/tmp/ga-thresholds-smoke.json MQTT_ENABLED=false AI_PROVIDER=ollama OLLAMA_URL=http://127.0.0.1:11435 TAVILY_API_KEY=test TAVILY_SEARCH_URL=http://127.0.0.1:11435/search node index.js >/tmp/ga-api-test.log 2>&1 &
api_pid=$!
trap 'kill "$api_pid" "$ollama_pid" 2>/dev/null || true' EXIT
sleep 2
TEST_API_URL=http://127.0.0.1:3101 node tests/smoke-user.mjs
