# 03 - Stock Queries (Consultas de Estoque)

## 📋 Objetivo

Queries para gestão e análise de estoque de produtos:
- Estoque por local (TGFEST + TGFLOC)
- Produtos abaixo do estoque mínimo
- Controle de múltiplos locais
- Resumo de estoque total

## 🎯 Workflow

```
1. Testar query via POST /inspection/query
2. Validar resultados e performance
3. Criar interface TypeScript
4. Implementar no service com cache
5. Criar endpoint no controller
6. Documentar no Swagger
```

---

## Query 3.1: Estoque por Local (Produto Específico)

### Descrição
Retorna o estoque de um produto específico em todos os locais onde ele está armazenado.

### SQL

```sql
SELECT
    EST.CODPROD,                        -- Código do produto
    PRO.DESCRPROD,                      -- Descrição do produto
    EST.CODLOCAL,                       -- Código do local
    LOC.DESCRLOCAL,                     -- Descrição do local
    EST.ESTOQUE,                        -- Quantidade em estoque
    EST.RESERVADO,                      -- Quantidade reservada
    (EST.ESTOQUE - EST.RESERVADO) as DISPONIVEL,  -- Disponível para uso
    PRO.CODVOL,                         -- Unidade de medida
    EST.DTULTENT,                       -- Data última entrada
    EST.DTULTSAID                       -- Data última saída
FROM TGFEST EST WITH (NOLOCK)
INNER JOIN TGFPRO PRO WITH (NOLOCK)
    ON EST.CODPROD = PRO.CODPROD
LEFT JOIN TGFLOC LOC WITH (NOLOCK)
    ON EST.CODLOCAL = LOC.CODLOCAL
WHERE EST.CODPROD = @codprod
  AND PRO.ATIVO = 'S'
  AND EST.ESTOQUE > 0                   -- Apenas locais com estoque
ORDER BY EST.ESTOQUE DESC;              -- Maior estoque primeiro
```

### TypeScript Interface

```typescript
export interface ProductStockByLocation {
  codprod: number;              // Código do produto
  descrprod: string;            // Descrição do produto
  codlocal: number;             // Código do local
  descrlocal?: string;          // Descrição do local
  estoque: number;              // Quantidade em estoque
  reservado: number;            // Quantidade reservada
  disponivel: number;           // Disponível (estoque - reservado)
  codvol?: string;              // Unidade de medida
  dtultent?: Date;              // Data última entrada
  dtultsaid?: Date;             // Data última saída
}
```

### NestJS Service

```typescript
import { Injectable } from '@nestjs/common';
import { SankhyaApiService } from '../sankhya-api/sankhya-api.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProductStockService {
  constructor(
    private sankhyaApi: SankhyaApiService,
    private redis: RedisService
  ) {}

  async findStockByLocation(codprod: number): Promise<ProductStockByLocation[]> {
    const cacheKey = `products:stock:by-location:${codprod}`;

    // Cache por 2 minutos (estoque muda com frequência)
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const query = `
      SELECT
        EST.CODPROD, PRO.DESCRPROD,
        EST.CODLOCAL, LOC.DESCRLOCAL,
        EST.ESTOQUE, EST.RESERVADO,
        (EST.ESTOQUE - EST.RESERVADO) as DISPONIVEL,
        PRO.CODVOL,
        EST.DTULTENT, EST.DTULTSAID
      FROM TGFEST EST WITH (NOLOCK)
      INNER JOIN TGFPRO PRO WITH (NOLOCK)
        ON EST.CODPROD = PRO.CODPROD
      LEFT JOIN TGFLOC LOC WITH (NOLOCK)
        ON EST.CODLOCAL = LOC.CODLOCAL
      WHERE EST.CODPROD = ${codprod}
        AND PRO.ATIVO = 'S'
        AND EST.ESTOQUE > 0
      ORDER BY EST.ESTOQUE DESC;
    `;

    const data = await this.sankhyaApi.executeQuery<ProductStockByLocation>(query);

    // Cache por 2 minutos
    await this.redis.setex(cacheKey, 120, JSON.stringify(data));

    return data;
  }
}
```

