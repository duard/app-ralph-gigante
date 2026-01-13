# 01 - Basic Listing Queries

Queries básicas de listagem de produtos testadas e prontas para implementação.

---

## Query 1.1: Lista Produtos Ativos

### 📝 Descrição
Retorna lista paginada de produtos ativos de consumo com informações básicas.

### 🎯 Use Case
- Listagem principal de produtos
- Autocomplete
- Dropdowns de seleção

### 📋 SQL Query

```sql
SELECT TOP 20
    CODPROD,
    DESCRPROD,
    REFERENCIA,
    ATIVO,
    USOPROD,
    VLRULTCOMPRA,
    DTALTER
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S'
  AND USOPROD = 'C'
ORDER BY CODPROD DESC
OFFSET 0 ROWS
FETCH NEXT 20 ROWS ONLY;
```

### 🧪 Teste com Curl

```bash
# 1. Obter token
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# 2. Executar query
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 20 CODPROD, DESCRPROD, REFERENCIA, ATIVO, USOPROD, VLRULTCOMPRA, DTALTER FROM TGFPRO WITH (NOLOCK) WHERE ATIVO = '\''S'\'' AND USOPROD = '\''C'\'' ORDER BY CODPROD DESC"
  }' | jq '.'
```

### 📥 Resultado Esperado

```json
[
  {
    "CODPROD": 3680,
    "DESCRPROD": "FOLHAS A4 SULFITE 75G 210X297MM",
    "REFERENCIA": "A4-75G",
    "ATIVO": "S",
    "USOPROD": "C",
    "VLRULTCOMPRA": 23.44,
    "DTALTER": "2025-12-30T10:30:00"
  },
  ...
]
```

### 📦 Interface TypeScript

```typescript
export interface ProductBasic {
  codprod: number;              // Código do produto
  descrprod: string;            // Descrição do produto
  referencia?: string;          // Referência interna
  ativo: 'S' | 'N';            // Ativo (S=Sim, N=Não)
  usoprod: string;              // Tipo de uso (C=Consumo)
  vlrultcompra?: number;        // Valor última compra (R$)
  dtalter?: Date;               // Data última alteração
}

export interface PaginatedResult<T> {
  data: T[];                    // Dados da página atual
  total: number;                // Total de registros
  page: number;                 // Página atual
  perPage: number;              // Itens por página
  lastPage: number;             // Última página
  hasMore: boolean;             // Há mais páginas?
}
```

### ⚙️ Implementação NestJS

```typescript
// tgfpro.service.ts
import { Injectable } from '@nestjs/common';
import { SankhyaApiService } from '../sankhya/sankhya-api.service';

@Injectable()
export class TgfproService {
  constructor(private sankhyaApi: SankhyaApiService) {}

  async findAll(page: number = 1, perPage: number = 20): Promise<PaginatedResult<ProductBasic>> {
    const offset = (page - 1) * perPage;

    // Query de dados
    const dataQuery = `
      SELECT TOP ${perPage}
        CODPROD,
        DESCRPROD,
        REFERENCIA,
        ATIVO,
        USOPROD,
        VLRULTCOMPRA,
        DTALTER
      FROM TGFPRO WITH (NOLOCK)
      WHERE ATIVO = 'S'
        AND USOPROD = 'C'
      ORDER BY CODPROD DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${perPage} ROWS ONLY
    `;

    // Query de contagem
    const countQuery = `
      SELECT COUNT(*) AS TOTAL
      FROM TGFPRO WITH (NOLOCK)
      WHERE ATIVO = 'S'
        AND USOPROD = 'C'
    `;

    const [data, countResult] = await Promise.all([
      this.sankhyaApi.executeQuery<ProductBasic>(dataQuery, []),
      this.sankhyaApi.executeQuery<{ TOTAL: number }>(countQuery, [])
    ]);

    const total = countResult[0]?.TOTAL || 0;
    const lastPage = Math.ceil(total / perPage);

    return {
      data: data.map(this.mapToLowercase),
      total,
      page,
      perPage,
      lastPage,
      hasMore: page < lastPage
    };
  }

  private mapToLowercase(item: any): ProductBasic {
    return {
      codprod: item.CODPROD,
      descrprod: item.DESCRPROD,
      referencia: item.REFERENCIA,
      ativo: item.ATIVO,
      usoprod: item.USOPROD,
      vlrultcompra: item.VLRULTCOMPRA,
      dtalter: item.DTALTER ? new Date(item.DTALTER) : undefined
    };
  }
}
```

### 💾 Estratégia de Cache

```typescript
async findAllWithCache(page: number = 1, perPage: number = 20): Promise<PaginatedResult<ProductBasic>> {
  const cacheKey = `products:list:${page}:${perPage}`;

  // Tentar cache
  const cached = await this.redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Buscar do database
  const result = await this.findAll(page, perPage);

  // Guardar no cache por 5 minutos
  await this.redis.setex(cacheKey, 300, JSON.stringify(result));

  return result;
}
```

