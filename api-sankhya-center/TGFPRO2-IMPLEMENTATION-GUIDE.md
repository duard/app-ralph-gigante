# 📘 TGFPRO2 - Guia de Implementação

## 🧪 Como Testar Queries

**Importante**: Use o guia `/home/carloshome/z-ralph-code/archive/api-old/TEST-API-GUIDE.md`

### Método 1: Via API Inspection (Recomendado)

```bash
# 1. Fazer login e obter token
curl -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CONVIDADO","password":"guest123"}'

# Salvar o token
TOKEN="eyJhbGciOiJIUzI1NiIsInR..."

# 2. Testar query SQL
curl -X POST http://localhost:3100/inspection/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "SELECT TOP 5 CODPROD, DESCRPROD FROM TGFPRO WHERE ATIVO = '\''S'\''",
    "params": []
  }'
```

### Método 2: Via Script Automatizado

```bash
cd /home/carloshome/z-ralph-code/archive/api-old
chmod +x test-api-complete.sh
./test-api-complete.sh
```

### Porta da API
- **Desenvolvimento**: `http://localhost:3100` (conforme package.json)
- **Produção**: Conforme env `PORT`

---

## 📊 Estrutura de Dados Completa

### TIPMOV - Tipos de Movimento (TGFCAB)

| TIPMOV | Descrição | Uso |
|--------|-----------|-----|
| `'C'` | Compra | Entrada de mercadoria (compra) |
| `'O'` | Ordem/Pedido | **Pedido de compra aprovado** ⭐ |
| `'Q'` | Requisição | Requisição interna (saída) |
| `'V'` | Venda | Venda de produto |
| `'D'` | Devolução | Devolução de mercadoria |
| `'T'` | Transferência | Transferência entre locais |
| `'J'` | Requisição Interna | Saída para uso interno |
| `'L'` | Lançamento | Lançamento manual |
| `'P'` | Pedido de Venda | Pedido de venda |

### STATUSNOTA - Status da Nota (TGFCAB)

| STATUSNOTA | Descrição | Usar? |
|------------|-----------|-------|
| `'L'` | Liberada/Aprovada | ✅ **SIM** - Apenas notas liberadas |
| `'A'` | Aberta/Pendente | ❌ NÃO - Ainda não aprovada |
| `'C'` | Cancelada | ❌ NÃO - Foi cancelada |
| `'E'` | Em aprovação | ❌ NÃO - Aguardando aprovação |

**⚠️ IMPORTANTE**: Sempre filtrar por `STATUSNOTA = 'L'` para obter apenas registros aprovados/confirmados!

### Tabela TGFGRU (Grupos de Produtos)

**Campos principais:**
```typescript
{
  CODGRUPOPROD: number    // PK - Código do grupo
  DESCRGRUPOPROD: string  // Descrição do grupo
  ATIVO: 'S' | 'N'       // Status
}
```

**Exemplos de grupos:**
```
1000 - PEÇAS DE REPOSIÇÃO
2000 - FERRAMENTAS
3000 - CONSUMÍVEIS
3100 - CONSUMÍVEIS - LIMPEZA
3200 - CONSUMÍVEIS - ESCRITÓRIO
4000 - EQUIPAMENTOS
```

**Relacionamento com produtos:**
- Cada produto (`TGFPRO`) tem um `CODGRUPOPROD`
- JOIN: `LEFT JOIN TGFGRU ON TGFPRO.CODGRUPOPROD = TGFGRU.CODGRUPOPROD`
- Usado para:
  - Categorização de produtos
  - Filtros em relatórios
  - Análise por categoria
  - Permissões e controle de acesso

### Tabela TGFLOC (Locais de Estoque)

**Campos principais:**
```typescript
{
  CODLOCAL: number        // PK - Código do local
  DESCRLOCAL: string      // Descrição do local
  CODLOCALPAI: number     // FK - Local pai (hierarquia)
  ATIVO: 'S' | 'N'       // Status
}
```

**Hierarquia de locais:**
```
101000 - ALMOXARIFADO GERAL
  ├── 101001 - ALMOX PECAS
  ├── 101002 - ALMOX FERRAMENTAS
  └── 101003 - ALMOX CONSUMO
      └── 101003001 - ALMOX CONSUMO - PAPEL
```

### Tabela TGFEST (Estoque por Local)

