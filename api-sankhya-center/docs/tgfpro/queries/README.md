# Queries TGFPRO - Testadas e Prontas para Implementação

## 📋 Índice de Queries

Todas as queries neste diretório foram **testadas via `/inspection/query`** e estão prontas para implementação no NestJS.

### Workflow de Desenvolvimento

```
1. Testar Query → /inspection/query com curl
2. Validar Resultados → Verificar dados retornados
3. Definir Interface → TypeScript types
4. Implementar Service → NestJS service method
5. Adicionar Cache → Redis strategy
6. Testar Endpoint → curl no endpoint final
```

---

## 📁 Categorias de Queries

### [01 - Basic Listing](./01-basic-listing.md)
Queries básicas de listagem de produtos

- ✅ Lista produtos ativos
- ✅ Busca por código
- ✅ Busca por descrição
- ✅ Filtros básicos (grupo, ativo, tipo)
- ✅ Paginação

**Complexity**: ⭐ Simples
**Performance**: ~150-300ms
**Cache TTL**: 5 minutos

---

### [02 - Pricing](./02-pricing.md)
Queries de precificação e custos

- ✅ Preço última compra
- ✅ Preço médio ponderado (últimas N compras)
- ✅ Preço médio simples
- ✅ Histórico de preços
- ✅ Comparação de estratégias

**Complexity**: ⭐⭐ Média
**Performance**: ~300-600ms
**Cache TTL**: 1-2 minutos

---

### [03 - Stock](./03-stock.md)
Queries de estoque e locais

- ✅ Estoque por local
- ✅ Estoque total consolidado
- ✅ Produtos abaixo do mínimo
- ✅ Produtos sem estoque
- ✅ Hierarquia de locais

**Complexity**: ⭐⭐ Média
**Performance**: ~200-400ms
**Cache TTL**: 30 segundos - 1 minuto

---

### [04 - Analytics](./04-analytics.md)
Queries analíticas e agregações

- ✅ Movimentação por período
- ✅ Análise de consumo
- ✅ Tendências de preço
- ✅ Comparação entre produtos
- ✅ Ranking de produtos

**Complexity**: ⭐⭐⭐ Alta
**Performance**: ~500-1500ms
**Cache TTL**: 5-10 minutos

---

### [05 - Dashboard](./05-dashboard.md)
Queries para KPIs e dashboard

- ✅ Dashboard completo de produto
- ✅ KPIs agregados
- ✅ Alertas (estoque baixo, sem compra há X dias)
- ✅ Resumo por grupo
- ✅ Métricas de performance

**Complexity**: ⭐⭐⭐ Alta
**Performance**: ~800-2000ms
**Cache TTL**: 5 minutos + Background job

---

## 🧪 Como Testar Queries

### 1. Obter Token de Autenticação

```bash
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

echo $TOKEN
```

### 2. Executar Query

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 10 CODPROD, DESCRPROD FROM TGFPRO WITH (NOLOCK) WHERE ATIVO = '\''S'\''"
  }' | jq '.'
```

### 3. Salvar Resultado para Análise

```bash
curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @query.json > result.json

# Analisar
jq '.[] | {codprod, descrprod, vlrultcompra}' result.json
```

---

## 📊 Template de Documentação de Query

Cada arquivo de query segue este template:

```markdown
# Nome da Query

## 📝 Descrição
O que esta query faz

## 🎯 Use Case
Quando usar esta query

## 📋 SQL Query

```sql
-- Query SQL testada
SELECT ...
```

## 🧪 Teste com Curl

```bash
# Comando curl completo
curl -s...
```

## 📥 Resultado Esperado

```json
// Exemplo de resultado
```

## 📦 Interface TypeScript

```typescript
// Interface para o resultado
```

## ⚙️ Implementação NestJS

```typescript
// Service method
```

## 💾 Estratégia de Cache

