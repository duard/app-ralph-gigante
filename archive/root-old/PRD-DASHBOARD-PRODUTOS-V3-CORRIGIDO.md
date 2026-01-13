# PRD: Dashboard de Produtos V3 - Gestão de Compras e Consumo

**Versão**: 3.0.0  
**Data**: 2026-01-13  
**Status**: 🎯 Planning  
**Contexto**: Empresa de **CONSUMO** (não vende, apenas compra e consome)  
**Baseado em**: `/dashboard-2` template + SQLs de movimentação

---

## 📋 Contexto do Negócio

### **Fluxo de Materiais**

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  FORNECEDOR  │  -->  │   ESTOQUE    │  -->  │  CONSUMO     │
│   (Compra)   │       │   (Almox)    │       │ (Requisição) │
└──────────────┘       └──────────────┘       └──────────────┘
     TIPMOV=C            TGFEST                  TIPMOV=Q
  ATUALESTOQUE>0                              ATUALESTOQUE<0
```

### **Tipos de Movimentação (TIPMOV)**

| Tipo | Descrição | Impacto | ATUALESTOQUE |
|------|-----------|---------|--------------|
| **C** | Compra | ➕ Entrada | > 0 |
| **Q** | Requisição/Consumo | ➖ Saída | < 0 |
| **T** | Transferência | ↔️ Neutro | ±  |
| **L** | Ajuste/Lançamento | ± Ajuste | ±  |

### **Métricas Importantes**

1. **Taxa de Consumo**: Quanto está sendo consumido por período
2. **Cobertura de Estoque**: Quantos dias/meses de consumo disponível
3. **Última Compra**: Quando e por quanto foi comprado
4. **Maiores Consumidores**: Quais departamentos/centros de custo mais consomem
5. **Produtos Críticos**: Risco de ruptura baseado em consumo

---

## 🎯 Objetivos

### **Objetivos de Negócio**
1. ✅ Evitar rupturas de estoque (produtos críticos)
2. ✅ Otimizar compras (quantidade e timing)
3. ✅ Controlar consumo por departamento
4. ✅ Reduzir custos de estoque parado
5. ✅ Prever necessidade de compras

### **Perguntas que o Dashboard Responde**
1. ❓ Quantos dias de estoque eu tenho? (Cobertura)
2. ❓ Quem está consumindo mais? (Por CC/Departamento)
3. ❓ Quando preciso comprar? (Previsão)
4. ❓ Quanto gastei em compras este mês?
5. ❓ Quais produtos estão parados? (Sem consumo)
6. ❓ Qual o custo médio de compra? (PMM - Preço Médio Móvel)

---

## 🏗️ Arquitetura do Dashboard V3

### **Layout Baseado em Dashboard-2**

```
┌────────────────────────────────────────────────────┐
│  Dashboard de Gestão de Materiais   [Quick Actions]│
├────────────────────────────────────────────────────┤
│  ┌──────┬──────┬──────┬──────┐                    │
│  │ KPI1 │ KPI2 │ KPI3 │ KPI4 │  Métricas Principais│
│  └──────┴──────┴──────┴──────┘                    │
├─────────────────────┬──────────────────────────────┤
│  Evolução de        │  Consumo vs Compras         │
│  Estoque (Area)     │  (Bar Chart Comparativo)    │
├─────────────────────┼──────────────────────────────┤
│  Últimas            │  Produtos Mais              │
│  Requisições        │  Consumidos (Ranking)       │
├─────────────────────┴──────────────────────────────┤
│  ⚠️ Alertas Críticos (Ruptura + Slow Movers)      │
└────────────────────────────────────────────────────┘
```

---

## 🎨 Componentes Detalhados

### **1. Métricas Overview (4 KPIs Premium)**

#### **KPI 1: Valor Total em Estoque**
```
┌─────────────────────────┐
│ 💰 Valor em Estoque    │
│                         │
│ R$ 2.5M                │ ← Custo total (PMM)
│ ↑ +12.3%               │ ← vs mês anterior
│                         │
│ Estoque crescendo      │ ← Contexto
│ Mais compras que consumo│ ← Insight
└─────────────────────────┘
```

**Cálculo:**
```sql
SELECT SUM(est.ESTOQUE * (
  -- PMM da última compra
  SELECT TOP 1 ite.VLRUNIT 
  FROM TGFITE ite
  JOIN TGFCAB cab ON cab.NUNOTA = ite.NUNOTA
  WHERE ite.CODPROD = est.CODPROD
    AND cab.TIPMOV = 'C'
    AND cab.STATUSNOTA = 'L'
  ORDER BY cab.DTENTSAI DESC
)) as valor_total_estoque
FROM TGFEST est
WHERE est.ATIVO = 'S'
```

#### **KPI 2: Taxa de Consumo Mensal**
```
┌─────────────────────────┐
│ 📉 Consumo Mensal      │
│                         │
│ R$ 487k                │ ← Total consumido
│ ↓ -5.2%                │ ← vs mês anterior
│                         │
│ Redução no consumo     │
│ Pode indicar parada    │
└─────────────────────────┘
```

**Cálculo:**
```sql
SELECT ABS(SUM(ite.VLRTOT)) as total_consumo
FROM TGFITE ite
JOIN TGFCAB cab ON cab.NUNOTA = ite.NUNOTA
WHERE cab.TIPMOV = 'Q'  -- Requisição
  AND cab.STATUSNOTA = 'L'
  AND ite.ATUALESTOQUE < 0  -- Saída
  AND MONTH(cab.DTENTSAI) = MONTH(GETDATE())
