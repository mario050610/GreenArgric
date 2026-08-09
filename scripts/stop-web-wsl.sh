#!/usr/bin/env bash
set -euo pipefail

RUNTIME_DIR="${GREEN_ARGRIC_RUNTIME_DIR:-$HOME/green-argric-run}"
STATE_DIR="$RUNTIME_DIR/.green-argric-runtime"

stop_pid() {
  local name="$1" file="$STATE_DIR/$1.pid" pid=""
  [[ -f "$file" ]] || { echo "[OK] $name không có PID do launcher quản lý."; return; }
  pid="$(tr -cd '0-9' < "$file")"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid"
    echo "[OK] Đã dừng $name (PID $pid)."
  else
    echo "[OK] $name đã dừng trước đó."
  fi
  rm -f -- "$file"
}

stop_pid frontend
stop_pid backend
stop_pid ollama
