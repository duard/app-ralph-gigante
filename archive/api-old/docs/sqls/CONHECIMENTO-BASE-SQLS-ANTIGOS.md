# 📚 Base de Conhecimento - SQLs Antigos (TRASH)

**Fonte**: `/home/cazakino/zzz-ultra-gigante/api-sankhya-center/.TRASH/ANTIGUINDA/sqls/`  
**Data**: 10/01/2026  
**Objetivo**: Consolidar padrões e boas práticas extraídos de SQLs históricos

---

## 🎯 Principais Aprendizados

### 1. ⭐ **Padrões de Consulta de Estoque**

#### 📌 Estrutura Base (estoque-resumo-por-produto.sql):

```sql
-- CTE para último preço de compra
WITH last_purchase_price AS (
    SELECT CODPROD, VLRUNIT AS last_vlrunit
    FROM (
        SELECT I.CODPROD, I.VLRUNIT,
            ROW_NUMBER() OVER (
                PARTITION BY I.CODPROD
                ORDER BY C.DTNEG DESC, I.NUNOTA DESC
            ) as rn
        FROM TGFITE I
        JOIN TGFCAB C ON C.NUNOTA = I.NUNOTA
            AND C.TIPMOV = 'C'
            AND C.STATUSNOTA = 'L'
    ) t
    WHERE rn = 1
)
```

**Uso**: Sempre usar ROW_NUMBER() para pegar a última compra  
**Benefício**: Mais eficiente que MAX() com subquery

---

### 2. ⭐ **Cálculo de Preço Ponderado**

```sql
-- Preço médio ponderado do período
CASE WHEN SUM(QTDNEG) > 0
    THEN SUM(VLRUNIT * QTDNEG) / SUM(QTDNEG)
    ELSE NULL
END AS PRECO_PONDERADO
```

**Aplicação**: Usar para calcular PMM (Preço Médio Móvel)

---

### 3. ⭐ **Padrões de Filtros de Consumo**

#### 📌 Consumo Usando TGFTOP.ATUALEST:

```sql
-- Método 1: Por tipo de atualização de estoque
WHERE TGFTOP.ATUALEST = 'B'  -- Apenas baixas/saídas

-- Método 2: Excluindo compras
WHERE C.TIPMOV <> 'O'  -- Exclui pedidos de compra
  AND C.STATUSNOTA = 'L'
```

**Lição**: Dois métodos válidos, preferir ATUALEST quando disponível

---

### 4. ⭐ **Controle de Estoque com CONTROLE**

```sql
SELECT DISTINCT
    LOC.DESCRLOCAL,
    EST.CONTROLE,          -- ⭐ Sempre incluir
    PRO.CODPROD,
    PRO.DESCRPROD,
    ISNULL(PRO.COMPLDESC, ' ') AS Complemento,
    ISNULL(EST.ESTOQUE, 0) AS Estoque
FROM TGFPRO PRO
JOIN TGFEST EST ON PRO.CODPROD = EST.CODPROD
JOIN TGFLOC LOC ON EST.CODLOCAL = LOC.CODLOCAL
WHERE EST.CODPARC = 0      -- Estoque próprio
  AND EST.ATIVO = 'S'
```

**Observação**: CONTROLE pode ser NULL, vazio ou conter lote/série

---

### 5. ⭐ **Agregação por Período (Mensal)**

```sql
-- Agrupar por ano-mês
SELECT
    LEFT(CONVERT(VARCHAR(7), C.DTNEG, 120), 7) AS ANO_MES,
    COUNT(DISTINCT C.NUNOTA) AS NOTAS,
    SUM(ISNULL(I.QTDNEG, 0)) AS QTD_TOTAL
FROM TGFITE I
JOIN TGFCAB C ON C.NUNOTA = I.NUNOTA
WHERE I.CODPROD = @codprod
GROUP BY LEFT(CONVERT(VARCHAR(7), C.DTNEG, 120), 7)
ORDER BY ANO_MES DESC
```

**Uso**: Análise de tendência de consumo ao longo do tempo

---

### 6. ⭐ **Cálculo de Pedidos Pendentes**

```sql
-- Quantidade e valor pendente de entrega
SELECT
    i.CODPROD,
    SUM(CASE
        WHEN (QTDNEG - QTDENTREGUE) > 0
        THEN (QTDNEG - QTDENTREGUE)
        ELSE 0
    END) AS QTD_PENDENTE,

    SUM(CASE
        WHEN (QTDNEG - QTDENTREGUE) > 0
        THEN COALESCE(i.VLRUNIT, lp.last_vlrunit, 0) * (QTDNEG - QTDENTREGUE)
        ELSE 0
    END) AS VLR_ESTIMADO_PENDENTE
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN last_purchase_price lp ON lp.CODPROD = i.CODPROD
WHERE (QTDNEG - QTDENTREGUE) > 0
  AND c.TIPMOV = 'Q'
  AND c.STATUSNOTA = 'L'
  AND c.CODTIPOPER IN (502, 504, 506, 507)
  AND c.NUMCOTACAO IS NULL
  AND c.NUREM IS NULL
GROUP BY i.CODPROD
```

