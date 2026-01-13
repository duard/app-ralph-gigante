-- Variant: Cálculo de valor usando custo médio ponderado acumulado até dtFim
-- Observação: este script calcula o custo médio a partir das compras (TIPMOV='C' e STATUSNOTA='L') ocorridas até dtFim

DECLARE @dtFim DATE = '2025-12-31';

WITH
  purchases_up_to
  AS
  (
    SELECT
      i.CODPROD,
      SUM(ISNULL(i.QTDNEG,0)) AS QTD_TOTAL,
      SUM(ISNULL(i.VLRUNIT,0) * ISNULL(i.QTDNEG,0)) AS VALOR_TOTAL
    FROM [SANKHYA].[TGFCAB] c
      JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
    WHERE c.TIPMOV = 'C' AND c.STATUSNOTA = 'L' AND c.DTNEG <= @dtFim
      AND i.CODPROD NOT IN (5568,6689,8076)
    GROUP BY i.CODPROD
  ),
  avg_cost
  AS
  (
    SELECT
      CODPROD,
      CASE WHEN QTD_TOTAL > 0 THEN VALOR_TOTAL / QTD_TOTAL ELSE NULL END AS COSTO_MEDIO
    FROM purchases_up_to
  ),
  stock
  AS
  (
    SELECT CODPROD, SUM(ISNULL(ESTOQUE,0)) AS ESTOQUE_ATUAL
    FROM [SANKHYA].[TGFEST]
    GROUP BY CODPROD
  )

SELECT
  ac.CODPROD,
  pr.DESCRPROD,
  st.ESTOQUE_ATUAL,
  ac.COSTO_MEDIO,
  ISNULL(st.ESTOQUE_ATUAL,0) * ISNULL(ac.COSTO_MEDIO,0) AS VALOR_ESTOQUE_SEGUNDO_CUSTO_MEDIO
FROM avg_cost ac
  LEFT JOIN stock st ON st.CODPROD = ac.CODPROD
  LEFT JOIN [SANKHYA].[TGFPRO] pr ON pr.CODPROD = ac.CODPROD
ORDER BY VALOR_ESTOQUE_SEGUNDO_CUSTO_MEDIO DESC;