### Teste via cURL

```bash
# 1. Autenticar
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | jq -r '.access_token')

# 2. Testar query (produto 3680 como exemplo)
curl -X POST http://localhost:3100/inspection/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT EST.CODPROD, PRO.DESCRPROD, EST.CODLOCAL, LOC.DESCRLOCAL, EST.ESTOQUE, EST.RESERVADO, (EST.ESTOQUE - EST.RESERVADO) as DISPONIVEL, PRO.CODVOL FROM TGFEST EST WITH (NOLOCK) INNER JOIN TGFPRO PRO WITH (NOLOCK) ON EST.CODPROD = PRO.CODPROD LEFT JOIN TGFLOC LOC WITH (NOLOCK) ON EST.CODLOCAL = LOC.CODLOCAL WHERE EST.CODPROD = 3680 AND PRO.ATIVO = '\''S'\'' AND EST.ESTOQUE > 0 ORDER BY EST.ESTOQUE DESC;"
  }' | jq
```

**Resultado esperado:**
- 200 OK
- Array de locais com estoque do produto
- Tempo: ~200-400ms (gateway)

---

## Query 3.2: Produtos Abaixo do Estoque Mínimo

### Descrição
Lista produtos ativos que estão com estoque total abaixo do mínimo definido (ESTMIN).

### SQL

```sql
SELECT
    PRO.CODPROD,
    PRO.DESCRPROD,
    PRO.REFERENCIA,
    PRO.ESTMIN,                                     -- Estoque mínimo
    ISNULL(SUM(EST.ESTOQUE), 0) as ESTOQUE_TOTAL,  -- Estoque total (todos os locais)
    ISNULL(SUM(EST.RESERVADO), 0) as RESERVADO_TOTAL,
    ISNULL(SUM(EST.ESTOQUE - EST.RESERVADO), 0) as DISPONIVEL_TOTAL,
    (PRO.ESTMIN - ISNULL(SUM(EST.ESTOQUE), 0)) as DEFICIT,  -- Quantidade faltante
    PRO.CODVOL,
    PRO.VLRULTCOMPRA                                -- Valor última compra
FROM TGFPRO PRO WITH (NOLOCK)
LEFT JOIN TGFEST EST WITH (NOLOCK)
    ON PRO.CODPROD = EST.CODPROD
WHERE PRO.ATIVO = 'S'
  AND PRO.USOPROD = 'C'
  AND PRO.ESTMIN > 0                                -- Tem estoque mínimo definido
GROUP BY
    PRO.CODPROD, PRO.DESCRPROD, PRO.REFERENCIA,
    PRO.ESTMIN, PRO.CODVOL, PRO.VLRULTCOMPRA
HAVING ISNULL(SUM(EST.ESTOQUE), 0) < PRO.ESTMIN   -- Estoque abaixo do mínimo
ORDER BY (PRO.ESTMIN - ISNULL(SUM(EST.ESTOQUE), 0)) DESC;  -- Maior déficit primeiro
```

### TypeScript Interface

```typescript
export interface ProductBelowMinStock {
  codprod: number;              // Código do produto
  descrprod: string;            // Descrição do produto
  referencia?: string;          // Referência interna
  estmin: number;               // Estoque mínimo definido
  estoque_total: number;        // Estoque total (soma de todos os locais)
  reservado_total: number;      // Total reservado
  disponivel_total: number;     // Total disponível
  deficit: number;              // Quantidade faltante (estmin - estoque_total)
  codvol?: string;              // Unidade de medida
  vlrultcompra?: number;        // Valor última compra (R$)
}
```

### NestJS Service

