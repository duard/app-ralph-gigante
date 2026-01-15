/* ============================================================
   EXTRATO CONTÁBIL DE ESTOQUE – SQL-92 PURO
   Produto : 3680
   Período : 01/12/2025 a 31/12/2025
   ============================================================ */

  SELECT
    'SALDO_ANTERIOR' AS TIPO_REGISTRO,
    CAST('2025-11-30 23:59:59' AS DATETIME) AS DATA_REFERENCIA,
    NULL AS NUNOTA,
    NULL AS TIPMOV,
    NULL AS CODPARC,
    NULL AS NOME_PARCEIRO,
    NULL AS USUARIO,
    NULL AS QTD_MOV,
    NULL AS VALOR_MOV,

    /* Saldo anterior em quantidade */
    SUM(
        CASE
            WHEN I.ATUALESTOQUE < 0 THEN -I.QTDNEG
            ELSE I.QTDNEG
        END
    ) AS SALDO_QTD_ANTERIOR,

    /* Saldo anterior em valor */
    SUM(
        CASE
            WHEN I.ATUALESTOQUE < 0 THEN -I.VLRTOT
            ELSE I.VLRTOT
        END
    ) AS SALDO_VALOR_ANTERIOR,

    /* Layout contábil */
    SUM(
        CASE
            WHEN I.ATUALESTOQUE < 0 THEN -I.QTDNEG
            ELSE I.QTDNEG
        END
    ) AS SALDO_QTD_FINAL,

    SUM(
        CASE
            WHEN I.ATUALESTOQUE < 0 THEN -I.VLRTOT
            ELSE I.VLRTOT
        END
    ) AS SALDO_VALOR_FINAL

  FROM TGFCAB C
    JOIN TGFITE I ON I.NUNOTA = C.NUNOTA
  WHERE I.CODPROD = 3680
    AND C.STATUSNOTA = 'L'
    AND I.ATUALESTOQUE <> 0
    AND I.RESERVA = 'N'
    AND COALESCE(C.DTENTSAI, C.DTNEG) < CAST('2025-12-01' AS DATETIME)

