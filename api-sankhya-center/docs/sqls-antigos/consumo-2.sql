/* ============================================================
   EXTRATO CONTÁBIL DE ESTOQUE - PRODUTO 3680
   Sistema: Sankhya / SQL Server
   Período: 01/12/2025 a 31/12/2025

   Estrutura:
   - SALDO_ANTERIOR
   - MOVIMENTACAO (linha a linha)
   - SALDO_ATUAL

   Regra:
   saldo_final = saldo_anterior + movimento
   ============================================================ */

WITH
  /* ============================================================
   PARÂMETROS DO RELATÓRIO
   ============================================================ */
  PARAMETROS
  AS
  (
    SELECT
      3680 AS CODPROD,
      CAST('2025-12-01' AS DATETIME) AS DATA_INICIO,
      CAST('2025-12-31' AS DATETIME) AS DATA_FIM
  ),

  /* ============================================================
   MOVIMENTOS DO PERÍODO
   ============================================================ */
  MOVIMENTOS
  AS
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
    CROSS JOIN PARAMETROS PR

    WHERE I.CODPROD = PR.CODPROD
      AND C.STATUSNOTA = 'L'
      AND I.ATUALESTOQUE <> 0
      AND I.RESERVA = 'N'
      AND COALESCE(C.DTENTSAI, C.DTNEG) >= PR.DATA_INICIO
      AND COALESCE(C.DTENTSAI, C.DTNEG) <  DATEADD(DAY,1,PR.DATA_FIM)
  ),

  /* ============================================================
   SALDO INICIAL (ANTES DO PERÍODO)
   ============================================================ */
  SALDO_INICIAL
  AS
  (
    SELECT
      SUM(
            CASE
                WHEN I.ATUALESTOQUE < 0 THEN -I.QTDNEG
                ELSE I.QTDNEG
            END
        ) AS SALDO_QTD,

      SUM(
            CASE
                WHEN I.ATUALESTOQUE < 0 THEN -I.VLRTOT
                ELSE I.VLRTOT
            END
        ) AS SALDO_VALOR

    FROM TGFCAB C
      JOIN TGFITE I ON I.NUNOTA = C.NUNOTA
    CROSS JOIN PARAMETROS PR

    WHERE I.CODPROD = PR.CODPROD
      AND C.STATUSNOTA = 'L'
      AND I.ATUALESTOQUE <> 0
      AND I.RESERVA = 'N'
      AND COALESCE(C.DTENTSAI, C.DTNEG) < PR.DATA_INICIO
  ),

  /* ============================================================
   EXTRATO LINHA A LINHA COM SALDOS
   ============================================================ */
  EXTRATO_MOV
  AS
  (
    SELECT
      M.DATA_MOV,
      M.NUNOTA,
      M.TIPMOV,
      M.CODPARC,
      M.NOME_PARCEIRO,
      M.USUARIO,
      M.QTD_MOV,
      M.VALOR_MOV,

      SI.SALDO_QTD
          + SUM(M.QTD_MOV) OVER (
                ORDER BY M.DATA_MOV, M.NUNOTA
                ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
            ) AS SALDO_QTD_ANTERIOR,

      SI.SALDO_QTD
          + SUM(M.QTD_MOV) OVER (
                ORDER BY M.DATA_MOV, M.NUNOTA
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS SALDO_QTD_FINAL,

      SI.SALDO_VALOR
          + SUM(M.VALOR_MOV) OVER (
                ORDER BY M.DATA_MOV, M.NUNOTA
                ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
            ) AS SALDO_VALOR_ANTERIOR,

      SI.SALDO_VALOR
          + SUM(M.VALOR_MOV) OVER (
                ORDER BY M.DATA_MOV, M.NUNOTA
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS SALDO_VALOR_FINAL

    FROM MOVIMENTOS M
    CROSS JOIN SALDO_INICIAL SI
  )

/* ============================================================
   RESULTADO FINAL
   ============================================================ */

  SELECT
    'SALDO_ATUAL' AS TIPO_REGISTRO,
    CAST('2025-12-31 23:59:59' AS DATETIME) AS DATA_REFERENCIA,
    NULL AS NUNOTA,
    NULL AS TIPMOV,
    NULL AS CODPARC,
    NULL AS NOME_PARCEIRO,
    NULL AS USUARIO,
    NULL AS QTD_MOV,
    NULL AS VALOR_MOV,
    NULL AS SALDO_QTD_ANTERIOR,
    NULL AS SALDO_VALOR_ANTERIOR,
    E.ESTOQUE AS SALDO_QTD_FINAL,
    E.ESTOQUE * (SELECT TOP 1
      SALDO_VALOR_FINAL / SALDO_QTD_FINAL
    FROM EXTRATO_MOV
    ORDER BY DATA_MOV DESC) AS SALDO_VALOR_FINAL
  FROM TGFEST E
  WHERE E.CODPROD = 3680
    AND E.ATIVO = 'S'

UNION ALL

  SELECT
    'MOVIMENTACAO',
    DATA_MOV,
    NUNOTA,
    TIPMOV,
    CODPARC,
    NOME_PARCEIRO,
    USUARIO,
    QTD_MOV,
    VALOR_MOV,
    SALDO_QTD_ANTERIOR,
    SALDO_VALOR_ANTERIOR,
    SALDO_QTD_FINAL,
    SALDO_VALOR_FINAL
  FROM EXTRATO_MOV

UNION ALL

  SELECT
    'SALDO_ANTERIOR',
    CAST('2025-11-30 23:59:59' AS DATETIME),
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    SALDO_QTD,
    SALDO_VALOR,
    SALDO_QTD,
    SALDO_VALOR
  FROM SALDO_INICIAL

ORDER BY
    DATA_REFERENCIA DESC;
