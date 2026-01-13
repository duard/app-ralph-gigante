-- TESTE: Estoque Resumo por Produto (amostra + checagens)
-- INSTRUÇÕES: conecte-se ao banco via SQL Server extension no VS Code e execute este arquivo.
-- Ele retorna uma amostra (TOP 100) ordenada por valor estimado, além de métricas agregadas para validação.

SET NOCOUNT ON;

-- Parâmetros de teste (ajuste se necessário)
-- DECLARE @CODEMP INT = 7; -- empresa de exemplo

WITH
  estoque_src
  AS
  (
    SELECT
      e.CODEMP,
      e.CODPROD,
      ISNULL(e.CODLOCAL, 0) AS CODLOCAL,
      SUM(ISNULL(e.ESTOQUE, 0)) AS ESTOQUE_TOTAL,
      SUM(ISNULL(e.ESTMIN, 0)) AS ESTMIN_SUM
    FROM [SANKHYA].[TGFEST] e
    GROUP BY e.CODEMP, e.CODPROD, ISNULL(e.CODLOCAL, 0)
  ),
  last_purchase_price
  AS
  (
    SELECT CODPROD, VLRUNIT AS last_vlrunit
    FROM (
      SELECT I.CODPROD, I.VLRUNIT,
        ROW_NUMBER() OVER (PARTITION BY I.CODPROD ORDER BY C.DTNEG DESC, I.NUNOTA DESC) as rn
      FROM [SANKHYA].[TGFITE] I
        JOIN [SANKHYA].[TGFCAB] C ON C.NUNOTA = I.NUNOTA AND C.TIPMOV = 'C' AND C.STATUSNOTA = 'L'
    ) t
    WHERE rn = 1
  ),
  pedidos_pendentes
  AS
  (
    SELECT
      i.CODPROD,
      SUM(CASE WHEN (QTDNEG - QTDENTREGUE) > 0 THEN (QTDNEG - QTDENTREGUE) ELSE 0 END) AS QTD_PENDENTE,
      SUM(CASE WHEN (QTDNEG - QTDENTREGUE) > 0 THEN ISNULL(i.VLRTOT, 0) ELSE 0 END) AS VLRTOT_PENDENTE,
      SUM(CASE WHEN (QTDNEG - QTDENTREGUE) > 0 THEN COALESCE(i.VLRUNIT, lp.last_vlrunit, 0) * (QTDNEG - QTDENTREGUE) ELSE 0 END) AS VLR_ESTIMADO_PENDENTE
    FROM [SANKHYA].[TGFCAB] c
      JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
      LEFT JOIN last_purchase_price lp ON lp.CODPROD = i.CODPROD
    WHERE (QTDNEG - QTDENTREGUE) > 0
      AND c.TIPMOV = 'Q'
      AND c.STATUSNOTA = 'L'
      AND c.CODTIPOPER IN (502,504,506,507)
      AND c.NUMCOTACAO IS NULL
      AND c.NUREM IS NULL
      AND i.CODPROD NOT IN (5568,6689,8076)
    GROUP BY i.CODPROD
  ),
  estoque_agg
  AS
  (
    SELECT
      s.CODPROD,
      SUM(s.ESTOQUE_TOTAL) AS ESTOQUE_TOTAL
    FROM estoque_src s
    GROUP BY s.CODPROD
  )

-- Amostra TOP 100 para inspeção visual
SELECT TOP 100
  p.CODPROD,
  p.DESCRPROD,
  p.REFERENCIA,
  p.CODUNIDADE,
  p.VLRUNIT,
  p.VLRULTCOMPRA,
  ISNULL(ea.ESTOQUE_TOTAL, 0) AS ESTOQUE_ATUAL,
  ISNULL(pp.QTD_PENDENTE, 0) AS QTD_PENDENTE,
  ISNULL(ea.ESTOQUE_TOTAL, 0) * COALESCE(p.VLRULTCOMPRA, p.VLRUNIT, 0) AS VALOR_ESTOQUE_ESTIMADO,
  ISNULL(pp.VLR_ESTIMADO_PENDENTE, pp.VLRTOT_PENDENTE) AS VALOR_PEDIDOS_PENDENTES
FROM [SANKHYA].[TGFPRO] p
  LEFT JOIN estoque_agg ea ON ea.CODPROD = p.CODPROD
  LEFT JOIN pedidos_pendentes pp ON pp.CODPROD = p.CODPROD
ORDER BY VALOR_ESTOQUE_ESTIMADO DESC, ESTOQUE_ATUAL DESC;

-- Checagens agregadas rápidas
SELECT COUNT(*) AS produtos_com_registros_em_estoque
FROM estoque_agg;
SELECT SUM(ESTOQUE_TOTAL) AS soma_estoque_total
FROM estoque_agg;
SELECT COUNT(*) AS produtos_com_pedidos_pendentes
FROM pedidos_pendentes;
SELECT SUM(QTD_PENDENTE) AS soma_pedidos_pendentes
FROM pedidos_pendentes;

-- (Opcional) listar os top 10 produtos por valor de estoque estimado para conferência
SELECT TOP 10
  p.CODPROD,
  p.DESCRPROD,
  ISNULL(ea.ESTOQUE_TOTAL, 0) AS ESTOQUE_ATUAL,
  ISNULL(ea.ESTOQUE_TOTAL, 0) * COALESCE(p.VLRULTCOMPRA, p.VLRUNIT, 0) AS VALOR_ESTOQUE_ESTIMADO
FROM [SANKHYA].[TGFPRO] p
  LEFT JOIN estoque_agg ea ON ea.CODPROD = p.CODPROD
ORDER BY VALOR_ESTOQUE_ESTIMADO DESC;

PRINT 'Teste finalizado - cole os resultados aqui para análise';
