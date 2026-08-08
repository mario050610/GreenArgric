#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_BACKEND="${GREEN_ARGRIC_RUNTIME_BACKEND:-$HOME/green-argric-run/backend}"

if [[ ! -d "$RUNTIME_BACKEND/node_modules/express" ]]; then
  echo "Thiếu dependency tại $RUNTIME_BACKEND/node_modules" >&2
  echo "Hãy cài dependency backend hoặc đặt GREEN_ARGRIC_RUNTIME_BACKEND." >&2
  exit 1
fi

TEST_DIR="$(mktemp -d)"
trap 'rm -rf -- "$TEST_DIR"' EXIT

cp -a "$ROOT_DIR/backend/config" "$ROOT_DIR/backend/core" "$ROOT_DIR/backend/data" "$ROOT_DIR/backend/database" "$ROOT_DIR/backend/middleware" "$ROOT_DIR/backend/routes" "$ROOT_DIR/backend/tests" "$TEST_DIR/"
cp "$ROOT_DIR/backend/"*.js "$ROOT_DIR/backend/package.json" "$TEST_DIR/"
ln -s "$RUNTIME_BACKEND/node_modules" "$TEST_DIR/node_modules"

bash "$TEST_DIR/tests/run-smoke-user.sh"
echo "Backend runtime smoke test: PASS"
