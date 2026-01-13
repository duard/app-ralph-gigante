#!/usr/bin/env bash
# Run the SQL for product 9558 and save a JSON response (requires jq)
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SQL_FILE="$ROOT_DIR/consumo_9558_202510_202512.sql"
OUT_FILE="$ROOT_DIR/consumo_9558_202510_202512_response.json"

TOKEN=$(curl -s -X POST 'https://api-dbexplorer-nestjs-production.gigantao.net/auth/login' -H 'Content-Type: application/json' -d '{"username":"CONVIDADO","password":"guest123"}' | jq -r '.access_token')

SQL_TEXT=$(sed "s/'/''/g" "$SQL_FILE")

curl -s -X POST 'https://api-dbexplorer-nestjs-production.gigantao.net/inspection/query' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"query\": \"$SQL_TEXT\", \"params\": []}" > "$OUT_FILE"

echo "Wrote $OUT_FILE"
