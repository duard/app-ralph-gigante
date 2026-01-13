-- Query para Extrato Completo Produto 3680
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
  AND e.ATIVO = 'S'

UNION ALL

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