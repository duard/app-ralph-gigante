# MICRO-PRD 02: Backend Endpoint GET /tgfpro2/produtos/detalhados

**Status**: 🟡 In Progress
**Priority**: P0 (Blocker)
**Estimated Time**: 2-3 hours
**Dependencies**: MICRO-PRD-01 (DTO types) ✅

---

## Objective

Implement the main backend endpoint that returns paginated list of products with rich aggregated data including stock, price analysis, and consumption indicators.

---

## Requirements

### 1. Controller Method

**File**: `src/sankhya/tgfpro2/tgfpro2.controller.ts`

Add new endpoint method:

```typescript
@Get('produtos/detalhados')
@ApiOperation({
  summary: 'Lista produtos com dados detalhados agregados',
  description: 'Retorna produtos com estoque, análise de preço (últimos 6 meses), consumo e variações CONTROLE'
})
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página', example: 1 })
@ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Itens por página (max 100)', example: 50 })
@ApiQuery({ name: 'search', required: false, type: String, description: 'Busca em descrição e marca' })
@ApiQuery({ name: 'ativo', required: false, enum: ['S', 'N'], description: 'Filtrar por status' })
@ApiQuery({ name: 'tipcontest', required: false, type: String, description: 'Filtrar por tipo controle (N/S/E/L/P)' })
@ApiQuery({ name: 'marca', required: false, type: String, description: 'Filtrar por marca (partial match)' })
@ApiQuery({ name: 'codgrupoprod', required: false, type: Number, description: 'Filtrar por código do grupo' })
@ApiQuery({ name: 'temEstoque', required: false, type: Boolean, description: 'Filtrar produtos com/sem estoque' })
@ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Campo para ordenação', example: 'DESCRPROD' })
@ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Direção da ordenação' })
@ApiResponse({ status: 200, type: ProdutosDetalhadosResponseDto })
async getProdutosDetalhados(
  @Query('page') page?: number,
  @Query('pageSize') pageSize?: number,
  @Query('search') search?: string,
  @Query('ativo') ativo?: 'S' | 'N',
  @Query('tipcontest') tipcontest?: string,
  @Query('marca') marca?: string,
  @Query('codgrupoprod') codgrupoprod?: number,
  @Query('temEstoque') temEstoque?: boolean,
  @Query('sortBy') sortBy?: string,
  @Query('sortOrder') sortOrder?: 'asc' | 'desc',
): Promise<ProdutosDetalhadosResponseDto> {
  return this.tgfpro2Service.getProdutosDetalhados({
    page: page || 1,
    pageSize: Math.min(pageSize || 50, 100), // Max 100 items per page
    search,
    ativo,
    tipcontest,
    marca,
    codgrupoprod,
    temEstoque,
    sortBy: sortBy || 'DESCRPROD',
    sortOrder: sortOrder || 'asc',
  });
}
```

### 2. Service Method

**File**: `src/sankhya/tgfpro2/tgfpro2.service.ts`

Add new service method `getProdutosDetalhados()`:

**Strategy**:
1. Build SQL query with CTEs for performance
2. Apply filters dynamically
3. Calculate totals for stats
4. Return paginated results with meta and stats

**SQL Query Structure**:

