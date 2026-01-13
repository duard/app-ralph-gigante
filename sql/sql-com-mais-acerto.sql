/* ============================================================
   EXTRATO CONTÁBIL DE ESTOQUE - PRODUTO 3680
   ============================================================ */

WITH MOVIMENTOS AS (

    SELECT
        COALESCE(c.DTENTSAI, c.DTNEG) AS data_referencia,
        c.NUNOTA,
        c.TIPMOV,
        c.CODPARC,
        par.NOMEPARC AS nome_parceiro,
        u.NOMEUSU AS usuario,

        CASE 
            WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG 
            ELSE i.QTDNEG 
        END AS quantidade_mov,

        CASE 
            WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT 
            ELSE i.VLRTOT 
        END AS valor_mov

    FROM TGFCAB c
    JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
    LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
    LEFT JOIN TGFPAR par ON par.CODPARC = c.CODPARC

    WHERE i.CODPROD = 3680
      AND c.STATUSNOTA = 'L'
      AND i.ATUALESTOQUE <> 0
      AND i.RESERVA = 'N'
      AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) = 12
      AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025
),

SALDO_INICIAL AS (
    SELECT 
        (153 - 37) AS saldo_qtd,
        (153 - 37) * 23.70 AS saldo_valor
),

EXTRATO AS (

    SELECT
        'SALDO_ANTERIOR' AS tipo_registro,
        CAST('2025-11-30 23:59:59' AS DATETIME) AS data_referencia,
        NULL AS nunota,
        NULL AS tipmov,
        NULL AS codparc,
        NULL AS nome_parceiro,
        NULL AS usuario,

        si.saldo_qtd AS saldo_qtd_anterior,
        NULL AS quantidade_mov,
        si.saldo_qtd AS saldo_qtd_final,

        si.saldo_valor AS saldo_valor_anterior,
        NULL AS valor_mov,
        si.saldo_valor AS saldo_valor_final

    FROM SALDO_INICIAL si

    UNION ALL

    SELECT
        'MOVIMENTACAO',
        m.data_referencia,
        m.NUNOTA,
        m.TIPMOV,
        m.CODPARC,
        m.nome_parceiro,
        m.usuario,

        si.saldo_qtd
          + SUM(m.quantidade_mov) OVER (
                ORDER BY m.data_referencia, m.NUNOTA
                ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
            ),

        m.quantidade_mov,

        si.saldo_qtd
          + SUM(m.quantidade_mov) OVER (
                ORDER BY m.data_referencia, m.NUNOTA
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ),

        si.saldo_valor
          + SUM(m.valor_mov) OVER (
                ORDER BY m.data_referencia, m.NUNOTA
                ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
            ),

        m.valor_mov,

        si.saldo_valor
          + SUM(m.valor_mov) OVER (
                ORDER BY m.data_referencia, m.NUNOTA
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            )

    FROM MOVIMENTOS m
    CROSS JOIN SALDO_INICIAL si

    UNION ALL

    SELECT
        'SALDO_ATUAL',
        CAST('2025-12-31 23:59:59' AS DATETIME),
        NULL,NULL,NULL,NULL,NULL,

        e.ESTOQUE,
        NULL,
        e.ESTOQUE,

        e.ESTOQUE * 22.88,
        NULL,
        e.ESTOQUE * 22.88

    FROM TGFEST e
    WHERE e.CODPROD = 3680
      AND e.ATIVO = 'S'
)

-- ============================================================
-- EXIBIÇÃO FINAL (ORDEM DESC)
-- ============================================================

SELECT *
FROM EXTRATO
ORDER BY
    data_referencia DESC,
    CASE tipo_registro
        WHEN 'SALDO_ATUAL' THEN 1
        WHEN 'MOVIMENTACAO' THEN 2
        WHEN 'SALDO_ANTERIOR' THEN 3
    END;