**Campos principais:**
```typescript
{
  CODPROD: number         // PK/FK - Código do produto
  CODLOCAL: number        // PK/FK - Código do local
  CONTROLE: string        // PK - Controle (lote, série, etc) - PODE SER NULL/VAZIO
  ESTOQUE: number         // Quantidade em estoque
  ESTMIN: number          // Estoque mínimo
  ESTMAX: number          // Estoque máximo
  CODPARC: number         // 0 = próprio, >0 = consignado
  ATIVO: 'S' | 'N'       // Status
  CODEMP: number          // Código da empresa
}
```

**Chave composta**: `(CODPROD, CODLOCAL, CONTROLE)`

**Importante:**
- ✅ Um produto pode estar em **vários locais**
- ✅ Cada local pode ter estoque mínimo/máximo diferente
- ✅ `CONTROLE` é opcional (NULL, vazio ou com valor)
- ✅ `CODPARC = 0` = estoque próprio (usar sempre este filtro)

### Query de Exemplo - Estoque por Local

```sql
SELECT
  P.CODPROD,
  P.DESCRPROD,
  E.CODLOCAL,
  L.DESCRLOCAL,
  E.CONTROLE,
  E.ESTOQUE,
  E.ESTMIN,
  E.ESTMAX
FROM TGFPRO P WITH (NOLOCK)
JOIN TGFEST E WITH (NOLOCK) ON E.CODPROD = P.CODPROD
LEFT JOIN TGFLOC L WITH (NOLOCK) ON L.CODLOCAL = E.CODLOCAL
WHERE P.CODPROD = 3680
  AND E.CODPARC = 0           -- Estoque próprio
  AND E.ATIVO = 'S'
  AND E.ESTOQUE > 0
ORDER BY E.ESTOQUE DESC
```

---

## 🎯 PRDs Atualizados

### PRD #1: Interface Produto2 (Revisada)

```typescript
interface Produto2 {
  // Identificação
  codprod: number
  descrprod: string
  compldesc?: string
  referencia?: string

  // Classificação
  marca?: string
  codgrupoprod: number
  codvol: string              // Unidade
  ncm?: string
  ativo: string               // S/N

  // Localização física
  localizacao?: string        // Localização no depósito (ex: "Prateleira A12")

  // Controle (lote/série)
  tipcontest?: string         // Tipo de controle
  liscontest?: string         // Lista de controles

  // Uso
  usoprod?: string            // C (Consumo), R (Revenda)
  origprod?: string           // Origem

  // Relacionamentos (opcionais via JOIN)
  tgfgru?: {
    codgrupoprod: number
    descrgrupoprod: string
  }

  tgfvol?: {
    codvol: string
    descrvol: string
  }

  // NOVO: Estoque agregado por local
  estoqueLocais?: EstoqueLocal[]

  // Estoque total (agregado)
  estoque?: {
    totalGeral: number
    totalMin: number
    totalMax: number
    qtdeLocais: number
    statusGeral: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'EXCESSO'
  }
}

interface EstoqueLocal {
  codlocal: number
  descrlocal: string
  localpai?: string           // Nome do local pai
  controle: string | null
  quantidade: number
  estmin: number
  estmax: number
  statusLocal: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'EXCESSO'
  percOcupacao: number        // (quantidade / estmax) * 100
}
```

### PRD #2: Interface ProdutoKPI (Atualizada)

```typescript
interface ProdutoKPI {
  produto: {
    codprod: number
    descrprod: string
    marca?: string
    grupo: string
    unidade: string
  }

  // ATUALIZADO: Estoque detalhado por local
  estoque: {
    totalGeral: number
    porLocal: EstoqueLocal[]    // Array com todos os locais
    totalMin: number
    totalMax: number
    statusGeral: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'EXCESSO'
    distribuicao: {
      locaisComEstoque: number
      locaisAbaixoMinimo: number
      localMaiorEstoque: {
        codlocal: number
        descrlocal: string
        quantidade: number
      }
    }
  }

  financeiro: {
    precoUltimaCompra: number
    dataUltimaCompra: string
    fornecedorUltimaCompra?: string
    precoMedio: number                    // Média últimas N compras
    precoMinMax: { min: number; max: number }
    precoMedioMovel: number               // PMM atual
    valorTotalEstoque: number
    valorPorLocal?: Array<{
      codlocal: number
      descrlocal: string
      valor: number
    }>
    tendenciaPreco: 'ALTA' | 'BAIXA' | 'ESTAVEL'
  }

  consumo: {
    consumoMedioMensal: number            // Média últimos N meses
    ultimosMeses: Array<{
      mes: string
      quantidade: number
      valor: number
    }>
    previsaoEsgotamento: string | null    // Data estimada
    diasEstoque: number
  }

  giro: {
    giroEstoque: number                   // Rotações/ano
    tempoMedioEstoque: number             // Dias
    classificacaoABC: 'A' | 'B' | 'C'
  }
}
```

