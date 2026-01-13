# TGFPRO2 - Product Requirements Document (PRD)

## 🎯 Objetivo

Desenvolver módulo completo de produtos (TGFPRO2) com queries otimizadas, cache estratégico e funcionalidades incrementais seguindo **estratégia Ralph** (small functionalities, continuous development).

---

## 📋 Visão Geral

**Módulo**: TGFPRO2 (Products v2)
**Database**: Sankhya ERP via Gateway
**Framework**: NestJS + TypeScript 5.0+
**Estratégia**: Ralph Wiggum (incremental phases with tests)
**Linguagem**: Código em inglês, user-facing em pt-BR

---

## 🚀 Fases de Desenvolvimento

### Phase 1: Basic Listing (Listagem Básica)

**Objetivo**: Implementar queries básicas de listagem de produtos.

**Requirements**:
- ✅ Queries documentadas em `docs/tgfpro/queries/01-basic-listing.md`
- ⏳ Implementar 4 endpoints:
  - `GET /api/products2` - Lista produtos ativos (paginado)
  - `GET /api/products2/:id` - Busca por código
  - `GET /api/products2/search?q=termo` - Busca por descrição
  - `GET /api/products2/by-group/:groupId` - Filtro por grupo
- ⏳ DTOs com validação (class-validator)
- ⏳ Service com cache Redis (TTL: 5 min)
- ⏳ Controller com Swagger completo (pt-BR)
- ⏳ Usar `PaginatedResult<T>` existente
- ⏳ Unit tests (>80% coverage)
- ⏳ E2E tests com cURL

**Success Criteria**:
- [ ] Todos os 4 endpoints funcionando
- [ ] Cache funcionando (verificar com logs)
- [ ] Swagger documentation completa em pt-BR
- [ ] Tests passing (jest)
- [ ] E2E tests passing (cURL)
- [ ] Performance: <500ms sem cache, <50ms com cache

**Output**: `<promise>PHASE_1_COMPLETE</promise>`

---

### Phase 2: Pricing (Preços)

**Objetivo**: Implementar análise e histórico de preços.

**Requirements**:
- ✅ Queries documentadas em `docs/tgfpro/queries/02-pricing.md`
- ⏳ Implementar 4 endpoints:
  - `GET /api/products2/pricing/last-purchase` - Produtos com preço última compra
  - `GET /api/products2/:id/pricing/history` - Histórico de preços
  - `GET /api/products2/:id/pricing/average` - Média ponderada
  - `GET /api/products2/:id/pricing/suppliers` - Comparação por fornecedor
- ⏳ DTOs específicos para pricing
- ⏳ Service methods com cache estratégico
- ⏳ Controller com Swagger completo (pt-BR)
- ⏳ Unit tests (>80% coverage)
- ⏳ E2E tests com cURL

**Success Criteria**:
- [ ] Todos os 4 endpoints funcionando
- [ ] Cache com TTLs diferenciados (5-20 min)
- [ ] Swagger documentation completa em pt-BR
- [ ] Tests passing (jest)
- [ ] E2E tests passing (cURL)
- [ ] Performance: <600ms sem cache, <50ms com cache

**Output**: `<promise>PHASE_2_COMPLETE</promise>`

---

### Phase 3: Stock Management (Gestão de Estoque)

**Objetivo**: Implementar controle e análise de estoque.

**Requirements**:
- ✅ Queries documentadas em `docs/tgfpro/queries/03-stock.md`
- ⏳ Implementar 4 endpoints:
  - `GET /api/products2/:id/stock/locations` - Estoque por local
  - `GET /api/products2/stock/below-minimum` - Produtos abaixo do mínimo
  - `GET /api/products2/stock/summary` - Resumo de estoque (paginado)
  - `GET /api/products2/stock/location/:locationId` - Produtos em local específico
- ⏳ DTOs específicos para stock
- ⏳ Service methods com cache curto (2-3 min)
- ⏳ Controller com Swagger completo (pt-BR)
- ⏳ Unit tests (>80% coverage)
- ⏳ E2E tests com cURL

**Success Criteria**:
- [ ] Todos os 4 endpoints funcionando
- [ ] Cache com TTL curto (2-3 min) - estoque muda frequentemente
- [ ] Swagger documentation completa em pt-BR
- [ ] Tests passing (jest)
- [ ] E2E tests passing (cURL)
- [ ] Performance: <600ms sem cache, <50ms com cache

**Output**: `<promise>PHASE_3_COMPLETE</promise>`

---

### Phase 4: Analytics (Análises e Tendências)

**Objetivo**: Implementar análises de consumo e tendências.

**Requirements**:
- ⏳ Criar `docs/tgfpro/queries/04-analytics.md`
- ⏳ Documentar queries de análise:
  - Consumo mensal por produto
  - Produtos mais comprados (ranking)
  - Tendência de preços (últimos 12 meses)
  - Análise de fornecedores (frequência e volume)
