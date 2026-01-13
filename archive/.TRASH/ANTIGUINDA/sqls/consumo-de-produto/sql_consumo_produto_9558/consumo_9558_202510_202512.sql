-- Consumo do produto 9558 (período: 2025-10-01 .. 2025-12-31)
-- Arquivo gerado automaticamente para análise por comprador e totais

DECLARE @codprod INT = 9558;
DECLARE @dt_start DATE = '2025-10-01';
DECLARE @dt_end DATE = '2025-12-31';

-- 1) Por comprador (ROLLUP) — quantidade de pedidos confirmados que contêm o produto
SELECT
    CASE
        WHEN GROUPING(USU.NOMEUSU) = 1 THEN 'TOTAL GERAL'
        ELSE USU.NOMEUSU
    END AS comprador,

    COUNT(DISTINCT CAB.NUNOTA) AS qtdConfirmados,
    SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN 1 ELSE 0 END) AS qtdExecutados,
    SUM(CAB.VLRNOTA) AS vlrConfirmados,
    SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN CAB.VLRNOTA ELSE 0 END) AS vlrExecutados,

    -- Percentuais (sobre o total geral)
    CAST(
        COUNT(DISTINCT CAB.NUNOTA) * 100.0 / SUM(COUNT(DISTINCT CAB.NUNOTA)) OVER ()
        AS DECIMAL(5,2)
    ) AS pctQtdConfirmados,

    CAST(
        SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN 1 ELSE 0 END) * 100.0
        / SUM(SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN 1 ELSE 0 END)) OVER ()
        AS DECIMAL(5,2)
    ) AS pctQtdExecutados,

    CAST(
        SUM(CAB.VLRNOTA) * 100.0 / SUM(SUM(CAB.VLRNOTA)) OVER ()
        AS DECIMAL(5,2)
    ) AS pctVlrConfirmados,

    CAST(
        SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN CAB.VLRNOTA ELSE 0 END) * 100.0
        / SUM(SUM(CASE WHEN fin.comprasPagas IS NOT NULL THEN CAB.VLRNOTA ELSE 0 END)) OVER ()
        AS DECIMAL(5,2)
    ) AS pctVlrExecutados,

    (SELECT NOMEUSU FROM TSIULG WHERE SPID = @@SPID) AS usuLog

FROM TGFCAB CAB
JOIN TSICUS CRES ON CRES.CODCENCUS = CAB.CODCENCUS
LEFT JOIN (
    SELECT NUNOTA, 1 AS comprasPagas
    FROM TGFFIN
    WHERE DHBAIXA IS NOT NULL
    GROUP BY NUNOTA
) fin ON fin.NUNOTA = CAB.NUNOTA
JOIN TGFVEN ven ON ven.CODVEND = CAB.CODVEND
JOIN TSIUSU USU ON USU.CODUSU = CAB.CODUSUINC
-- restringe às notas que efetivamente contêm o produto 9558
JOIN TGFITE I ON I.NUNOTA = CAB.NUNOTA AND I.CODEMP = CAB.CODEMP AND I.CODPROD = @codprod

WHERE
    CAB.TIPMOV = 'O'
    AND CAB.STATUSNOTA = 'L'
    AND CAB.DTNEG BETWEEN @dt_start AND @dt_end
    AND CAB.CODUSUINC IN (104,107,263,309)

GROUP BY ROLLUP(USU.NOMEUSU)
ORDER BY
    CASE WHEN GROUPING(USU.NOMEUSU) = 1 THEN 2 ELSE 1 END,
    USU.NOMEUSU;

-- 2) Total simples: quantos pedidos confirmados (contendo o produto) no período
SELECT
  COUNT(DISTINCT CAB.NUNOTA) AS TOTAL_PEDIDOS_CONFIRMADOS
FROM TGFCAB CAB
JOIN TGFITE I ON I.NUNOTA = CAB.NUNOTA AND I.CODEMP = CAB.CODEMP
WHERE I.CODPROD = @codprod
  AND CAB.TIPMOV = 'O'
  AND CAB.STATUSNOTA = 'L'
  AND CAB.DTNEG BETWEEN @dt_start AND @dt_end;

-- 3) (Opcional) Linha por nota (inspeção): mostra as notas que contêm o produto
SELECT DISTINCT C.NUNOTA, C.CODEMP, C.DTNEG, C.TIPMOV, C.STATUSNOTA
FROM TGFCAB C
JOIN TGFITE I ON I.NUNOTA = C.NUNOTA AND I.CODEMP = C.CODEMP
WHERE I.CODPROD = @codprod
  AND C.DTNEG BETWEEN @dt_start AND @dt_end
ORDER BY C.DTNEG DESC;
