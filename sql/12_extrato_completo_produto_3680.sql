-- ==================================================================
-- Query: Extrato Completo Produto 3680 - Estoque e Movimentações
-- Objetivo: Mostrar estoque atual TGFEST e todas as movimentações
-- ==================================================================

-- 1. Estoque Atual do Produto 3680
SELECT 
    'ESTOQUE ATUAL' AS tipo_registro,
    e.CODPROD,
    e.CODLOCAL,
    e.ESTOQUE AS quantidade_estoque,
    e.ESTMIN AS estoque_minimo,
    e.ESTMAX AS estoque_maximo,
    e.ATIVO AS status_estoque,
    l.DESCRLocal AS descricao_local,
    e.DTULTMOV AS data_ultima_movimentacao
FROM TGFEST e
LEFT JOIN TGFLOC l ON l.CODLOCAL = e.CODLOCAL
WHERE e.CODPROD = 3680
  AND e.ATIVO = 'S';

-- 2. Todas as Movimentações (últimos 50 registros)
SELECT 
    'MOVIMENTACAO' AS tipo_registro,
    c.NUNOTA,
    c.NUMNOTA,
    c.DTMOV,
    c.DTNEG,
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
        ELSE c.TIPMOV
    END AS tipo_movimentacao,
    t.DESCROPER AS descricao_operacao,
    i.SEQUENCIA,
    i.CODPROD,
    i.QTDNEG,
    i.QTDENTREGUE,
    i.VLRUNIT,
    i.VLRTOT,
    u.NOMEUSU AS usuario_inclusao
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER
LEFT JOIN TSICUS u ON u.CODUSU = c.CODUSUINC
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND YEAR(c.DTMOV) = 2025
ORDER BY c.DTMOV DESC, c.NUNOTA DESC;

-- 3. Resumo Mensal de Movimentações 2025
SELECT 
    'RESUMO MENSAL' AS tipo_registro,
    LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7) AS ano_mes,
    c.TIPMOV,
    CASE c.TIPMOV
        WHEN 'V' THEN 'Venda'
        WHEN 'P' THEN 'Pedido Venda'
        WHEN 'D' THEN 'Devolução Venda'
        WHEN 'A' THEN 'CT-e Venda'
        WHEN 'O' THEN 'Compra'
        WHEN 'C' THEN 'Nota Compra'
        WHEN 'E' THEN 'Devolução Compra'
        WHEN 'H' THEN 'CT-e Compra'
        WHEN 'T' THEN 'Transferência'
        WHEN 'J' THEN 'Req. Compra'
        WHEN 'Q' THEN 'Requisição'
        WHEN 'L' THEN 'Dev. Requisição'
        WHEN 'F' THEN 'Produção'
        ELSE c.TIPMOV
    END AS tipo_descricao,
    COUNT(*) AS numero_movimentacoes,
    SUM(i.QTDNEG) AS quantidade_total,
    SUM(i.VLRTOT) AS valor_total,
    AVG(i.VLRUNIT) AS preco_medio,
    MIN(c.DTMOV) AS primeira_data,
    MAX(c.DTMOV) AS ultima_data
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND YEAR(c.DTMOV) = 2025
GROUP BY LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7), 
         c.TIPMOV,
         CASE c.TIPMOV
             WHEN 'V' THEN 'Venda'
             WHEN 'P' THEN 'Pedido Venda'
             WHEN 'D' THEN 'Devolução Venda'
             WHEN 'A' THEN 'CT-e Venda'
             WHEN 'O' THEN 'Compra'
             WHEN 'C' THEN 'Nota Compra'
             WHEN 'E' THEN 'Devolução Compra'
             WHEN 'H' THEN 'CT-e Compra'
             WHEN 'T' THEN 'Transferência'
             WHEN 'J' THEN 'Req. Compra'
             WHEN 'Q' THEN 'Requisição'
             WHEN 'L' THEN 'Dev. Requisição'
             WHEN 'F' THEN 'Produção'
             ELSE c.TIPMOV
         END
ORDER BY ano_mes, tipo_descricao;