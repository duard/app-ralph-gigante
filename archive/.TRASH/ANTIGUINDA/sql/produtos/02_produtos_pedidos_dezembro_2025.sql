-- ==================================================================
-- Query: Produtos Pedidos em Dezembro 2025
-- Objetivo: Contar produtos pedidos via TGFITE em dezembro de 2025
-- ==================================================================

SELECT 
    COUNT(DISTINCT i.NUNOTA) AS total_pedidos,
    COUNT(i.CODPROD) AS total_itens,
    SUM(i.QTDNEG) AS quantidade_total,
    SUM(i.VLRTOT) AS valor_total
FROM [SANKHYA].[TGFCAB] c
JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
WHERE c.TIPMOV = 'O'
  AND c.STATUSNOTA = 'L'
  AND MONTH(c.DTNEG) = 12
  AND YEAR(c.DTNEG) = 2025;

-- Detalhamento por produto
SELECT 
    p.CODPROD,
    p.DESCRPROD,
    COUNT(DISTINCT c.NUNOTA) AS pedidos,
    SUM(i.QTDNEG) AS quantidade,
    SUM(i.VLRTOT) AS valor_total,
    AVG(i.VLRUNIT) AS preco_medio
FROM [SANKHYA].[TGFCAB] c
JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
JOIN [SANKHYA].[TGFPRO] p ON p.CODPROD = i.CODPROD
WHERE c.TIPMOV = 'O'
  AND c.STATUSNOTA = 'L'
  AND MONTH(c.DTNEG) = 12
  AND YEAR(c.DTNEG) = 2025
GROUP BY p.CODPROD, p.DESCRPROD
ORDER BY valor_total DESC;