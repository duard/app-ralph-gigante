  -- ==================================================================
  -- VERIFICADOR DE EXTRATO HISTÓRICO COM VALORES MÉDIOS DINÂMICOS
  -- Produto: PAPEL SULFITE A4 500 FOLHAS (3680)
  -- Período: Dezembro 2025
  -- Valores médios calculados dinamicamente via subqueries
  -- ==================================================================

  WITH
  -- Subquery para calcular valor médio anterior (dados históricos)
  VALOR_MEDIO_ANTERIOR AS (
      SELECT
          CASE
              WHEN SUM(CASE WHEN i.ATUALESTOQUE <> 0 THEN ABS(i.QTDNEG) ELSE 0 END) > 0
              THEN SUM(CASE WHEN i.ATUALESTOQUE <> 0 THEN ABS(i.VLRTOT) ELSE 0 END) /
                  SUM(CASE WHEN i.ATUALESTOQUE <> 0 THEN ABS(i.QTDNEG) ELSE 0 END)
              ELSE 23.70  -- Valor padrão se não houver dados anteriores
          END AS valor_medio_anterior
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      WHERE i.CODPROD = 3680
        AND c.STATUSNOTA = 'L'
        AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) < 12
        AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025
        AND i.ATUALESTOQUE <> 0
        AND i.RESERVA = 'N'
  ),

  -- Subquery para calcular valor médio atual (dezembro 2025)
  VALOR_MEDIO_ATUAL AS (
      SELECT
          CASE
              WHEN SUM(CASE WHEN i.ATUALESTOQUE <> 0 THEN ABS(i.QTDNEG) ELSE 0 END) > 0
              THEN SUM(CASE WHEN i.ATUALESTOQUE <> 0 THEN ABS(i.VLRTOT) ELSE 0 END) /
                  SUM(CASE WHEN i.ATUALESTOQUE <> 0 THEN ABS(i.QTDNEG) ELSE 0 END)
              ELSE 22.88  -- Valor padrão para dezembro
          END AS valor_medio_atual
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      WHERE i.CODPROD = 3680
        AND c.STATUSNOTA = 'L'
        AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) = 12
        AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025
        AND i.ATUALESTOQUE <> 0
        AND i.RESERVA = 'N'
  ),

  -- ==================================================================
  -- SEÇÃO 1: SALDO ANTERIOR AO PERÍODO (01/12/2025)
  -- ==================================================================
  SALDO_ANTERIOR_CTE AS (
      SELECT
          'SALDO_ANTERIOR' AS tipo_registro,
          CAST('2025-11-30 23:59:59' AS DATETIME) AS data_referencia,
          NULL AS nunota,
          NULL AS tipmov,
          NULL AS codparc,
          NULL AS nome_parceiro,
          NULL AS quantidade_mov,
          NULL AS valor_mov,
          NULL AS usuario,
          (e.ESTOQUE - COALESCE(mov.total_mov_dezembro, 0)) AS saldo_quantidade_anterior,
          ((e.ESTOQUE - COALESCE(mov.total_mov_dezembro, 0)) * vma.valor_medio_anterior) AS saldo_valor_anterior,
          vma.valor_medio_anterior AS valor_medio_anterior
      FROM VALOR_MEDIO_ANTERIOR vma
      CROSS JOIN TGFEST e
      LEFT JOIN (
          SELECT SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END) AS total_mov_dezembro
          FROM TGFCAB c
          JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
          WHERE i.CODPROD = 3680
            AND c.STATUSNOTA = 'L'
            AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) = 12
            AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025
            AND i.ATUALESTOQUE <> 0
            AND i.RESERVA = 'N'
      ) mov ON 1=1
      WHERE e.CODPROD = 3680
        AND e.ATIVO = 'S'
  ),

  -- ==================================================================
  -- SEÇÃO 2: MOVIMENTAÇÕES ORDENADAS CRONOLOGICAMENTE
  -- ==================================================================
  MOVIMENTACOES_CTE AS (
      SELECT
          'MOVIMENTACAO' AS tipo_registro,
          COALESCE(c.DTENTSAI, c.DTNEG) AS data_referencia,
          c.NUNOTA,
          c.TIPMOV,
          -- Parceiro responsável (TGFPAR) - Cliente/Fornecedor ligado à nota
          c.CODPARC,
          par.NOMEPARC AS nome_parceiro,
          CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END AS quantidade_mov,
          CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END AS valor_mov,
          u.NOMEUSU AS usuario,
          NULL AS saldo_quantidade_anterior,
          NULL AS saldo_valor_anterior,
          NULL AS valor_medio_anterior
      FROM TGFCAB c
      JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
      LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
      -- JUNÇÃO COM TGFPAR PARA OBTER O PARCEIRO RESPONSÁVEL
      LEFT JOIN TGFPAR par ON par.CODPARC = c.CODPARC
      WHERE i.CODPROD = 3680
        AND c.STATUSNOTA = 'L'
        AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) = 12
        AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025
        AND i.ATUALESTOQUE <> 0
        AND i.RESERVA = 'N'
  ),

  -- ==================================================================
  -- SEÇÃO 3: SALDO ATUAL FINAL
  -- ==================================================================
  SALDO_ATUAL_CTE AS (
      SELECT
          'SALDO_ATUAL' AS tipo_registro,
          CAST('2025-12-31 23:59:59' AS DATETIME) AS data_referencia,
          NULL AS nunota,
          NULL AS tipmov,
          NULL AS codparc,
          NULL AS nome_parceiro,
          NULL AS quantidade_mov,
          NULL AS valor_mov,
          NULL AS usuario,
          e.ESTOQUE AS saldo_quantidade_anterior,
          (e.ESTOQUE * vmat.valor_medio_atual) AS saldo_valor_anterior,
          vmat.valor_medio_atual AS valor_medio_anterior
      FROM TGFEST e
      CROSS JOIN VALOR_MEDIO_ATUAL vmat
      WHERE e.CODPROD = 3680
        AND e.ATIVO = 'S'
  )

  -- ==================================================================
  -- QUERY FINAL - UNIÃO DE TODAS AS SEÇÕES
  -- ==================================================================
  SELECT * FROM SALDO_ANTERIOR_CTE
  UNION ALL
  SELECT * FROM MOVIMENTACOES_CTE
  UNION ALL
  SELECT * FROM SALDO_ATUAL_CTE
  ORDER BY data_referencia ASC, tipo_registro ASC;

  -- ==================================================================
  -- INSTRUÇÕES PARA CÁLCULO MANUAL DOS SALDOS PROGRESSIVOS:
  -- ==================================================================
  /*
  1. Comece com o SALDO_ANTERIOR (linha 1)
  2. Para cada MOVIMENTACAO, some/subtraia da linha anterior
  3. O SALDO_ATUAL deve coincidir com o final calculado

  Exemplo:
  - Saldo anterior: 116 unidades, R$ 2.747,20
  - Movimentação 1: -5 unidades, -R$ 118,45
  - Saldo após: 111 unidades, R$ 2.628,75
  - E assim por diante...

  Valor médio = Saldo Valor ÷ Saldo Quantidade
  */

  -- ==================================================================
  -- SEÇÃO 4: RESUMO POR DIA PARA FACILITAR CÁLCULOS
  -- ==================================================================
  SELECT
      CAST(COALESCE(c.DTENTSAI, c.DTNEG) AS DATE) AS data_dia,
      COUNT(*) AS numero_movimentacoes,
      SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END) AS total_quantidade_dia,
      SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END) AS total_valor_dia,
      COUNT(DISTINCT u.CODUSU) AS usuarios_unicos_dia,
      AVG(CASE WHEN i.ATUALESTOQUE < 0 THEN i.VLRUNIT ELSE NULL END) AS valor_medio_saidas_dia
  FROM TGFCAB c
  JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
  LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
  WHERE i.CODPROD = 3680
    AND c.STATUSNOTA = 'L'
    AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) = 12
    AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025
    AND i.ATUALESTOQUE <> 0
    AND i.RESERVA = 'N'
  GROUP BY CAST(COALESCE(c.DTENTSAI, c.DTNEG) AS DATE)
  ORDER BY data_dia ASC;

  -- ==================================================================
  -- SEÇÃO 5: VALIDAÇÃO DOS TOTAIS
  -- ==================================================================
  SELECT
      'VALIDACAO_TOTAIS' AS tipo_validacao,
      COUNT(DISTINCT c.NUNOTA) AS total_notas,
      COUNT(*) AS total_movimentacoes,
      SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE 0 END) AS total_saidas_quantidade,
      SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.QTDNEG ELSE 0 END) AS total_entradas_quantidade,
      SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE 0 END) AS total_saidas_valor,
      SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.VLRTOT ELSE 0 END) AS total_entradas_valor,
      COUNT(DISTINCT u.CODUSU) AS total_usuarios,
      AVG(CASE WHEN i.ATUALESTOQUE < 0 THEN i.VLRUNIT ELSE NULL END) AS valor_medio_saidas,
      AVG(CASE WHEN i.ATUALESTOQUE > 0 THEN i.VLRUNIT ELSE NULL END) AS valor_medio_entradas
  FROM TGFCAB c
  JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
  LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
  WHERE i.CODPROD = 3680
    AND c.STATUSNOTA = 'L'
    AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) = 12
    AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025
    AND i.ATUALESTOQUE <> 0
    AND i.RESERVA = 'N';