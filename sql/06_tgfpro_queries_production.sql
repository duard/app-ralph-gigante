-- ==================================================================
-- TGFPRO Production Queries
-- Queries prontas para uso em produção baseadas em descobertas do dicionário
-- Data: 2026-01-13
-- ==================================================================

-- ==================================================================
-- CAMPOS DESCOBERTOS VIA DICIONÁRIO
-- ==================================================================

-- IDENTIFICAÇÃO:
--   CODPROD (I)       - Código único do produto
--   DESCRPROD (S)     - Descrição do produto
--   REFERENCIA (S)    - Referência do produto
--   REFFORN (S)       - Referência do fornecedor
--   ATIVO (S)         - Ativo (S=Sim, N=Não)

-- CLASSIFICAÇÃO:
--   CODGRUPOPROD (I)  - FK para TGFGRU.CODGRUPOPROD
--   USOPROD (S)       - C=Consumo, R=Revenda, V=Venda, M=Matéria prima
--   CODCAT (I)        - FK para TGFCAT.CODCAT
--   CODCPR (I)        - Classificação

-- FORNECEDOR:
--   CODPARCFORN (I)   - FK para TGFPAR.CODPARC
--   FABRICANTE (S)    - Nome do fabricante

-- CONTROLE:
--   TIPCONTEST (S)    - N=Sem controle, L=Lote, S=Lista, E=Série
--   LISCONTEST (S)    - Lista de controle
--   CODVOL (S)        - Unidade padrão
--   CODVOLCOMPRA (S)  - Unidade de compra

-- PREÇOS E CUSTOS:
--   VLRUNIT (F)       - Valor unitário
--   VLRULTCOMPRA (F)  - Valor última compra
--   CUSTO (F)         - Custo
--   CUSTOCONT (F)     - Custo contábil
--   CUSTOFIN (F)      - Custo financeiro
--   MARGEM (F)        - Margem
--   PRECOVENDA (F)    - Preço venda 1
--   PRECOVENDA2 (F)   - Preço venda 2

-- DATAS:
--   DTALTER (H)       - Data alteração

-- ==================================================================
-- QUERY 1: Listagem Básica de Produtos Ativos de Consumo
-- ==================================================================

SELECT TOP 100
    CODPROD,
    DESCRPROD,
    REFERENCIA,
    REFFORN,
    ATIVO,
    USOPROD,
    CODGRUPOPROD,
    FABRICANTE,
    CODVOL,
    TIPCONTEST,
    DTALTER
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S'
  AND USOPROD = 'C'
ORDER BY CODPROD DESC;

-- ==================================================================
-- QUERY 2: Produtos com Informações de Preço
-- ==================================================================

SELECT TOP 100
    CODPROD,
    DESCRPROD,
    VLRUNIT,
    VLRULTCOMPRA,
    CUSTO,
    CUSTOCONT,
    CUSTOFIN,
    MARGEM,
    PRECOVENDA,
    CASE
        WHEN VLRULTCOMPRA > 0 THEN ((PRECOVENDA - VLRULTCOMPRA) / VLRULTCOMPRA * 100)
        ELSE 0
    END AS MARGEM_PERCENTUAL
FROM TGFPRO WITH (NOLOCK)
WHERE ATIVO = 'S'
  AND USOPROD = 'C'
  AND VLRULTCOMPRA > 0
ORDER BY CODPROD DESC;

-- ==================================================================
-- QUERY 3: Produtos por Grupo (com contagem)
-- ==================================================================

SELECT
    G.CODGRUPOPROD,
    G.DESCRGRUPOPROD,
    COUNT(P.CODPROD) AS QTD_PRODUTOS,
    SUM(CASE WHEN P.ATIVO = 'S' THEN 1 ELSE 0 END) AS QTD_ATIVOS,
    SUM(CASE WHEN P.ATIVO = 'N' THEN 1 ELSE 0 END) AS QTD_INATIVOS