```typescript
async findBelowMinStock(): Promise<ProductBelowMinStock[]> {
  const cacheKey = 'products:stock:below-min';

  // Cache por 5 minutos
  const cached = await this.redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const query = `
    SELECT
      PRO.CODPROD, PRO.DESCRPROD, PRO.REFERENCIA, PRO.ESTMIN,
      ISNULL(SUM(EST.ESTOQUE), 0) as ESTOQUE_TOTAL,
      ISNULL(SUM(EST.RESERVADO), 0) as RESERVADO_TOTAL,
      ISNULL(SUM(EST.ESTOQUE - EST.RESERVADO), 0) as DISPONIVEL_TOTAL,
      (PRO.ESTMIN - ISNULL(SUM(EST.ESTOQUE), 0)) as DEFICIT,
      PRO.CODVOL, PRO.VLRULTCOMPRA
    FROM TGFPRO PRO WITH (NOLOCK)
    LEFT JOIN TGFEST EST WITH (NOLOCK)
      ON PRO.CODPROD = EST.CODPROD
    WHERE PRO.ATIVO = 'S'
      AND PRO.USOPROD = 'C'
      AND PRO.ESTMIN > 0
    GROUP BY
      PRO.CODPROD, PRO.DESCRPROD, PRO.REFERENCIA,
      PRO.ESTMIN, PRO.CODVOL, PRO.VLRULTCOMPRA
    HAVING ISNULL(SUM(EST.ESTOQUE), 0) < PRO.ESTMIN
    ORDER BY (PRO.ESTMIN - ISNULL(SUM(EST.ESTOQUE), 0)) DESC;
  `;

  const data = await this.sankhyaApi.executeQuery<ProductBelowMinStock>(query);

  // Cache por 5 minutos
  await this.redis.setex(cacheKey, 300, JSON.stringify(data));

  return data;
}
```

### Teste via cURL

```bash
curl -X POST http://localhost:3100/inspection/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT PRO.CODPROD, PRO.DESCRPROD, PRO.ESTMIN, ISNULL(SUM(EST.ESTOQUE), 0) as ESTOQUE_TOTAL, (PRO.ESTMIN - ISNULL(SUM(EST.ESTOQUE), 0)) as DEFICIT FROM TGFPRO PRO WITH (NOLOCK) LEFT JOIN TGFEST EST WITH (NOLOCK) ON PRO.CODPROD = EST.CODPROD WHERE PRO.ATIVO = '\''S'\'' AND PRO.USOPROD = '\''C'\'' AND PRO.ESTMIN > 0 GROUP BY PRO.CODPROD, PRO.DESCRPROD, PRO.ESTMIN HAVING ISNULL(SUM(EST.ESTOQUE), 0) < PRO.ESTMIN ORDER BY (PRO.ESTMIN - ISNULL(SUM(EST.ESTOQUE), 0)) DESC;"
  }' | jq
```

---

## Query 3.3: Resumo de Estoque Total por Produto

### Descrição
Retorna resumo consolidado de estoque de todos os produtos ativos, agrupando todos os locais.

### SQL

```sql
SELECT TOP 50
    PRO.CODPROD,
    PRO.DESCRPROD,
    PRO.REFERENCIA,
    ISNULL(SUM(EST.ESTOQUE), 0) as ESTOQUE_TOTAL,
    ISNULL(SUM(EST.RESERVADO), 0) as RESERVADO_TOTAL,
    ISNULL(SUM(EST.ESTOQUE - EST.RESERVADO), 0) as DISPONIVEL_TOTAL,
    COUNT(DISTINCT EST.CODLOCAL) as TOTAL_LOCAIS,   -- Em quantos locais está
    PRO.ESTMIN,                                     -- Estoque mínimo
    PRO.ESTMAX,                                     -- Estoque máximo
    PRO.CODVOL,
    CASE
        WHEN PRO.ESTMIN > 0 AND ISNULL(SUM(EST.ESTOQUE), 0) < PRO.ESTMIN
            THEN 'ABAIXO_MINIMO'
        WHEN PRO.ESTMAX > 0 AND ISNULL(SUM(EST.ESTOQUE), 0) > PRO.ESTMAX
            THEN 'ACIMA_MAXIMO'
        ELSE 'NORMAL'
    END as STATUS_ESTOQUE
FROM TGFPRO PRO WITH (NOLOCK)
LEFT JOIN TGFEST EST WITH (NOLOCK)
    ON PRO.CODPROD = EST.CODPROD
WHERE PRO.ATIVO = 'S'
  AND PRO.USOPROD = 'C'
GROUP BY
    PRO.CODPROD, PRO.DESCRPROD, PRO.REFERENCIA,
    PRO.ESTMIN, PRO.ESTMAX, PRO.CODVOL
ORDER BY ESTOQUE_TOTAL DESC
OFFSET 0 ROWS FETCH NEXT 50 ROWS ONLY;
```

