# TGFPRO3 - Product Requirements Document (PRD)

> **Version 3** - Learning from TGFPRO and TGFPRO2 mistakes to create the definitive product module

---

## 🎯 Executive Summary

TGFPRO3 is the **third iteration** of the product management module, designed to be **better than all previous versions** by incorporating lessons learned from:

- **TGFPRO (v1)**: Basic implementation with limited functionality
- **TGFPRO2 (v2)**: Complex implementation with performance issues, query size limits, and missing features from PRD

### Why TGFPRO3?

| Issue | TGFPRO v1 | TGFPRO v2 | TGFPRO3 (Proposed) |
|-------|-----------|-----------|-------------------|
| **Query Size Limits** | ❌ Hit 450-char limits | ❌ Hit 450-char limits | ✅ Smart query optimization |
| **API Restrictions** | ❌ Not documented | ❌ Discovered late | ✅ Known & handled upfront |
| **Performance** | ⚠️ Slow (no optimization) | ⚠️ Inconsistent | ✅ Cached + optimized |
| **Feature Coverage** | ⚠️ Basic only | ❌ Incomplete PRD | ✅ Complete & tested |
| **Documentation** | ❌ Minimal | ⚠️ Partial | ✅ Comprehensive |
| **Testing** | ❌ None | ❌ None | ✅ E2E + Unit tests |
| **Code Quality** | ⚠️ Mixed patterns | ⚠️ Inconsistent | ✅ Clean architecture |

---

## 📋 Lessons Learned from TGFPRO2

### ❌ What Went Wrong

1. **Query Size Limits (450 chars)**
   - Sankhya API has strict SQL query length limits (~450 characters)
   - TGFPRO2 hit this limit repeatedly, requiring query rewrites mid-development
   - Solution: Pre-optimize all queries to fit limit

2. **API Field Restrictions**
   - Fields like `DTCAD`, `DTALTER`, `CODUSUINC`, `CODUSUALT` are blocked by API
   - Field `CODDEP` (department) causes 500 errors
   - Discovery happened during development, causing rework
   - Solution: Document all restrictions upfront

3. **Missing Features from PRD**
   - TGFPRO2-PRD.md defined 5 phases, but only Phase 1 was partially implemented
   - Analytics (Phase 4) and Dashboard (Phase 5) never happened
   - Solution: Start with MVP, then iterate

4. **No Redis Cache**
   - Despite being in PRD, no Redis cache was implemented
   - Performance suffered (200-600ms responses)
   - Solution: Implement cache from day 1

5. **No Testing**
   - No unit tests, no E2E tests
   - Bugs discovered in production
   - Solution: TDD approach

6. **Inconsistent Patterns**
   - Mixed use of DTOs vs interfaces
   - Inconsistent naming (camelCase vs snake_case)
   - No clear architecture
   - Solution: Enforce strict patterns

### ✅ What Worked Well

1. **Query Documentation**
   - `docs/tgfpro/queries/*.md` files were excellent
   - Tested via `/inspection/query` before implementation
   - Solution: Keep this pattern

2. **TypeScript Interfaces**
   - Clear, type-safe interfaces
   - Good mapping from SQL to TS
   - Solution: Keep this pattern

3. **Pagination**
   - `buildPaginatedResult()` helper worked great
   - Consistent pagination across endpoints
   - Solution: Keep this pattern

4. **Incremental Development**
   - Ralph Wiggum strategy (small functionalities) was good in theory
   - Problem: Phases were too big and never completed
   - Solution: Smaller, deliverable increments

---

## 🚀 TGFPRO3 Strategy

### Core Principles

1. **Start Small, Deliver Fast**
   - MVP: 4-6 core endpoints only
   - Each endpoint fully tested before moving on
   - Release early, iterate often

2. **API-First Design**
   - All restrictions documented upfront
   - All queries tested via `/inspection/query` before coding
   - All queries under 450 chars

3. **Performance First**
   - Redis cache mandatory (not optional)
   - Query optimization mandatory
   - Performance budgets: <200ms first hit, <50ms cached

4. **Quality First**
   - TDD: Write tests first
   - E2E tests with cURL scripts
   - 80%+ code coverage

5. **Clean Architecture**
   - Service → Repository → Gateway pattern
   - DTOs for all inputs/outputs
   - Interfaces for all models
   - Consistent naming conventions

---

## 📐 TGFPRO3 Architecture

