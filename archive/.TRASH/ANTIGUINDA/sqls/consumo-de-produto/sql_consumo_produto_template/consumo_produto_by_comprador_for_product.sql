-- Consumo por comprador para um produto específico (ROLLUP)
-- Ajuste @codprod, @month e @year conforme necessário

DECLARE @codprod INT = 9558;
-- produto alvo
DECLARE @month INT = 12;
DECLARE @year INT = 2025;

SELECT
  CASE
        WHEN GROUPING(USU.NOMEUSU) = 1 THEN 'TOTAL GERAL'
        ELSE USU.NOMEUSU
    END AS comprador,

  COUNT(DISTINCT CAB.NUNOTA) AS qtdConfirmados,
  COUNT(DISTINCT CASE WHEN fin.comprasPagas IS NOT NULL THEN CAB.NUNOTA END) AS qtdExecutados,
  SUM(CAB.VLRNOTA) AS vlrConfirmados,
  SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN CAB.VLRNOTA ELSE 0 END) AS vlrExecutados,

  -- Percentuais (sobre o total geral de pedidos contendo o produto)
  CAST(
        COUNT(DISTINCT CAB.NUNOTA) * 100.0 / SUM(COUNT(DISTINCT CAB.NUNOTA)) OVER ()
        AS DECIMAL(5,2)
    ) AS pctQtdConfirmados,

  CAST(
        COUNT(DISTINCT CASE WHEN fin.comprasPagas IS NOT NULL THEN CAB.NUNOTA END) * 100.0
        / NULLIF(SUM(COUNT(DISTINCT CASE WHEN fin.comprasPagas IS NOT NULL THEN CAB.NUNOTA END)) OVER (),0)
        AS DECIMAL(5,2)
    ) AS pctQtdExecutados,

  CAST(
        SUM(CAB.VLRNOTA) * 100.0 / NULLIF(SUM(SUM(CAB.VLRNOTA)) OVER (),0)
        AS DECIMAL(5,2)
    ) AS pctVlrConfirmados,

  CAST(
        SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN CAB.VLRNOTA ELSE 0 END) * 100.0
        / NULLIF(SUM(SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN CAB.VLRNOTA ELSE 0 END)) OVER (),0)
        AS DECIMAL(5,2)
    ) AS pctVlrExecutados,

  (SELECT NOMEUSU
  FROM [SANKHYA].[TSIULG]
  WHERE SPID = @@SPID) AS usuLog

FROM [SANKHYA].[TGFCAB] CAB
  -- join TGFITE to restrict to the desired product
  JOIN [SANKHYA].[TGFITE] I ON I.NUNOTA = CAB.NUNOTA AND I.CODEMP = CAB.CODEMP AND I.CODPROD = @codprod
  JOIN [SANKHYA].[TSICUS] CRES ON CRES.CODCENCUS = CAB.CODCENCUS
  LEFT JOIN (
    SELECT NUNOTA, 1 AS comprasPagas
  FROM [SANKHYA].[TGFFIN]
  WHERE DHBAIXA IS NOT NULL
  GROUP BY NUNOTA
) fin ON fin.NUNOTA = CAB.NUNOTA
  JOIN [SANKHYA].[TGFVEN] ven ON ven.CODVEND = CAB.CODVEND
  JOIN [SANKHYA].[TSIUSU] USU ON USU.CODUSU = CAB.CODUSUINC

WHERE
    CAB.TIPMOV = 'O'
  AND CAB.STATUSNOTA = 'L'
  AND MONTH(CAB.DTNEG) = @month
  AND YEAR(CAB.DTNEG) = @year
  AND CAB.CODUSUINC IN (104,107,263,309)

GROUP BY ROLLUP(USU.NOMEUSU)
ORDER BY
    CASE WHEN GROUPING(USU.NOMEUSU) = 1 THEN 2 ELSE 1 END,
    USU.NOMEUSU;

-- Nota: o JOIN com TGFITE garante que apenas notas que contenham o produto @codprod sejam consideradas.
-- Use COUNT(DISTINCT CAB.NUNOTA) para evitar duplicações caso haja múltiplas linhas do mesmo produto na mesma nota.