```

#### **KPI 3: Cobertura de Estoque (Dias)**
```
┌─────────────────────────┐
│ 📅 Cobertura Estoque   │
│                         │
│ 45 dias                │ ← Dias disponíveis
│ ↓ -8.3%                │ ← vs mês anterior
│                         │
│ Atenção: baixando      │
│ Planejar próximas compras│
└─────────────────────────┘
```

**Cálculo:**
```sql
-- Estoque atual / Consumo médio diário
SELECT 
  CASE 
    WHEN consumo_medio_dia > 0 
    THEN estoque_total / consumo_medio_dia 
    ELSE 999 
  END as dias_cobertura
FROM (
  SELECT 
    SUM(est.ESTOQUE) as estoque_total,
    AVG(consumo_dia) as consumo_medio_dia
  FROM ...
)
```

#### **KPI 4: Valor de Compras no Mês**
```
┌─────────────────────────┐
│ 🛒 Compras Mês         │
│                         │
│ R$ 523k                │ ← Total comprado
│ ↑ +15.7%               │ ← vs mês anterior
│                         │
│ Aumento nas compras    │
│ Reposição de estoque   │
└─────────────────────────┘
```

**Cálculo:**
```sql
SELECT SUM(ite.VLRTOT) as total_compras
FROM TGFITE ite
JOIN TGFCAB cab ON cab.NUNOTA = ite.NUNOTA
WHERE cab.TIPMOV = 'C'  -- Compra
  AND cab.STATUSNOTA = 'L'
  AND ite.ATUALESTOQUE > 0  -- Entrada
  AND MONTH(cab.DTENTSAI) = MONTH(GETDATE())
```

---

### **2. Evolução de Estoque (Area Chart)**

```
┌──────────────────────────────────────────────┐
│ Evolução do Estoque               [12m ▼]  │
│ Quantidade e valor ao longo do tempo        │
├──────────────────────────────────────────────┤
│                                              │
│     [AREA CHART COM 2 ÁREAS]                │
│     - Área 1: Quantidade (linha azul)       │
│     - Área 2: Valor R$ (linha verde)        │
│     - Gradiente suave                       │
│     - Tooltip com detalhes                  │
│                                              │
└──────────────────────────────────────────────┘
```

**Dados:**
- Eixo X: Últimos 12 meses
- Eixo Y1: Quantidade total em estoque
- Eixo Y2: Valor total (R$)
- Tooltip: Mês, Quantidade, Valor, Variação

**Query:**
```sql
SELECT 
  FORMAT(cab.DTENTSAI, 'yyyy-MM') as mes,
  SUM(CASE WHEN ite.ATUALESTOQUE > 0 THEN ite.QTDNEG ELSE -ite.QTDNEG END) 
    OVER (ORDER BY FORMAT(cab.DTENTSAI, 'yyyy-MM')) as estoque_acumulado,
  SUM(CASE WHEN ite.ATUALESTOQUE > 0 THEN ite.VLRTOT ELSE -ite.VLRTOT END)
    OVER (ORDER BY FORMAT(cab.DTENTSAI, 'yyyy-MM')) as valor_acumulado