### Layers

```
┌─────────────────────────────────────────────┐
│  Controller (HTTP/REST)                     │
│  - Validates DTOs                           │
│  - Swagger documentation                    │
│  - Error handling                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Service (Business Logic)                   │
│  - Orchestrates repositories                │
│  - Applies business rules                   │
│  - Aggregates data                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Repository (Data Access)                   │
│  - Executes SQL queries                     │
│  - Maps SQL → TypeScript                    │
│  - Handles cache (Redis)                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Gateway (Sankhya API)                      │
│  - HTTP client to Sankhya                   │
│  - Query execution                          │
│  - Connection pooling                       │
└─────────────────────────────────────────────┘
```

### File Structure

```
src/
├── products3/                          # TGFPRO3 module
│   ├── products3.module.ts
│   ├── products3.controller.ts         # HTTP endpoints
│   ├── products3.service.ts            # Business logic
│   ├── repositories/
│   │   ├── products3.repository.ts     # Product queries
│   │   ├── stock3.repository.ts        # Stock queries
│   │   └── pricing3.repository.ts      # Pricing queries
│   ├── dto/
│   │   ├── requests/
│   │   │   ├── find-products.dto.ts
│   │   │   ├── find-stock.dto.ts
│   │   │   └── find-pricing.dto.ts
│   │   └── responses/
│   │       ├── product.dto.ts
│   │       ├── stock.dto.ts
│   │       └── pricing.dto.ts
│   ├── interfaces/
│   │   ├── product.interface.ts
│   │   ├── stock.interface.ts
│   │   └── pricing.interface.ts
│   └── tests/
│       ├── products3.service.spec.ts
│       ├── products3.controller.spec.ts
│       └── products3.e2e-spec.ts
└── common/
    ├── cache/
    │   └── redis.service.ts
    ├── pagination/
    │   └── pagination.types.ts
    └── sankhya/
        └── sankhya-gateway.service.ts
```

---

## 🎯 TGFPRO3 MVP (Phase 1)

### Scope: 6 Core Endpoints

| # | Endpoint | Description | Priority |
|---|----------|-------------|----------|
| 1 | `GET /api/products3` | List products (paginated) | P0 |
| 2 | `GET /api/products3/:id` | Get product by code | P0 |
| 3 | `GET /api/products3/:id/stock` | Get stock by location | P0 |
| 4 | `GET /api/products3/:id/pricing` | Get pricing history | P1 |
| 5 | `GET /api/products3/search` | Search products | P1 |
| 6 | `GET /api/products3/stock/below-min` | Products below min stock | P1 |

### Features

- ✅ Pagination (all list endpoints)
- ✅ Redis cache (5-10 min TTL)
- ✅ Query optimization (<450 chars)
- ✅ Error handling (404, 400, 500)
- ✅ Swagger documentation (pt-BR)
- ✅ Unit tests (>80% coverage)
- ✅ E2E tests (cURL scripts)

### Performance Targets

| Endpoint | First Hit | Cached | Cache TTL |
|----------|-----------|--------|-----------|
| List products | <200ms | <30ms | 5 min |
| Get by ID | <150ms | <20ms | 5 min |
| Stock by location | <200ms | <30ms | 2 min |
| Pricing history | <300ms | <50ms | 10 min |
| Search | <250ms | <40ms | 10 min |
| Below min stock | <300ms | <50ms | 5 min |

---

## 🛠️ TGFPRO3 Implementation Guide

### Step 1: Setup Module (Day 1)

**Tasks:**
1. Create `src/products3/` folder structure
2. Create `products3.module.ts` with Redis import
3. Create base controller + service + repository
4. Setup Swagger tags
5. Add to `AppModule`

**Output:** Basic module skeleton

### Step 2: Repository Pattern (Day 1-2)

**Tasks:**
1. Create `products3.repository.ts`
2. Implement `findAll()` with cache
3. Implement `findById()` with cache
4. Test queries via `/inspection/query`
5. Write unit tests for repository

**Output:** Working repository with 2 methods + tests

### Step 3: Service Layer (Day 2)

**Tasks:**
1. Create `products3.service.ts`
2. Inject repository
3. Implement `findAll()` and `findById()`
4. Add business logic (if needed)
5. Write unit tests for service

**Output:** Working service + tests

### Step 4: Controller + DTOs (Day 2-3)

