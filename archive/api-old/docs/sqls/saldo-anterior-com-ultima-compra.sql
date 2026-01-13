-- ============================================================
-- SQL: SALDO ANTERIOR COM VALOR DA ÚLTIMA COMPRA
-- ============================================================
-- Calcula o saldo anterior usando o valor unitário da última compra
-- como referência para valorizar o estoque
-- ============================================================

-- PRODUTO: 3680 - PAPEL SULFITE A4 500 FOLHAS
-- PERÍODO: Antes de 2025-12-01
-- DATA ÚLTIMA COMPRA: 2025-10-30
-- VALOR ÚLTIMA COMPRA: R$ 22,6951

DECLARE @CODPROD INT = 3680
DECLARE @DATA_INICIO VARCHAR(10) = '2025-12-01'

-- Passo 1: Buscar valor da última compra
DECLARE @VALOR_ULTIMA_COMPRA DECIMAL(15,4)

SELECT TOP 1 @VALOR_ULTIMA_COMPRA = i.VLRUNIT
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = @CODPROD
    AND c.STATUSNOTA = 'L'
    AND c.TIPMOV = 'C'  -- Compra
    AND i.ATUALESTOQUE > 0  -- Entrada
    AND COALESCE(c.DTENTSAI, c.DTNEG) < @DATA_INICIO
ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) DESC, c.NUNOTA DESC

-- Passo 2: Calcular saldo anterior com o valor de referência
SELECT
    @CODPROD AS codprod,
    @VALOR_ULTIMA_COMPRA AS valor_referencia_ultima_compra,
    COALESCE(SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END), 0) AS saldo_qtd,
    -- Usar valor da última compra para valorizar o saldo
    COALESCE(SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END), 0) * @VALOR_ULTIMA_COMPRA AS saldo_valor_calculado,
    -- Valor original (soma dos VLRTOT das movimentações)
    COALESCE(SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END), 0) AS saldo_valor_acumulado
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = @CODPROD
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE <> 0
    AND i.RESERVA = 'N'
    AND COALESCE(c.DTENTSAI, c.DTNEG) < @DATA_INICIO

-- ============================================================
-- VERSÃO SIMPLIFICADA (SEM VARIÁVEIS) PARA USAR NA API
-- ============================================================

WITH UltimaCompra AS (
    SELECT TOP 1 i.VLRUNIT AS valor_unitario
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
    3680 AS codprod,
    uc.valor_unitario AS valor_referencia_ultima_compra,
    COALESCE(SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END), 0) AS saldo_qtd,
    COALESCE(SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END), 0) * uc.valor_unitario AS saldo_valor_com_ultima_compra,
    COALESCE(SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END), 0) AS saldo_valor_acumulado_original
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
CROSS JOIN UltimaCompra uc
WHERE i.CODPROD = 3680
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE <> 0
    AND i.RESERVA = 'N'
    AND COALESCE(c.DTENTSAI, c.DTNEG) < '2025-12-01'
GROUP BY uc.valor_unitario

-- ============================================================
-- RESULTADO ESPERADO:
-- ============================================================
-- codprod: 3680
-- valor_referencia_ultima_compra: 22.6951
-- saldo_qtd: 104
-- saldo_valor_com_ultima_compra: 2360.2904 (104 * 22.6951)
-- saldo_valor_acumulado_original: -30525.93 (valor incorreto - mix de valores)
-- ============================================================
