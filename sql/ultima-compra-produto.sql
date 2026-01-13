-- ============================================================
-- SQL: ÚLTIMA COMPRA DO PRODUTO
-- ============================================================
-- Busca a última compra (entrada) de um produto específico
-- para obter o valor unitário de referência para cálculo de
-- saldo anterior e PMM (Preço Médio Móvel)
-- ============================================================

-- VERSÃO 1: Última compra antes de uma data específica
SELECT TOP 1
    c.NUNOTA,
    c.TIPMOV,
    COALESCE(c.DTENTSAI, c.DTNEG) AS data_compra,
    i.CODPROD,
    p.DESCRPROD,
    i.QTDNEG AS quantidade,
    i.VLRUNIT AS valor_unitario,
    i.VLRTOT AS valor_total,
    par.NOMEPARC AS fornecedor
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
JOIN TGFPRO p ON p.CODPROD = i.CODPROD
LEFT JOIN TGFPAR par ON par.CODPARC = c.CODPARC
WHERE i.CODPROD = 3680  -- Substituir pelo CODPROD desejado
    AND c.STATUSNOTA = 'L'
    AND c.TIPMOV = 'C'  -- Compra
    AND i.ATUALESTOQUE > 0  -- Entrada no estoque
    AND COALESCE(c.DTENTSAI, c.DTNEG) < '2025-12-01'  -- Data limite
ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) DESC, c.NUNOTA DESC;

-- ============================================================
-- VERSÃO 2: Valor médio das últimas N compras
-- ============================================================
SELECT 
    i.CODPROD,
    p.DESCRPROD,
    COUNT(*) AS total_compras,
    SUM(i.QTDNEG) AS quantidade_total,
    SUM(i.VLRTOT) AS valor_total,
    AVG(i.VLRUNIT) AS valor_medio_unitario,
    MIN(i.VLRUNIT) AS valor_minimo,
    MAX(i.VLRUNIT) AS valor_maximo,
    MAX(COALESCE(c.DTENTSAI, c.DTNEG)) AS data_ultima_compra
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
JOIN TGFPRO p ON p.CODPROD = i.CODPROD
WHERE i.CODPROD = 3680  -- Substituir pelo CODPROD desejado
    AND c.STATUSNOTA = 'L'
    AND c.TIPMOV = 'C'  -- Compra
    AND i.ATUALESTOQUE > 0  -- Entrada no estoque
    AND COALESCE(c.DTENTSAI, c.DTNEG) < '2025-12-01'  -- Data limite
    AND COALESCE(c.DTENTSAI, c.DTNEG) >= DATEADD(MONTH, -6, '2025-12-01')  -- Últimos 6 meses
GROUP BY i.CODPROD, p.DESCRPROD;

-- ============================================================
-- VERSÃO 3: Valor médio das últimas 5 compras
-- ============================================================
WITH UltimasCompras AS (
    SELECT TOP 5
        c.NUNOTA,
        COALESCE(c.DTENTSAI, c.DTNEG) AS data_compra,
        i.CODPROD,
        i.QTDNEG,
        i.VLRUNIT,
        i.VLRTOT
    FROM TGFCAB c
    JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
    WHERE i.CODPROD = 3680
        AND c.STATUSNOTA = 'L'
        AND c.TIPMOV = 'C'
        AND i.ATUALESTOQUE > 0
        AND COALESCE(c.DTENTSAI, c.DTNEG) < '2025-12-01'
    ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) DESC, c.NUNOTA DESC
)
SELECT 
    CODPROD,
    COUNT(*) AS num_compras,
    SUM(QTDNEG) AS qtd_total,
    SUM(VLRTOT) AS valor_total,
    AVG(VLRUNIT) AS valor_medio_unitario,
    SUM(VLRTOT) / NULLIF(SUM(QTDNEG), 0) AS valor_medio_ponderado
FROM UltimasCompras
GROUP BY CODPROD;