FROM TGFITE ite
JOIN TGFCAB cab ON cab.NUNOTA = ite.NUNOTA
WHERE cab.STATUSNOTA = 'L'
  AND cab.DTENTSAI >= DATEADD(MONTH, -12, GETDATE())
GROUP BY FORMAT(cab.DTENTSAI, 'yyyy-MM')
ORDER BY mes
```

---

### **3. Consumo vs Compras (Bar Chart Comparativo)**

```
┌──────────────────────────────────────────────┐
│ Consumo vs Compras Mensal          [6m ▼]  │
│ Comparativo de entradas e saídas            │
├──────────────────────────────────────────────┤
│                                              │
│     [BAR CHART AGRUPADO]                    │
│     - Barras Verdes: Compras (↑)           │
│     - Barras Vermelhas: Consumo (↓)        │
│     - Linha: Saldo (Compras - Consumo)     │
│                                              │
└──────────────────────────────────────────────┘
```

**Dados:**
```json
[
  {
    "mes": "2025-08",
    "compras": 450000,
    "consumo": 380000,
    "saldo": 70000
  },
  // ...
]
```

**Query:**
```sql
SELECT 
  FORMAT(cab.DTENTSAI, 'yyyy-MM') as mes,
  SUM(CASE WHEN cab.TIPMOV = 'C' THEN ite.VLRTOT ELSE 0 END) as compras,
  ABS(SUM(CASE WHEN cab.TIPMOV = 'Q' THEN ite.VLRTOT ELSE 0 END)) as consumo,
  SUM(CASE WHEN cab.TIPMOV = 'C' THEN ite.VLRTOT 
           WHEN cab.TIPMOV = 'Q' THEN ite.VLRTOT 
           ELSE 0 END) as saldo
FROM TGFITE ite
JOIN TGFCAB cab ON cab.NUNOTA = ite.NUNOTA
WHERE cab.STATUSNOTA = 'L'
  AND cab.DTENTSAI >= DATEADD(MONTH, -6, GETDATE())
  AND cab.TIPMOV IN ('C', 'Q')
GROUP BY FORMAT(cab.DTENTSAI, 'yyyy-MM')
ORDER BY mes
```

---

### **4. Últimas Requisições (Transaction List)**

```
┌──────────────────────────────────────────────────┐
│ 📋 Últimas Requisições            [Ver Todas]  │
│ Movimentações de consumo recentes               │
├──────────────────────────────────────────────────┤
│ 13/01 │ Manutenção       │ 15 itens │ R$ 3.2k  │
│ 12/01 │ Produção         │ 28 itens │ R$ 8.5k  │
│ 12/01 │ TI               │ 3 itens  │ R$ 1.1k  │
│ 11/01 │ Administração    │ 12 itens │ R$ 2.8k  │
│ 10/01 │ Produção         │ 45 itens │ R$ 15k   │
└──────────────────────────────────────────────────┘
```

**Dados:**
- Data da requisição
- Departamento/Centro de Custo
- Quantidade de itens
- Valor total
- Link para detalhes

**Query:**
```sql
SELECT TOP 10
  cab.DTENTSAI as data_requisicao,
  cab.NUNOTA,
  cus.NOMECENCUS as departamento,
  COUNT(DISTINCT ite.SEQUENCIA) as qtd_itens,
  ABS(SUM(ite.VLRTOT)) as valor_total
FROM TGFCAB cab
JOIN TGFITE ite ON ite.NUNOTA = cab.NUNOTA
LEFT JOIN TSICUS cus ON cus.CODCENCUS = cab.CODCENCUS
WHERE cab.TIPMOV = 'Q'
  AND cab.STATUSNOTA = 'L'
  AND ite.ATUALESTOQUE < 0
