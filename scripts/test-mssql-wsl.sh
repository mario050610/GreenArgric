#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_BACKEND="${GREEN_ARGRIC_RUNTIME_BACKEND:-$HOME/green-argric-run/backend}"
CONTAINER="green-argric-sqlserver"
PASSWORD="${GREEN_ARGRIC_TEST_DB_PASSWORD:-GreenArgric@123}"
TEST_DIR="$(mktemp -d)"
API_PID=""
cleanup() {
  [[ -n "$API_PID" ]] && kill "$API_PID" 2>/dev/null || true
  rm -rf -- "$TEST_DIR"
}
trap cleanup EXIT

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "SQL Server container $CONTAINER chưa chạy" >&2
  exit 1
fi

SQLCMD='/opt/mssql-tools18/bin/sqlcmd'
for _ in {1..60}; do
  docker exec "$CONTAINER" "$SQLCMD" -C -S localhost -U sa -P "$PASSWORD" -Q 'SELECT 1' >/dev/null 2>&1 && break
  sleep 1
done
docker exec "$CONTAINER" "$SQLCMD" -C -S localhost -U sa -P "$PASSWORD" -Q 'SELECT 1' >/dev/null

DB_EXISTS="$(docker exec "$CONTAINER" "$SQLCMD" -h -1 -W -C -S localhost -U sa -P "$PASSWORD" -Q "SET NOCOUNT ON; SELECT CASE WHEN DB_ID(N'GreenArgric') IS NULL THEN 0 ELSE 1 END" | tr -d '[:space:]')"
if [[ "$DB_EXISTS" == '0' ]]; then
  docker exec -i "$CONTAINER" "$SQLCMD" -C -S localhost -U sa -P "$PASSWORD" < "$ROOT_DIR/backend/database/GA-database.sql"
  docker exec -i "$CONTAINER" "$SQLCMD" -C -S localhost -U sa -P "$PASSWORD" < "$ROOT_DIR/backend/database/GA-data.sql"
fi

cp -a "$ROOT_DIR/backend/config" "$ROOT_DIR/backend/core" "$ROOT_DIR/backend/data" "$ROOT_DIR/backend/database" "$ROOT_DIR/backend/middleware" "$ROOT_DIR/backend/routes" "$ROOT_DIR/backend/tests" "$TEST_DIR/"
cp "$ROOT_DIR/backend/"*.js "$ROOT_DIR/backend/package.json" "$TEST_DIR/"
ln -s "$RUNTIME_BACKEND/node_modules" "$TEST_DIR/node_modules"
cd "$TEST_DIR"

start_api() {
  PORT=3103 DATA_MODE=mssql MQTT_ENABLED=false DB_SERVER=127.0.0.1 DB_PORT=1433 DB_USER=sa DB_PASSWORD="$PASSWORD" DB_NAME=GreenArgric DB_ENCRYPT=false DB_TRUST_CERT=true node index.js >api.log 2>&1 &
  API_PID=$!
  for _ in {1..60}; do
    curl -fsS http://127.0.0.1:3103/health >/dev/null 2>&1 && return
    sleep 0.25
  done
  cat api.log >&2
  exit 1
}

start_api
TEST_PHASE=write node tests/mssql-smoke.mjs
kill "$API_PID"
wait "$API_PID" 2>/dev/null || true
API_PID=""
start_api
TEST_PHASE=read node tests/mssql-smoke.mjs
echo 'MSSQL persistence across backend restart: PASS'