- ⏳ Implementar 4 endpoints baseados nas queries
- ⏳ DTOs específicos para analytics
- ⏳ Service methods com cache longo (15-30 min)
- ⏳ Controller com Swagger completo (pt-BR)
- ⏳ Unit tests (>80% coverage)
- ⏳ E2E tests com cURL

**Success Criteria**:
- [ ] Query documentation completa (04-analytics.md)
- [ ] Todos os endpoints funcionando
- [ ] Cache com TTL longo (analytics mudam pouco)
- [ ] Swagger documentation completa em pt-BR
- [ ] Tests passing (jest)
- [ ] E2E tests passing (cURL)
- [ ] Performance: <800ms sem cache (queries complexas), <50ms com cache

**Output**: `<promise>PHASE_4_COMPLETE</promise>`

---

### Phase 5: Dashboard KPIs

**Objetivo**: Implementar KPIs e métricas para dashboard.

**Requirements**:
- ⏳ Criar `docs/tgfpro/queries/05-dashboard.md`
- ⏳ Documentar queries de KPIs:
  - Total de produtos ativos/inativos
  - Valor total de estoque
  - Alertas (produtos abaixo do mínimo, sem movimentação, etc)
  - Top 10 produtos por valor de estoque
  - Resumo de compras (últimos 30/60/90 dias)
- ⏳ Implementar endpoint de dashboard: `GET /api/products2/dashboard`
- ⏳ DTO específico para dashboard (consolidado)
- ⏳ Service method com cache agressivo (10 min)
- ⏳ Background job para pre-cache (cron)
- ⏳ Controller com Swagger completo (pt-BR)
- ⏳ Unit tests (>80% coverage)
- ⏳ E2E tests com cURL

**Success Criteria**:
- [ ] Query documentation completa (05-dashboard.md)
- [ ] Endpoint de dashboard funcionando
- [ ] Cache + background job funcionando
- [ ] Swagger documentation completa em pt-BR
- [ ] Tests passing (jest)
- [ ] E2E tests passing (cURL)
- [ ] Performance: <1000ms sem cache (query complexa), <30ms com cache

**Output**: `<promise>PHASE_5_COMPLETE</promise>`

---

## 📁 Estrutura de Arquivos

```
src/
├── products2/
│   ├── products2.module.ts           # Module com imports
│   ├── products2.controller.ts       # Controller com Swagger
│   ├── products2.service.ts          # Service principal
│   ├── pricing/
│   │   ├── pricing.service.ts        # Service de pricing
│   │   └── dto/
│   │       ├── product-pricing.dto.ts
│   │       ├── price-history.dto.ts
│   │       ├── average-price.dto.ts
│   │       └── supplier-comparison.dto.ts
│   ├── stock/
│   │   ├── stock.service.ts          # Service de stock
│   │   └── dto/
│   │       ├── stock-by-location.dto.ts
│   │       ├── below-min-stock.dto.ts
│   │       ├── stock-summary.dto.ts
│   │       └── location-stock.dto.ts
│   ├── analytics/
│   │   ├── analytics.service.ts      # Service de analytics
│   │   └── dto/
│   │       └── (DTOs após documentar queries)
│   ├── dashboard/
│   │   ├── dashboard.service.ts      # Service de dashboard
│   │   └── dto/
│   │       └── dashboard.dto.ts
│   └── dto/
│       ├── find-products.dto.ts      # DTO base para queries
│       ├── product-basic.dto.ts      # Interface básica
│       └── product-detail.dto.ts     # Interface completa
├── common/
│   └── pagination/
│       └── pagination.types.ts       # PaginatedResult (existente)
└── tests/
    └── products2/
        ├── products2.service.spec.ts
        ├── products2.controller.spec.ts
        ├── pricing.service.spec.ts
        ├── stock.service.spec.ts
        └── products2.e2e-spec.ts
```

---

## 🧪 Testing Strategy

### Unit Tests (Jest)

```typescript
// Cada service method deve ter:
describe('Products2Service', () => {
  describe('findAll', () => {
    it('should return paginated products', async () => {
      // Mock SankhyaApiService
      // Mock RedisService
      // Assert result matches PaginatedResult<ProductBasic>
    });

    it('should use cache when available', async () => {
      // Mock cache hit
      // Verify SankhyaApiService NOT called
    });

    it('should query database on cache miss', async () => {
      // Mock cache miss
      // Verify SankhyaApiService called
      // Verify cache set
    });
  });
});
```

### E2E Tests (cURL)

```bash
# Cada fase deve ter script de teste:
# test-phase-1.sh
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login ...)

# Test 1: List products
curl -X GET "http://localhost:3100/api/products2?page=1&perPage=20" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 2: Get by ID
curl -X GET "http://localhost:3100/api/products2/3680" \
  -H "Authorization: Bearer $TOKEN" | jq

# ... (todos os endpoints da fase)
```

