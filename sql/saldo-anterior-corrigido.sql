-- ============================================================
-- SQL: SALDO ANTERIOR CORRIGIDO COM VALOR DA ÚLTIMA COMPRA
-- ============================================================
-- Calcula o saldo anterior (quantidade) e usa o valor unitário
-- da última compra para valorizar o estoque inicial
-- ============================================================
-- PROBLEMA IDENTIFICADO:
-- O método antigo somava VLRTOT que misturava valores históricos
-- de compras diferentes, gerando valores negativos incorretos.
-- 
-- SOLUÇÃO:
-- Calcular apenas a QUANTIDADE do saldo anterior e multiplicar
-- pelo valor unitário da última compra antes do período.
-- ============================================================

-- EXEMPLO: Produto 3680, Período 2025-12-01 a 2025-12-31
SELECT 
    3680 AS codprod,
    -- Valor da última compra antes do período
    (SELECT TOP 1 i.VLRUNIT 
     FROM TGFCAB c 
     JOIN TGFITE i ON i.NUNOTA = c.NUNOTA 
     WHERE i.CODPROD = 3680 
        AND c.STATUSNOTA = 'L' 
        AND c.TIPMOV = 'C' 
        AND i.ATUALESTOQUE > 0 
        AND COALESCE(c.DTENTSAI, c.DTNEG) < '2025-12-01' 
     ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) DESC
    ) AS valor_ultima_compra,
    
    -- Quantidade do saldo anterior
    COALESCE(SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END), 0) AS saldo_qtd
    
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = 3680
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE <> 0
    AND i.RESERVA = 'N'
    AND COALESCE(c.DTENTSAI, c.DTNEG) < '2025-12-01'

-- RESULTADO:
-- codprod: 3680
-- valor_ultima_compra: 22.6951
-- saldo_qtd: 104
-- saldo_valor_calculado: 104 * 22.6951 = 2360.2904

-- ============================================================
-- IMPLEMENTAÇÃO NO SERVIÇO:
-- 1. Buscar valor da última compra em fetchUltimaCompra()
-- 2. Buscar apenas quantidade em fetchSaldoAnterior()
-- 3. Calcular: saldo_valor = saldo_qtd * valor_ultima_compra
-- ============================================================