- TTL: X minutos
- Key pattern: `products:...`
- Invalidação: Quando...

## ⚡ Performance

- Tempo estimado: Xms
- Otimizações aplicadas: ...
- Considerações: ...
```

---

## 🎯 Padrões e Convenções

### Nomenclatura de Queries

```typescript
// Nomenclatura consistente
findProducts()                    // Lista básica
findProductById()                 // Busca específica
findProductsWithPrices()          // Com dados relacionados
getProductLastPrice()             // Dados calculados
getProductAnalytics()             // Analytics/agregações
getDashboardKPIs()                // Dashboard
```

### Sempre Incluir

```sql
-- Em todas as queries:
WITH (NOLOCK)                     -- Evitar locks
WHERE ATIVO = 'S'                 -- Apenas ativos
TOP N ou OFFSET-FETCH             -- Limitar resultados
ORDER BY                          -- Sempre ordenar
```

### Performance Checklist

Antes de implementar:
- [ ] Query testada via `/inspection/query`
- [ ] Tempo de resposta aceitável (< 2s)
- [ ] Apenas campos necessários
- [ ] Filtros aplicados no SQL (não no JS)
- [ ] OUTER APPLY usado quando apropriado
- [ ] Cache strategy definida
- [ ] Interface TypeScript criada
- [ ] Testes de erro (produto inexistente, etc)

---

## 🔄 Workflow de Atualização

Quando adicionar nova query:

1. **Criar arquivo** na categoria apropriada
2. **Testar query** via curl + `/inspection/query`
3. **Documentar** usando template acima
4. **Implementar** service method
5. **Adicionar cache** se aplicável
6. **Testar endpoint** final
7. **Atualizar** este README com link

---

## 📚 Recursos Relacionados

- [DATABASE-INSPECTION-GUIDE.md](../../DATABASE-INSPECTION-GUIDE.md) - Como descobrir estruturas
- [PERFORMANCE-GATEWAY-STRATEGIES.md](../../PERFORMANCE-GATEWAY-STRATEGIES.md) - Otimização de performance
- [PRODUCTS-MODULE-COMPLETE.md](../../PRODUCTS-MODULE-COMPLETE.md) - Guia completo do módulo

---

## 🚀 Quick Start

### Exemplo Completo: Do Teste à Implementação

**1. Criar e testar query:**

```bash
# test-query.sh
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

curl -s -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 5 CODPROD, DESCRPROD, VLRULTCOMPRA FROM TGFPRO WITH (NOLOCK) WHERE ATIVO = '\''S'\'' ORDER BY CODPROD DESC"
  }' | jq '.'
```

**2. Definir interface:**

```typescript
// product.interface.ts
export interface ProductBasic {
  codprod: number;
  descrprod: string;
  vlrultcompra: number;
}
```

**3. Implementar service:**

```typescript
// product.service.ts
async findBasicProducts(limit: number = 10): Promise<ProductBasic[]> {
  const query = `
    SELECT TOP ${limit}
      CODPROD,
      DESCRPROD,
      VLRULTCOMPRA
    FROM TGFPRO WITH (NOLOCK)
    WHERE ATIVO = 'S'
    ORDER BY CODPROD DESC
  `;

  return this.sankhyaApiService.executeQuery(query, []);
}
```

**4. Adicionar cache:**

```typescript
async findBasicProductsWithCache(limit: number = 10): Promise<ProductBasic[]> {
  const cacheKey = `products:basic:${limit}`;

  const cached = await this.redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const data = await this.findBasicProducts(limit);

  await this.redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min TTL

  return data;
}
```

**5. Criar endpoint:**

```typescript
// product.controller.ts
@Get()
async getProducts(@Query('limit') limit: number = 10) {
  return this.productService.findBasicProductsWithCache(limit);
}
```

**6. Testar endpoint:**

```bash
curl http://localhost:3000/products?limit=5
```

---

**Última atualização**: 2026-01-13