GROUP BY cab.DTENTSAI, cab.NUNOTA, cus.NOMECENCUS
ORDER BY cab.DTENTSAI DESC
```

---

### **5. Produtos Mais Consumidos (Ranking)**

```
┌──────────────────────────────────────────────────┐
│ 🔥 Produtos Mais Consumidos       [Este Mês]   │
│ Ranking por valor de consumo                    │
├──────────────────────────────────────────────────┤
│ #1 │ PARAFUSO M10       │ R$ 45k  │ 2.5k unid │
│    │ Manutenção         │ ⚠️ 15d  │ Comprar   │
├──────────────────────────────────────────────────┤
│ #2 │ ÓLEO LUBRIFICANTE  │ R$ 38k  │ 850 L     │
│    │ Produção           │ ✅ 60d  │ OK        │
├──────────────────────────────────────────────────┤
│ #3 │ LIXA GRÃO 80       │ R$ 32k  │ 1.2k unid │
│    │ Acabamento         │ ⚠️ 20d  │ Atenção   │
└──────────────────────────────────────────────────┘
```

**Dados por Produto:**
- Ranking (#)
- Nome do produto
- Valor consumido no período
- Quantidade consumida
- Principal consumidor (departamento)
- Cobertura de estoque (dias)
- Status/Ação necessária

**Query:**
```sql
WITH CONSUMO AS (
  SELECT 
    ite.CODPROD,
    pro.DESCRPROD,
    ABS(SUM(ite.VLRTOT)) as valor_consumido,
    ABS(SUM(ite.QTDNEG)) as qtd_consumida,
    (
      SELECT TOP 1 cus.NOMECENCUS
      FROM TGFCAB c2
      JOIN TGFITE i2 ON i2.NUNOTA = c2.NUNOTA
      LEFT JOIN TSICUS cus ON cus.CODCENCUS = c2.CODCENCUS
      WHERE i2.CODPROD = ite.CODPROD
        AND c2.TIPMOV = 'Q'
        AND c2.STATUSNOTA = 'L'
      GROUP BY cus.NOMECENCUS
      ORDER BY ABS(SUM(i2.VLRTOT)) DESC
    ) as principal_consumidor,
    -- Calcular cobertura
    CASE 
      WHEN AVG(qtd_dia) > 0 
      THEN est.ESTOQUE / AVG(qtd_dia)
      ELSE 999
    END as dias_cobertura
  FROM TGFITE ite
  JOIN TGFCAB cab ON cab.NUNOTA = ite.NUNOTA
  JOIN TGFPRO pro ON pro.CODPROD = ite.CODPROD
  LEFT JOIN TGFEST est ON est.CODPROD = ite.CODPROD
  WHERE cab.TIPMOV = 'Q'
    AND cab.STATUSNOTA = 'L'
    AND MONTH(cab.DTENTSAI) = MONTH(GETDATE())
  GROUP BY ite.CODPROD, pro.DESCRPROD, est.ESTOQUE
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY valor_consumido DESC) as ranking,
  *,
  CASE 
    WHEN dias_cobertura < 15 THEN 'Crítico'
    WHEN dias_cobertura < 30 THEN 'Atenção'
    ELSE 'OK'
  END as status
FROM CONSUMO
ORDER BY valor_consumido DESC
```

---

### **6. Alertas Críticos (Full Width Panel)**

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Alertas e Recomendações                 [15 alertas]│
├─────────────────────────────────────────────────────────┤
│ 🔴 CRÍTICO: 8 produtos com menos de 15 dias de estoque │
│    PARAFUSO M10, ROLAMENTO 6205, CORREIA V-BELT...     │
│    [Ver Lista Completa] [Gerar Pedido de Compra]       │
├─────────────────────────────────────────────────────────┤
│ 🟡 ATENÇÃO: 12 produtos sem consumo há 90+ dias        │
│    FERRAMENTA XYZ, ACESSÓRIO ABC...                    │
│    [Ver Produtos Parados] [Analisar Descarte]          │
├─────────────────────────────────────────────────────────┤
│ 🟢 OPORTUNIDADE: Consumo reduzido 30% vs mês anterior  │
│    Considerar redução de pedidos de compra             │
│    [Ver Análise Detalhada]                             │
└─────────────────────────────────────────────────────────┘
```