- **TTL**: 5 minutos (300 segundos)
- **Key pattern**: `products:list:{page}:{perPage}`
- **Invalidação**: Ao alterar produto (raro no nosso caso - só compramos)

### ⚡ Performance

- **Tempo estimado**: 200-300ms (primeira vez), 10-20ms (cache hit)
- **Otimizações aplicadas**:
  - WITH (NOLOCK) para evitar locks
  - OFFSET-FETCH para paginação eficiente
  - TOP N para limitar resultados
  - Apenas campos necessários
  - Queries em paralelo (data + count)

---

## Query 1.2: Busca por Código

### 📝 Descrição
Busca um produto específico por código.

### 🎯 Use Case
- Detalhes de um produto
- Edição de produto
- Validação de código

### 📋 SQL Query

```sql
SELECT
    CODPROD,
    DESCRPROD,
    REFERENCIA,
    REFFORN,
    ATIVO,
    USOPROD,
    CODGRUPOPROD,
    FABRICANTE,
    CODVOL,
    VLRUNIT,
    VLRULTCOMPRA,
    CUSTO,
    DTALTER
FROM TGFPRO WITH (NOLOCK)
WHERE CODPROD = 3680;
```

### 🧪 Teste com Curl

```bash
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT CODPROD, DESCRPROD, REFERENCIA, REFFORN, ATIVO, USOPROD, CODGRUPOPROD, FABRICANTE, CODVOL, VLRUNIT, VLRULTCOMPRA, CUSTO, DTALTER FROM TGFPRO WITH (NOLOCK) WHERE CODPROD = 3680"
  }' | jq '.'
```

### 📥 Resultado Esperado

```json
[
  {
    "CODPROD": 3680,
    "DESCRPROD": "FOLHAS A4 SULFITE 75G 210X297MM",
    "REFERENCIA": "A4-75G",
    "REFFORN": "REF-FORN-123",
    "ATIVO": "S",
    "USOPROD": "C",
    "CODGRUPOPROD": 10,
    "FABRICANTE": "Chamex",
    "CODVOL": "UN",
    "VLRUNIT": 25.00,
    "VLRULTCOMPRA": 23.44,
    "CUSTO": 23.80,
    "DTALTER": "2025-12-30T10:30:00"
  }
]
```

### 📦 Interface TypeScript

```typescript
export interface ProductDetail {
  codprod: number;
  descrprod: string;
  referencia?: string;
  refforn?: string;
  ativo: 'S' | 'N';
  usoprod: string;
  codgrupoprod?: number;
  fabricante?: string;
  codvol?: string;
  vlrunit?: number;
  vlrultcompra?: number;
  custo?: number;
  dtalter?: Date;
}
```

### ⚙️ Implementação NestJS

```typescript
async findById(codprod: number): Promise<ProductDetail | null> {
  const query = `
    SELECT
      CODPROD,
      DESCRPROD,
      REFERENCIA,
      REFFORN,
      ATIVO,
      USOPROD,
      CODGRUPOPROD,
      FABRICANTE,
      CODVOL,
      VLRUNIT,
      VLRULTCOMPRA,
      CUSTO,
      DTALTER
    FROM TGFPRO WITH (NOLOCK)
    WHERE CODPROD = ${codprod}
  `;

  const result = await this.sankhyaApi.executeQuery<ProductDetail>(query, []);

  if (result.length === 0) {
    return null;
  }

  return this.mapToLowercase(result[0]);
}
```

### 💾 Estratégia de Cache

```typescript
async findByIdWithCache(codprod: number): Promise<ProductDetail | null> {
  const cacheKey = `product:${codprod}`;

  const cached = await this.redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const product = await this.findById(codprod);

  if (product) {
    await this.redis.setex(cacheKey, 120, JSON.stringify(product)); // 2 minutos
  }

  return product;
}
```

- **TTL**: 2 minutos
- **Key pattern**: `product:{codprod}`
- **Invalidação**: Ao alterar produto específico

### ⚡ Performance

- **Tempo estimado**: 100-200ms (primeira vez), 5-10ms (cache hit)
- **Otimizações**:
  - WHERE em chave primária (índice clustered)
  - Cache agressivo para produto específico
  - Apenas 1 registro retornado

---

## Query 1.3: Busca por Descrição (LIKE)

### 📝 Descrição
Busca produtos por descrição parcial.

### 🎯 Use Case
- Autocomplete
- Busca de produtos
- Filtros de pesquisa

### 📋 SQL Query

```sql
SELECT TOP 20
    CODPROD,
    DESCRPROD,
    REFERENCIA,
    VLRULTCOMPRA,
    ATIVO
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S'
  AND USOPROD = 'C'
  AND DESCRPROD LIKE '%FOLHA%'
ORDER BY DESCRPROD;
```