```sql
WITH EstoquePorProduto AS (
  SELECT
    E.CODPROD,
    SUM(E.ESTOQUE) AS ESTOQUE_TOTAL
  FROM TGFEST E WITH(NOLOCK)
  WHERE E.ATIVO = 'S'
  GROUP BY E.CODPROD
),
ComprasRecentes AS (
  SELECT
    ITE.CODPROD,
    COUNT(DISTINCT ITE.NUNOTA) AS QTD_COMPRAS,
    MIN(ITE.VLRUNIT) AS PRECO_MIN,
    MAX(ITE.VLRUNIT) AS PRECO_MAX,
    SUM(ITE.VLRTOT) AS TOTAL_GASTO,
    SUM(ITE.QTDNEG) AS TOTAL_QTD,
    SUM(ITE.VLRTOT) / NULLIF(SUM(ITE.QTDNEG), 0) AS PRECO_MEDIO,
    -- First and last purchase for trend calculation
    MIN(CAB.DTNEG) AS PRIMEIRA_COMPRA_DATA,
    MAX(CAB.DTNEG) AS ULTIMA_COMPRA_DATA
  FROM TGFITE ITE WITH(NOLOCK)
  JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
  WHERE CAB.TIPMOV = 'C'
    AND CAB.STATUSNOTA = 'L'
    AND ITE.ATUALESTOQUE > 0
    AND CAB.DTNEG >= DATEADD(MONTH, -6, GETDATE())
  GROUP BY ITE.CODPROD
),
PrimeiraUltimaCompra AS (
  SELECT
    ITE.CODPROD,
    -- First purchase price
    (SELECT TOP 1 ITE2.VLRUNIT
     FROM TGFITE ITE2 WITH(NOLOCK)
     JOIN TGFCAB CAB2 WITH(NOLOCK) ON CAB2.NUNOTA = ITE2.NUNOTA
     WHERE ITE2.CODPROD = ITE.CODPROD
       AND CAB2.TIPMOV = 'C'
       AND CAB2.STATUSNOTA = 'L'
       AND ITE2.ATUALESTOQUE > 0
       AND CAB2.DTNEG >= DATEADD(MONTH, -6, GETDATE())
     ORDER BY CAB2.DTNEG ASC) AS PRECO_PRIMEIRA,
    -- Last purchase price
    (SELECT TOP 1 ITE2.VLRUNIT
     FROM TGFITE ITE2 WITH(NOLOCK)
     JOIN TGFCAB CAB2 WITH(NOLOCK) ON CAB2.NUNOTA = ITE2.NUNOTA
     WHERE ITE2.CODPROD = ITE.CODPROD
       AND CAB2.TIPMOV = 'C'
       AND CAB2.STATUSNOTA = 'L'
       AND ITE2.ATUALESTOQUE > 0
       AND CAB2.DTNEG >= DATEADD(MONTH, -6, GETDATE())
     ORDER BY CAB2.DTNEG DESC) AS PRECO_ULTIMA
  FROM TGFPRO ITE WITH(NOLOCK)
  WHERE ITE.CODPROD IN (SELECT CODPROD FROM ComprasRecentes)
)
SELECT
  -- Basic Info
  P.CODPROD,
  P.DESCRPROD,
  P.MARCA,
  P.CODGRUPOPROD,
  G.DESCRGRUPOPROD,
  P.ATIVO,

  -- Control System
  P.TIPCONTEST,
  P.LISCONTEST,
  CASE WHEN P.TIPCONTEST <> 'N' THEN 1 ELSE 0 END AS HAS_CONTROLE,
  -- Count controle variations (approximate)
  CASE
    WHEN P.TIPCONTEST = 'N' THEN 0
    WHEN P.LISCONTEST IS NOT NULL THEN LEN(P.LISCONTEST) - LEN(REPLACE(P.LISCONTEST, ';', '')) + 1
    ELSE 1
  END AS CONTROLE_COUNT,

  -- Stock Data
  ISNULL(E.ESTOQUE_TOTAL, 0) AS ESTOQUE_TOTAL,
  CASE WHEN ISNULL(E.ESTOQUE_TOTAL, 0) > 0 THEN 1 ELSE 0 END AS TEM_ESTOQUE,

  -- Price Analysis
  CR.PRECO_MEDIO AS PRECO_MEDIO_PONDERADO,
  PU.PRECO_ULTIMA AS PRECO_ULTIMA_COMPRA,
  CR.PRECO_MIN AS PRECO_MINIMO,
  CR.PRECO_MAX AS PRECO_MAXIMO,

  -- Price variation calculation
  CASE
    WHEN PU.PRECO_PRIMEIRA > 0 AND PU.PRECO_ULTIMA IS NOT NULL
    THEN ((PU.PRECO_ULTIMA - PU.PRECO_PRIMEIRA) / PU.PRECO_PRIMEIRA) * 100
    ELSE NULL
  END AS VARIACAO_PRECO_PERCENTUAL,

  -- Price trend
  CASE
    WHEN PU.PRECO_PRIMEIRA IS NULL OR PU.PRECO_ULTIMA IS NULL THEN NULL
    WHEN ABS(((PU.PRECO_ULTIMA - PU.PRECO_PRIMEIRA) / PU.PRECO_PRIMEIRA) * 100) < 2 THEN 'ESTAVEL'
    WHEN PU.PRECO_ULTIMA > PU.PRECO_PRIMEIRA THEN 'AUMENTO'
    ELSE 'QUEDA'
  END AS TENDENCIA_PRECO,

  -- Consumption Indicators
  ISNULL(CR.QTD_COMPRAS, 0) AS QTD_COMPRAS_6M,
  ISNULL(CR.TOTAL_GASTO, 0) AS TOTAL_GASTO_6M,

  -- Metadata
  P.DTALTER,
  USUALT.NOMEUSU AS NOMEUSU_ALT

FROM TGFPRO P WITH(NOLOCK)
LEFT JOIN TGFGRU G WITH(NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
LEFT JOIN EstoquePorProduto E ON E.CODPROD = P.CODPROD
LEFT JOIN ComprasRecentes CR ON CR.CODPROD = P.CODPROD
LEFT JOIN PrimeiraUltimaCompra PU ON PU.CODPROD = P.CODPROD
LEFT JOIN TSIUSU USUALT WITH(NOLOCK) ON USUALT.CODUSU = P.CODUSUALT

WHERE 1=1
  -- Apply filters dynamically
ORDER BY P.DESCRPROD
OFFSET @offset ROWS
FETCH NEXT @pageSize ROWS ONLY
```