---

## 💰 Estratégias de Cálculo de Preços

### 1. Preço da Última Compra APROVADA

**Query para último pedido aprovado:**
```sql
-- Busca o último PEDIDO APROVADO (TIPMOV='O', STATUSNOTA='L')
SELECT TOP 1
  c.NUNOTA,
  c.TIPMOV,
  c.DTNEG AS data_pedido,
  c.DTENTSAI AS data_entrega,
  i.VLRUNIT AS preco_unitario,
  i.VLRTOT AS valor_total,
  i.QTDNEG AS quantidade,
  par.CODPARC,
  par.NOMEPARC AS fornecedor
FROM TGFCAB c WITH (NOLOCK)
JOIN TGFITE i WITH (NOLOCK) ON i.NUNOTA = c.NUNOTA
LEFT JOIN TGFPAR par WITH (NOLOCK) ON par.CODPARC = c.CODPARC
WHERE i.CODPROD = @codprod
  AND c.TIPMOV = 'O'          -- Pedido de compra
  AND c.STATUSNOTA = 'L'      -- Aprovado/Liberado
ORDER BY c.DTNEG DESC, c.NUNOTA DESC
```

**Alternativa - Última ENTRADA efetiva no estoque (TIPMOV='C'):**
```sql
SELECT TOP 1
  c.NUNOTA,
  COALESCE(c.DTENTSAI, c.DTNEG) AS data_compra,
  i.VLRUNIT AS preco_unitario,
  i.VLRTOT AS valor_total,
  par.NOMEPARC AS fornecedor
FROM TGFCAB c WITH (NOLOCK)
JOIN TGFITE i WITH (NOLOCK) ON i.NUNOTA = c.NUNOTA
LEFT JOIN TGFPAR par WITH (NOLOCK) ON par.CODPARC = c.CODPARC
WHERE i.CODPROD = @codprod
  AND c.STATUSNOTA = 'L'      -- Aprovado
  AND c.TIPMOV = 'C'          -- Compra (entrada)
  AND i.ATUALESTOQUE > 0      -- Que atualizou estoque positivamente
ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) DESC, c.NUNOTA DESC
```

### 2. Preço Médio - Múltiplas Estratégias

#### Estratégia A: Média Simples das Últimas N Compras
```sql
WITH UltimasCompras AS (
  SELECT TOP 5
    i.VLRUNIT,
    i.QTDNEG,
    i.VLRTOT,
    c.DTNEG
  FROM TGFCAB c WITH (NOLOCK)
  JOIN TGFITE i WITH (NOLOCK) ON i.NUNOTA = c.NUNOTA
  WHERE i.CODPROD = @codprod
    AND c.STATUSNOTA = 'L'
    AND c.TIPMOV = 'O'        -- Pedidos aprovados
  ORDER BY c.DTNEG DESC
)
SELECT
  AVG(VLRUNIT) AS preco_medio_simples,
  MIN(VLRUNIT) AS preco_minimo,
  MAX(VLRUNIT) AS preco_maximo,
  COUNT(*) AS total_compras
FROM UltimasCompras
```

#### Estratégia B: Média Ponderada por Quantidade (Recomendado)
```sql
WITH UltimasCompras AS (
  SELECT TOP 10
    i.VLRUNIT,
    i.QTDNEG,
    i.VLRTOT,
    c.DTNEG
  FROM TGFCAB c WITH (NOLOCK)
  JOIN TGFITE i WITH (NOLOCK) ON i.NUNOTA = c.NUNOTA
  WHERE i.CODPROD = @codprod
    AND c.STATUSNOTA = 'L'
    AND c.TIPMOV = 'O'
  ORDER BY c.DTNEG DESC
)
SELECT
  SUM(VLRTOT) / NULLIF(SUM(QTDNEG), 0) AS preco_medio_ponderado,
  AVG(VLRUNIT) AS preco_medio_simples,
  MIN(VLRUNIT) AS preco_minimo,
  MAX(VLRUNIT) AS preco_maximo,
  SUM(QTDNEG) AS quantidade_total
FROM UltimasCompras
```

