#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_FRONTEND="${GREEN_ARGRIC_RUNTIME_FRONTEND:-$HOME/green-argric-run/frontend}"

if [[ ! -f "$RUNTIME_FRONTEND/node_modules/typescript/bin/tsc" || ! -f "$RUNTIME_FRONTEND/node_modules/vite/bin/vite.js" ]]; then
  echo "Thiếu dependency tại $RUNTIME_FRONTEND/node_modules" >&2
  echo "Hãy cài dependency frontend hoặc đặt GREEN_ARGRIC_RUNTIME_FRONTEND." >&2
  exit 1
fi

BUILD_DIR="$(mktemp -d)"
trap 'rm -rf -- "$BUILD_DIR"' EXIT

cp -a "$ROOT_DIR/frontend/src" "$BUILD_DIR/"
cp "$ROOT_DIR/frontend/index.html" "$ROOT_DIR/frontend/package.json" "$ROOT_DIR/frontend/tsconfig.json" "$ROOT_DIR/frontend/vite.config.ts" "$BUILD_DIR/"
ln -s "$RUNTIME_FRONTEND/node_modules" "$BUILD_DIR/node_modules"

cd "$BUILD_DIR"
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
echo "Frontend TypeScript + Vite build: PASS"
