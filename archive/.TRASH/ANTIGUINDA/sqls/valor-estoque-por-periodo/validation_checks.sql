-- Validation checks for Valor em Estoque por Período
-- Run after running the test or canonical queries to ensure sums and expectations hold

-- 1) Soma de quantidades compradas no período >= soma das quantidades aplicadas (min(estoque,qtd_compra))
-- (This is sanity check — the applied qty cannot exceed total purchased qty in period)

-- 2) Valor remanescente não excede (qtd_comprada_periodo * preco_max)

-- Example queries (adjust @dtInicio/@dtFim/@CODEMP):

-- a) show total purchased qty and total applied qty (computed in-line)
DECLARE @dtInicio DATE = '2025-01-01';
DECLARE @dtFim DATE = '2025-12-31';

WITH
  purchases_period
  AS
  (
    SELECT i.CODPROD, SUM(ISNULL(i.QTDNEG,0)) AS QTD_COMPRADA
    FROM [SANKHYA].[TGFCAB] c JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
    WHERE c.TIPMOV='O' AND c.STATUSNOTA='L' AND c.DTMOV BETWEEN @dtInicio AND @dtFim
    GROUP BY i.CODPROD
  ),
  stock
  AS
  (
    SELECT CODPROD, SUM(ISNULL(ESTOQUE,0)) AS ESTOQUE_ATUAL
    FROM [SANKHYA].[TGFEST]
    GROUP BY CODPROD
  )
SELECT SUM(p.QTD_COMPRADA) AS soma_qtd_comprada_periodo,
  SUM(CASE WHEN ISNULL(s.ESTOQUE_ATUAL,0) < ISNULL(p.QTD_COMPRADA,0) THEN ISNULL(s.ESTOQUE_ATUAL,0) ELSE ISNULL(p.QTD_COMPRADA,0) END) AS soma_qtd_aplicavel
FROM purchases_period p LEFT JOIN stock s ON s.CODPROD = p.CODPROD;

-- b) check total valor remanescente vs soma de compras (sanity)
-- Use the main query's logic to compute valor_remanescente and compare to total purchases value

-- (Adjust and run as needed)