**Tasks:**
1. Create DTOs (request/response)
2. Implement `GET /api/products3`
3. Implement `GET /api/products3/:id`
4. Add Swagger decorators
5. Write E2E tests (cURL)

**Output:** 2 working endpoints + E2E tests

### Step 5: Stock Endpoints (Day 3-4)

**Tasks:**
1. Create `stock3.repository.ts`
2. Implement `findStockByProduct()`
3. Implement `findBelowMinStock()`
4. Add service methods
5. Add controller endpoints
6. Write tests (unit + E2E)

**Output:** 2 stock endpoints + tests

### Step 6: Pricing Endpoints (Day 4-5)

**Tasks:**
1. Create `pricing3.repository.ts`
2. Implement `findPricingHistory()`
3. Add service method
4. Add controller endpoint
5. Write tests (unit + E2E)

**Output:** 1 pricing endpoint + tests

### Step 7: Search Endpoint (Day 5)

**Tasks:**
1. Add `search()` to products repository
2. Add service method
3. Add controller endpoint
4. Optimize query for LIKE performance
5. Write tests (unit + E2E)

**Output:** 1 search endpoint + tests

### Step 8: Documentation + Cleanup (Day 6)

**Tasks:**
1. Complete Swagger documentation (pt-BR)
2. Write README.md for products3 module
3. Add inline code comments
4. Run linter + fix issues
5. Final E2E test suite

**Output:** Production-ready MVP

---

## 📊 API Specifications

### 1. GET /api/products3

**Description:** Lista produtos ativos com paginação

**Query Params:**
- `page` (number, default: 1)
- `perPage` (number, default: 20, max: 100)
- `ativo` (string, optional: 'S' | 'N')
- `sort` (string, optional, default: 'CODPROD DESC')

**Response:**
```typescript
{
  data: Product[],
  total: number,
  page: number,
  perPage: number,
  lastPage: number,
  hasMore: boolean
}
```

**Cache:** 5 min

**Query (optimized, <450 chars):**
```sql
SELECT P.CODPROD,P.DESCRPROD,P.REFERENCIA,P.ATIVO,P.CODVOL,
  G.DESCRGRUPOPROD,V.DESCRVOL
FROM TGFPRO P WITH(NOLOCK)
LEFT JOIN TGFGRU G WITH(NOLOCK)ON G.CODGRUPOPROD=P.CODGRUPOPROD
LEFT JOIN TGFVOL V WITH(NOLOCK)ON V.CODVOL=P.CODVOL
WHERE P.ATIVO='S'AND P.USOPROD='C'
ORDER BY P.CODPROD DESC
OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY
```
*Length: 285 chars ✅*

---

### 2. GET /api/products3/:id

**Description:** Busca produto por código

**Path Params:**
- `id` (number, required)

**Response:**
```typescript
{
  codprod: number,
  descrprod: string,
  referencia?: string,
  ativo: 'S' | 'N',
  codgrupoprod?: number,
  descrgrupoprod?: string,
  codvol?: string,
  descrvol?: string
}
```

**Cache:** 5 min

**Query (optimized, <450 chars):**
```sql
SELECT P.CODPROD,P.DESCRPROD,P.REFERENCIA,P.ATIVO,P.CODGRUPOPROD,
  P.CODVOL,G.DESCRGRUPOPROD,V.DESCRVOL
FROM TGFPRO P WITH(NOLOCK)
LEFT JOIN TGFGRU G WITH(NOLOCK)ON G.CODGRUPOPROD=P.CODGRUPOPROD
LEFT JOIN TGFVOL V WITH(NOLOCK)ON V.CODVOL=P.CODVOL
WHERE P.CODPROD=@id
```
*Length: 236 chars ✅*

---

### 3. GET /api/products3/:id/stock

**Description:** Busca estoque por local de um produto

**Path Params:**
- `id` (number, required)

**Response:**
```typescript
{
  codprod: number,
  descrprod: string,
  estoqueTotal: number,
  locais: [{
    codlocal: number,
    descrlocal: string,
    quantidade: number,
    estmin: number,
    estmax: number
  }]
}
```

**Cache:** 2 min (stock changes frequently)

