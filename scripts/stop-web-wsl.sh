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

# WSL hoặc cửa sổ launcher có thể bị đóng trước khi PID kịp lưu. Khi đó,
# dừng tiến trình còn giữ đúng các cổng của GREEN ARGRIC để lần mở sau không
# gặp lỗi cổng đã được sử dụng.
stop_port() {
  local name="$1" port="$2" pids=""
  command -v fuser >/dev/null 2>&1 || return
  pids="$(fuser "${port}/tcp" 2>/dev/null || true)"
  [[ -n "$pids" ]] || return
  for pid in $pids; do
    [[ "$pid" =~ ^[0-9]+$ ]] && kill "$pid" 2>/dev/null || true
  done
  echo "[OK] Đã giải phóng cổng $port của $name."
}

stop_port frontend 5173
stop_port backend 3000
stop_port ollama 11434

for _ in {1..20}; do
  busy=0
  for port in 5173 3000 11434; do
    if command -v fuser >/dev/null 2>&1 && fuser "${port}/tcp" >/dev/null 2>&1; then busy=1; fi
  done
  [[ "$busy" -eq 0 ]] && break
  sleep 0.1
done

echo "[DONE] GREEN ARGRIC đã dừng."
