SELECT
  CASE
        WHEN GROUPING(USU.NOMEUSU) = 1 THEN 'TOTAL GERAL'
        ELSE USU.NOMEUSU
    END AS comprador,

  COUNT(*) AS qtdConfirmados,
  SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN 1 ELSE 0 END) AS qtdExecutados,
  SUM(cab.vlrnota) AS vlrConfirmados,
  SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN cab.vlrnota ELSE 0 END) AS vlrExecutados,

  -- Percentuais
  CAST(
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()
        AS DECIMAL(5,2)
    ) AS pctQtdConfirmados,

  CAST(
        SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN 1 ELSE 0 END) * 100.0
        / SUM(SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN 1 ELSE 0 END)) OVER ()
        AS DECIMAL(5,2)
    ) AS pctQtdExecutados,

  CAST(
        SUM(cab.vlrnota) * 100.0 / SUM(SUM(cab.vlrnota)) OVER ()
        AS DECIMAL(5,2)
    ) AS pctVlrConfirmados,

  CAST(
        SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN cab.vlrnota ELSE 0 END) * 100.0
        / SUM(SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN cab.vlrnota ELSE 0 END)) OVER ()
        AS DECIMAL(5,2)
    ) AS pctVlrExecutados,

  (SELECT NOMEUSU
  FROM TSIULG
  WHERE SPID = @@SPID) AS usuLog

FROM TGFCAB cab
  JOIN TSICUS CRES ON CRES.CODCENCUS = cab.CODCENCUS
  LEFT JOIN (
    SELECT NUNOTA, 1 AS comprasPagas
  FROM TGFFIN
  WHERE DHBAIXA IS NOT NULL
  GROUP BY NUNOTA
) fin ON fin.NUNOTA = cab.NUNOTA
  JOIN TGFVEN ven ON ven.CODVEND = cab.CODVEND
  JOIN TSIUSU USU ON USU.CODUSU = CAB.CODUSUINC

WHERE
    CAB.TIPMOV = 'O'
  AND CAB.STATUSNOTA = 'L'
  AND MONTH(CAB.DTNEG) = CAST($P
{MES} AS INT)
    AND YEAR
(CAB.DTNEG) = CAST
($P{ANO} AS INT)
    AND CAB.CODUSUINC IN
(104,107,263,309)

GROUP BY ROLLUP
(USU.NOMEUSU)
ORDER BY
    CASE WHEN GROUPING
(USU.NOMEUSU) = 1 THEN 2 ELSE 1
END,
    USU.NOMEUSU;