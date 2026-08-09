#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-}"
RUNTIME_DIR="${GREEN_ARGRIC_RUNTIME_DIR:-$HOME/green-argric-run}"
STATE_DIR="$RUNTIME_DIR/.green-argric-runtime"
mkdir -p "$STATE_DIR"

case "$SERVICE" in
  ollama)
    command -v ollama >/dev/null 2>&1 || exit 0
    curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1 && exit 0
    echo $$ >"$STATE_DIR/ollama.pid"
    exec ollama serve
    ;;
  backend)
    curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1 && exit 0
    cd "$RUNTIME_DIR/backend"
    [[ -d node_modules/express ]] || { echo "Thiếu dependency Backend." >&2; exit 1; }
    echo $$ >"$STATE_DIR/backend.pid"
    exec node index.js
    ;;
  frontend)
    curl -fsS http://127.0.0.1:5173 >/dev/null 2>&1 && exit 0
    cd "$RUNTIME_DIR/frontend"
    [[ -f node_modules/vite/bin/vite.js ]] || { echo "Thiếu dependency Frontend." >&2; exit 1; }
    echo $$ >"$STATE_DIR/frontend.pid"
    exec node node_modules/vite/bin/vite.js --host 0.0.0.0
    ;;
  *)
    echo "Cách dùng: $0 {ollama|backend|frontend}" >&2
    exit 2
    ;;
esac