FROM TGFGRU G WITH (NOLOCK)
LEFT JOIN TGFPRO P WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD AND P.USOPROD = 'C'
GROUP BY G.CODGRUPOPROD, G.DESCRGRUPOPROD
HAVING COUNT(P.CODPROD) > 0
ORDER BY QTD_ATIVOS DESC;

-- ==================================================================
-- QUERY 4: Produtos com Estoque Detalhado por Local
-- ==================================================================

SELECT TOP 100
    P.CODPROD,
    P.DESCRPROD,
    P.ATIVO AS PROD_ATIVO,
    P.USOPROD,
    P.CODGRUPOPROD,
    G.DESCRGRUPOPROD,
    E.CODLOCAL,
    L.DESCRLOCAL,
    E.ESTOQUE,
    E.ESTMIN,
    E.ESTMAX,
    E.CONTROLE,
    E.ATIVO AS EST_ATIVO,
    P.VLRULTCOMPRA,
    E.ESTOQUE * P.VLRULTCOMPRA AS VALOR_ESTOQUE_ULT_COMPRA,
    CASE
        WHEN E.ESTOQUE <= 0 THEN 'SEM ESTOQUE'
        WHEN E.ESTOQUE < E.ESTMIN THEN 'ABAIXO DO MÍNIMO'
        WHEN E.ESTOQUE > E.ESTMAX THEN 'ACIMA DO MÁXIMO'
        ELSE 'NORMAL'
    END AS STATUS_ESTOQUE
FROM TGFPRO P WITH (NOLOCK)
JOIN TGFEST E WITH (NOLOCK) ON E.CODPROD = P.CODPROD
LEFT JOIN TGFLOC L WITH (NOLOCK) ON L.CODLOCAL = E.CODLOCAL
LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
WHERE P.ATIVO = 'S'
  AND P.USOPROD = 'C'
  AND E.ATIVO = 'S'
ORDER BY P.CODPROD, E.CODLOCAL;

-- ==================================================================
-- QUERY 5: Produtos com Última Compra (via OUTER APPLY)
-- ==================================================================

SELECT TOP 100
    P.CODPROD,
    P.DESCRPROD,
    P.VLRULTCOMPRA AS VLR_ULT_COMPRA_CADASTRO,
    ULT.DTMOV AS DT_ULTIMA_COMPRA,
    ULT.VLRUNIT AS VLR_ULT_PEDIDO,
    ULT.QTDNEG AS QTD_ULT_PEDIDO,
    ULT.NUNOTA AS NUNOTA_ULT_COMPRA,
    DATEDIFF(DAY, ULT.DTMOV, GETDATE()) AS DIAS_DESDE_ULT_COMPRA
FROM TGFPRO P WITH (NOLOCK)
OUTER APPLY (
    SELECT TOP 1
        C.NUNOTA,
        C.DTMOV,
        I.VLRUNIT,
        I.QTDNEG
    FROM TGFCAB C WITH (NOLOCK)
    JOIN TGFITE I WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA
    WHERE I.CODPROD = P.CODPROD
      AND C.TIPMOV = 'O'
      AND C.STATUSNOTA = 'L'
    ORDER BY C.DTMOV DESC
) ULT
WHERE P.ATIVO = 'S'
  AND P.USOPROD = 'C'
ORDER BY P.CODPROD DESC;

-- ==================================================================
-- QUERY 6: Produtos com Preço Médio Ponderado (últimas 10 compras)
-- ==================================================================

SELECT TOP 100
    P.CODPROD,
    P.DESCRPROD,
    P.VLRULTCOMPRA AS VLR_CADASTRO,
    MEDIA.PRECO_MEDIO_PONDERADO,
    MEDIA.PRECO_SIMPLES,
    MEDIA.TOTAL_QTD,
    MEDIA.QTD_COMPRAS,
    ABS(P.VLRULTCOMPRA - MEDIA.PRECO_MEDIO_PONDERADO) AS DIFERENCA_MEDIA,
    CASE
        WHEN P.VLRULTCOMPRA > 0 THEN
            ((MEDIA.PRECO_MEDIO_PONDERADO - P.VLRULTCOMPRA) / P.VLRULTCOMPRA * 100)
        ELSE 0
    END AS VARIACAO_PERCENTUAL
