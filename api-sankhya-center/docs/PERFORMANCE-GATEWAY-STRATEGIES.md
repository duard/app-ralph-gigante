# Estratégias de Performance para Database Gateway

## 🎯 Contexto

Nossa API **não acessa o database Sankhya diretamente**. Usamos um **database gateway** (API externa):

```
Nossa API (NestJS)
    ↓ HTTP Request
Database Gateway API (porta 3100)
    ↓ SQL Connection
Sankhya SQL Server Database
```

**Implicações**:
- ✅ Segurança: Não expõe database diretamente
- ✅ Validação: Gateway bloqueia SELECT *, CTEs, campos binários
- ❌ Latência: Adiciona overhead de rede e processamento
- ❌ Limitações: Não podemos usar alguns recursos SQL avançados

---

## ⏱️ Expectativas de Performance

### Tempos Típicos

| Operação | Gateway | SQL Direto | Overhead |
|----------|---------|------------|----------|
| Query simples (5 campos, 10 rows) | 150-300ms | 5-10ms | ~20x |
| Query complexa (JOIN 3 tabelas, 100 rows) | 300-500ms | 20-50ms | ~10x |
| Query analytics (agregações, 1000+ rows) | 500-1000ms | 50-100ms | ~10x |
| Query com OUTER APPLY múltiplos | 800-1500ms | 100-200ms | ~8x |

**Componentes do tempo total**:
```
Total = Network Latency + Gateway Processing + SQL Execution + Serialization

Exemplo: 300ms total
  - 50ms: Latência rede (ida + volta)
  - 100ms: Processamento gateway (parsing, validação, proxy)
  - 100ms: Execução SQL no servidor
  - 50ms: Serialização JSON + transferência
```

---

## 🚀 Estratégias de Otimização

### 1. Minimizar Roundtrips (Mais Importante!)

#### ❌ EVITAR: Múltiplas queries sequenciais (N+1 problem)

```typescript
// ❌ MAU - 1 query inicial + N queries para cada produto
async getBadProductsWithPrices() {
  const products = await this.getProducts(); // 1 query

  for (const product of products) {
    // N queries adicionais!
    product.lastPrice = await this.getLastPrice(product.codprod);
    product.avgPrice = await this.getAvgPrice(product.codprod);
  }

  return products;
}

// Tempo total: 200ms + (100 produtos × 150ms) = 15 SEGUNDOS! 😱
```

#### ✅ BOM: Uma query com OUTER APPLY

```typescript
// ✅ BOM - 1 única query
async getGoodProductsWithPrices() {
  const query = `
    SELECT
      P.CODPROD,
      P.DESCRPROD,
      LAST_PRICE.VLRUNIT AS LAST_PRICE,
      AVG_PRICE.PRECO_MEDIO AS AVG_PRICE
    FROM TGFPRO P WITH (NOLOCK)
    OUTER APPLY (
      SELECT TOP 1 I.VLRUNIT
      FROM TGFCAB C WITH (NOLOCK)
      JOIN TGFITE I WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA
      WHERE I.CODPROD = P.CODPROD
        AND C.TIPMOV = 'O'
        AND C.STATUSNOTA = 'L'
      ORDER BY C.DTMOV DESC
    ) LAST_PRICE
    OUTER APPLY (
      SELECT AVG(I.VLRUNIT) AS PRECO_MEDIO
      FROM (
        SELECT TOP 10 I2.VLRUNIT
        FROM TGFCAB C2 WITH (NOLOCK)
        JOIN TGFITE I2 WITH (NOLOCK) ON I2.NUNOTA = C2.NUNOTA
        WHERE I2.CODPROD = P.CODPROD
          AND C2.TIPMOV = 'O'
          AND C2.STATUSNOTA = 'L'
        ORDER BY C2.DTMOV DESC
      ) I
    ) AVG_PRICE
    WHERE P.ATIVO = 'S'
  `;

  return this.sankhyaApiService.executeQuery(query, []);
}

// Tempo total: 500ms (30x mais rápido!)
```

---

### 2. Cache Estratégico Multi-Layer

#### Layer 1: In-Memory Cache (Node.js)

```typescript
import { Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  private memoryCache = new Map<string, { data: any; expires: number }>();

  async getProduct(codprod: number) {
    const cacheKey = `product:${codprod}`;
    const cached = this.memoryCache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      return cached.data; // Retorno instantâneo!
    }

    const data = await this.fetchFromDatabase(codprod);

    this.memoryCache.set(cacheKey, {
      data,
      expires: Date.now() + 60000 // 1 minuto
    });

    return data;
  }
}
```