**Tipos de Alertas:**

1. **🔴 Crítico - Ruptura Iminente**
   - Produtos < 15 dias de cobertura
   - Alto consumo + baixo estoque
   - Última compra > 60 dias

2. **🟡 Atenção - Slow Movers**
   - Sem consumo há 90+ dias
   - Estoque alto + consumo baixo
   - Produtos obsoletos

3. **🟢 Oportunidade - Otimização**
   - Redução significativa de consumo
   - Estoque acima da necessidade
   - Compras desnecessárias

4. **🔵 Informativo - Tendências**
   - Novos produtos em consumo
   - Picos sazonais detectados
   - Mudanças de fornecedor

---

## 🔌 API Endpoints V2

### **Base URL**: `/api/v2/produtos/dashboard`

#### **1. GET `/kpis`**

**Query Params:**
- `mes?: string` (formato: YYYY-MM)

**Response:**
```json
{
  "valorEstoque": {
    "atual": 2500000,
    "anterior": 2230000,
    "variacao": 12.1,
    "trend": "up",
    "contexto": "Estoque crescendo",
    "insight": "Mais compras que consumo"
  },
  "consumoMensal": {
    "atual": 487000,
    "anterior": 514000,
    "variacao": -5.2,
    "trend": "down"
  },
  "coberturaEstoque": {
    "dias": 45,
    "anterior": 49,
    "variacao": -8.2,
    "trend": "down",
    "status": "atenção"
  },
  "comprasMes": {
    "atual": 523000,
    "anterior": 452000,
    "variacao": 15.7,
    "trend": "up"
  }
}
```

#### **2. GET `/evolucao-estoque`**

**Query Params:**
- `periodo: "6m" | "12m" | "24m"`
- `metrica: "quantidade" | "valor" | "ambos"`

**Response:**
```json
{
  "periodo": "12m",
  "data": [
    {
      "mes": "2025-01",
      "quantidade": 145000,
      "valor": 2100000,
      "compras": 180000,
      "consumo": 165000,
      "saldo": 15000
    },
    // ... 11 meses
  ]
}
```

#### **3. GET `/consumo-vs-compras`**

**Query Params:**
- `periodo: "3m" | "6m" | "12m"`

**Response:**
```json
{
  "periodo": "6m",
  "totais": {
    "compras": 2850000,
    "consumo": 2620000,
    "saldo": 230000,
    "taxa_consumo": 92
  },
  "mensal": [
    {
      "mes": "2025-08",
      "compras": 450000,
      "consumo": 380000,
      "saldo": 70000,
      "taxa": 84
    },
    // ... 5 meses
  ]
}
```

#### **4. GET `/ranking-consumo`**

**Query Params:**
- `periodo: "mes" | "trimestre" | "ano"`
- `limite?: number` (default: 10)
- `ordenacao: "valor" | "quantidade"`

**Response:**
```json
{
  "periodo": "mes",
  "produtos": [
    {
      "ranking": 1,
      "codprod": 3680,
      "descrprod": "PARAFUSO M10",
      "valorConsumido": 45000,
      "quantidadeConsumida": 2500,
      "principalConsumidor": "Manutenção",
      "coberturaEstoque": 15,
      "estoqueAtual": 375,
      "status": "critico",
      "ultimaCompra": {
        "data": "2025-12-15",
        "valor": 18.5,
        "quantidade": 1000
      }
    },
    // ... mais produtos
  ]
}
```

#### **5. GET `/ultimas-requisicoes`**

**Query Params:**
- `limite?: number` (default: 10)
- `departamento?: string`

