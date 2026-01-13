#!/usr/bin/env bash
set -euo pipefail
# run_consumo_produto.sh <CODPROD> <DT_START> <DT_END>
# Example: ./run_consumo_produto.sh 3680 2025-12-01 2025-12-31

CODPROD=${1:-3680}
DT_START=${2:-'2025-12-01'}
DT_END=${3:-'2025-12-31'}

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$BASE_DIR/output_${CODPROD}_${DT_START}_${DT_END}"
mkdir -p "$OUT_DIR"

# get token
TOKEN=$(curl -s -X POST 'https://api-dbexplorer-nestjs-production.gigantao.net/auth/login' -H 'Content-Type: application/json' -d '{"username":"CONVIDADO","password":"guest123"}' | jq -r '.access_token')

# embed SQL template and set parameters by replace
SQL_TEMPLATE="$BASE_DIR/consumo_produto_template.sql"
SQL_TEXT=$(sed "s/@codprod INT = [0-9]\+/@codprod INT = ${CODPROD}/" "$SQL_TEMPLATE" | sed "s/@dt_start DATETIME = '[^']\+'/@dt_start DATETIME = '${DT_START}/" | sed "s/@dt_end DATETIME   = '[^']\+'/@dt_end DATETIME   = '${DT_END} 23:59:59'/")

# send
PAYLOAD=$(jq -n --arg q "$SQL_TEXT" '{query:$q, params:[]}')

curl -s -X POST 'https://api-dbexplorer-nestjs-production.gigantao.net/inspection/query' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "$PAYLOAD" > "$OUT_DIR/consumo_${CODPROD}_${DT_START}_${DT_END}_response.json"

echo "Wrote $OUT_DIR/consumo_${CODPROD}_${DT_START}_${DT_END}_response.json"
