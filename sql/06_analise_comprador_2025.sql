-- ==================================================================
-- Query: Análise do Comprador - Produto 3680 - 2025
-- Objetivo: Tabular o que foi comprado vs consumido internamente
-- ==================================================================

-- Query para análise mensal detalhada (comprador)
SELECT 
    LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7) AS ano_mes,
    MONTH(c.DTMOV) AS mes,
    YEAR(c.DTMOV) AS ano,
    
    -- Compras realizadas (TIPMOV = C)
    SUM(CASE WHEN c.TIPMOV = 'C' THEN i.QTDNEG ELSE 0 END) AS quantidade_comprada,
    SUM(CASE WHEN c.TIPMOV = 'C' THEN i.VLRTOT ELSE 0 END) AS valor_comprado,
    
    -- Consumo real externo (saídas que não são requisições internas)
    SUM(CASE WHEN c.TIPMOV = 'O' 
             AND t.DESCROPER NOT LIKE '%COMPRA%' 
             AND t.DESCROPER NOT LIKE '%REQUISICAO%' 
         THEN i.QTDNEG ELSE 0 END) AS quantidade_consumida_externa,
    SUM(CASE WHEN c.TIPMOV = 'O' 
             AND t.DESCROPER NOT LIKE '%COMPRA%' 
             AND t.DESCROPER NOT LIKE '%REQUISICAO%' 
         THEN i.VLRTOT ELSE 0 END) AS valor_consumido_externo,
    
    -- Consumo interno (requisições)
    SUM(CASE WHEN c.TIPMOV = 'O' 
             AND (t.DESCROPER LIKE '%COMPRA%' OR t.DESCROPER LIKE '%REQUISICAO%') 
         THEN i.QTDNEG ELSE 0 END) AS quantidade_consumido_interno,
    SUM(CASE WHEN c.TIPMOV = 'O' 
             AND (t.DESCROPER LIKE '%COMPRA%' OR t.DESCROPER LIKE '%REQUISICAO%') 
         THEN i.VLRTOT ELSE 0 END) AS valor_consumido_interno,
    
    -- Totais gerais
    SUM(i.QTDNEG) AS quantidade_total_saida,
    SUM(i.VLRTOT) AS valor_total_saida,
    
    -- Saldo mensal do comprador
    (SUM(CASE WHEN c.TIPMOV = 'C' THEN i.QTDNEG ELSE 0 END) - 
     SUM(CASE WHEN c.TIPMOV = 'O' 
             AND t.DESCROPER NOT LIKE '%COMPRA%' 
             AND t.DESCROPER NOT LIKE '%REQUISICAO%' 
         THEN i.QTDNEG ELSE 0 END)) AS saldo_disponivel,
         
    -- Percentual de atendimento do consumo
    CASE WHEN SUM(CASE WHEN c.TIPMOV = 'O' 
                 AND t.DESCROPER NOT LIKE '%COMPRA%' 
                 AND t.DESCROPER NOT LIKE '%REQUISICAO%' 
             THEN i.QTDNEG ELSE 0 END) > 0
         THEN (SUM(CASE WHEN c.TIPMOV = 'C' THEN i.QTDNEG ELSE 0 END) * 100.0) / 
              SUM(CASE WHEN c.TIPMOV = 'O' 
                   AND t.DESCROPER NOT LIKE '%COMPRA%' 
                   AND t.DESCROPER NOT LIKE '%REQUISICAO%' 
                   THEN i.QTDNEG ELSE 0 END)
         ELSE 0 
    END AS percentual_atendimento
    
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND YEAR(c.DTMOV) = 2025
GROUP BY LEFT(CONVERT(VARCHAR(10), c.DTMOV, 120), 7), 
         MONTH(c.DTMOV), 
         YEAR(c.DTMOV)
ORDER BY mes;