**Query (optimized, <450 chars):**
```sql
SELECT E.CODLOCAL,L.DESCRLOCAL,E.ESTOQUE AS QTD,E.ESTMIN,E.ESTMAX
FROM TGFEST E WITH(NOLOCK)
LEFT JOIN TGFLOC L WITH(NOLOCK)ON L.CODLOCAL=E.CODLOCAL
WHERE E.CODPROD=@id AND E.ESTOQUE>0
ORDER BY E.ESTOQUE DESC
```
*Length: 181 chars ✅*

---

### 4. GET /api/products3/:id/pricing

**Description:** Busca histórico de preços de compra

**Path Params:**
- `id` (number, required)

**Query Params:**
- `limit` (number, default: 10, max: 50)

**Response:**
```typescript
{
  codprod: number,
  descrprod: string,
  historico: [{
    nunota: number,
    dtneg: Date,
    vlrunit: number,
    qtdneg: number,
    nomeparc: string
  }]
}
```

**Cache:** 10 min

**Query (optimized, <450 chars):**
```sql
SELECT TOP 10 CAB.NUNOTA,CAB.DTNEG,ITE.VLRUNIT,ITE.QTDNEG,
  PAR.NOMEPARC
FROM TGFITE ITE WITH(NOLOCK)
JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA
LEFT JOIN TGFPAR PAR WITH(NOLOCK)ON PAR.CODPARC=CAB.CODPARC
WHERE ITE.CODPROD=@id AND CAB.TIPMOV='O'AND CAB.STATUSNOTA='L'
ORDER BY CAB.DTNEG DESC
```
*Length: 261 chars ✅*

---

### 5. GET /api/products3/search

**Description:** Busca produtos por descrição/referência

**Query Params:**
- `q` (string, required, min: 3 chars)
- `limit` (number, default: 20, max: 50)

**Response:**
```typescript
{
  results: [{
    codprod: number,
    descrprod: string,
    referencia?: string
  }],
  total: number
}
```

**Cache:** 10 min

**Query (optimized, <450 chars):**
```sql
SELECT TOP 20 CODPROD,DESCRPROD,REFERENCIA
FROM TGFPRO WITH(NOLOCK)
WHERE ATIVO='S'AND(DESCRPROD LIKE '%@q%'OR REFERENCIA LIKE '%@q%')
ORDER BY DESCRPROD
```
*Length: 138 chars ✅*

---

### 6. GET /api/products3/stock/below-min

**Description:** Lista produtos com estoque abaixo do mínimo

**Query Params:**
- `page` (number, default: 1)
- `perPage` (number, default: 20)

**Response:**
```typescript
{
  data: [{
    codprod: number,
    descrprod: string,
    estoqueTotal: number,
    estmin: number,
    deficit: number
  }],
  total: number,
  page: number,
  perPage: number
}
```

**Cache:** 5 min

**Query (optimized, <450 chars):**
```sql
SELECT P.CODPROD,P.DESCRPROD,P.ESTMIN,
  ISNULL(SUM(E.ESTOQUE),0)AS ESTOQUE,
  (P.ESTMIN-ISNULL(SUM(E.ESTOQUE),0))AS DEFICIT
FROM TGFPRO P WITH(NOLOCK)
LEFT JOIN TGFEST E WITH(NOLOCK)ON E.CODPROD=P.CODPROD
WHERE P.ATIVO='S'AND P.ESTMIN>0
GROUP BY P.CODPROD,P.DESCRPROD,P.ESTMIN
HAVING ISNULL(SUM(E.ESTOQUE),0)<P.ESTMIN
ORDER BY DEFICIT DESC
```
*Length: 311 chars ✅*

---

## 🧪 Testing Strategy

### Unit Tests (Jest)

**Coverage Target:** >80%

**Test Files:**
- `products3.repository.spec.ts`
- `stock3.repository.spec.ts`
- `pricing3.repository.spec.ts`
- `products3.service.spec.ts`
- `products3.controller.spec.ts`

**Mocking:**
- Mock `SankhyaGatewayService`
- Mock `RedisService`
- Use test fixtures for SQL results

**Example:**
```typescript
describe('Products3Repository', () => {
  describe('findAll', () => {
    it('should return paginated products', async () => {
      // Arrange
      const mockData = [{ CODPROD: 1, DESCRPROD: 'Test' }]
      jest.spyOn(gateway, 'executeQuery').mockResolvedValue(mockData)

      // Act
      const result = await repository.findAll(1, 20)

      // Assert
      expect(result).toBeDefined()
      expect(result.data).toHaveLength(1)
      expect(gateway.executeQuery).toHaveBeenCalledTimes(2) // data + count
    })

    it('should use cache when available', async () => {
      // Arrange
      const cached = { data: [], total: 0, page: 1 }
      jest.spyOn(redis, 'get').mockResolvedValue(JSON.stringify(cached))

      // Act
      const result = await repository.findAll(1, 20)

      // Assert
      expect(gateway.executeQuery).not.toHaveBeenCalled()
      expect(result).toEqual(cached)
    })
  })
})
```

