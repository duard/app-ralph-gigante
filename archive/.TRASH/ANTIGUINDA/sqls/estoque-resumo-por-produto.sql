-- ==================================================================
-- SQL: Resumo de Estoque por Produto (quantidade e valor)
-- Objetivo: fornecer visão consolidada do estoque físico (TGFEST), informações
-- de produto
-- (TGFPRO) e pedidos de compra pendentes
-- (TGFCAB/TGFITE) para avaliar
--         quantidade disponível, reservas/pedidos em aberto e valor financeiro.
-- Uso: ajustar filtros (CODEMP / CODLOCAL / ATIVO) conforme necessidade.
-- ==================================================================

-- Parâmetros sugeridos (comente/descomente conforme engine/cliente de execução):
-- DECLARE @CODEMP INT = 7;       -- empresa padrão
-- DECLARE @CODLOCAL INT = NULL;  -- local (NULL = todos)
-- DECLARE @ATIVO CHAR(1) = 'S';  -- produto ativo

-- 1) Estoque agregado por produto (soma ESTOQUE de TGFEST)
WITH
  estoque_src
  AS
  (
    SELECT
      e.CODEMP,
      e.CODPROD,
      ISNULL(e.CODLOCAL, 0) AS CODLOCAL,
      SUM(ISNULL(e.ESTOQUE, 0)) AS ESTOQUE_TOTAL,
      SUM(ISNULL(e.ESTMIN, 0)) AS ESTMIN_SUM
    -- soma de ESTMIN por local (opcional)
    FROM [SANKHYA].[TGFEST] e
    -- WHERE e.CODEMP = @CODEMP -- opcional: filtrar empresa
    GROUP BY e.CODEMP, e.CODPROD, ISNULL(e.CODLOCAL, 0)
  ),

  -- 2) Último preço de compra confirmado por produto (usado como fallback)
  last_purchase_price
  AS
  (
    SELECT CODPROD, VLRUNIT AS last_vlrunit
    FROM (
      SELECT I.CODPROD, I.VLRUNIT,
        ROW_NUMBER() OVER (PARTITION BY I.CODPROD ORDER BY C.DTNEG DESC, I.NUNOTA DESC) as rn
      FROM [SANKHYA].[TGFITE] I
        JOIN [SANKHYA].[TGFCAB] C ON C.NUNOTA = I.NUNOTA AND C.TIPMOV = 'C' AND C.STATUSNOTA = 'L'
    ) t
    WHERE rn = 1
  ),

  pedidos_pendentes
  AS
  (
    SELECT
      i.CODPROD,
      SUM(CASE WHEN (QTDNEG - QTDENTREGUE) > 0 THEN (QTDNEG - QTDENTREGUE) ELSE 0 END) AS QTD_PENDENTE,
      -- estimativa de valor pendente usando preço unitário do item (VLRTOT/QTDNEG quando disponível)
      SUM(CASE WHEN (QTDNEG - QTDENTREGUE) > 0 THEN ISNULL(i.VLRTOT, 0) ELSE 0 END) AS VLRTOT_PENDENTE,
      -- se o item do pedido não tiver VLRUNIT, usamos o último preço confirmado (last_purchase_price) como fallback
      SUM(CASE WHEN (QTDNEG - QTDENTREGUE) > 0 THEN COALESCE(i.VLRUNIT, lp.last_vlrunit, 0) * (QTDNEG - QTDENTREGUE) ELSE 0 END) AS VLR_ESTIMADO_PENDENTE
    FROM [SANKHYA].[TGFCAB] c
      JOIN [SANKHYA].[TGFITE] i ON i.NUNOTA = c.NUNOTA
      LEFT JOIN last_purchase_price lp ON lp.CODPROD = i.CODPROD
    WHERE (QTDNEG - QTDENTREGUE) > 0
      AND c.TIPMOV = 'Q' -- requisições/compras
      AND c.STATUSNOTA = 'L' -- liberadas
      AND c.CODTIPOPER IN (502,504,506,507)
      AND c.NUMCOTACAO IS NULL
      AND c.NUREM IS NULL
      AND i.CODPROD NOT IN (5568,6689,8076)
    GROUP BY i.CODPROD
  ),

  -- 3) Estoque por produto (agregação total across locais) para simplificação da visão principal
  estoque_agg
  AS
  (
    SELECT
      s.CODPROD,
      SUM(s.ESTOQUE_TOTAL) AS ESTOQUE_TOTAL
    FROM estoque_src s
    GROUP BY s.CODPROD
  )

SELECT
  p.CODPROD,
  p.DESCRPROD,
  p.REFERENCIA,
  p.CODUNIDADE,
  -- campos de custo/valor que existem em TGFPRO (sugestão: VLRULTCOMPRA se disponível)
  p.VLRUNIT,
  p.VLRULTCOMPRA,

  -- estoque atual consolidado (soma de TGFEST)
  ISNULL(e.APROX_ESTOQUE, ea.ESTOQUE_TOTAL) AS ESTOQUE_ATUAL,

  -- quantidade pendente em compras (do TGFCAB/TGFITE)
  ISNULL(pp.QTD_PENDENTE, 0) AS QTD_PENDENTE,

  -- valor estimado do estoque (usa VLRULTCOMPRA fallback VLRUNITARIO)
  ISNULL(ea.ESTOQUE_TOTAL, 0) * COALESCE(p.VLRULTCOMPRA, p.VLRUNIT, 0) AS VALOR_ESTOQUE_ESTIMADO,

  -- valor estimado dos pedidos pendentes (somatório dos itens pendentes) quando disponível
  ISNULL(pp.VLR_ESTIMADO_PENDENTE, pp.VLRTOT_PENDENTE) AS VALOR_PEDIDOS_PENDENTES,

  -- sinalizadores úteis (estoque baixo)
  CASE WHEN ISNULL(ea.ESTOQUE_TOTAL, 0) <= ISNULL(p.QTDESTOQUE, 0) OR ISNULL(ea.ESTOQUE_TOTAL, 0) <= ISNULL(e.ESTMIN_SUM, 0)
       THEN 'BAIXO' ELSE 'OK' END AS STATUS_ESTOQUE

FROM [SANKHYA].[TGFPRO] p
  LEFT JOIN estoque_src e ON e.CODPROD = p.CODPROD
  LEFT JOIN estoque_agg ea ON ea.CODPROD = p.CODPROD
  LEFT JOIN pedidos_pendentes pp ON pp.CODPROD = p.CODPROD

-- Filtros sugeridos (descomente/ajuste conforme necessidade):
-- WHERE p.ATIVO = @ATIVO
--   AND e.CODEMP = @CODEMP
--   AND (e.CODLOCAL = @CODLOCAL OR @CODLOCAL IS NULL)

ORDER BY VALOR_ESTOQUE_ESTIMADO DESC, ESTOQUE_ATUAL DESC;

-- ==================================================================
-- Observações e sugestões:
-- 1) Dependendo do método de custo adotado pela empresa (última compra, média ponderada), prefira o campo adequado
--    em TGFPRO (VLRULTCOMPRA, VLRUNITARIO) ou calcule média de custo a partir de movimentos de entrada.
-- 2) Para visões por local, remova o CTE 'estoque_agg' e selecione diretamente de 'estoque_src' agrupado por CODLOCAL.
-- 3) Se for necessário considerar reservas internas (reservas de venda), combine com TGFITE/TGFTOP filtros adicionais.
-- 4) Posso gerar uma variante que inclui localização, parceiro principal (fornecedor usual) e custo médio móvel se desejar.
-- ==================================================================