FROM TGFPRO P WITH (NOLOCK)
OUTER APPLY (
    SELECT
        SUM(I.VLRTOT) / NULLIF(SUM(I.QTDNEG), 0) AS PRECO_MEDIO_PONDERADO,
        AVG(I.VLRUNIT) AS PRECO_SIMPLES,
        SUM(I.QTDNEG) AS TOTAL_QTD,
        COUNT(*) AS QTD_COMPRAS
    FROM (
        SELECT TOP 10
            I2.VLRTOT,
            I2.QTDNEG,
            I2.VLRUNIT
        FROM TGFCAB C2 WITH (NOLOCK)
        JOIN TGFITE I2 WITH (NOLOCK) ON I2.NUNOTA = C2.NUNOTA
        WHERE I2.CODPROD = P.CODPROD
          AND C2.TIPMOV = 'O'
          AND C2.STATUSNOTA = 'L'
        ORDER BY C2.DTMOV DESC
    ) I
) MEDIA
WHERE P.ATIVO = 'S'
  AND P.USOPROD = 'C'
  AND MEDIA.PRECO_MEDIO_PONDERADO IS NOT NULL
ORDER BY P.CODPROD DESC;

-- ==================================================================
-- QUERY 7: Histórico de Compras de um Produto Específico
-- ==================================================================

SELECT
    C.NUNOTA,
    C.DTMOV,
    C.DTNEG,
    C.TIPMOV,
    C.STATUSNOTA,
    I.SEQUENCIA,
    I.CODPROD,
    P.DESCRPROD,
    I.QTDNEG,
    I.VLRUNIT,
    I.VLRTOT,
    T.DESCROPER,
    PARC.NOMEPARC AS FORNECEDOR
FROM TGFCAB C WITH (NOLOCK)
JOIN TGFITE I WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA
JOIN TGFPRO P WITH (NOLOCK) ON P.CODPROD = I.CODPROD
LEFT JOIN TGFTOP T WITH (NOLOCK) ON T.CODTIPOPER = C.CODTIPOPER
LEFT JOIN TGFPAR PARC WITH (NOLOCK) ON PARC.CODPARC = C.CODPARC
WHERE I.CODPROD = 3680  -- Substituir pelo código desejado
  AND C.STATUSNOTA = 'L'
  AND C.TIPMOV = 'O'
ORDER BY C.DTMOV DESC;

-- ==================================================================
-- QUERY 8: Produtos sem Estoque (zerados ou sem registro)
-- ==================================================================

SELECT
    P.CODPROD,
    P.DESCRPROD,
    P.ATIVO,
    P.CODGRUPOPROD,
    G.DESCRGRUPOPROD,
    P.VLRULTCOMPRA,
    ULT.DT_ULTIMA_COMPRA,
    DATEDIFF(DAY, ULT.DT_ULTIMA_COMPRA, GETDATE()) AS DIAS_SEM_COMPRA
FROM TGFPRO P WITH (NOLOCK)
LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
OUTER APPLY (
    SELECT TOP 1 C.DTMOV AS DT_ULTIMA_COMPRA
    FROM TGFCAB C WITH (NOLOCK)
    JOIN TGFITE I WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA
    WHERE I.CODPROD = P.CODPROD
      AND C.TIPMOV = 'O'
      AND C.STATUSNOTA = 'L'
    ORDER BY C.DTMOV DESC
) ULT
WHERE P.ATIVO = 'S'
  AND P.USOPROD = 'C'
  AND NOT EXISTS (
      SELECT 1
      FROM TGFEST E WITH (NOLOCK)
      WHERE E.CODPROD = P.CODPROD
        AND E.ATIVO = 'S'
        AND E.ESTOQUE > 0
  )
ORDER BY DIAS_SEM_COMPRA DESC;

-- ==================================================================
-- QUERY 9: Produtos Abaixo do Estoque Mínimo
-- ==================================================================