**Response:**
```json
{
  "requisicoes": [
    {
      "nunota": 12345,
      "data": "2025-01-13",
      "departamento": "Manutenção",
      "centroCusto": "CC-MANUT-001",
      "qtdItens": 15,
      "valorTotal": 3200,
      "usuario": "João Silva",
      "status": "Liberada",
      "produtos": [
        {
          "codprod": 3680,
          "descrprod": "PARAFUSO M10",
          "quantidade": 50,
          "valor": 925
        },
        // ... mais itens
      ]
    },
    // ... mais requisições
  ]
}
```

#### **6. GET `/alertas`**

**Response:**
```json
{
  "total": 15,
  "criticos": 8,
  "atencao": 5,
  "informativo": 2,
  "alertas": [
    {
      "tipo": "critico",
      "severidade": "alta",
      "titulo": "8 produtos com risco de ruptura",
      "descricao": "Produtos com menos de 15 dias de cobertura",
      "produtos": [
        {
          "codprod": 3680,
          "descrprod": "PARAFUSO M10",
          "coberturaEstoque": 12,
          "consumoMedioDia": 31.25,
          "estoqueAtual": 375
        },
        // ... mais produtos
      ],
      "acoes": [
        {
          "label": "Ver Lista Completa",
          "href": "/produtos-v3/criticos"
        },
        {
          "label": "Gerar Pedido de Compra",
          "action": "generate_purchase_order",
          "params": { "codprods": [3680, ...] }
        }
      ]
    },
    // ... mais alertas
  ]
}
```

---

## 🗺️ Roadmap de Implementação

### **Fase 1: Backend (2 semanas)**

#### **Sprint 1: Estrutura Base + Queries SQL**
- [ ] Criar módulo `produtos-v2`
- [ ] Implementar queries SQL otimizadas
  - [ ] KPIs com comparação período anterior
  - [ ] Evolução de estoque (12 meses)
  - [ ] Consumo vs Compras (6 meses)
  - [ ] Ranking de consumo
  - [ ] Últimas requisições
  - [ ] Alertas (produtos críticos, slow movers)
- [ ] Setup Redis cache para queries pesadas
- [ ] DTOs e validações

#### **Sprint 2: Controllers + Services**
- [ ] Implementar 6 endpoints principais
- [ ] Adicionar cache strategies
- [ ] Logging estruturado
- [ ] Rate limiting
- [ ] Testes unitários (80%+ coverage)

---

### **Fase 2: Frontend (2 semanas)**

#### **Sprint 3: Estrutura Base + KPIs**
- [ ] Criar rota `/produtos-v3`
- [ ] Implementar 4 KPI Cards premium
- [ ] Setup TanStack Query
- [ ] Criar hooks customizados
- [ ] Loading states + skeletons

#### **Sprint 4: Charts e Listas**
- [ ] Evolução de Estoque (Area Chart)
- [ ] Consumo vs Compras (Bar Chart)
- [ ] Ranking de Consumo (Lista ranqueada)
- [ ] Últimas Requisições (Transaction list)
- [ ] Painel de Alertas

#### **Sprint 5: UX e Polimento**
- [ ] Quick Actions (botões rápidos)
- [ ] Filtros inline (período, departamento)
- [ ] Export functionality (Excel, PDF)
- [ ] Animações e transições
- [ ] Responsividade completa
- [ ] Dark mode optimization

---

### **Fase 3: Testing & Deploy (1 semana)**

#### **Sprint 6: QA**
- [ ] Testes E2E
- [ ] Performance testing
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Code review
- [ ] Documentação técnica

---

## 📊 Queries SQL Otimizadas

### **Query 1: KPIs Principais**