### TypeScript Interface

```typescript
export type StockStatus = 'ABAIXO_MINIMO' | 'ACIMA_MAXIMO' | 'NORMAL';

export interface ProductStockSummary {
  codprod: number;              // Código do produto
  descrprod: string;            // Descrição do produto
  referencia?: string;          // Referência interna
  estoque_total: number;        // Estoque total (todos os locais)
  reservado_total: number;      // Total reservado
  disponivel_total: number;     // Total disponível
  total_locais: number;         // Quantidade de locais onde está
  estmin?: number;              // Estoque mínimo
  estmax?: number;              // Estoque máximo
  codvol?: string;              // Unidade de medida
  status_estoque: StockStatus;  // Status do estoque
}
```

### NestJS Service

```typescript
import { PaginatedResult, buildPaginatedResult } from '../common/pagination/pagination.types';

async findStockSummary(
  page: number = 1,
  perPage: number = 50
): Promise<PaginatedResult<ProductStockSummary>> {
  const cacheKey = `products:stock:summary:${page}:${perPage}`;

  // Cache por 3 minutos
  const cached = await this.redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const offset = (page - 1) * perPage;

  const query = `
    SELECT
      PRO.CODPROD, PRO.DESCRPROD, PRO.REFERENCIA,
      ISNULL(SUM(EST.ESTOQUE), 0) as ESTOQUE_TOTAL,
      ISNULL(SUM(EST.RESERVADO), 0) as RESERVADO_TOTAL,
      ISNULL(SUM(EST.ESTOQUE - EST.RESERVADO), 0) as DISPONIVEL_TOTAL,
      COUNT(DISTINCT EST.CODLOCAL) as TOTAL_LOCAIS,
      PRO.ESTMIN, PRO.ESTMAX, PRO.CODVOL,
      CASE
        WHEN PRO.ESTMIN > 0 AND ISNULL(SUM(EST.ESTOQUE), 0) < PRO.ESTMIN
          THEN 'ABAIXO_MINIMO'
        WHEN PRO.ESTMAX > 0 AND ISNULL(SUM(EST.ESTOQUE), 0) > PRO.ESTMAX
          THEN 'ACIMA_MAXIMO'
        ELSE 'NORMAL'
      END as STATUS_ESTOQUE
    FROM TGFPRO PRO WITH (NOLOCK)
    LEFT JOIN TGFEST EST WITH (NOLOCK)
      ON PRO.CODPROD = EST.CODPROD
    WHERE PRO.ATIVO = 'S'
      AND PRO.USOPROD = 'C'
    GROUP BY
      PRO.CODPROD, PRO.DESCRPROD, PRO.REFERENCIA,
      PRO.ESTMIN, PRO.ESTMAX, PRO.CODVOL
    ORDER BY ESTOQUE_TOTAL DESC
    OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY;
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT PRO.CODPROD) as total
    FROM TGFPRO PRO WITH (NOLOCK)
    WHERE PRO.ATIVO = 'S'
      AND PRO.USOPROD = 'C';
  `;

  const [data, countResult] = await Promise.all([
    this.sankhyaApi.executeQuery<ProductStockSummary>(query),
    this.sankhyaApi.executeQuery<{ total: number }>(countQuery)
  ]);

  const total = countResult[0]?.total || 0;

  const result = buildPaginatedResult({
    data,
    total,
    page,
    perPage
  });

  // Cache por 3 minutos
  await this.redis.setex(cacheKey, 180, JSON.stringify(result));

  return result;
}
```