### 🧪 Teste com Curl

```bash
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 20 CODPROD, DESCRPROD, REFERENCIA, VLRULTCOMPRA, ATIVO FROM TGFPRO WITH (NOLOCK) WHERE ATIVO = '\''S'\'' AND USOPROD = '\''C'\'' AND DESCRPROD LIKE '\''%FOLHA%'\'' ORDER BY DESCRPROD"
  }' | jq '.'
```

### 📦 Interface TypeScript

```typescript
export interface ProductSearchResult {
  codprod: number;
  descrprod: string;
  referencia?: string;
  vlrultcompra?: number;
  ativo: string;
}
```

### ⚙️ Implementação NestJS

```typescript
async search(term: string, limit: number = 20): Promise<ProductSearchResult[]> {
  // Sanitize input
  const safeTerm = term.replace(/['"]/g, '').toUpperCase();

  const query = `
    SELECT TOP ${limit}
      CODPROD,
      DESCRPROD,
      REFERENCIA,
      VLRULTCOMPRA,
      ATIVO
    FROM TGFPRO WITH (NOLOCK)
    WHERE ATIVO = 'S'
      AND USOPROD = 'C'
      AND DESCRPROD LIKE '%${safeTerm}%'
    ORDER BY DESCRPROD
  `;

  const result = await this.sankhyaApi.executeQuery(query, []);

  return result.map(this.mapToLowercase);
}
```

### 💾 Estratégia de Cache

```typescript
async searchWithCache(term: string, limit: number = 20): Promise<ProductSearchResult[]> {
  // Normalizar termo para cache
  const normalizedTerm = term.trim().toUpperCase();
  const cacheKey = `products:search:${normalizedTerm}:${limit}`;

  const cached = await this.redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const results = await this.search(normalizedTerm, limit);

  // Cache por 10 minutos (autocomplete não muda muito)
  await this.redis.setex(cacheKey, 600, JSON.stringify(results));

  return results;
}
```

- **TTL**: 10 minutos
- **Key pattern**: `products:search:{term}:{limit}`
- **Consideração**: LIKE '%term%' não usa índice (scan completo)

### ⚡ Performance

- **Tempo estimado**: 300-500ms (primeira vez), 10ms (cache hit)
- **Otimizações**:
  - Limitar com TOP N
  - Cache agressivo para termos comuns
  - Considerar índice full-text (se possível no futuro)
- **Atenção**: LIKE '%term%' faz table scan - use cache!

---

## Query 1.4: Filtro por Grupo

### 📝 Descrição
Lista produtos de um grupo específico.

### 🎯 Use Case
- Filtrar por categoria
- Navegação por grupos
- Relatórios por grupo

### 📋 SQL Query

```sql
SELECT
    P.CODPROD,
    P.DESCRPROD,
    P.VLRULTCOMPRA,
    G.DESCRGRUPOPROD AS GRUPO
FROM TGFPRO P WITH (NOLOCK)
LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
WHERE P.ATIVO = 'S'
  AND P.USOPROD = 'C'
  AND P.CODGRUPOPROD = 10
ORDER BY P.DESCRPROD;
```

### 🧪 Teste com Curl

```bash
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT P.CODPROD, P.DESCRPROD, P.VLRULTCOMPRA, G.DESCRGRUPOPROD AS GRUPO FROM TGFPRO P WITH (NOLOCK) LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD WHERE P.ATIVO = '\''S'\'' AND P.USOPROD = '\''C'\'' AND P.CODGRUPOPROD = 10 ORDER BY P.DESCRPROD"
  }' | jq '.'
```

### 📦 Interface TypeScript

```typescript
export interface ProductByGroup {
  codprod: number;
  descrprod: string;
  vlrultcompra?: number;
  grupo?: string;
}
```

### ⚙️ Implementação NestJS

```typescript
async findByGroup(codgrupoprod: number): Promise<ProductByGroup[]> {
  const query = `
    SELECT
      P.CODPROD,
      P.DESCRPROD,
      P.VLRULTCOMPRA,
      G.DESCRGRUPOPROD AS GRUPO
    FROM TGFPRO P WITH (NOLOCK)
    LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
    WHERE P.ATIVO = 'S'
      AND P.USOPROD = 'C'
      AND P.CODGRUPOPROD = ${codgrupoprod}
    ORDER BY P.DESCRPROD
  `;

  const result = await this.sankhyaApi.executeQuery(query, []);

  return result.map(this.mapToLowercase);
}
```

### 💾 Estratégia de Cache

- **TTL**: 5 minutos
- **Key pattern**: `products:group:{codgrupoprod}`

### ⚡ Performance

- **Tempo estimado**: 200-400ms
- **Otimizações**: JOIN eficiente, LEFT JOIN permite grupo null

---

**Última atualização**: 2026-01-13