```sql
-- KPIs com comparação mês anterior
WITH 
PERIODO_ATUAL AS (
  SELECT 
    -- Valor em Estoque (PMM)
    SUM(est.ESTOQUE * (
      SELECT TOP 1 ite.VLRUNIT 
      FROM TGFITE ite
      JOIN TGFCAB cab ON cab.NUNOTA = ite.NUNOTA
      WHERE ite.CODPROD = est.CODPROD
        AND cab.TIPMOV = 'C'
        AND cab.STATUSNOTA = 'L'
      ORDER BY cab.DTENTSAI DESC
    )) as valor_estoque,
    
    -- Consumo Mensal
    ABS(SUM(CASE 
      WHEN cab.TIPMOV = 'Q' AND MONTH(cab.DTENTSAI) = MONTH(GETDATE())
      THEN ite.VLRTOT 
      ELSE 0 
    END)) as consumo_mes,
    
    -- Compras Mensais
    SUM(CASE 
      WHEN cab.TIPMOV = 'C' AND MONTH(cab.DTENTSAI) = MONTH(GETDATE())
      THEN ite.VLRTOT 
      ELSE 0 
    END) as compras_mes
    
  FROM TGFEST est
  LEFT JOIN TGFITE ite ON ite.CODPROD = est.CODPROD
  LEFT JOIN TGFCAB cab ON cab.NUNOTA = ite.NUNOTA
  WHERE est.ATIVO = 'S'
    AND cab.STATUSNOTA = 'L'
),
PERIODO_ANTERIOR AS (
  -- Similar, mas MONTH(cab.DTENTSAI) = MONTH(DATEADD(MONTH, -1, GETDATE()))
  ...
),
COBERTURA AS (
  SELECT 
    SUM(est.ESTOQUE) as estoque_total,
    AVG(consumo_dia) as consumo_medio_dia
  FROM TGFEST est
  CROSS APPLY (
    SELECT AVG(ABS(daily_consumo)) as consumo_dia
    FROM (
      SELECT 
        CAST(cab.DTENTSAI AS DATE) as data,
        SUM(ite.QTDNEG) as daily_consumo
      FROM TGFITE ite
      JOIN TGFCAB cab ON cab.NUNOTA = ite.NUNOTA
      WHERE ite.CODPROD = est.CODPROD
        AND cab.TIPMOV = 'Q'
        AND cab.DTENTSAI >= DATEADD(DAY, -30, GETDATE())
      GROUP BY CAST(cab.DTENTSAI AS DATE)
    ) daily
  ) consumo
  WHERE est.ATIVO = 'S'
)
SELECT 
  pa.valor_estoque,
  pant.valor_estoque as valor_estoque_anterior,
  (pa.valor_estoque - pant.valor_estoque) / pant.valor_estoque * 100 as variacao_estoque,
  
  pa.consumo_mes,
  pant.consumo_mes as consumo_mes_anterior,
  (pa.consumo_mes - pant.consumo_mes) / pant.consumo_mes * 100 as variacao_consumo,
  
  pa.compras_mes,
  pant.compras_mes as compras_mes_anterior,
  (pa.compras_mes - pant.compras_mes) / pant.compras_mes * 100 as variacao_compras,
  
  cob.estoque_total / NULLIF(cob.consumo_medio_dia, 0) as dias_cobertura
  
FROM PERIODO_ATUAL pa
CROSS JOIN PERIODO_ANTERIOR pant
CROSS JOIN COBERTURA cob
```

---

## 🎨 Design System

### **Cores Semânticas**

```css
/* Status de Cobertura */
.cobertura-critica { color: #ef4444; }   /* < 15 dias */
.cobertura-atencao { color: #f59e0b; }   /* 15-30 dias */
.cobertura-ok { color: #10b981; }        /* > 30 dias */

/* Tipo de Movimentação */
.mov-compra { color: #10b981; }   /* Verde - entrada */
.mov-consumo { color: #ef4444; }  /* Vermelho - saída */
.mov-ajuste { color: #6366f1; }   /* Roxo - ajuste */
```

---

## ✅ Checklist de Implementação

### **Backend**
- [ ] 6 endpoints REST documentados
- [ ] Queries SQL otimizadas e testadas
- [ ] Cache strategy implementada
- [ ] Testes unitários > 80%
- [ ] Documentação Swagger
- [ ] Rate limiting configurado

### **Frontend**
- [ ] 4 KPI Cards funcionais
- [ ] 2 Charts interativos
- [ ] 2 Listas/Tables com dados reais
- [ ] Painel de alertas dinâmico
- [ ] Loading states em todos componentes
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Dark mode suportado
- [ ] Testes E2E principais fluxos

---

**Status**: 🎯 Ready for Implementation  
**Próxima Ação**: Aprovação e início do Sprint 1 (Backend)