---

## 🎨 Swagger Documentation Pattern

```typescript
// Todos os endpoints devem seguir:
@ApiTags('Produtos v2')  // pt-BR
@Controller('api/products2')  // inglês
@ApiBearerAuth()
export class Products2Controller {

  @Get()
  @ApiOperation({
    summary: 'Listar produtos ativos',  // pt-BR
    description: `
      Retorna lista paginada de produtos ativos de consumo.

      **Casos de Uso:**
      - Listagem geral
      - Autocomplete
      - Seleção em dropdowns

      **Performance:**
      - Primeira requisição: 200-500ms
      - Com cache: ~50ms
      - Cache TTL: 5 minutos
    `
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',  // pt-BR
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos recuperados com sucesso',  // pt-BR
    type: PaginatedProductDto
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros inválidos'  // pt-BR
  })
  async findAll(@Query() dto: FindProductsDto) {
    // ...
  }
}
```

---

## 📊 Performance Targets

| Categoria | Primeira Req | Com Cache | Cache TTL |
|-----------|--------------|-----------|-----------|
| Basic Listing | <500ms | <50ms | 5 min |
| Pricing | <600ms | <50ms | 5-20 min |
| Stock | <600ms | <50ms | 2-3 min |
| Analytics | <800ms | <50ms | 15-30 min |
| Dashboard | <1000ms | <30ms | 10 min (pre-cache) |

---

## ✅ Definition of Done (DoD)

Para cada fase ser considerada **COMPLETE**:

1. ✅ **Code**:
   - [ ] All endpoints implemented
   - [ ] DTOs with validation decorators
   - [ ] Service methods with cache
   - [ ] Error handling (try/catch, proper exceptions)
   - [ ] TypeScript strict mode (no `any`)

2. ✅ **Documentation**:
   - [ ] Swagger decorators complete (pt-BR)
   - [ ] Code comments for complex logic (pt-BR)
   - [ ] Query documentation in docs/tgfpro/queries/

3. ✅ **Tests**:
   - [ ] Unit tests passing (>80% coverage)
   - [ ] E2E tests passing (cURL scripts)
   - [ ] All test files in src/tests/products2/

4. ✅ **Quality**:
   - [ ] No linting errors (`npm run lint`)
   - [ ] No TypeScript errors (`npm run build`)
   - [ ] Performance targets met
   - [ ] Cache working (verify with logs)

5. ✅ **Integration**:
   - [ ] Module registered in AppModule
   - [ ] Routes working in Swagger UI
   - [ ] Compatible with existing pagination

---

## 🔄 Workflow de Desenvolvimento

```
Para cada fase:

1. Read query documentation (docs/tgfpro/queries/*.md)
2. Create DTOs with validation
3. Implement service methods with cache
4. Implement controller endpoints
5. Add Swagger decorators (pt-BR)
6. Write unit tests
7. Write E2E tests (cURL)
8. Run tests (npm run test && npm run test:e2e)
9. Test manually via Swagger UI
10. Verify performance targets
11. Output <promise>PHASE_X_COMPLETE</promise>
12. Move to next phase
```

---

## 🚨 Constraints

- ❌ **NO breaking changes** to existing routes
- ✅ **MUST use** existing `PaginatedResult<T>` from `src/common/pagination/pagination.types.ts`
- ✅ **MUST use** existing `buildPaginatedResult()` helper
- ❌ **NO SELECT \*** (list fields explicitly)
- ✅ **MUST use** `WITH (NOLOCK)` in all queries
- ✅ **MUST use** Redis cache with appropriate TTLs
- ✅ **MUST use** pt-BR for user-facing content
- ✅ **MUST use** English for code/routes/variables

---

## 📝 Current Status

- ✅ Phase 0: Query Documentation
  - ✅ 01-basic-listing.md (4 queries)
  - ✅ 02-pricing.md (4 queries)
  - ✅ 03-stock.md (4 queries)
  - ⏳ 04-analytics.md (pending)
  - ⏳ 05-dashboard.md (pending)

- ⏳ Phase 1: Basic Listing (NEXT)
- ⏳ Phase 2: Pricing
- ⏳ Phase 3: Stock Management
- ⏳ Phase 4: Analytics
- ⏳ Phase 5: Dashboard KPIs

---

## 🎯 Next Action

**START Phase 1: Basic Listing**

Requirements:
1. Create DTOs (product-basic.dto.ts, find-products.dto.ts)
2. Create Products2Service with 4 methods
3. Create Products2Controller with 4 endpoints
4. Add Swagger decorators (pt-BR)
5. Write unit tests
6. Write E2E tests
7. Test and verify

**Output**: `<promise>PHASE_1_COMPLETE</promise>`

---

**Última atualização**: 2026-01-13
**Estratégia**: Ralph Wiggum (incremental phases with tests)
**Status**: Ready to start Phase 1
