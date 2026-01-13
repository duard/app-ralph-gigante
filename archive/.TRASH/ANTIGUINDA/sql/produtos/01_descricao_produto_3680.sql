-- ==================================================================
-- Query: Descrição do Produto 3680
-- Objetivo: Obter informações importantes do produto 3680 sem campos binários
-- ==================================================================

SELECT 
    p.CODPROD AS "CódProduto",
    p.DESCRPROD AS "Descrição_Produto",
    p.REFERENCIA AS "Referência",
    p.CODUNIDADE AS "Cod_Unidade",
    p.CODGRUPOPROD AS "Cod_Grupo_Prod",
    g.NOMEGRUPOPROD AS "Nome_Grupo_Produto",
    p.MARCA AS "Marca",
    p.ATIVO AS "Ativo",
    p.VLRUNIT AS "Valor_Unitário",
    p.VLRULTCOMPRA AS "Valor_Ultima_Compra",
    p.QTDESTOQUE AS "Qtde_Estoque_Min",
    p.PESOBRUTO AS "Peso_Bruto",
    p.PESOLIQUIDO AS "Peso_Líquido",
    p.CODVOL AS "Unidade_Volume",
    p.COMPLDESC AS "Complemento_Desc",
    p.CUSTO AS "Custo",
    p.CUSTOCONT AS "Custo_Contábil"
FROM TGFPRO p
LEFT JOIN TGFGRU g ON g.CODGRUPOPROD = p.CODGRUPOPROD
WHERE p.CODPROD = 3680;