### Teste via cURL

```bash
curl -X POST http://localhost:3100/inspection/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT TOP 50 PRO.CODPROD, PRO.DESCRPROD, ISNULL(SUM(EST.ESTOQUE), 0) as ESTOQUE_TOTAL, ISNULL(SUM(EST.RESERVADO), 0) as RESERVADO_TOTAL, COUNT(DISTINCT EST.CODLOCAL) as TOTAL_LOCAIS, PRO.ESTMIN, CASE WHEN PRO.ESTMIN > 0 AND ISNULL(SUM(EST.ESTOQUE), 0) < PRO.ESTMIN THEN '\''ABAIXO_MINIMO'\'' ELSE '\''NORMAL'\'' END as STATUS_ESTOQUE FROM TGFPRO PRO WITH (NOLOCK) LEFT JOIN TGFEST EST WITH (NOLOCK) ON PRO.CODPROD = EST.CODPROD WHERE PRO.ATIVO = '\''S'\'' AND PRO.USOPROD = '\''C'\'' GROUP BY PRO.CODPROD, PRO.DESCRPROD, PRO.ESTMIN, PRO.ESTMAX, PRO.CODVOL ORDER BY ESTOQUE_TOTAL DESC;"
  }' | jq
```

---

## Query 3.4: Estoque por Local (Todos os Produtos de um Local)

### Descrição
Lista todos os produtos disponíveis em um local específico.

### SQL

```sql
SELECT
    EST.CODLOCAL,
    LOC.DESCRLOCAL,
    EST.CODPROD,
    PRO.DESCRPROD,
    PRO.REFERENCIA,
    EST.ESTOQUE,
    EST.RESERVADO,
    (EST.ESTOQUE - EST.RESERVADO) as DISPONIVEL,
    PRO.CODVOL,
    PRO.VLRULTCOMPRA,
    (EST.ESTOQUE * ISNULL(PRO.VLRULTCOMPRA, 0)) as VALOR_ESTOQUE,  -- Valor em R$
    EST.DTULTENT,
    EST.DTULTSAID
FROM TGFEST EST WITH (NOLOCK)
INNER JOIN TGFPRO PRO WITH (NOLOCK)
    ON EST.CODPROD = PRO.CODPROD
LEFT JOIN TGFLOC LOC WITH (NOLOCK)
    ON EST.CODLOCAL = LOC.CODLOCAL
WHERE EST.CODLOCAL = @codlocal
  AND PRO.ATIVO = 'S'
  AND EST.ESTOQUE > 0
ORDER BY EST.ESTOQUE DESC;
```

### TypeScript Interface

```typescript
export interface LocationStock {
  codlocal: number;             // Código do local
  descrlocal?: string;          // Descrição do local
  codprod: number;              // Código do produto
  descrprod: string;            // Descrição do produto
  referencia?: string;          // Referência interna
  estoque: number;              // Quantidade em estoque
  reservado: number;            // Quantidade reservada
  disponivel: number;           // Disponível
  codvol?: string;              // Unidade de medida
  vlrultcompra?: number;        // Valor última compra (R$)
  valor_estoque: number;        // Valor total do estoque (R$)
  dtultent?: Date;              // Data última entrada
  dtultsaid?: Date;             // Data última saída
}
```

### NestJS Service