SELECT
    P.CODPROD,
    P.DESCRPROD,
    G.DESCRGRUPOPROD,
    L.DESCRLOCAL,
    E.ESTOQUE,
    E.ESTMIN,
    E.ESTMAX,
    E.ESTMIN - E.ESTOQUE AS QTD_FALTANTE,
    P.VLRULTCOMPRA,
    (E.ESTMIN - E.ESTOQUE) * P.VLRULTCOMPRA AS VLR_NECESSARIO_COMPRA,
    ULT.DT_ULTIMA_COMPRA,
    DATEDIFF(DAY, ULT.DT_ULTIMA_COMPRA, GETDATE()) AS DIAS_DESDE_ULT_COMPRA
FROM TGFPRO P WITH (NOLOCK)
JOIN TGFEST E WITH (NOLOCK) ON E.CODPROD = P.CODPROD
LEFT JOIN TGFLOC L WITH (NOLOCK) ON L.CODLOCAL = E.CODLOCAL
LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
OUTER APPLY (
    SELECT TOP 1 C.DTMOV AS DT_ULTIMA_COMPRA
    FROM TGFCAB C WITH (NOLOCK)
    JOIN TGFITE I WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA
    WHERE I.CODPROD = P.CODPROD
      AND C.TIPMOV = 'O'
      AND C.STATUSNOTA = 'L'
    ORDER BY C.DTMOV DESC
) ULT
WHERE P.ATIVO = 'S'
  AND P.USOPROD = 'C'
  AND E.ATIVO = 'S'
  AND E.ESTOQUE < E.ESTMIN
  AND E.ESTMIN > 0
ORDER BY QTD_FALTANTE DESC;

-- ==================================================================
-- QUERY 10: Resumo Geral por Grupo de Produtos
-- ==================================================================

SELECT
    G.CODGRUPOPROD,
    G.DESCRGRUPOPROD,
    COUNT(DISTINCT P.CODPROD) AS QTD_PRODUTOS,
    SUM(E.ESTOQUE) AS ESTOQUE_TOTAL,
    SUM(E.ESTOQUE * P.VLRULTCOMPRA) AS VALOR_TOTAL_ESTOQUE,
    AVG(P.VLRULTCOMPRA) AS PRECO_MEDIO_GRUPO,
    MIN(P.VLRULTCOMPRA) AS PRECO_MINIMO,
    MAX(P.VLRULTCOMPRA) AS PRECO_MAXIMO
FROM TGFGRU G WITH (NOLOCK)
LEFT JOIN TGFPRO P WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD AND P.ATIVO = 'S' AND P.USOPROD = 'C'
LEFT JOIN TGFEST E WITH (NOLOCK) ON E.CODPROD = P.CODPROD AND E.ATIVO = 'S'
GROUP BY G.CODGRUPOPROD, G.DESCRGRUPOPROD
HAVING COUNT(DISTINCT P.CODPROD) > 0
ORDER BY VALOR_TOTAL_ESTOQUE DESC;

-- ==================================================================
-- QUERY 11: Produtos com Movimentação Recente (últimos 30 dias)
-- ==================================================================

DECLARE @dt_inicio DATETIME = DATEADD(DAY, -30, GETDATE());

SELECT
    P.CODPROD,
    P.DESCRPROD,
    COUNT(DISTINCT C.NUNOTA) AS QTD_COMPRAS,
    SUM(I.QTDNEG) AS QTD_TOTAL_COMPRADA,
    SUM(I.VLRTOT) AS VLR_TOTAL_COMPRAS,
    AVG(I.VLRUNIT) AS PRECO_MEDIO_PERIODO,
    MAX(C.DTMOV) AS ULTIMA_COMPRA
FROM TGFPRO P WITH (NOLOCK)
JOIN TGFITE I WITH (NOLOCK) ON I.CODPROD = P.CODPROD
JOIN TGFCAB C WITH (NOLOCK) ON C.NUNOTA = I.NUNOTA
WHERE P.ATIVO = 'S'
  AND P.USOPROD = 'C'
  AND C.TIPMOV = 'O'
  AND C.STATUSNOTA = 'L'
  AND C.DTMOV >= @dt_inicio
