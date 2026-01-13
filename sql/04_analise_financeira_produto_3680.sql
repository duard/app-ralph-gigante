-- ==================================================================
-- Query: Análise Financeira do Produto 3680
-- Objetivo: Analisar custos, valor em estoque e movimentações financeiras
-- ==================================================================

-- Informações financeiras do produto
SELECT 
    p.CODPROD,
    p.DESCRPROD,
    p.VLRUNIT,
    p.VLRULTCOMPRA,
    p.CUSTO,
    p.CUSTOCONT,
    p.CUSTOFIN,
    p.MARGEM,
    p.PRECOVENDA,
    p.PRECOVENDA2,
    p.PRECOVENDA3,
    p.PRECOVENDA4,
    p.PRECOVENDA5
FROM [SANKHYA].[TGFPRO] p
WHERE p.CODPROD = 3680;

-- Valor atual do estoque
SELECT 
    e.CODPROD,
    e.CODLOCAL,
    e.ESTOQUE,
    e.ESTOQUE * p.VLRULTCOMPRA AS valor_estoque_ultima_compra,
    e.ESTOQUE * p.VLRUNIT AS valor_estoque_preco_atual,
    e.ESTOQUE * p.CUSTO AS valor_estoque_custo,
    l.DESCRLocal
FROM [SANKHYA].[TGFEST] e
JOIN [SANKHYA].[TGFPRO] p ON p.CODPROD = e.CODPROD
LEFT JOIN [SANKHYA].[TGFLOC] l ON l.CODLOCAL = e.CODLOCAL
WHERE e.CODPROD = 3680
  AND e.ATIVO = 'S';

-- Histórico de compras e custos
SELECT 
    c.NUNOTA,
    c.DTMOV,
    c.DTNEG,
    i.QTDNEG,
    i.VLRUNIT,
    i.VLRTOT,
    t.DESCROPER,
    CASE WHEN c.TIPMOV = 'C' THEN 'COMPRA' 
         WHEN c.TIPMOV = 'O' THEN 'SAÍDA' 
         ELSE 'OUTRO' END AS tipo_movimento,
    i.VLRTOT / i.QTDNEG AS preco_unitario_real
FROM [SANKHYA].[TGFCAB] c
JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
LEFT JOIN [SANKHYA].[TGFTOP] t ON t.CODTIPOPER = c.CODTIPOPER
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND c.TIPMOV IN ('C', 'O')
ORDER BY c.DTMOV DESC;

-- Resumo financeiro por período
SELECT 
    LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7) AS ano_mes,
    CASE WHEN c.TIPMOV = 'C' THEN 'COMPRA' 
         WHEN c.TIPMOV = 'O' THEN 'SAÍDA' 
         ELSE 'OUTRO' END AS tipo_movimento,
    COUNT(*) AS transacoes,
    SUM(i.QTDNEG) AS quantidade,
    SUM(i.VLRTOT) AS valor_total,
    AVG(i.VLRUNIT) AS preco_medio,
    MIN(i.VLRUNIT) AS preco_minimo,
    MAX(i.VLRUNIT) AS preco_maximo
FROM [SANKHYA].[TGFCAB] c
JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND c.TIPMOV IN ('C', 'O')
GROUP BY LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7), 
         CASE WHEN c.TIPMOV = 'C' THEN 'COMPRA' 
              WHEN c.TIPMOV = 'O' THEN 'SAÍDA' 
              ELSE 'OUTRO' END
ORDER BY ano_mes DESC, tipo_movimento;

-- Análise de rentabilidade (últimas 12 meses)
DECLARE @dt_inicio DATETIME = DATEADD(MONTH, -12, GETDATE());

SELECT 
    SUM(CASE WHEN c.TIPMOV = 'C' THEN i.VLRTOT ELSE 0 END) AS custo_compras,
    SUM(CASE WHEN c.TIPMOV = 'O' THEN i.VLRTOT ELSE 0 END) AS valor_vendas,
    SUM(CASE WHEN c.TIPMOV = 'O' THEN i.VLRTOT ELSE 0 END) - 
    SUM(CASE WHEN c.TIPMOV = 'C' THEN i.VLRTOT ELSE 0 END) AS margem_bruta,
    CASE WHEN SUM(CASE WHEN c.TIPMOV = 'C' THEN i.VLRTOT ELSE 0 END) > 0
         THEN (SUM(CASE WHEN c.TIPMOV = 'O' THEN i.VLRTOT ELSE 0 END) - 
               SUM(CASE WHEN c.TIPMOV = 'C' THEN i.VLRTOT ELSE 0 END)) / 
               SUM(CASE WHEN c.TIPMOV = 'C' THEN i.VLRTOT ELSE 0 END) * 100
         ELSE 0 END AS percentual_margem
FROM [SANKHYA].[TGFCAB] c
JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND c.TIPMOV IN ('C', 'O')
  AND c.DTMOV >= @dt_inicio;