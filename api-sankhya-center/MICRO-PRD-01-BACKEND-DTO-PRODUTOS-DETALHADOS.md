# MICRO-PRD 01: Backend DTO Types for Produtos Detalhados

**Status**: 🟡 In Progress
**Priority**: P0 (Blocker)
**Estimated Time**: 30 minutes
**Dependencies**: None

---

## Objective

Create TypeScript DTO (Data Transfer Object) types for the new "produtos detalhados" endpoint response. These types will define the structure of rich product data returned by the API.

---

## Requirements

### 1. Create ProdutoRico Response DTO

**File**: `src/sankhya/tgfpro2/dtos/produto-rico-response.dto.ts`

**Fields**:

```typescript
export class ProdutoRicoDto {
  // Basic Info
  codprod: number;
  descrprod: string;
  marca: string | null;
  codgrupoprod: number | null;
  descrgrupoprod: string | null;
  ativo: 'S' | 'N';

  // Control System
  tipcontest: 'N' | 'S' | 'E' | 'L' | 'P';
  liscontest: string | null;
  hasControle: boolean;
  controleCount: number;

  // Stock Data
  estoqueTotal: number;
  temEstoque: boolean;

  // Price Analysis (last 6 months)
  precoMedioPonderado: number | null;
  precoUltimaCompra: number | null;
  precoMinimo: number | null;
  precoMaximo: number | null;
  variacaoPrecoPercentual: number | null;
  tendenciaPreco: 'AUMENTO' | 'QUEDA' | 'ESTAVEL' | null;

  // Consumption Indicators
  qtdComprasUltimos6Meses: number;
  totalGastoUltimos6Meses: number;

  // Metadata
  dtalter: string | null;
  nomeusualt: string | null;
}
```

### 2. Create Paginated Response DTO

**File**: Same as above

```typescript
export class ProdutosDetalhadosMetaDto {
  @ApiProperty({ example: 13281 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  pageSize: number;

  @ApiProperty({ example: 266 })
  totalPages: number;
}

export class ProdutosDetalhadosStatsDto {
  @ApiProperty({ example: 13281 })
  totalProdutos: number;

  @ApiProperty({ example: 4920 })
  comEstoque: number;

  @ApiProperty({ example: 8361 })
  semEstoque: number;

  @ApiProperty({ example: 2407 })
  comControle: number;

  @ApiProperty({ example: 11500 })
  ativos: number;

  @ApiProperty({ example: 1781 })
  inativos: number;
}

export class ProdutosDetalhadosResponseDto {
  @ApiProperty({ type: [ProdutoRicoDto] })
  data: ProdutoRicoDto[];

  @ApiProperty({ type: ProdutosDetalhadosMetaDto })
  meta: ProdutosDetalhadosMetaDto;

  @ApiProperty({ type: ProdutosDetalhadosStatsDto })
  stats: ProdutosDetalhadosStatsDto;
}
```

### 3. Add Swagger/OpenAPI Decorators

Use `@ApiProperty()` decorators for all fields with:
- Example values
- Description text
- Type information
- Nullable indication where appropriate

---

## Acceptance Criteria

- [ ] File created at `src/sankhya/tgfpro2/dtos/produto-rico-response.dto.ts`
- [ ] All DTO classes have `@ApiProperty()` decorators
- [ ] Types match the expected database schema
- [ ] File exports all DTOs
- [ ] No TypeScript errors
- [ ] Code follows existing DTO pattern in project

---

## Testing

No tests required for this PRD (just type definitions).

---

## Commit Message

```
feat(tgfpro2): add produtos detalhados DTOs

- Create ProdutoRicoDto with all rich data fields
- Add ProdutosDetalhadosResponseDto with meta and stats
- Include Swagger/OpenAPI decorators
- Support for CONTROLE variations and price analysis

Related to ULTRA-PLAN-PRODUTOS-DETALHADOS.md
```
