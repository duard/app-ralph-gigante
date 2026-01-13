-- Query simples para pedidos aprovados em dezembro 2025
SELECT 
    COUNT(*) AS total_pedidos,
    SUM(i.QTDNEG) AS quantidade_total,
    SUM(i.VLRTOT) AS valor_total,
    AVG(i.VLRUNIT) AS preco_medio
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = 3680
  AND c.TIPMOV = 'O'
  AND c.STATUSNOTA = 'L'
  AND MONTH(c.DTMOV) = 12
  AND YEAR(c.DTMOV) = 2025
  AND (c.DESCROPER LIKE '%APROVACAO%' 
       OR c.DESCROPER LIKE '%APROVACAO%'
       OR c.DESCROPER LIKE '%AUTORIZACAO%'
       OR c.DESCROPER LIKE '%ALVARACAO%')
       OR c.DESCROPER LIKE '%ALVARACAO%');