UNION ALL

  /* ============================================================
   MOVIMENTAÇÃO DO PERÍODO
   ============================================================ */

  SELECT
    'MOVIMENTACAO' AS TIPO_REGISTRO,
    M.DATA_MOV,
    M.NUNOTA,
    M.TIPMOV,
    M.CODPARC,
    M.NOME_PARCEIRO,
    M.USUARIO,
    M.QTD_MOV,
    M.VALOR_MOV,

    /* Saldo anterior acumulado */
    (
        SELECT COALESCE(SUM(
            CASE
                WHEN I2.ATUALESTOQUE < 0 THEN -I2.QTDNEG
                ELSE I2.QTDNEG
            END
        ),0)
    FROM TGFCAB C2
      JOIN TGFITE I2 ON I2.NUNOTA = C2.NUNOTA
    WHERE I2.CODPROD = 3680
      AND C2.STATUSNOTA = 'L'
      AND I2.ATUALESTOQUE <> 0
      AND I2.RESERVA = 'N'
      AND (
                COALESCE(C2.DTENTSAI, C2.DTNEG) <  M.DATA_MOV
      OR (COALESCE(C2.DTENTSAI, C2.DTNEG) = M.DATA_MOV
      AND C2.NUNOTA < M.NUNOTA)
          )
    ) AS SALDO_QTD_ANTERIOR,

    (
        SELECT COALESCE(SUM(
            CASE
                WHEN I2.ATUALESTOQUE < 0 THEN -I2.VLRTOT
                ELSE I2.VLRTOT
            END
        ),0)
    FROM TGFCAB C2
      JOIN TGFITE I2 ON I2.NUNOTA = C2.NUNOTA
    WHERE I2.CODPROD = 3680
      AND C2.STATUSNOTA = 'L'
      AND I2.ATUALESTOQUE <> 0
      AND I2.RESERVA = 'N'
      AND (
                COALESCE(C2.DTENTSAI, C2.DTNEG) <  M.DATA_MOV
      OR (COALESCE(C2.DTENTSAI, C2.DTNEG) = M.DATA_MOV
      AND C2.NUNOTA < M.NUNOTA)
          )
    ) AS SALDO_VALOR_ANTERIOR,

    /* Saldo final */
    (
        SELECT COALESCE(SUM(
            CASE
                WHEN I2.ATUALESTOQUE < 0 THEN -I2.QTDNEG
                ELSE I2.QTDNEG
            END
        ),0)
    FROM TGFCAB C2
      JOIN TGFITE I2 ON I2.NUNOTA = C2.NUNOTA
    WHERE I2.CODPROD = 3680
      AND C2.STATUSNOTA = 'L'
      AND I2.ATUALESTOQUE <> 0
      AND I2.RESERVA = 'N'
      AND (
                COALESCE(C2.DTENTSAI, C2.DTNEG) <  M.DATA_MOV
      OR (COALESCE(C2.DTENTSAI, C2.DTNEG) = M.DATA_MOV
      AND C2.NUNOTA <= M.NUNOTA)
          )
    ) AS SALDO_QTD_FINAL,

    (
        SELECT COALESCE(SUM(
            CASE
                WHEN I2.ATUALESTOQUE < 0 THEN -I2.VLRTOT
                ELSE I2.VLRTOT
            END
        ),0)
    FROM TGFCAB C2
      JOIN TGFITE I2 ON I2.NUNOTA = C2.NUNOTA
    WHERE I2.CODPROD = 3680
      AND C2.STATUSNOTA = 'L'
      AND I2.ATUALESTOQUE <> 0
      AND I2.RESERVA = 'N'
      AND (
                COALESCE(C2.DTENTSAI, C2.DTNEG) <  M.DATA_MOV
      OR (COALESCE(C2.DTENTSAI, C2.DTNEG) = M.DATA_MOV
      AND C2.NUNOTA <= M.NUNOTA)
          )
    ) AS SALDO_VALOR_FINAL

  FROM
    (
    SELECT
      COALESCE(C.DTENTSAI, C.DTNEG) AS DATA_MOV,
      C.NUNOTA,
      C.TIPMOV,
      C.CODPARC,
      P.NOMEPARC AS NOME_PARCEIRO,
      U.NOMEUSU  AS USUARIO,

      CASE
            WHEN I.ATUALESTOQUE < 0 THEN -I.QTDNEG
            ELSE I.QTDNEG
        END AS QTD_MOV,

      CASE
            WHEN I.ATUALESTOQUE < 0 THEN -I.VLRTOT
            ELSE I.VLRTOT
        END AS VALOR_MOV

    FROM TGFCAB C
      JOIN TGFITE I ON I.NUNOTA = C.NUNOTA
      LEFT JOIN TGFPAR P ON P.CODPARC = C.CODPARC
      LEFT JOIN TSIUSU U ON U.CODUSU = C.CODUSUINC
    WHERE I.CODPROD = 3680
      AND C.STATUSNOTA = 'L'
      AND I.ATUALESTOQUE <> 0
      AND I.RESERVA = 'N'
      AND COALESCE(C.DTENTSAI, C.DTNEG) >= CAST('2025-12-01' AS DATETIME)
      AND COALESCE(C.DTENTSAI, C.DTNEG) <= CAST('2025-12-31 23:59:59' AS DATETIME)
) M

UNION ALL

  /* ============================================================
   SALDO ATUAL (ESTOQUE FÍSICO)
   ============================================================ */

  SELECT
    'SALDO_ATUAL' AS TIPO_REGISTRO,
    CAST('2025-12-31 23:59:59' AS DATETIME),
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NULL, NULL,
    E.ESTOQUE,
    NULL
  FROM TGFEST E
  WHERE E.CODPROD = 3680
    AND E.ATIVO = 'S'

ORDER BY DATA_REFERENCIA DESC;