#### Estratégia C: Média dos Últimos N Meses
```sql
SELECT
  AVG(i.VLRUNIT) AS preco_medio,
  MIN(i.VLRUNIT) AS preco_minimo,
  MAX(i.VLRUNIT) AS preco_maximo,
  COUNT(*) AS total_compras,
  SUM(i.QTDNEG) AS quantidade_total
FROM TGFCAB c WITH (NOLOCK)
JOIN TGFITE i WITH (NOLOCK) ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = @codprod
  AND c.STATUSNOTA = 'L'
  AND c.TIPMOV = 'O'
  AND c.DTNEG >= DATEADD(MONTH, -6, GETDATE())  -- Últimos 6 meses
```

#### Estratégia D: PMM (Preço Médio Móvel) - Calculado
```sql
-- Calcula PMM baseado em todas movimentações de entrada
WITH Movimentacoes AS (
  SELECT
    COALESCE(c.DTENTSAI, c.DTNEG) AS data_mov,
    CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END AS qtd_mov,
    CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END AS valor_mov
  FROM TGFCAB c WITH (NOLOCK)
  JOIN TGFITE i WITH (NOLOCK) ON i.NUNOTA = c.NUNOTA
  WHERE i.CODPROD = @codprod
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE <> 0
    AND i.RESERVA = 'N'
  ORDER BY data_mov ASC
)
-- Calcular saldo acumulado e PMM (lógica complexa - melhor fazer no Service)
SELECT * FROM Movimentacoes
```

### 3. Tendência de Preço

```sql
WITH PrecosRecentes AS (
  SELECT TOP 10
    c.DTNEG,
    i.VLRUNIT,
    ROW_NUMBER() OVER (ORDER BY c.DTNEG DESC) AS rn
  FROM TGFCAB c WITH (NOLOCK)
  JOIN TGFITE i WITH (NOLOCK) ON i.NUNOTA = c.NUNOTA
  WHERE i.CODPROD = @codprod
    AND c.STATUSNOTA = 'L'
    AND c.TIPMOV = 'O'
  ORDER BY c.DTNEG DESC
)
SELECT
  AVG(CASE WHEN rn <= 3 THEN VLRUNIT END) AS media_ultimas_3,
  AVG(CASE WHEN rn BETWEEN 4 AND 6 THEN VLRUNIT END) AS media_3_anteriores,
  -- Se media_ultimas_3 > media_3_anteriores => 'ALTA'
  -- Se media_ultimas_3 < media_3_anteriores => 'BAIXA'
  -- Senão => 'ESTAVEL'
  CASE
    WHEN AVG(CASE WHEN rn <= 3 THEN VLRUNIT END) >
         AVG(CASE WHEN rn BETWEEN 4 AND 6 THEN VLRUNIT END) * 1.05 THEN 'ALTA'
    WHEN AVG(CASE WHEN rn <= 3 THEN VLRUNIT END) <
         AVG(CASE WHEN rn BETWEEN 4 AND 6 THEN VLRUNIT END) * 0.95 THEN 'BAIXA'
    ELSE 'ESTAVEL'
  END AS tendencia
FROM PrecosRecentes
```

## 🔍 Queries SQL Principais

### 1. Listar Produtos com Estoque por Local

```sql
WITH EstoqueAgregado AS (
  SELECT
    E.CODPROD,
    COUNT(DISTINCT E.CODLOCAL) AS qtde_locais,
    SUM(E.ESTOQUE) AS estoque_total,
    SUM(E.ESTMIN) AS estmin_total,
    SUM(E.ESTMAX) AS estmax_total,
    CASE
      WHEN SUM(E.ESTOQUE) <= SUM(E.ESTMIN) * 0.5 THEN 'CRITICO'
      WHEN SUM(E.ESTOQUE) <= SUM(E.ESTMIN) THEN 'BAIXO'
      WHEN SUM(E.ESTOQUE) > SUM(E.ESTMAX) THEN 'EXCESSO'
      ELSE 'NORMAL'
    END AS status_geral
  FROM TGFEST E WITH (NOLOCK)
  WHERE E.CODPARC = 0
    AND E.ATIVO = 'S'
  GROUP BY E.CODPROD
)
SELECT
  P.CODPROD,
  P.DESCRPROD,
  P.REFERENCIA,
  P.MARCA,
  P.CODVOL,
  P.ATIVO,
  G.DESCRGRUPOPROD,
  V.DESCRVOL,
  ISNULL(EA.estoque_total, 0) AS estoque_total,
  ISNULL(EA.estmin_total, 0) AS estmin_total,
  ISNULL(EA.estmax_total, 0) AS estmax_total,
  ISNULL(EA.qtde_locais, 0) AS qtde_locais,
  ISNULL(EA.status_geral, 'NORMAL') AS status_geral
FROM TGFPRO P WITH (NOLOCK)
LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
LEFT JOIN TGFVOL V WITH (NOLOCK) ON V.CODVOL = P.CODVOL
LEFT JOIN EstoqueAgregado EA ON EA.CODPROD = P.CODPROD
WHERE P.ATIVO = 'S'
ORDER BY P.DESCRPROD
```