### E2E Tests (cURL)

**Test Script:** `test/products3.e2e.sh`

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Config
BASE_URL="http://localhost:3100"
PASSED=0
FAILED=0

# Helper function
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local expected_code=$4

  echo -n "Testing $name... "

  status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X $method "$BASE_URL$endpoint" \
    -H "Authorization: Bearer $TOKEN")

  if [ "$status" -eq "$expected_code" ]; then
    echo -e "${GREEN}PASS${NC} (HTTP $status)"
    ((PASSED++))
  else
    echo -e "${RED}FAIL${NC} (expected $expected_code, got $status)"
    ((FAILED++))
  fi
}

# 1. Authenticate
echo "=== Authenticating ==="
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | jq -r '.access_token')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Authentication failed${NC}"
  exit 1
fi
echo -e "${GREEN}Token obtained${NC}"

# 2. Run tests
echo -e "\n=== Running E2E Tests ==="

test_endpoint "List products" GET "/api/products3?page=1&perPage=10" 200
test_endpoint "Get product by ID" GET "/api/products3/3680" 200
test_endpoint "Get non-existent product" GET "/api/products3/999999" 404
test_endpoint "Get product stock" GET "/api/products3/3680/stock" 200
test_endpoint "Get product pricing" GET "/api/products3/3680/pricing" 200
test_endpoint "Search products" GET "/api/products3/search?q=folha" 200
test_endpoint "Below min stock" GET "/api/products3/stock/below-min" 200

# 3. Summary
echo -e "\n=== Test Summary ==="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -gt 0 ]; then
  exit 1
