-- ================================================================
-- Valor em estoque por período (por produto)
-- Objetivo: para um intervalo (dtInicio..dtFim) e lista opcional de produtos,
-- calcular quanto, em valor monetário, das compras feitas nesse período
-- permanece hoje em estoque.
-- Premissas:
--  - Pedidos aprovados: TGFCAB (TIPMOV = 'O' AND STATUSNOTA = 'L').
--  - Preço do pedido: TGFITE.VLRUNIT. Caso não exista preço, usa-se o último preço de compra confirmada.
--  - Sem rastreamento por lote: usamos VALOR_REMANESCENTE = min(ESTOQUE_ATUAL, QTD_COMPRADA_NO_PERIODO) * PRECO_USADO
--  - Ajuste CODEMP/CODLOCAL e lista de produtos conforme necessário.
-- ================================================================

-- Parâmetros de execução (ajuste antes de rodar na extensão SQL Server):
-- DECLARE @dtInicio DATE = '2025-01-01';
-- DECLARE @dtFim    DATE = '2025-12-31';
-- DECLARE @CODEMP   INT  = NULL; -- opcional
-- DECLARE @CODLOCAL INT  = NULL; -- opcional
-- (Opcional) Filtrar por produtos: add "AND i.CODPROD IN ( ... )" na CTE purchases_period

WITH
  -- 1) Compras (pedidos aprovados) no período: total qty e valor total (para preço ponderado)
  purchases_period
  AS
  (
    SELECT
      i.CODPROD,
      SUM(ISNULL(i.QTDNEG, 0)) AS QTD_COMPRADA,
      SUM(ISNULL(i.VLRUNIT, 0) * ISNULL(i.QTDNEG, 0)) AS VALOR_TOTAL_COMPRAS,
      CASE WHEN SUM(ISNULL(i.QTDNEG, 0)) > 0
         THEN SUM(ISNULL(i.VLRUNIT, 0) * ISNULL(i.QTDNEG, 0)) / SUM(ISNULL(i.QTDNEG, 0))
         ELSE NULL END AS PRECO_PONDERADO
    FROM [SANKHYA].[TGFCAB] c
      JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
    WHERE c.TIPMOV = 'O' -- pedido aprovado
      AND c.STATUSNOTA = 'L'
      AND c.DTMOV BETWEEN @dtInicio AND @dtFim
      /* AND i.CODPROD IN (...) */
      AND i.CODPROD NOT IN (5568,6689,8076)
    GROUP BY i.CODPROD
  ),

  -- 2) Último preço de compra confirmada (TIPMOV='C' e STATUSNOTA='L') por produto (fallback)
  last_purchase_price
  AS
  (
    SELECT t.CODPROD, t.VLRUNIT as last_vlrunit
    FROM (
    SELECT I.CODPROD, I.VLRUNIT,
        ROW_NUMBER() OVER (PARTITION BY I.CODPROD ORDER BY C.DTNEG DESC, I.NUNOTA DESC) as rn
      FROM [SANKHYA].[TGFITE] I
        JOIN [SANKHYA].[TGFCAB] C ON C.NUNOTA = I.NUNOTA AND C.TIPMOV = 'C' AND C.STATUSNOTA = 'L'
  ) t
    WHERE t.rn = 1
  ),

  -- 3) Estoque atual por produto (soma across locais; filtre CODEMP/CODLOCAL se necessário)
  stock
  AS
  (
    SELECT
      e.CODPROD,
      SUM(ISNULL(e.ESTOQUE, 0)) AS ESTOQUE_ATUAL
    FROM [SANKHYA].[TGFEST] e
    WHERE (@CODEMP IS NULL OR e.CODEMP = @CODEMP)
      AND (@CODLOCAL IS NULL OR e.CODLOCAL = @CODLOCAL)
    GROUP BY e.CODPROD
  )

SELECT
  p.CODPROD,
  pr.DESCRPROD,
  ISNULL(st.ESTOQUE_ATUAL, 0) AS ESTOQUE_ATUAL,
  ISNULL(p.QTD_COMPRADA, 0) AS QTD_COMPRADA_PERIOD,
  -- preço usado (preferência: preço ponderado do período, senão último preço de compra, senão preço de cadastro)
  COALESCE(p.PRECO_PONDERADO, lp.last_vlrunit, pr.VLRUNIT, 0) AS PRECO_USADO,
  -- quantidade aplicável do período que permanece em estoque (min)
  CASE WHEN ISNULL(st.ESTOQUE_ATUAL, 0) < ISNULL(p.QTD_COMPRADA, 0) THEN ISNULL(st.ESTOQUE_ATUAL, 0) ELSE ISNULL(p.QTD_COMPRADA, 0) END AS QTD_APLICAVEL,
  -- valor remanescente estimado
  (CASE WHEN ISNULL(st.ESTOQUE_ATUAL, 0) < ISNULL(p.QTD_COMPRADA, 0) THEN ISNULL(st.ESTOQUE_ATUAL, 0) ELSE ISNULL(p.QTD_COMPRADA, 0) END) * COALESCE(p.PRECO_PONDERADO, lp.last_vlrunit, pr.VLRUNIT, 0) AS VALOR_REMANESCENTE
FROM purchases_period p
  LEFT JOIN stock st ON st.CODPROD = p.CODPROD
  LEFT JOIN last_purchase_price lp ON lp.CODPROD = p.CODPROD
  LEFT JOIN [SANKHYA].[TGFPRO] pr ON pr.CODPROD = p.CODPROD
ORDER BY VALOR_REMANESCENTE DESC;

-- ==================================================================
-- Observações:
--  - Esta query atribui o valor do período ao estoque atual até a quantidade comprada.
--  - Para análises mais precisas por lote (FIFO/LIFO) é necessário cruzar movimentos (kardex) e reconciliar quantidades por movimento.
--  - Se preferir usar QTDENTREGUE em vez de QTDNEG, substitua i.QTDNEG por i.QTDENTREGUE na CTE purchases_period.
-- ==================================================================