**Vantagens**:
- ⚡ Extremamente rápido (< 1ms)
- 💰 Grátis (sem infra adicional)
- 🎯 Ideal para dados que mudam pouco

**Desvantagens**:
- 🔄 Não compartilhado entre instâncias
- 💾 Limitado pela RAM do processo

---

#### Layer 2: Redis Cache (Distribuído)

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class ProductService {
  constructor(private redis: RedisService) {}

  async getProductsWithCache() {
    const cacheKey = 'products:active';

    // Tentar Redis primeiro
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached); // ~5-10ms
    }

    // Se não está no cache, buscar do database
    const data = await this.fetchFromDatabase(); // ~300ms

    // Guardar no Redis por 5 minutos
    await this.redis.setex(cacheKey, 300, JSON.stringify(data));

    return data;
  }
}
```

**Vantagens**:
- 🌐 Compartilhado entre todas as instâncias
- 📊 Ideal para dados agregados/computados
- ⚙️ Controle fino de expiração

**Desvantagens**:
- 🏗️ Requer infraestrutura Redis
- 🐌 Mais lento que memória (mas ainda rápido: 5-10ms)

---

#### Layer 3: Computed Data (Simula Materialized Views)

```typescript
// Background job (roda a cada 10 minutos)
@Cron('*/10 * * * *')
async computeProductStats() {
  const stats = await this.heavyAnalyticsQuery(); // Pode levar 5 segundos

  await this.redis.set('product:stats', JSON.stringify(stats), 600);
}

// Endpoint (retorna instantaneamente)
async getProductStats() {
  const cached = await this.redis.get('product:stats');

  if (cached) {
    return JSON.parse(cached); // ~5ms
  }

  // Fallback se cache expirou
  return this.computeProductStats();
}
```

---

### 3. Estratégias de Cache por Tipo de Dado

| Tipo de Dado | TTL Recomendado | Estratégia | Razão |
|--------------|-----------------|------------|-------|
| Lista de produtos ativos | 5-10 min | Redis | Muda raramente |
| Detalhes de 1 produto | 2-5 min | Memory + Redis | Leitura frequente |
| Preço última compra | 1-2 min | Redis | Pode mudar |
| Preço médio (10 compras) | 5-10 min | Redis | Mais estável |
| Estoque por local | 30 seg - 1 min | Memory | Muda com frequência |
| Lista de grupos | 30-60 min | Memory | Quase nunca muda |
| Dashboard KPIs | 2-5 min | Redis + Background Job | Computação pesada |
| Autocomplete | 10-30 min | Redis | Alto volume de reads |

---

### 4. Batch Operations

#### ❌ EVITAR: Processar 1 por vez

```typescript
async updateMultipleProducts(products: Product[]) {
  for (const product of products) {
    await this.updateProduct(product); // 300ms cada
  }
}
// Tempo: 100 produtos × 300ms = 30 segundos
```

#### ✅ BOM: Processar em batch

```typescript
async updateMultipleProducts(products: Product[]) {
  // Agrupar em lotes de 50
  const batches = chunk(products, 50);

  for (const batch of batches) {
    await Promise.all(
      batch.map(p => this.updateProduct(p))
    );
  }
}
// Tempo: (100 produtos / 50 por batch) × 300ms = 600ms
```

---

### 5. Pagination Inteligente

```typescript
export class FindProductsDto {
  @IsInt()
  @Min(1)
  @Max(100) // ⭐ Limite máximo!
  perPage: number = 20; // Default menor

  @IsInt()
  @Min(1)
  page: number = 1;
}

// Na query, sempre usar TOP/OFFSET-FETCH
const query = `
  SELECT TOP ${dto.perPage}
    CODPROD, DESCRPROD, VLRULTCOMPRA
  FROM TGFPRO WITH (NOLOCK)
  WHERE ATIVO = 'S'
  ORDER BY CODPROD DESC
  OFFSET ${(dto.page - 1) * dto.perPage} ROWS
  FETCH NEXT ${dto.perPage} ROWS ONLY
`;
```

**Vantagens**:
- Menos dados transferidos pela rede
- Queries mais rápidas
- Melhor UX (carregamento progressivo)

---

### 6. Campos Selecionados (evitar over-fetching)

```typescript
// ❌ Buscar tudo quando só precisa de nome e preço
const query = `
  SELECT
    CODPROD, DESCRPROD, REFERENCIA, REFFORN, ATIVO, USOPROD,
    CODGRUPOPROD, FABRICANTE, MARCA, VLRUNIT, VLRULTCOMPRA,
    CUSTO, CUSTOCONT, CUSTOFIN, MARGEM, PRECOVENDA, PRECOVENDA2,
    ... (50 campos!)
  FROM TGFPRO
  WHERE CODPROD = 3680
`;

