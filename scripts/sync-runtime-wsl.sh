#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="${GREEN_ARGRIC_RUNTIME_DIR:-$HOME/green-argric-run}"

mkdir -p "$RUNTIME_DIR/backend" "$RUNTIME_DIR/frontend/src/reference-ui" "$RUNTIME_DIR/frontend/src/reference-styles"

# Chỉ đồng bộ mã nguồn và cấu hình dự án. Giữ nguyên node_modules cùng các
# khóa cục bộ trong .env của runtime Linux để lần mở sau không phải cài lại.
cp -f "$SOURCE_DIR/backend/index.js" "$RUNTIME_DIR/backend/index.js"
cp -f "$SOURCE_DIR/backend/config.js" "$RUNTIME_DIR/backend/config.js"
cp -f "$SOURCE_DIR/backend/package.json" "$RUNTIME_DIR/backend/package.json"
[[ -f "$SOURCE_DIR/backend/pnpm-lock.yaml" ]] && cp -f "$SOURCE_DIR/backend/pnpm-lock.yaml" "$RUNTIME_DIR/backend/pnpm-lock.yaml"

for directory in config core data middleware routes services; do
  [[ -d "$SOURCE_DIR/backend/$directory" ]] || continue
  mkdir -p "$RUNTIME_DIR/backend/$directory"
  cp -Rf "$SOURCE_DIR/backend/$directory/." "$RUNTIME_DIR/backend/$directory/"
done

cp -f "$SOURCE_DIR/frontend/package.json" "$RUNTIME_DIR/frontend/package.json"
[[ -f "$SOURCE_DIR/frontend/pnpm-lock.yaml" ]] && cp -f "$SOURCE_DIR/frontend/pnpm-lock.yaml" "$RUNTIME_DIR/frontend/pnpm-lock.yaml"
cp -f "$SOURCE_DIR/frontend/src/reference-ui/App.tsx" "$RUNTIME_DIR/frontend/src/reference-ui/App.tsx"
cp -Rf "$SOURCE_DIR/frontend/src/reference-styles/." "$RUNTIME_DIR/frontend/src/reference-styles/"
cp -f "$SOURCE_DIR/frontend/src/main.tsx" "$RUNTIME_DIR/frontend/src/main.tsx"

[[ -d "$RUNTIME_DIR/backend/node_modules/express" ]] || {
  echo "[ERROR] Backend runtime chua co dependency. Chay pnpm install trong $RUNTIME_DIR/backend." >&2
  exit 1
}
[[ -f "$RUNTIME_DIR/frontend/node_modules/vite/bin/vite.js" ]] || {
  echo "[ERROR] Frontend runtime chua co dependency. Chay pnpm install trong $RUNTIME_DIR/frontend." >&2
  exit 1
}

echo "[OK] Da dong bo code vao $RUNTIME_DIR"
