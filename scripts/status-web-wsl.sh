#!/usr/bin/env bash
set -u

check_url() {
  local name="$1" url="$2"
  if curl -fsS "$url" >/dev/null 2>&1; then echo "[ONLINE]  $name"; else echo "[OFFLINE] $name"; fi
}

check_url Ollama http://127.0.0.1:11434/api/tags
check_url Backend http://127.0.0.1:3000/health
check_url Frontend http://127.0.0.1:5173