GROUP BY P.CODPROD, P.DESCRPROD
ORDER BY QTD_COMPRAS DESC;

-- ==================================================================
-- QUERY 12: Dashboard KPIs - Resumo por Produto
-- ==================================================================

SELECT TOP 100
    P.CODPROD,
    P.DESCRPROD,
    G.DESCRGRUPOPROD AS GRUPO,
    P.ATIVO,

    -- Estoque
    EST.ESTOQUE_TOTAL,
    EST.QTD_LOCAIS,

    -- Preços
    P.VLRULTCOMPRA AS PRECO_ULT_COMPRA_CADASTRO,
    ULT.PRECO_ULT_PEDIDO,
    ULT.DT_ULT_PEDIDO,
    MEDIA.PRECO_MEDIO_POND_10,

    -- Custos e Margem
    P.CUSTO,
    P.PRECOVENDA,
    P.MARGEM,

    -- Movimentação
    MOV.QTD_COMPRAS_30D,
    MOV.QTD_TOTAL_COMPRADA_30D,

    -- Status
    CASE
        WHEN EST.ESTOQUE_TOTAL <= 0 THEN 'SEM ESTOQUE'
        WHEN EST.ESTOQUE_ABAIXO_MIN > 0 THEN 'ESTOQUE BAIXO'
        ELSE 'OK'
    END AS STATUS

FROM TGFPRO P WITH (NOLOCK)
LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD

-- Estoque consolidado
OUTER APPLY (
    SELECT
        SUM(E.ESTOQUE) AS ESTOQUE_TOTAL,
        COUNT(DISTINCT E.CODLOCAL) AS QTD_LOCAIS,
        SUM(CASE WHEN E.ESTOQUE < E.ESTMIN THEN 1 ELSE 0 END) AS ESTOQUE_ABAIXO_MIN
    FROM TGFEST E WITH (NOLOCK)
    WHERE E.CODPROD = P.CODPROD
      AND E.ATIVO = 'S'
) EST

-- Última compra
OUTER APPLY (
    SELECT TOP 1
        I.VLRUNIT AS PRECO_ULT_PEDIDO,
        C.DTMOV AS DT_ULT_PEDIDO
    FROM TGFCAB C WITH (NOLOCK)
    JOIN TGFITE I WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA
    WHERE I.CODPROD = P.CODPROD
      AND C.TIPMOV = 'O'
      AND C.STATUSNOTA = 'L'
    ORDER BY C.DTMOV DESC
) ULT

-- Preço médio ponderado (últimas 10)
OUTER APPLY (
    SELECT
        SUM(I.VLRTOT) / NULLIF(SUM(I.QTDNEG), 0) AS PRECO_MEDIO_POND_10
    FROM (
        SELECT TOP 10 I2.VLRTOT, I2.QTDNEG
        FROM TGFCAB C2 WITH (NOLOCK)
        JOIN TGFITE I2 WITH (NOLOCK) ON I2.NUNOTA = C2.NUNOTA
        WHERE I2.CODPROD = P.CODPROD
          AND C2.TIPMOV = 'O'
          AND C2.STATUSNOTA = 'L'
        ORDER BY C2.DTMOV DESC
    ) I
) MEDIA

-- Movimentação últimos 30 dias
OUTER APPLY (
    SELECT
        COUNT(DISTINCT C.NUNOTA) AS QTD_COMPRAS_30D,
        SUM(I.QTDNEG) AS QTD_TOTAL_COMPRADA_30D
    FROM TGFCAB C WITH (NOLOCK)
    JOIN TGFITE I WITH (NOLOCK) ON I.NUNOTA = C.NUNOTA
    WHERE I.CODPROD = P.CODPROD
      AND C.TIPMOV = 'O'
      AND C.STATUSNOTA = 'L'
      AND C.DTMOV >= DATEADD(DAY, -30, GETDATE())
) MOV

WHERE P.ATIVO = 'S'
  AND P.USOPROD = 'C'
ORDER BY P.CODPROD DESC;

-- ==================================================================
-- FIM
-- ==================================================================