**Aplicação**: Mostrar quanto está pendente de entrega em requisições

---

### 7. ⭐ **Rollup para Totalizadores**

```sql
-- Totalização com ROLLUP (agrupa + total geral)
SELECT
    CASE
        WHEN GROUPING(USU.NOMEUSU) = 1
        THEN 'TOTAL GERAL'
        ELSE USU.NOMEUSU
    END AS comprador,
    COUNT(DISTINCT C.NUNOTA) AS qtdConfirmados,
    SUM(ISNULL(I.QTDNEG, 0)) AS qtdTotalNegada,
    SUM(C.VLRNOTA) AS vlrConfirmados
FROM TGFCAB C
JOIN TGFITE I ON I.NUNOTA = C.NUNOTA
LEFT JOIN TSIUSU USU ON USU.CODUSU = C.CODUSUINC
GROUP BY ROLLUP(USU.NOMEUSU)
ORDER BY CASE
    WHEN GROUPING(USU.NOMEUSU) = 1 THEN 2
    ELSE 1
END
```

**Uso**: Criar totalizações automáticas (por usuário + total geral)

---

### 8. ⭐ **Valor Remanescente em Estoque**

```sql
-- Calcular quanto do valor comprado no período permanece em estoque
WITH purchases_period AS (
    SELECT
        i.CODPROD,
        SUM(QTDNEG) AS QTD_COMPRADA,
        SUM(VLRUNIT * QTDNEG) / SUM(QTDNEG) AS PRECO_PONDERADO
    FROM TGFCAB c
    JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
    WHERE c.TIPMOV = 'O'
      AND c.STATUSNOTA = 'L'
      AND c.DTMOV BETWEEN @dtInicio AND @dtFim
    GROUP BY i.CODPROD
),
stock AS (
    SELECT CODPROD, SUM(ESTOQUE) AS ESTOQUE_ATUAL
    FROM TGFEST
    GROUP BY CODPROD
)
SELECT
    p.CODPROD,
    -- Quantidade aplicável (mínimo entre estoque atual e qtd comprada)
    CASE
        WHEN st.ESTOQUE_ATUAL < p.QTD_COMPRADA
        THEN st.ESTOQUE_ATUAL
        ELSE p.QTD_COMPRADA
    END AS QTD_APLICAVEL,
    -- Valor remanescente
    (CASE
        WHEN st.ESTOQUE_ATUAL < p.QTD_COMPRADA
        THEN st.ESTOQUE_ATUAL
        ELSE p.QTD_COMPRADA
    END) * p.PRECO_PONDERADO AS VALOR_REMANESCENTE
FROM purchases_period p
LEFT JOIN stock st ON st.CODPROD = p.CODPROD
```

**Aplicação**: Análise financeira de estoque por período

---

### 9. ⭐ **Tratamento de Campos Opcionais**

```sql
-- Sempre usar ISNULL ou COALESCE para campos que podem ser NULL
ISNULL(PRO.COMPLDESC, ' ') AS Complemento,
ISNULL(EST.ESTOQUE, 0) AS Estoque,
COALESCE(p.VLRULTCOMPRA, p.VLRUNIT, 0) AS PrecoUsado,
COALESCE(i.VLRUNIT, lp.last_vlrunit, 0) AS PrecoEstimado
```

**Regra**: Nunca confiar que campo não é NULL

---

### 10. ⭐ **Joins Opcionais**

```sql
-- Usar LEFT JOIN para tabelas que podem não ter dados
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA           -- OBRIGATÓRIO
LEFT JOIN TGFPAR par ON par.CODPARC = c.CODPARC  -- OPCIONAL
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC    -- OPCIONAL
LEFT JOIN TSICUS cc ON cc.CODCENCUS = c.CODCENCUS -- OPCIONAL
LEFT JOIN TGFLOC l ON l.CODLOCAL = i.CODLOCAL    -- OPCIONAL
```

**Regra**: JOIN apenas para tabelas essenciais, LEFT JOIN para extras

---

## 📊 Estrutura de Queries Complexas (Padrão CTE)

```sql
-- 1. CTEs de dados base
WITH
  last_purchase AS (...),
  pedidos_pendentes AS (...),
  estoque_atual AS (...)

-- 2. Query principal com JOINs
SELECT ...
FROM base_table
  LEFT JOIN last_purchase ...
  LEFT JOIN pedidos_pendentes ...
  LEFT JOIN estoque_atual ...

-- 3. Filtros e ordenação
WHERE ...
ORDER BY ...
```

**Benefício**: Código mais legível, reutilizável e testável

---