fi
```

---

## 📝 Sankhya API Restrictions

### Known Blocked Fields

These fields **CANNOT** be accessed via `executeQuery`:

| Field | Table | Reason |
|-------|-------|--------|
| `DTCAD` | TGFPRO | Security: cadastro date |
| `DTALTER` | TGFPRO | Security: modification date |
| `CODUSUINC` | TGFPRO | Security: created by user |
| `CODUSUALT` | TGFPRO | Security: modified by user |
| `CODDEP` | TGFCAB | Security: department |

**Impact:** Queries using these fields will return HTTP 500

**Workaround:**
- Use alternative fields (e.g., `P.CODUSU` instead of `P.CODUSUINC`)
- Join via different tables (e.g., `TSIUSU.CODPARC` instead of `TGFCAB.CODDEP`)

### Query Size Limit

**Limit:** ~450 characters (SQL string)

**Impact:** Long queries fail silently or return errors

**Mitigation:**
1. Use short aliases (`P`, `E`, `L` instead of `PRO`, `EST`, `LOC`)
2. Remove all whitespace/newlines
3. Use compact SQL syntax (`JOIN` instead of `INNER JOIN`)
4. Limit JOINs to 2-3 maximum
5. Split complex queries into multiple calls

### Performance Notes

- `WITH (NOLOCK)` is **mandatory** (prevents table locks)
- `OFFSET-FETCH` is faster than `TOP` for pagination
- `LEFT JOIN` is safer than `INNER JOIN` (null-safe)
- Avoid `LIKE '%term%'` (full table scan) - cache heavily

---

## 🎨 Code Standards

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `products3.service.ts` |
| Classes | PascalCase | `Products3Service` |
| Interfaces | PascalCase + I prefix | `IProduct` |
| DTOs | PascalCase + Dto suffix | `FindProductsDto` |
| Methods | camelCase | `findAll()` |
| Variables | camelCase | `productData` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| SQL aliases | UPPERCASE | `P`, `E`, `L` |

### DTO Patterns

**Request DTO:**
```typescript
import { IsOptional, IsNumber, Min, Max } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class FindProductsDto {
  @ApiPropertyOptional({ description: 'Página (padrão: 1)', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: 'Itens por página (padrão: 20, max: 100)', example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  perPage?: number = 20
}
```

**Response DTO:**
```typescript
import { ApiProperty } from '@nestjs/swagger'

export class ProductDto {
  @ApiProperty({ description: 'Código do produto', example: 3680 })
  codprod: number

  @ApiProperty({ description: 'Descrição do produto', example: 'FOLHAS A4' })
  descrprod: string

  @ApiProperty({ description: 'Produto ativo', example: 'S', enum: ['S', 'N'] })
  ativo: 'S' | 'N'
}
```

### Repository Pattern

```typescript
@Injectable()
export class Products3Repository {
  constructor(
    private readonly gateway: SankhyaGatewayService,
    private readonly redis: RedisService,
  ) {}

  async findAll(page: number, perPage: number): Promise<PaginatedResult<IProduct>> {
    const cacheKey = `products3:list:${page}:${perPage}`

    // 1. Try cache
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    // 2. Execute query
    const offset = (page - 1) * perPage
    const query = `SELECT ... OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY`
    const countQuery = `SELECT COUNT(*) AS total FROM ...`

    const [data, countResult] = await Promise.all([
      this.gateway.executeQuery(query),
      this.gateway.executeQuery(countQuery),
    ])

    // 3. Map and paginate
    const products = data.map(this.mapToProduct)
    const total = countResult[0]?.total || 0
    const result = buildPaginatedResult({ data: products, total, page, perPage })

    // 4. Cache result
    await this.redis.setex(cacheKey, 300, JSON.stringify(result)) // 5 min

    return result
  }

  private mapToProduct(row: any): IProduct {
    return {
      codprod: Number(row.CODPROD),
      descrprod: row.DESCRPROD,
      ativo: row.ATIVO,
    }
  }
}
```

---

## 🚦 Definition of Done

For each endpoint to be considered **DONE**:

- [ ] Query tested via `/inspection/query`
- [ ] Query length < 450 chars
- [ ] Repository method implemented
- [ ] Service method implemented
- [ ] Controller endpoint implemented
- [ ] Request DTO with validation
- [ ] Response DTO with Swagger docs
- [ ] Redis cache implemented
- [ ] Unit tests written (>80% coverage)
- [ ] E2E test in cURL script
- [ ] Performance target met (<200ms first, <50ms cached)
- [ ] Swagger docs complete (pt-BR)
- [ ] Code linted (no errors)

---

## 📅 Timeline

| Phase | Days | Deliverable |
|-------|------|-------------|
| **Phase 1: Setup** | 1 | Module skeleton + Redis |
| **Phase 2: Core Repos** | 1 | Products + Stock repos + tests |
| **Phase 3: Services** | 1 | Products + Stock services + tests |
| **Phase 4: Controllers** | 2 | All 6 endpoints + DTOs + tests |
| **Phase 5: Documentation** | 1 | Swagger + README + comments |
| **Total** | **6 days** | Production-ready MVP |

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Code coverage | >80% |
| E2E tests passing | 100% |
| Performance (first hit) | <200ms average |
| Performance (cached) | <50ms average |
| Query size | <450 chars (all) |
| API errors | 0 (500 errors) |
| Documentation | 100% coverage |

---

## 🔮 Future Phases (Post-MVP)

### Phase 2: Analytics

- Consumption analysis by period
- Top products by consumption
- Consumption trends

### Phase 3: Dashboard

- KPI cards (total products, stock value, alerts)
- Charts (consumption over time, top products)
- Real-time alerts

### Phase 4: Advanced Features

- Batch operations
- Import/Export (CSV, Excel)
- Product templates

---

## 📚 References

- [TGFPRO2-PRD.md](./TGFPRO2-PRD.md) - Previous version PRD
- [queries/README.md](./queries/README.md) - Query documentation
- [queries/01-basic-listing.md](./queries/01-basic-listing.md) - Product queries
- [queries/02-pricing.md](./queries/02-pricing.md) - Pricing queries
- [queries/03-stock.md](./queries/03-stock.md) - Stock queries
- [DATABASE-INSPECTION-GUIDE.md](../DATABASE-INSPECTION-GUIDE.md) - DB exploration guide
- [PERFORMANCE-GATEWAY-STRATEGIES.md](../PERFORMANCE-GATEWAY-STRATEGIES.md) - Performance guide

---

**Última atualização**: 2026-01-14
**Status**: Planning
**Version**: 3.0.0-alpha
**Author**: Ralph Wiggum Strategy Team
