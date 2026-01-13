-- ==================================================================
-- Query: Análise Tabular Mensal - Produto 3680 - 2025
-- Objetivo: Tabular consumo, compras e indicadores mês a mês
-- ==================================================================

-- Query principal para análise tabular completa
WITH 
compras_mensais AS (
    SELECT 
        LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7) AS ano_mes,
        MONTH(c.DTMOV) AS mes,
        YEAR(c.DTMOV) AS ano,
        SUM(i.QTDNEG) AS quantidade_comprada,
        SUM(i.VLRTOT) AS valor_comprado,
        COUNT(DISTINCT c.NUNOTA) AS numero_compras,
        AVG(i.VLRUNIT) AS preco_medio_compra
    FROM TGFCAB c
    JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
    WHERE i.CODPROD = 3680
      AND c.TIPMOV = 'C'  -- Compras
      AND c.STATUSNOTA = 'L'
      AND YEAR(c.DTMOV) = 2025
    GROUP BY LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7), 
             MONTH(c.DTMOV), 
             YEAR(c.DTMOV)
),

saidas_mensais AS (
    SELECT 
        LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7) AS ano_mes,
        MONTH(c.DTMOV) AS mes,
        YEAR(c.DTMOV) AS ano,
        SUM(i.QTDNEG) AS quantidade_saida,
        SUM(i.VLRTOT) AS valor_saida,
        COUNT(DISTINCT c.NUNOTA) AS numero_saidas,
        AVG(i.VLRUNIT) AS preco_medio_saida
    FROM TGFCAB c
    JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
    WHERE i.CODPROD = 3680
      AND c.TIPMOV = 'O'  -- Saídas/Consumo
      AND c.STATUSNOTA = 'L'
      AND YEAR(c.DTMOV) = 2025
    GROUP BY LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7), 
             MONTH(c.DTMOV), 
             YEAR(c.DTMOV)
),

estoque_mes AS (
    SELECT 
        e.ESTOQUE AS estoque_final
    FROM TGFEST e
    WHERE e.CODPROD = 3680
      AND e.ATIVO = 'S'
)

-- Query final unificada
SELECT 
    CONVERT(VARCHAR, DATEFROMPARTS(2025, ISNULL(cm.mes, 0), 1), 103) AS mes_descricao,
    ISNULL(cm.mes, sm.mes) AS mes_numero,
    ISNULL(cm.quantidade_comprada, 0) AS quantidade_comprada,
    ISNULL(cm.valor_comprado, 0) AS valor_comprado,
    ISNULL(cm.numero_compras, 0) AS numero_compras,
    ISNULL(cm.preco_medio_compra, 0) AS preco_medio_compra,
    ISNULL(sm.quantidade_saida, 0) AS quantidade_saida,
    ISNULL(sm.valor_saida, 0) AS valor_saida,
    ISNULL(sm.numero_saidas, 0) AS numero_saidas,
    ISNULL(sm.preco_medio_saida, 0) AS preco_medio_saida,
    (ISNULL(cm.quantidade_comprada, 0) - ISNULL(sm.quantidade_saida, 0)) AS saldo_mensal,
    CASE 
        WHEN ISNULL(cm.valor_comprado, 0) > 0 
        THEN ((ISNULL(sm.valor_saida, 0) - ISNULL(cm.valor_comprado, 0)) / ISNULL(cm.valor_comprado, 0)) * 100
        ELSE 0 
    END AS percentual_margem,
    es.estoque_final AS estoque_atual
FROM 
    (SELECT 1 AS dummy) d
LEFT JOIN compras_mensais cm ON 1=1
LEFT JOIN saidas_mensais sm ON cm.ano_mes = sm.ano_mes
CROSS JOIN estoque_mes es
WHERE (cm.ano_mes IS NOT NULL OR sm.ano_mes IS NOT NULL)
ORDER BY mes_numero;