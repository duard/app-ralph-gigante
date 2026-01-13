# PRD: Dashboard de Produtos V3 - Design Moderno

**Versão**: 3.0.0  
**Data**: 2026-01-13  
**Status**: 🎯 Planning  
**Baseado em**: `/dashboard-2` template

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Objetivos](#objetivos)
3. [Análise do Template](#análise-do-template)
4. [Arquitetura](#arquitetura)
5. [Componentes](#componentes)
6. [API Endpoints](#api-endpoints)
7. [Roadmap de Implementação](#roadmap-de-implementação)
8. [Tasks Detalhadas](#tasks-detalhadas)

---

## 🎯 Visão Geral

Criar um **Dashboard de Produtos V3** moderno e performático, baseado no template `/dashboard-2`, totalmente integrado com dados reais do Sankhya ERP.

### **Diferenças entre Versões**

| Feature | V2 (Atual) | V3 (Nova) |
|---------|-----------|-----------|
| **Design** | Cards simples | Gradientes, sombras, animações |
| **Layout** | Grid fixo | Container queries + responsive |
| **KPIs** | 8 cards básicos | 4 KPIs com trends e insights |
| **Gráficos** | Recharts básico | Area charts com gradientes |
| **Filtros** | Sheet lateral | Inline + Quick Actions |
| **Performance** | Bom | Otimizado com virtualization |
| **API** | V1 (tgfpro) | V2 (novos endpoints agregados) |
| **UX** | Funcional | Premium com micro-interações |

---

## 🎯 Objetivos

### **Objetivos de Negócio**
1. ✅ Visão executiva instantânea do estoque
2. ✅ Identificação rápida de problemas críticos
3. ✅ Análise de tendências e previsões
4. ✅ Insights acionáveis para tomada de decisão

### **Objetivos Técnicos**
1. ✅ Performance sub-2s no carregamento
2. ✅ Código reutilizável e manutenível
3. ✅ API versioning (v2)
4. ✅ Type-safe end-to-end
5. ✅ Testes automatizados (80%+ coverage)

### **Objetivos de UX**
1. ✅ Interface intuitiva e moderna
2. ✅ Responsividade perfeita (mobile-first)
3. ✅ Feedback visual em todas interações
4. ✅ Acessibilidade WCAG 2.1 AA

---

## 📊 Análise do Template

### **Estrutura do Dashboard-2**

```
┌────────────────────────────────────────────────────┐
│  Header                        [Quick Actions]     │
├────────────────────────────────────────────────────┤
│  ┌──────┬──────┬──────┬──────┐                    │
│  │ KPI1 │ KPI2 │ KPI3 │ KPI4 │  Metrics Overview  │
│  └──────┴──────┴──────┴──────┘                    │
├─────────────────────┬──────────────────────────────┤
│  Sales Chart        │  Revenue Breakdown          │
│  (Area Chart)       │  (Donut/Bar Chart)          │
├─────────────────────┼──────────────────────────────┤
│  Recent             │  Top Products               │
│  Transactions       │  (Ranked List)              │
├─────────────────────┴──────────────────────────────┤
│  Customer Insights (Full Width)                    │
└────────────────────────────────────────────────────┘
```

### **Componentes Reutilizáveis**

1. **MetricsOverview** - 4 KPI cards com trends
2. **SalesChart** - Area chart com gradientes
3. **TopProducts** - Lista ranqueada com badges
4. **QuickActions** - Botões de ação rápida
5. **CardVariants** - Cards com gradientes e sombras

---

## 🏗️ Arquitetura

### **Stack Tecnológico**

#### **Frontend**
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **State**: TanStack Query + Zustand
- **UI**: Shadcn/ui + Tailwind CSS
- **Charts**: Recharts com customizações
- **Forms**: React Hook Form + Zod
- **Virtualization**: @tanstack/react-virtual

#### **Backend (Novos Endpoints V2)**
- **Framework**: NestJS + TypeScript
- **Database**: Oracle (Sankhya)
- **Cache**: Redis (in-memory)
- **Validation**: Class Validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### **Estrutura de Pastas**

```
📁 sankhya-products-dashboard/
├── src/
│   ├── app/
│   │   └── produtos-v3/                    # Nova rota
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── components/
│   │           ├── metrics-overview.tsx
│   │           ├── estoque-chart.tsx
│   │           ├── movimentacao-chart.tsx
│   │           ├── produtos-top.tsx
│   │           ├── produtos-criticos.tsx
│   │           ├── quick-actions.tsx
│   │           └── insights-panel.tsx
│   ├── hooks/
│   │   └── produtos-v3/
│   │       ├── use-dashboard-kpis.ts
│   │       ├── use-estoque-timeline.ts
│   │       ├── use-produtos-ranking.ts
│   │       └── use-movimentacao-resumo.ts
│   ├── services/
│   │   └── api/
│   │       └── v2/                         # Nova versão da API
│   │           ├── produtos.service.ts
│   │           ├── estoque.service.ts
│   │           └── movimentacao.service.ts
│   └── types/
│       └── v3/
│           └── dashboard.types.ts

📁 api-sankhya-center/
├── src/
│   ├── sankhya/
│   │   ├── produtos/
│   │   │   └── v2/                         # Nova versão
│   │   │       ├── produtos-v2.controller.ts
│   │   │       ├── produtos-v2.service.ts
│   │   │       ├── dto/
│   │   │       │   ├── dashboard-kpis.dto.ts
│   │   │       │   ├── estoque-timeline.dto.ts
│   │   │       │   └── produtos-ranking.dto.ts
│   │   │       └── queries/
│   │   │           ├── kpis.query.ts
│   │   │           ├── timeline.query.ts
│   │   │           └── ranking.query.ts
│   │   └── estoque/
│   │       └── v2/
│   │           ├── estoque-v2.controller.ts
│   │           └── estoque-v2.service.ts
```

---

## 🎨 Componentes

### **1. Header + Quick Actions**

```tsx
<div className="flex items-center justify-between">
  <div>
    <h1>Dashboard de Produtos V3</h1>
    <p>Visão executiva do estoque em tempo real</p>
  </div>
  <QuickActions />
</div>
```

**Quick Actions:**
- 🔄 Atualizar Dados
- 📊 Exportar Relatório
- 📥 Importar Produtos
- ⚙️ Configurações

---

### **2. Metrics Overview (4 KPIs Premium)**

#### **KPI 1: Valor Total em Estoque**
```
┌─────────────────────────┐
│ 💰 Valor em Estoque    │
│                         │
│ R$ 2.5M                │ ← Valor principal
│ ↑ +12.3%               │ ← Trend badge
│                         │
│ Trending up this month │ ← Footer
│ Strong inventory value │ ← Subfooter
└─────────────────────────┘
```

**Dados:**
- Valor atual (SUM de valorEstoque)
- Variação vs mês anterior
- Trend (up/down)
- Mensagem contextual

#### **KPI 2: Produtos Ativos**
```
┌─────────────────────────┐
│ 📦 Produtos Ativos     │
│                         │
│ 13,264                 │
│ ↑ +5.2%                │
│                         │
│ Strong catalog growth  │
│ Exceeds targets        │
└─────────────────────────┘
```

#### **KPI 3: Movimentações**
```
┌─────────────────────────┐
│ 🔄 Movimentações Mês   │
│                         │
│ 1,247                  │
│ ↓ -2.1%                │
│                         │
│ Down 2% this period    │
│ Needs attention        │
└─────────────────────────┘
```

#### **KPI 4: Taxa de Giro**
```
┌─────────────────────────┐
│ 📈 Taxa de Giro        │
│                         │
│ 3.24x                  │
│ ↑ +8.3%                │
│                         │
│ Steady performance     │
│ Meets projections      │
└─────────────────────────┘
```

---

### **3. Estoque Timeline (Area Chart)**

```
┌──────────────────────────────────────────────┐
│ Evolução do Estoque                 [6m ▼] │
│ Quantidade e valor ao longo do tempo        │
├──────────────────────────────────────────────┤
│                                              │
│     [AREA CHART COM GRADIENTE]              │
│     - Linha 1: Quantidade (blue gradient)   │
│     - Linha 2: Valor (green gradient)       │
│     - Grid: subtle                          │
│     - Tooltip: customizado                  │
│                                              │
└──────────────────────────────────────────────┘
```

**Dados:**
- Eixo X: Meses (últimos 12)
- Eixo Y1: Quantidade total
- Eixo Y2: Valor total (R$)
- Selector: 3m / 6m / 12m / YTD

---

### **4. Movimentação Breakdown (Donut Chart)**

```
┌──────────────────────────────────────────────┐
│ Distribuição de Movimentações               │
│ Por tipo de operação                        │
├──────────────────────────────────────────────┤
│                                              │
│         [DONUT CHART]                       │
│       - Vendas: 45%                         │
│       - Compras: 30%                        │
│       - Transferências: 15%                 │
│       - Ajustes: 10%                        │
│                                              │
│  Legenda com cores e percentuais            │
└──────────────────────────────────────────────┘
```

---

### **5. Top Produtos (Ranked List)**

```
┌──────────────────────────────────────────────────┐
│ Top Produtos                     [👁 View All]  │
│ Produtos com melhor performance este mês        │
├──────────────────────────────────────────────────┤
│ #1 │ PRODUTO A             │ R$ 142k │ ↑ 23% │
│    │ ⭐ 4.8 • 2847 vendas │ Stock:145│       │
├──────────────────────────────────────────────────┤
│ #2 │ PRODUTO B             │ R$ 96k  │ ↑ 18% │
│    │ ⭐ 4.6 • 1923 vendas │ Stock:67 │       │
├──────────────────────────────────────────────────┤
│ #3 │ PRODUTO C             │ R$ 73k  │ ↑ 12% │
│    │ ⭐ 4.9 • 1456 vendas │ Stock:234│       │
├──────────────────────────────────────────────────┤
│ #4 │ PRODUTO D             │ R$ 178k │ ↑ 8%  │
│ #5 │ PRODUTO E             │ R$ 68k  │ ↑ 31% │
└──────────────────────────────────────────────────┘
```

**Dados por Produto:**
- Ranking (#)
- Nome + Categoria
- Rating (calculado)
- Quantidade vendida
- Revenue
- Growth %
- Stock atual com progress bar

---

### **6. Produtos Críticos (Alert List)**

```
┌──────────────────────────────────────────────────┐
│ ⚠️ Produtos Críticos              [15 itens]    │
│ Produtos abaixo do estoque mínimo               │
├──────────────────────────────────────────────────┤
│ PRODUTO X       │ Atual: 5  │ Mín: 20  │ ⚠️    │
│ Ref: ABC123     │ Falta: 15 │          │ Ação  │
├──────────────────────────────────────────────────┤
│ PRODUTO Y       │ Atual: 2  │ Mín: 50  │ 🚨    │
│ Ref: DEF456     │ Falta: 48 │          │ Ação  │
└──────────────────────────────────────────────────┘
```

---

### **7. Insights Panel (Full Width)**

```
┌─────────────────────────────────────────────────────────┐
│ 💡 Insights e Recomendações                            │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┬──────────┬──────────┬──────────┐         │
│ │ Insight1 │ Insight2 │ Insight3 │ Insight4 │         │
│ │ 🔴 Alto  │ 🟡 Médio │ 🟢 Baixo │ 🔵 Info  │         │
│ └──────────┴──────────┴──────────┴──────────┘         │
└─────────────────────────────────────────────────────────┘
```

**Tipos de Insights:**
1. 🔴 **Alto Risco**: Produtos críticos, rupturas
2. 🟡 **Atenção**: Tendências negativas, slow movers
3. 🟢 **Oportunidade**: Produtos em alta, margens boas
4. 🔵 **Informativo**: Estatísticas gerais

---

## 🔌 API Endpoints (V2)

### **Base URL**: `/api/v2/produtos`

#### **1. GET `/dashboard/kpis`**

**Response:**
```json
{
  "valorEstoque": {
    "atual": 2500000,
    "anterior": 2230000,
    "variacao": 12.3,
    "trend": "up"
  },
  "produtosAtivos": {
    "atual": 13264,
    "anterior": 12595,
    "variacao": 5.2,
    "trend": "up"
  },
  "movimentacoes": {
    "atual": 1247,
    "anterior": 1274,
    "variacao": -2.1,
    "trend": "down"
  },
  "taxaGiro": {
    "atual": 3.24,
    "anterior": 2.99,
    "variacao": 8.3,
    "trend": "up"
  }
}
```

#### **2. GET `/dashboard/timeline`**

**Query Params:**
- `periodo`: "3m" | "6m" | "12m" | "ytd"
- `metrica`: "quantidade" | "valor" | "ambos"

**Response:**
```json
{
  "periodo": "6m",
  "data": [
    {
      "mes": "2025-08",
      "quantidade": 145000,
      "valor": 2100000,
      "movimentacoes": 450
    },
    // ...
  ]
}
```

#### **3. GET `/dashboard/ranking`**

**Query Params:**
- `criterio`: "receita" | "quantidade" | "margem" | "giro"
- `limite`: number (default: 10)
- `periodo`: "mes" | "trimestre" | "ano"

**Response:**
```json
{
  "criterio": "receita",
  "periodo": "mes",
  "produtos": [
    {
      "ranking": 1,
      "codprod": 3680,
      "descrprod": "PRODUTO A",
      "categoria": "Ferramentas",
      "receita": 142350,
      "quantidade": 2847,
      "crescimento": 23,
      "rating": 4.8,
      "estoque": 145
    },
    // ...
  ]
}
```

#### **4. GET `/dashboard/criticos`**

**Response:**
```json
{
  "total": 15,
  "produtos": [
    {
      "codprod": 1234,
      "descrprod": "PRODUTO X",
      "referencia": "ABC123",
      "estoqueAtual": 5,
      "estoqueMinimo": 20,
      "faltante": 15,
      "severidade": "alta",
      "ultimaCompra": "2025-12-01",
      "leadTime": 30
    },
    // ...
  ]
}
```

#### **5. GET `/dashboard/insights`**

**Response:**
```json
{
  "insights": [
    {
      "tipo": "critico",
      "severidade": "alta",
      "titulo": "15 produtos abaixo do estoque mínimo",
      "descricao": "Ação imediata necessária para evitar rupturas",
      "acoes": [
        {
          "label": "Ver Produtos",
          "href": "/produtos-v3/criticos"
        }
      ]
    },
    // ...
  ]
}
```

---

## 🗺️ Roadmap de Implementação

### **Fase 1: Backend (API V2)** - 2 semanas

#### **Sprint 1: Estrutura Base**
- [ ] Criar módulo `produtos-v2`
- [ ] Setup controllers, services, DTOs
- [ ] Configurar versionamento de API
- [ ] Setup Redis cache
- [ ] Criar queries SQL otimizadas

#### **Sprint 2: Endpoints Core**
- [ ] Implementar `/dashboard/kpis`
- [ ] Implementar `/dashboard/timeline`
- [ ] Implementar `/dashboard/ranking`
- [ ] Implementar `/dashboard/criticos`
- [ ] Implementar `/dashboard/insights`

#### **Sprint 3: Otimização**
- [ ] Adicionar cache strategies
- [ ] Otimizar queries complexas
- [ ] Implementar rate limiting
- [ ] Adicionar logging estruturado
- [ ] Testes unitários e de integração

---

### **Fase 2: Frontend (Dashboard V3)** - 2 semanas

#### **Sprint 4: Estrutura Base**
- [ ] Criar rota `/produtos-v3`
- [ ] Setup componentes base
- [ ] Criar hooks customizados
- [ ] Implementar types TypeScript
- [ ] Setup TanStack Query

#### **Sprint 5: Componentes Principais**
- [ ] MetricsOverview (4 KPIs)
- [ ] EstoqueChart (Area chart)
- [ ] MovimentacaoChart (Donut chart)
- [ ] ProdutosTop (Ranked list)
- [ ] ProdutosCriticos (Alert list)

#### **Sprint 6: Features Avançadas**
- [ ] QuickActions (botões de ação)
- [ ] InsightsPanel (recomendações)
- [ ] Filtros inline
- [ ] Export functionality
- [ ] Loading states + skeletons

#### **Sprint 7: UX e Polimento**
- [ ] Animações e transições
- [ ] Responsividade completa
- [ ] Acessibilidade (ARIA)
- [ ] Dark mode optimization
- [ ] Performance optimization

---

### **Fase 3: Testing & Deploy** - 1 semana

#### **Sprint 8: Quality Assurance**
- [ ] Testes E2E com Playwright
- [ ] Testes de performance
- [ ] Testes de acessibilidade
- [ ] Code review
- [ ] Documentação

---

## 📝 Tasks Detalhadas

### **BACKEND TASKS**

#### **TASK-B001: Setup Módulo V2**
```typescript
// api-sankhya-center/src/sankhya/produtos/v2/produtos-v2.module.ts
@Module({
  imports: [CacheModule.register()],
  controllers: [ProdutosV2Controller],
  providers: [ProdutosV2Service, KpisQuery, TimelineQuery],
  exports: [ProdutosV2Service],
})
export class ProdutosV2Module {}
```

#### **TASK-B002: KPIs Endpoint**
```sql
-- Query para KPIs com comparação período anterior
WITH PERIODO_ATUAL AS (
  SELECT 
    SUM(est.ESTOQUE * ite.VLRUNIT) as valor_estoque,
    COUNT(DISTINCT pro.CODPROD) as total_produtos,
    COUNT(DISTINCT mov.NUNOTA) as total_movimentacoes
  FROM TGFPRO pro
  LEFT JOIN TGFEST est ON est.CODPROD = pro.CODPROD
  LEFT JOIN TGFITE ite ON ite.CODPROD = pro.CODPROD
  LEFT JOIN TGFCAB mov ON mov.NUNOTA = ite.NUNOTA
  WHERE pro.ATIVO = 'S'
    AND MONTH(mov.DTNEG) = MONTH(GETDATE())
),
PERIODO_ANTERIOR AS (
  -- Similar query para mês anterior
)
SELECT 
  pa.valor_estoque,
  (pa.valor_estoque - pant.valor_estoque) / pant.valor_estoque * 100 as variacao
FROM PERIODO_ATUAL pa
CROSS JOIN PERIODO_ANTERIOR pant
```

---

### **FRONTEND TASKS**

#### **TASK-F001: Metrics Overview Component**
```tsx
// src/app/produtos-v3/components/metrics-overview.tsx
export function MetricsOverview() {
  const { data, isLoading } = useDashboardKpis();
  
  const metrics = [
    {
      title: 'Valor em Estoque',
      value: formatCurrency(data?.valorEstoque.atual),
      change: `${data?.valorEstoque.variacao}%`,
      trend: data?.valorEstoque.trend,
      icon: DollarSign,
      footer: getTrendMessage(data?.valorEstoque),
    },
    // ... outros KPIs
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map(metric => (
        <KpiCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
```

#### **TASK-F002: Estoque Timeline Chart**
```tsx
// src/app/produtos-v3/components/estoque-chart.tsx
export function EstoqueChart() {
  const [periodo, setPeriodo] = useState('6m');
  const { data } = useEstoqueTimeline(periodo);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Estoque</CardTitle>
        <Select value={periodo} onValueChange={setPeriodo}>
          {/* Options */}
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer>
          <AreaChart data={data}>
            {/* Area com gradiente */}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```

---

## 🎨 Design System V3

### **Cores e Gradientes**

```css
/* KPI Cards */
.kpi-card {
  background: linear-gradient(to top, 
    hsl(var(--primary) / 0.05), 
    hsl(var(--card))
  );
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

/* Area Chart Gradients */
.chart-gradient-blue {
  --color-stop-1: hsl(var(--primary) / 0.4);
  --color-stop-2: hsl(var(--primary) / 0.05);
}

.chart-gradient-green {
  --color-stop-1: hsl(142 76% 36% / 0.4);
  --color-stop-2: hsl(142 76% 36% / 0.05);
}
```

### **Animações**

```css
/* Hover effects */
.kpi-card {
  transition: all 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Loading shimmer */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

---

## 📊 Métricas de Sucesso

### **Performance**
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Cumulative Layout Shift < 0.1

### **Quality**
- ✅ TypeScript coverage: 100%
- ✅ Test coverage: 80%+
- ✅ Lighthouse Score: 95+
- ✅ Bundle size: < 500KB

### **User Metrics**
- ✅ Time to decision: < 30s
- ✅ User satisfaction: 4.5/5
- ✅ Daily active users: +20%

---

## 🚀 Próximos Passos

1. **Aprovação do PRD** ✅
2. **Setup do ambiente** (Sprint 1)
3. **Desenvolvimento Backend** (Sprints 1-3)
4. **Desenvolvimento Frontend** (Sprints 4-7)
5. **Testing & Deploy** (Sprint 8)
6. **Monitoramento e Iteração**

---

## 📚 Referências

- [Dashboard-2 Template](http://localhost:5173/dashboard-2)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Recharts Documentation](https://recharts.org/)
- [TanStack Query](https://tanstack.com/query)
- [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)

---

**Status**: 🎯 Ready for Implementation  
**Próxima Ação**: Aprovação e início do Sprint 1
