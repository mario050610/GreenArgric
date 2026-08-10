#!/usr/bin/env bash
set -euo pipefail

RUNTIME_DIR="${GREEN_ARGRIC_RUNTIME_DIR:-$HOME/green-argric-run}"
STATE_DIR="$RUNTIME_DIR/.green-argric-runtime"
PID_FILE="$STATE_DIR/backend.pid"

if [[ -f "$PID_FILE" ]]; then
  pid="$(tr -cd '0-9' < "$PID_FILE")"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid"
    for _ in {1..20}; do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.2
    done
  fi
  rm -f -- "$PID_FILE"
fi

# Chờ tiến trình cũ ngừng lắng nghe hẳn, tránh launcher thấy health cũ rồi thoát.
for _ in {1..30}; do
  curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1 || break
  sleep 0.2
done

nohup bash /mnt/d/DADN/scripts/run-web-service-wsl.sh backend \
  > "$STATE_DIR/backend.log" 2>&1 &

for _ in {1..40}; do
  curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1 && {
    echo '[ONLINE] Backend đã nạp mã mới.'
    exit 0
  }
  sleep 0.25
done

echo '[ERROR] Backend không khởi động lại được.' >&2
tail -n 40 "$STATE_DIR/backend.log" >&2 || true
exit 1
