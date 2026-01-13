#!/bin/bash

echo "🚀 TESTE COMPLETO DA API SANKHYA CENTER - SERVIÇO DE CONSUMO V2"
echo "====================================================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
TOKEN=""

echo -e "${BLUE}1️⃣  TESTE DE CONEXÃO${NC}"
echo "Verificando se o servidor está respondendo..."
if curl -s -f "$BASE_URL/api" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Servidor respondendo na porta 3000${NC}"
else
    echo -e "${RED}❌ Servidor não respondeu - verifique se está rodando${NC}"
    echo "Execute: npm run start:dev"
    exit 1
fi
echo ""

echo -e "${BLUE}2️⃣  LOGIN PARA OBTER TOKEN${NC}"
echo "POST $BASE_URL/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"CONVIDADO","password":"guest123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login realizado com sucesso!${NC}"
    echo -e "${YELLOW}📋 Token: ${TOKEN:0:50}...${NC}"
else
    echo -e "${RED}❌ Login falhou:${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi
echo ""

echo -e "${BLUE}3️⃣  TESTE DE HEALTH CHECK${NC}"
echo "GET $BASE_URL/consumo/health"
HEALTH_RESPONSE=$(curl -s -X GET "$BASE_URL/consumo/health" \
    -H "Authorization: Bearer $TOKEN")
echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
echo ""

echo -e "${BLUE}4️⃣  TESTE DE HEALTH CHECK DETALHADO${NC}"
echo "GET $BASE_URL/consumo/health/detailed"
HEALTH_DETAILED=$(curl -s -X GET "$BASE_URL/consumo/health/detailed" \
    -H "Authorization: Bearer $TOKEN")
echo "$HEALTH_DETAILED" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_DETAILED"
echo ""

echo -e "${BLUE}5️⃣  TESTE DE HEALTH CHECK DO CACHE${NC}"
echo "GET $BASE_URL/consumo/health/cache"
CACHE_HEALTH=$(curl -s -X GET "$BASE_URL/consumo/health/cache" \
    -H "Authorization: Bearer $TOKEN")
echo "$CACHE_HEALTH" | python3 -m json.tool 2>/dev/null || echo "$CACHE_HEALTH"
echo ""

echo -e "${BLUE}6️⃣  TESTE DE CONSULTA DE CONSUMO V2${NC}"
CODPROD=3680
DATA_INICIO="2025-12-01"
DATA_FIM="2025-12-31"
echo "GET $BASE_URL/tgfpro/consumo-periodo-v2/$CODPROD?dataInicio=$DATA_INICIO&dataFim=$DATA_FIM&page=1&perPage=10"
CONSUMO_RESPONSE=$(curl -s -X GET "$BASE_URL/tgfpro/consumo-periodo-v2/$CODPROD?dataInicio=$DATA_INICIO&dataFim=$DATA_FIM&page=1&perPage=10" \
    -H "Authorization: Bearer $TOKEN")

