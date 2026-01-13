-- Stock Trend: estimativa de estoque em uma data passada e comparações de compras
-- Objetivo: para uma lista de produtos, calcular: estoque atual, compras em dois períodos, e estimativa de estoque em data passada (stock_at_past)
-- Premissas:
--  - Entradas: TIPMOV IN ('C','O') (Compra e Ordem de compra)
--  - Saídas: TIPMOV IN ('V','Q','D','I','R','U') (Vendas, Requisições, Devoluções, etc.)
--  - Quantidade usada: COALESCE(QTDENTREGUE, QTDNEG)
-- Parâmetros:
--  - @pastDate: data anterior para estimar estoque (stock_at_past = current_stock - net_movement_since_past)
--  - @periodA_start, @periodA_end: período A (ex: recent)
--  - @periodB_start, @periodB_end: período B (ex: earlier period)
--  - list of products: ajuste a cláusula "AND p.CODPROD IN (...)" conforme desejado

DECLARE @pastDate DATE = '2025-06-30';
DECLARE @periodA_start DATE = '2025-07-01';
DECLARE @periodA_end   DATE = '2025-07-31';
DECLARE @periodB_start DATE = '2025-01-01';
DECLARE @periodB_end   DATE = '2025-06-30';

WITH
  -- Current stock from TGFEST
  current_stock
  AS
  (
    SELECT e.CODPROD, SUM(ISNULL(e.ESTOQUE,0)) AS ESTOQUE_ATUAL
    FROM [SANKHYA].[TGFEST] e
    GROUP BY e.CODPROD
  ),
  -- Purchases (orders approved TIPMOV='O' STATUSNOTA='L') aggregated per period
  purchases_period
  AS
  (
    SELECT
      i.CODPROD,
      SUM(CASE WHEN c.DTMOV BETWEEN @periodA_start AND @periodA_end THEN COALESCE(i.QTDENTREGUE, i.QTDNEG, 0) ELSE 0 END) AS QTD_A,
      SUM(CASE WHEN c.DTMOV BETWEEN @periodB_start AND @periodB_end THEN COALESCE(i.QTDENTREGUE, i.QTDNEG, 0) ELSE 0 END) AS QTD_B,
      SUM(CASE WHEN c.DTMOV BETWEEN @periodA_start AND @periodA_end THEN ISNULL(i.VLRUNIT,0) * COALESCE(i.QTDENTREGUE, i.QTDNEG, 0) ELSE 0 END) AS VAL_A,
      SUM(CASE WHEN c.DTMOV BETWEEN @periodB_start AND @periodB_end THEN ISNULL(i.VLRUNIT,0) * COALESCE(i.QTDENTREGUE, i.QTDNEG, 0) ELSE 0 END) AS VAL_B
    FROM [SANKHYA].[TGFCAB] c
      JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
    WHERE c.TIPMOV = 'O' AND c.STATUSNOTA = 'L'
    -- AND i.CODPROD IN (1234, 5678) -- opcional: filtrar produtos
    GROUP BY i.CODPROD
  ),
  -- Net movement since pastDate until now (entries - exits)
  movements_since_past
  AS
  (
    SELECT
      i.CODPROD,
      SUM(CASE WHEN c.TIPMOV IN ('C','O') THEN COALESCE(i.QTDENTREGUE, i.QTDNEG, 0) ELSE 0 END) AS QTD_ENTRIES_SINCE,
      SUM(CASE WHEN c.TIPMOV IN ('V','Q','D','I','R','U') THEN COALESCE(i.QTDENTREGUE, i.QTDNEG, 0) ELSE 0 END) AS QTD_EXITS_SINCE
    FROM [SANKHYA].[TGFCAB] c
      JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
    WHERE c.DTMOV > @pastDate AND c.DTMOV <= GETDATE()
    GROUP BY i.CODPROD
  )

SELECT
  p.CODPROD,
  pr.DESCRPROD,
  ISNULL(cs.ESTOQUE_ATUAL, 0) AS ESTOQUE_ATUAL,
  ISNULL(pp.QTD_A, 0) AS QTD_COMPRADA_PERIOD_A,
  ISNULL(pp.QTD_B, 0) AS QTD_COMPRADA_PERIOD_B,
  ISNULL(msp.QTD_ENTRIES_SINCE, 0) AS QTD_ENTRIES_SINCE_PAST_DATE,
  ISNULL(msp.QTD_EXITS_SINCE, 0) AS QTD_EXITS_SINCE_PAST_DATE,
  -- stock at past date = current - (entries_since - exits_since)
  (ISNULL(cs.ESTOQUE_ATUAL,0) - (ISNULL(msp.QTD_ENTRIES_SINCE,0) - ISNULL(msp.QTD_EXITS_SINCE,0))) AS ESTOQUE_ESTIMADO_EM_PAST_DATE
FROM (
  -- union of products from purchases_period and current_stock
      SELECT CODPROD
    FROM purchases_period
  UNION
    SELECT CODPROD
    FROM current_stock
) p
  LEFT JOIN purchases_period pp ON pp.CODPROD = p.CODPROD
  LEFT JOIN current_stock cs ON cs.CODPROD = p.CODPROD
  LEFT JOIN movements_since_past msp ON msp.CODPROD = p.CODPROD
  LEFT JOIN [SANKHYA].[TGFPRO] pr ON pr.CODPROD = p.CODPROD
ORDER BY ESTOQUE_ATUAL DESC;

-- Observações:
--  - Esta é uma estimativa baseada em movimentações registradas entre @pastDate e hoje.
--  - Se sua definição de "entrada"/"saída" for diferente, ajuste as listas de TIPMOV em movements_since_past.
--  - Recomendo rodar para um conjunto pequeno de produtos (adicionar o filtro) para validar antes de rodar em massa.
