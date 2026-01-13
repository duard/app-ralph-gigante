-- ==================================================================
-- Query: Análise de Estoque do Produto 3680
-- Objetivo: Analisar entradas e saídas do produto 3680 via TGFEST
-- ==================================================================

-- Estoque atual do produto 3680
SELECT 
    e.CODPROD,
    e.CODLOCAL,
    e.ESTOQUE,
    e.ESTMIN,
    e.ESTMAX,
    e.CONTROLE,
    e.ATIVO,
    l.DESCRLocal
FROM [SANKHYA].[TGFEST] e
LEFT JOIN [SANKHYA].[TGFLOC] l ON l.CODLOCAL = e.CODLOCAL
WHERE e.CODPROD = 3680
  AND e.ATIVO = 'S';

-- Movimentações do produto 3680 (entradas e saídas)
SELECT 
    c.NUNOTA,
    c.DTMOV,
    c.DTNEG,
    c.TIPMOV,
    CASE WHEN c.TIPMOV = 'C' THEN 'ENTRADA' 
         WHEN c.TIPMOV = 'O' THEN 'SAÍDA/COMPRA' 
         ELSE 'OUTRO' END AS tipo_movimento,
    i.SEQUENCIA,
    i.QTDNEG,
    i.QTDENTREGUE,
    i.VLRUNIT,
    i.VLRTOT,
    t.DESCROPER,
    c.STATUSNOTA
FROM [SANKHYA].[TGFCAB] c
JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
LEFT JOIN [SANKHYA].[TGFTOP] t ON t.CODTIPOPER = c.CODTIPOPER
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
ORDER BY c.DTMOV DESC;

-- Resumo de movimentações por período
SELECT 
    LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7) AS ano_mes,
    CASE WHEN c.TIPMOV = 'C' THEN 'ENTRADA' 
         WHEN c.TIPMOV = 'O' THEN 'SAÍDA/COMPRA' 
         ELSE 'OUTRO' END AS tipo_movimento,
    COUNT(*) AS quantidade_transacoes,
    SUM(i.QTDNEG) AS quantidade_total,
    SUM(i.VLRTOT) AS valor_total,
    AVG(i.VLRUNIT) AS preco_medio
FROM [SANKHYA].[TGFCAB] c
JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
GROUP BY LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7), 
         CASE WHEN c.TIPMOV = 'C' THEN 'ENTRADA' 
              WHEN c.TIPMOV = 'O' THEN 'SAÍDA/COMPRA' 
              ELSE 'OUTRO' END
ORDER BY ano_mes DESC, tipo_movimento;