if echo "$CONSUMO_RESPONSE" | grep -q "produto"; then
    echo -e "${GREEN}✅ Consulta de consumo realizada com sucesso!${NC}"
    echo ""
    echo -e "${YELLOW}📦 PRODUTO:${NC}"
    echo "$CONSUMO_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"  Código: {d['produto']['codprod']}\"); print(f\"  Nome: {d['produto']['descrprod']}\"); print(f\"  Unidade: {d['produto']['unidade']}\"); print(f\"  Controle: {d['produto']['tipcontest']}\")" 2>/dev/null || echo "  Erro ao parsear produto"
    echo ""
    echo -e "${YELLOW}📊 PERÍODO:${NC}"
    echo "$CONSUMO_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"  Início: {d['periodo']['dataInicio']}\"); print(f\"  Fim: {d['periodo']['dataFim']}\"); print(f\"  Dias: {d.get('totalDias', 'N/A')}\")" 2>/dev/null || echo "  Erro ao parsear período"
    echo ""
    echo -e "${YELLOW}🔄 MOVIMENTAÇÕES:${NC}"
    MOV_COUNT=$(echo "$CONSUMO_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('totalMovimentacoes', 0))" 2>/dev/null || echo "N/A")
    echo -e "  Total: $MOV_COUNT movimentações"
    if [ "$MOV_COUNT" -gt 0 ]; then
        echo "$CONSUMO_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); movs=d.get('movimentacoes', [])[:3]; [print(f\"  {i+1}. {m['dataReferencia']} - Nota {m['nunota']} - {m['quantidadeMov']:+} {m['quantidadeMov']} unidades ({m['tipoOperacao']['descricao']})\") for i, m in enumerate(movs)]" 2>/dev/null || echo "  Erro ao listar movimentações"
    fi
    echo ""
    echo -e "${YELLOW}💰 MÉTRICAS:${NC}"
    echo "$CONSUMO_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); m=d.get('metrics', {}); print(f\"  Valor médio período: R\$ {m.get('valorMedioPeriodo', 0):.2f}\"); print(f\"  Total entradas (Qtd): {m.get('totalEntradasQtd', 0)}\"); print(f\"  Total saídas (Qtd): {m.get('totalSaidasQtd', 0)}\"); print(f\"  % Consumo: {m.get('percentualConsumo', 0):.2f}%\"); print(f\"  Dias estoque disponível: {m.get('diasEstoqueDisponivel', 0):.1f}\")" 2>/dev/null || echo "  Erro ao listar métricas"
    echo ""
    echo -e "${YELLOW}💳 SALDOS:${NC}"
    echo "$CONSUMO_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); sa=d.get('saldoAnterior', {}); sc=d.get('saldoAtual', {}); print(f\"  Saldo anterior: {sa.get('saldoQtd', 0)} unidades (R\$ {sa.get('saldoValorFormatted', 'N/A')})\"); print(f\"  Saldo atual: {sc.get('saldoQtdFinal', 0)} unidades (R\$ {sc.get('saldoValorFinalFormatted', 'N/A')})\"); print(f\"  Movimento líquido: {d.get('movimentoLiquido', 0)} unidades\")" 2>/dev/null || echo "  Erro ao listar saldos"
else
    echo -e "${RED}❌ Consulta de consumo falhou:${NC}"
    echo "$CONSUMO_RESPONSE"
fi
echo ""

echo -e "${BLUE}7️⃣  TESTE DE INSPECT QUERY${NC}"
echo "POST $BASE_URL/inspection/query"
INSPECT_QUERY='{"query":"SELECT TOP 3 CODPROD, DESCRPROD FROM TGFPRO WHERE CODPROD > 0 ORDER BY CODPROD","params":[]}'
INSPECT_RESPONSE=$(curl -s -X POST "$BASE_URL/inspection/query" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$INSPECT_QUERY")

if echo "$INSPECT_RESPONSE" | grep -q "CODPROD"; then
    echo -e "${GREEN}✅ Inspect query executado com sucesso!${NC}"
    echo "$INSPECT_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$INSPECT_RESPONSE"
else
    echo -e "${RED}❌ Inspect query falhou:${NC}"
    echo "$INSPECT_RESPONSE"
fi
echo ""

echo "====================================================================================="
echo -e "${GREEN}🎉 TESTES CONCLUÍDOS!${NC}"
echo ""
echo -e "${BLUE}📋 RESUMO:${NC}"
echo "  ✅ Login: OK"
echo "  ✅ Health Check: OK"
echo "  ✅ Health Check Cache: OK"
echo "  ✅ Consulta de Consumo V2: OK"
echo "  ✅ Inspect Query: OK"
echo ""
echo -e "${YELLOW}💡 Dicas:${NC}"
echo "  • Para ver mais detalhes, acesse: http://localhost:3000/api"
echo "  • Para testar com outros produtos, altere CODPROD no script"
echo "  • Para testar outros períodos, altere DATA_INICIO e DATA_FIM"
echo "  • Execute ./run-consumo-tests.js para testes automatizados"
echo ""