// ✅ Buscar só o necessário
const query = `
  SELECT CODPROD, DESCRPROD, VLRULTCOMPRA
  FROM TGFPRO WITH (NOLOCK)
  WHERE CODPROD = 3680
`;
```

**Impacto**:
- 50 campos: ~300ms
- 3 campos: ~150ms (2x mais rápido!)

---

### 7. Índices Virtuais (Cache de Listagens)

```typescript
// Manter um índice em cache para buscas rápidas
class ProductIndexService {
  async rebuildIndex() {
    const products = await this.fetchAllProducts(); // 1 vez só

    // Criar índices
    const byCode = new Map(products.map(p => [p.codprod, p]));
    const byName = this.buildSearchIndex(products);

    await this.redis.set('index:products:code', JSON.stringify([...byCode]));
    await this.redis.set('index:products:name', JSON.stringify(byName));
  }

  async searchByName(term: string) {
    const index = await this.redis.get('index:products:name');
    return this.searchInIndex(JSON.parse(index), term); // ~10ms
  }
}
```

---

### 8. Query Optimization Checklist

Antes de executar uma query via gateway:

- [ ] Usar `WITH (NOLOCK)` em todas as tabelas
- [ ] Limitar resultados com `TOP N`
- [ ] Especificar apenas campos necessários
- [ ] Evitar funções em WHERE em colunas indexadas
- [ ] Usar OUTER APPLY em vez de subqueries correlacionadas
- [ ] Combinar múltiplas informações em 1 query (OUTER APPLY)
- [ ] Filtrar o máximo possível no SQL (não no JavaScript)
- [ ] Considerar cache para essa query?
- [ ] TTL adequado se usar cache?

---

## 🎯 Performance Targets por Endpoint

### Endpoints Simples
```
GET /products/:id
Target: < 200ms (com cache: < 50ms)
Estratégia: Cache Redis 2 min
```

### Endpoints de Listagem
```
GET /products?page=1&perPage=20
Target: < 500ms (com cache: < 100ms)
Estratégia: Cache Redis 5 min + Pagination
```

### Endpoints de Dashboard
```
GET /products/dashboard
Target: < 1000ms (com cache: < 100ms)
Estratégia: Background job + Redis cache 5 min
```

### Endpoints de Analytics
```
GET /products/analytics/price-history
Target: < 2000ms (com cache: < 200ms)
Estratégia: Background job + Redis cache 10 min (simula materialized view)
```

---

## 📊 Monitoring e Logs

```typescript
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;

        // Log queries lentas
        if (duration > 1000) {
          this.logger.warn(`Slow query: ${request.url} - ${duration}ms`);
        }

        // Métricas
        this.metrics.recordQueryTime(request.url, duration);
      })
    );
  }
}
```

---

## 🔧 Configuração Recomendada

### Redis Configuration

```typescript
// redis.config.ts
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,

  // Configurações otimizadas
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false,

  // Timeouts
  connectTimeout: 10000,
  commandTimeout: 5000,
};
```

### Cache TTL Constants

```typescript
// cache.constants.ts
export const CACHE_TTL = {
  PRODUCTS_LIST: 300,        // 5 minutos
  PRODUCT_DETAIL: 120,       // 2 minutos
  PRODUCT_PRICES: 60,        // 1 minuto
  PRODUCT_STOCK: 30,         // 30 segundos
  PRODUCT_GROUPS: 1800,      // 30 minutos
  DASHBOARD_KPIS: 300,       // 5 minutos
  AUTOCOMPLETE: 600,         // 10 minutos
} as const;
```

---

## 📈 Resultados Esperados

Com essas estratégias implementadas:

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| P50 (mediana) | 800ms | 150ms | 5.3x |
| P95 | 2000ms | 500ms | 4x |
| P99 | 5000ms | 1000ms | 5x |
| Cache hit rate | 0% | 70-80% | ∞ |
| Queries/segundo | 10 | 200 | 20x |

---

**Última atualização**: 2026-01-13