**Implementation Notes**:
- Use parameterized queries to prevent SQL injection
- Apply filters conditionally (only add WHERE clauses if filter is provided)
- Calculate stats separately (total products, com estoque, etc.)
- Handle NULL values gracefully

### 3. Stats Calculation

Calculate stats in a separate query:

```sql
SELECT
  COUNT(*) AS TOTAL_PRODUTOS,
  SUM(CASE WHEN ESTOQUE > 0 THEN 1 ELSE 0 END) AS COM_ESTOQUE,
  SUM(CASE WHEN ESTOQUE = 0 THEN 1 ELSE 0 END) AS SEM_ESTOQUE,
  SUM(CASE WHEN TIPCONTEST <> 'N' THEN 1 ELSE 0 END) AS COM_CONTROLE,
  SUM(CASE WHEN ATIVO = 'S' THEN 1 ELSE 0 END) AS ATIVOS,
  SUM(CASE WHEN ATIVO = 'N' THEN 1 ELSE 0 END) AS INATIVOS
FROM (
  SELECT
    P.ATIVO,
    P.TIPCONTEST,
    ISNULL((SELECT SUM(E.ESTOQUE) FROM TGFEST E WHERE E.CODPROD = P.CODPROD AND E.ATIVO = 'S'), 0) AS ESTOQUE
  FROM TGFPRO P
  WHERE 1=1
    -- Apply same filters as main query
) AS Stats
```

---

## Acceptance Criteria

- [ ] Endpoint added to controller with proper decorators
- [ ] Service method implements SQL query with CTEs
- [ ] Filters work correctly (search, ativo, tipcontest, marca, grupo, temEstoque)
- [ ] Pagination works (page, pageSize, offset/fetch)
- [ ] Sorting works (sortBy, sortOrder)
- [ ] Stats calculation returns correct counts
- [ ] Response matches ProdutosDetalhadosResponseDto structure
- [ ] No SQL injection vulnerabilities
- [ ] Build passes without errors
- [ ] Swagger documentation auto-generated

---

## Testing

### Manual Testing

Test with validated products from DOCUMENTACAO-FINAL-COMPLETA.md:

```bash
# Get token
TOKEN=$(node src/utils/getToken.js)

# Test 1: Basic request (first page)
curl -X GET "http://localhost:3100/tgfpro2/produtos/detalhados?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 2: Filter by marca
curl -X GET "http://localhost:3100/tgfpro2/produtos/detalhados?marca=VOLK&page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 3: Filter by tipcontest (only simple products)
curl -X GET "http://localhost:3100/tgfpro2/produtos/detalhados?tipcontest=N&page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 4: Filter by temEstoque (only with stock)
curl -X GET "http://localhost:3100/tgfpro2/produtos/detalhados?temEstoque=true&page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 5: Search
curl -X GET "http://localhost:3100/tgfpro2/produtos/detalhados?search=LUVA&page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 6: Sorting
curl -X GET "http://localhost:3100/tgfpro2/produtos/detalhados?sortBy=DESCRPROD&sortOrder=desc&page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Verify response structure
curl -X GET "http://localhost:3100/tgfpro2/produtos/detalhados?page=1&pageSize=1" \
  -H "Authorization: Bearer $TOKEN" | jq '{
    hasData: (.data | length > 0),
    hasMeta: .meta != null,
    hasStats: .stats != null,
    firstProduct: .data[0]
  }'
```

Expected response structure:
```json
{
  "data": [
    {
      "codprod": 3680,
      "descrprod": "...",
      "marca": "...",
      "estoqueTotal": 175,
      "precoMedioPonderado": 22.5,
      "tendenciaPreco": "QUEDA",
      ...
    }
  ],
  "meta": {
    "total": 13281,
    "page": 1,
    "pageSize": 50,
    "totalPages": 266
  },
  "stats": {
    "totalProdutos": 13281,
    "comEstoque": 4920,
    "semEstoque": 8361,
    "comControle": 2407,
    "ativos": 11500,
    "inativos": 1781
  }
}
```

---

## Commit Message

```
feat(tgfpro2): implement GET /produtos/detalhados endpoint

- Add controller method with query parameters and Swagger docs
- Implement service method with complex SQL query using CTEs
- Support filters: search, ativo, tipcontest, marca, grupo, temEstoque
- Implement pagination with offset/fetch
- Add sorting by any field (asc/desc)
- Calculate stats (total, comEstoque, comControle, ativos, inativos)
- Include price analysis (last 6 months): min, max, average, trend
- Include stock totals and consumption indicators

Query optimizations:
- Use CTEs for better readability and performance
- Index-friendly WHERE clauses
- Parameterized queries to prevent SQL injection

Related to ULTRA-PLAN-PRODUTOS-DETALHADOS.md - Phase 1
```