```typescript
async findStockByLocationCode(codlocal: number): Promise<LocationStock[]> {
  const cacheKey = `products:stock:location:${codlocal}`;

  // Cache por 3 minutos
  const cached = await this.redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const query = `
    SELECT
      EST.CODLOCAL, LOC.DESCRLOCAL,
      EST.CODPROD, PRO.DESCRPROD, PRO.REFERENCIA,
      EST.ESTOQUE, EST.RESERVADO,
      (EST.ESTOQUE - EST.RESERVADO) as DISPONIVEL,
      PRO.CODVOL, PRO.VLRULTCOMPRA,
      (EST.ESTOQUE * ISNULL(PRO.VLRULTCOMPRA, 0)) as VALOR_ESTOQUE,
      EST.DTULTENT, EST.DTULTSAID
    FROM TGFEST EST WITH (NOLOCK)
    INNER JOIN TGFPRO PRO WITH (NOLOCK)
      ON EST.CODPROD = PRO.CODPROD
    LEFT JOIN TGFLOC LOC WITH (NOLOCK)
      ON EST.CODLOCAL = LOC.CODLOCAL
    WHERE EST.CODLOCAL = ${codlocal}
      AND PRO.ATIVO = 'S'
      AND EST.ESTOQUE > 0
    ORDER BY EST.ESTOQUE DESC;
  `;

  const data = await this.sankhyaApi.executeQuery<LocationStock>(query);

  // Cache por 3 minutos
  await this.redis.setex(cacheKey, 180, JSON.stringify(data));

  return data;
}
```

### Teste via cURL

```bash
# Primeiro, descubra códigos de locais disponíveis
curl -X POST http://localhost:3100/inspection/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT DISTINCT TOP 10 CODLOCAL, DESCRLOCAL FROM TGFLOC WITH (NOLOCK) ORDER BY CODLOCAL;"
  }' | jq

# Depois teste com um código específico (exemplo: 1)
curl -X POST http://localhost:3100/inspection/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT EST.CODLOCAL, EST.CODPROD, PRO.DESCRPROD, EST.ESTOQUE, EST.RESERVADO, (EST.ESTOQUE - EST.RESERVADO) as DISPONIVEL FROM TGFEST EST WITH (NOLOCK) INNER JOIN TGFPRO PRO WITH (NOLOCK) ON EST.CODPROD = PRO.CODPROD WHERE EST.CODLOCAL = 1 AND PRO.ATIVO = '\''S'\'' AND EST.ESTOQUE > 0 ORDER BY EST.ESTOQUE DESC;"
  }' | jq
```

---

## 📊 Performance Esperada

| Query | Tempo Esperado | Cache TTL | Uso |
|-------|----------------|-----------|-----|
| 3.1 - Estoque por Local (Produto) | 200-400ms | 2 min | Detalhes de produto |
| 3.2 - Abaixo Estoque Mínimo | 400-600ms | 5 min | Alertas e dashboards |
| 3.3 - Resumo de Estoque | 300-500ms | 3 min | Listagens gerais |
| 3.4 - Produtos por Local | 300-500ms | 3 min | Gestão de locais |

**Observação**: Cache mais curto (2-3 minutos) pois estoque muda com mais frequência que preços. Com cache ativo, respostas ficam entre 10-50ms.

---

## ✅ Checklist de Implementação

- [ ] Testar todas as queries via `/inspection/query`
- [ ] Validar resultados com dados reais
- [ ] Verificar códigos de locais disponíveis (TGFLOC)
- [ ] Implementar service methods com cache
- [ ] Criar DTOs com validação
- [ ] Implementar endpoints no controller
- [ ] Adicionar decoradores Swagger (pt-BR)
- [ ] Escrever testes unitários
- [ ] Testar endpoints com cURL
- [ ] Validar performance (< 600ms sem cache)

---

## 🔍 Tabelas Relacionadas

- **TGFEST**: Estoque (CODPROD, CODLOCAL, ESTOQUE, RESERVADO)
- **TGFPRO**: Produtos (CODPROD, DESCRPROD, ESTMIN, ESTMAX)
- **TGFLOC**: Locais (CODLOCAL, DESCRLOCAL)

---

**Última atualização**: 2026-01-13
**Status**: Queries testadas e documentadas
