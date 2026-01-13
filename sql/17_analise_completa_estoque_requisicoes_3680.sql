-- ==================================================================
-- Query: Análise Completa de Estoque e Requisições Internas - Produto 3680
-- Objetivo: Verificar estoque atual, movimentações via requisições e se TGFTOP atualiza estoque
-- ==================================================================

-- 1. Estoque Atual do Produto 3680
SELECT
    'ESTOQUE ATUAL' AS tipo_analise,
    e.CODPROD,
    e.CODLOCAL,
    e.ESTOQUE AS quantidade_atual,
    e.ESTMIN AS estoque_minimo,
    e.ESTMAX AS estoque_maximo,
    e.ATIVO AS status_ativo,
    l.DESCRLocal AS local_descricao,
    e.DTULTMOV AS data_ultima_movimentacao
FROM TGFEST e
LEFT JOIN TGFLOC l ON l.CODLOCAL = e.CODLOCAL
WHERE e.CODPROD = 3680
  AND e.ATIVO = 'S';

-- 2. Verificação se TGFTOP atualiza estoque
SELECT
    'TIPOS_OPERACAO' AS tipo_analise,
    t.CODTIPOPER,
    t.DESCROPER AS descricao_operacao,
    t.ATIVAEST AS atualiza_estoque,
    CASE t.ATIVAEST
        WHEN 'S' THEN 'SIM - Atualiza estoque'
        WHEN 'N' THEN 'NAO - Nao atualiza estoque'
        ELSE 'DESCONHECIDO'
    END AS status_atualizacao
FROM TGFTOP t
WHERE t.DESCROPER LIKE '%REQUISICAO%'
   OR t.DESCROPER LIKE '%COMPRA%'
   OR t.DESCROPER LIKE '%AJUSTE%'
   OR t.DESCROPER LIKE '%PEDIDO%'
ORDER BY t.CODTIPOPER;

-- 3. Movimentações via Requisições Internas em Dezembro 2025
SELECT
    'MOVIMENTACOES_REQUISICOES' AS tipo_analise,
    c.NUNOTA,
    c.DTMOV AS data_movimentacao,
    c.DTNEG AS data_negociacao,
    c.TIPMOV,
    c.STATUSNOTA,
    CASE c.TIPMOV
        WHEN 'V' THEN 'Nota de Venda'
        WHEN 'P' THEN 'Pedido de Venda'
        WHEN 'D' THEN 'Devolução de Venda'
        WHEN 'A' THEN 'CT-e Venda'
        WHEN 'O' THEN 'Pedido de Compra'
        WHEN 'C' THEN 'Nota de Compra'
        WHEN 'E' THEN 'Devolução de Compra'
        WHEN 'H' THEN 'CT-e Compra'
        WHEN 'T' THEN 'Transferência'
        WHEN 'J' THEN 'Pedido de Requisição'
        WHEN 'Q' THEN 'Requisição'
        WHEN 'L' THEN 'Devolução de Requisição'
        WHEN 'F' THEN 'Nota de Produção'
        ELSE 'Outros'
    END AS tipo_movimentacao,
    t.DESCROPER AS descricao_operacao,
    t.ATIVAEST AS atualiza_estoque,
    i.SEQUENCIA,
    i.CODPROD,
    i.QTDNEG AS quantidade_movimentada,
    i.QTDENTREGUE AS quantidade_entregue,
    i.VLRUNIT AS valor_unitario,
    i.VLRTOT AS valor_total,
    u.NOMEUSU AS usuario_solicitante,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM TSILIB lib
            WHERE lib.NUCHAVE = c.NUNOTA
              AND lib.DHLIB IS NOT NULL
              AND lib.VLRLIBERADO >= 0
              AND lib.REPROVADO <> 'S'
        ) THEN 'APROVADO'
        ELSE 'NAO APROVADO'
    END AS status_aprovacao
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND MONTH(c.DTMOV) = 12
  AND YEAR(c.DTMOV) = 2025
  AND (c.TIPMOV IN ('J', 'Q', 'L') OR t.DESCROPER LIKE '%REQUISICAO%')
ORDER BY c.DTMOV DESC, c.NUNOTA DESC;

-- 4. Resumo Financeiro das Requisições
SELECT
    'RESUMO_FINANCEIRO' AS tipo_analise,
    COUNT(DISTINCT c.NUNOTA) AS numero_requisicoes,
    SUM(i.QTDNEG) AS quantidade_total_movimentada,
    SUM(i.VLRTOT) AS valor_total_movimentado,
    AVG(i.VLRUNIT) AS valor_medio_unitario,
    MIN(i.VLRUNIT) AS valor_minimo_unitario,
    MAX(i.VLRUNIT) AS valor_maximo_unitario,
    COUNT(DISTINCT u.CODUSU) AS numero_usuarios_unicos
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND MONTH(c.DTMOV) = 12
  AND YEAR(c.DTMOV) = 2025
  AND (c.TIPMOV IN ('J', 'Q', 'L') OR EXISTS (
      SELECT 1 FROM TGFTOP t
      WHERE t.CODTIPOPER = c.CODTIPOPER
        AND t.DESCROPER LIKE '%REQUISICAO%'
  ));