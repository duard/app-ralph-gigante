-- Extrato corrigido sem CODEMP
WITH MOV AS (
    SELECT
        c.NUNOTA,
        c.NUMNOTA,
        c.DTMOV,
        c.DTNEG,
        p.DESCRPROD AS PRODUTO,
        c.CODTIPOPER,
        t.DESCROPER AS TOP_DESCRICAO,
        t.ATUALEST,
        CASE t.ATUALEST
            WHEN 'B' THEN 'Baixa Estoque'
            WHEN 'E' THEN 'Entrada Estoque'
            WHEN 'R' THEN 'Reserva Estoque'
            WHEN 'N' THEN 'Nao Movimenta Estoque'
        END AS ACAO_ESTOQUE,
        u.NOMEUSU AS USUARIO,
        i.SEQUENCIA,
        i.QTDNEG,
        i.VLRUNIT,
        i.VLRTOT,
        CASE t.ATUALEST
            WHEN 'E' THEN  i.QTDNEG
            WHEN 'B' THEN -i.QTDNEG
            ELSE 0
        END AS IMPACTO_FISICO,
        CASE t.ATUALEST
            WHEN 'R' THEN i.QTDNEG
            ELSE 0
        END AS IMPACTO_RESERVA
    FROM TGFCAB c
    JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
    JOIN TGFPRO p ON p.CODPROD = i.CODPROD
    LEFT JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER
    LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
    WHERE i.CODPROD = 3680
      AND c.STATUSNOTA = 'L'
      AND c.DTMOV BETWEEN '2025-12-01' AND '2025-12-31'
),
SALDO_INICIAL AS (
    SELECT
        ISNULL(SUM(
            CASE t.ATUALEST
                WHEN 'E' THEN  i.QTDNEG
                WHEN 'B' THEN -i.QTDNEG
                ELSE 0
            END
        ),0) AS SALDO_ANTERIOR
    FROM TGFCAB c
    JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
    LEFT JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER
    WHERE i.CODPROD = 3680
      AND c.STATUSNOTA = 'L'
      AND c.DTMOV < '2025-12-01'
)
SELECT TOP 20
    m.DTMOV,
    m.DTNEG,
    m.NUNOTA,
    m.NUMNOTA,
    m.PRODUTO,
    m.TOP_DESCRICAO,
    m.ACAO_ESTOQUE,
    m.USUARIO,
    m.QTDNEG AS QTD_MOVIMENTADA,
    m.IMPACTO_FISICO,
    m.IMPACTO_RESERVA,
    si.SALDO_ANTERIOR +
      SUM(m.IMPACTO_FISICO) OVER (
        ORDER BY m.DTMOV, m.NUNOTA, m.SEQUENCIA
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS SALDO_FISICO_APOS,
    m.VLRUNIT,
    m.VLRTOT
FROM MOV m
CROSS JOIN SALDO_INICIAL si
ORDER BY m.DTMOV, m.NUNOTA, m.SEQUENCIA;