## 🎯 Produtos Especiais a Excluir

```sql
-- Produtos genéricos/teste que devem ser excluídos em queries
WHERE i.CODPROD NOT IN (5568, 6689, 8076, 99999)
```

**Observação**: Sempre verificar se há produtos especiais a excluir

---

## 🔑 Campos Importantes de TGFCAB

```sql
C.NUNOTA        -- Número único da nota
C.CODEMP        -- Código da empresa
C.DTNEG         -- Data de negociação
C.DTMOV         -- Data do movimento
C.DTENTSAI      -- Data entrada/saída
C.TIPMOV        -- Tipo movimento (C, V, Q, O, T, etc)
C.STATUSNOTA    -- Status (L=Liberada, P=Pendente, etc)
C.CODTIPOPER    -- Código tipo operação
C.CODPARC       -- Código parceiro
C.CODCENCUS     -- Centro de custo (pode ser NULL)
C.CODUSUINC     -- Usuário que incluiu
C.OBSERVACAO    -- Observação da nota
```

---

## 🔑 Campos Importantes de TGFITE

```sql
I.NUNOTA        -- Número da nota (FK)
I.SEQ           -- Sequência do item
I.CODPROD       -- Código do produto
I.QTDE          -- Quantidade (pode diferir de QTDNEG)
I.QTDNEG        -- Quantidade negociada
I.QTDENTREGUE   -- Quantidade entregue
I.PENDENTE      -- S/N
I.VLRUNIT       -- Valor unitário
I.VLRTOT        -- Valor total
I.ATUALESTOQUE  -- >0 entrada, <0 saída, 0 não afeta
I.RESERVA       -- S/N
I.CONTROLE      -- Lote/série (pode ser NULL)
I.CODLOCAL      -- Local de estoque
I.OBSERVACAO    -- Observação do item
```

---

## 🔑 Campos Importantes de TGFTOP

```sql
T.CODTIPOPER    -- Código do tipo de operação
T.DESCROPER     -- Descrição da operação
T.ATUALEST      -- B (Baixa), E (Entrada), N (Nenhum), R (Reserva)
T.DHTIPOPER     -- Data/hora (parte da chave composta com CODTIPOPER)
```

---

## 🔑 Campos Importantes de TGFEST

```sql
E.CODPROD       -- Código do produto
E.CODLOCAL      -- Código do local
E.CODEMP        -- Código da empresa
E.ESTOQUE       -- Quantidade em estoque
E.CONTROLE      -- Lote/série (pode ser NULL)
E.CODPARC       -- 0 = próprio, >0 = consignado
E.ATIVO         -- S/N
E.ESTMIN        -- Estoque mínimo
```

---

## 📋 Checklist para Novas Queries

- [ ] Usar LEFT JOIN para tabelas opcionais (TGFPAR, TSICUS, TGFLOC)
- [ ] Incluir ISNULL/COALESCE para campos que podem ser NULL
- [ ] Sempre incluir CONTROLE nas queries de estoque (pode ser NULL)
- [ ] Filtrar CODPARC = 0 para estoque próprio
- [ ] Usar STATUSNOTA = 'L' para notas liberadas
- [ ] Usar ATUALESTOQUE <> 0 para movimentações que afetam estoque
- [ ] Usar RESERVA = 'N' para excluir reservas
- [ ] Excluir produtos especiais (5568, 6689, 8076, 99999)
- [ ] Usar ROW_NUMBER() para última compra ao invés de MAX()
- [ ] Considerar usar CTEs para queries complexas

---

## 🎓 Padrões de Nomenclatura Observados

**Boas práticas dos SQLs antigos**:

- CTEs em minúsculas com underscore: `last_purchase_price`, `estoque_src`
- Aliases de tabela em maiúsculas: `C`, `I`, `PRO`, `EST`
- Campos calculados descritivos: `QTD_PENDENTE`, `VALOR_REMANESCENTE`
- Comentários explicativos antes de cada seção
- Parâmetros com `@` no início: `@codprod`, `@dt_start`

---

## 💡 Dicas para Otimização

1. **Índices úteis**: CODPROD, NUNOTA, DTNEG, STATUSNOTA, TIPMOV
2. **Evitar**: SELECT \* - sempre especificar campos necessários
3. **Usar**: Paginação em queries com muitos resultados
4. **Preferir**: CTEs ao invés de subqueries aninhadas
5. **Testar**: Queries com TOP 10 antes de rodar em produção

---

## 🔗 Arquivos de Referência

- `estoque-resumo-por-produto.sql` - Padrão completo de estoque
- `consumo_produto_template.sql` - Template para consumo
- `valor-estoque-por-periodo.sql` - Análise financeira
- `estoque-locais.sql` - Estoque por localização

---

**📌 Importante**: Sempre adaptar os padrões acima para o contexto específico,  
validando com dados reais antes de usar em produção.