### 2. Detalhes de Estoque por Local de um Produto

```sql
SELECT
  E.CODLOCAL,
  L.DESCRLOCAL,
  LP.DESCRLOCAL AS local_pai,
  E.CONTROLE,
  E.ESTOQUE AS quantidade,
  E.ESTMIN,
  E.ESTMAX,
  CASE
    WHEN E.ESTOQUE <= E.ESTMIN * 0.5 THEN 'CRITICO'
    WHEN E.ESTOQUE <= E.ESTMIN THEN 'BAIXO'
    WHEN E.ESTOQUE > E.ESTMAX THEN 'EXCESSO'
    ELSE 'NORMAL'
  END AS status_local,
  CASE
    WHEN E.ESTMAX > 0 THEN CAST((E.ESTOQUE * 100.0 / E.ESTMAX) AS DECIMAL(5,2))
    ELSE 0
  END AS perc_ocupacao
FROM TGFEST E WITH (NOLOCK)
LEFT JOIN TGFLOC L WITH (NOLOCK) ON L.CODLOCAL = E.CODLOCAL
LEFT JOIN TGFLOC LP WITH (NOLOCK) ON LP.CODLOCAL = L.CODLOCALPAI
WHERE E.CODPROD = @codprod
  AND E.CODPARC = 0
  AND E.ATIVO = 'S'
ORDER BY E.ESTOQUE DESC
```

### 3. Hierarquia de Locais (Tree View)

```sql
WITH RECURSIVE LocalesHierarquia AS (
  -- Raiz
  SELECT
    CODLOCAL,
    DESCRLOCAL,
    CODLOCALPAI,
    CAST(DESCRLOCAL AS VARCHAR(MAX)) AS caminho,
    0 AS nivel
  FROM TGFLOC WITH (NOLOCK)
  WHERE CODLOCALPAI IS NULL OR CODLOCALPAI = 0

  UNION ALL

  -- Filhos
  SELECT
    L.CODLOCAL,
    L.DESCRLOCAL,
    L.CODLOCALPAI,
    CAST(LH.caminho + ' > ' + L.DESCRLOCAL AS VARCHAR(MAX)),
    LH.nivel + 1
  FROM TGFLOC L WITH (NOLOCK)
  JOIN LocalesHierarquia LH ON L.CODLOCALPAI = LH.CODLOCAL
)
SELECT * FROM LocalesHierarquia
ORDER BY caminho
```

---

## 📋 Endpoints TGFPRO2

### Produtos
```
GET  /tgfpro2/produtos                    # Lista com filtros
GET  /tgfpro2/produtos/:codprod           # Detalhes completos
GET  /tgfpro2/produtos/:codprod/locais    # Estoque por local
GET  /tgfpro2/produtos/search             # Busca inteligente
```

### Dashboard & KPIs
```
GET  /tgfpro2/dashboard/:codprod          # KPIs completos
GET  /tgfpro2/dashboard/:codprod/precos   # Histórico preços
GET  /tgfpro2/dashboard/:codprod/consumo  # Análise consumo
GET  /tgfpro2/dashboard/:codprod/locais   # Distribuição por local
```

### Métricas Agregadas
```
GET  /tgfpro2/metrics/overview            # Visão geral
GET  /tgfpro2/metrics/estoque-critico     # Produtos críticos
GET  /tgfpro2/metrics/curva-abc           # Classificação ABC
```

### Locais
```
GET  /tgfpro2/locais                      # Lista locais
GET  /tgfpro2/locais/tree                 # Hierarquia
GET  /tgfpro2/locais/:codlocal/produtos   # Produtos no local
```

---

## 🚀 Próximos Passos

1. ✅ Revisar e aprovar PRDs
2. ⏳ Implementar interfaces TypeScript
3. ⏳ Implementar DTOs com validação
4. ⏳ Implementar Service com queries SQL
5. ⏳ Implementar Controllers
6. ⏳ Adicionar testes usando `/inspection/query`
7. ⏳ Documentação Swagger
8. ⏳ Registrar no app.module.ts

---

**Última atualização**: 2026-01-13
