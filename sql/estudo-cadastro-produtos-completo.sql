-- ============================================================
-- ESTUDO: CADASTRO DE PRODUTOS E SUAS RELAÇÕES
-- ============================================================
-- Baseado em análise real do banco de dados Sankhya
-- Data: 10/01/2026
-- ============================================================

-- ============================================================
-- 1. ESTRUTURA BÁSICA DO PRODUTO (TGFPRO)
-- ============================================================
SELECT 
    p.CODPROD,
    p.DESCRPROD,
    p.COMPLDESC,           -- Complemento da descrição (pode ser NULL)
    p.CODVOL,              -- Unidade (UN, KG, LT, JG, etc)
    p.ATIVO,               -- S/N
    p.USOPROD,             -- Uso: C (Consumo), R (Revenda), I (Imobilizado), etc
    p.CODGRUPOPROD,        -- Código do grupo
    p.MARCA,               -- Marca do produto (pode ser NULL)
    p.CODPROCFISCAL,       -- Código de processo fiscal (pode ser NULL)
    p.NCM                  -- NCM (Nomenclatura Comum do Mercosul)
FROM TGFPRO p
WHERE p.ATIVO = 'S'
ORDER BY p.CODPROD DESC

-- RESULTADO EXEMPLO:
-- CODPROD: 15630
-- DESCRPROD: "FIXADOR HASTE CAPÔ 7622907"
-- COMPLDESC: "7622907 - FIAT"
-- CODVOL: "UN"
-- ATIVO: "S"
-- USOPROD: "C"

-- ============================================================
-- 2. ESTOQUE COM CONTROLE (TGFEST)
-- ============================================================
-- IMPORTANTE: CONTROLE é OPCIONAL
-- - Pode ser NULL, vazio ("") ou conter valor
-- - Usado para: lote, série, tamanho, tipo, condição
-- - Exemplos: "NOVO", "USADO", "PVT22", "6\"", "18-6", "M(8/9)", "DIESEL S10"

SELECT DISTINCT
    LOC.DESCRLOCAL AS descricao_local,
    EST.CODEMP AS cod_empresa,
    PRO.CODPROD AS cod_produto,
    PRO.DESCRPROD AS descricao_produto,
    ISNULL(PRO.COMPLDESC, ' ') AS complemento,
    EST.CONTROLE AS controle,              -- ⭐ PODE SER NULL/VAZIO
    PRO.CODVOL AS unidade,
    ISNULL(EST.ESTOQUE, 0) AS estoque,
    EST.CODPARC AS cod_parceiro            -- 0 = próprio, >0 = consignado
FROM TGFPRO PRO
JOIN TGFEST EST ON PRO.CODPROD = EST.CODPROD
LEFT JOIN TGFLOC LOC ON EST.CODLOCAL = LOC.CODLOCAL
WHERE EST.CODPARC = 0                      -- Estoque próprio
    AND EST.ATIVO = 'S'
    AND ISNULL(EST.ESTOQUE, 0) <> 0
    AND PRO.ATIVO = 'S'
ORDER BY PRO.DESCRPROD

-- EXEMPLOS DE CONTROLE ENCONTRADOS:
-- ✅ CONTROLE: "" (vazio) - Produto sem controle
-- ✅ CONTROLE: "NOVO" - Condição do produto
-- ✅ CONTROLE: "USADO" - Condição do produto
-- ✅ CONTROLE: "6\"" - Tamanho
-- ✅ CONTROLE: "18-6" - Código/Dimensão
-- ✅ CONTROLE: "M(8/9)" - Tamanho (Médio)
-- ✅ CONTROLE: "GG (10)" - Tamanho (Extra Grande)
-- ✅ CONTROLE: "DIESEL S10" - Tipo de combustível
-- ✅ CONTROLE: "PVT22" - Código de lote
-- ✅ CONTROLE: "12X12X120" - Dimensões

-- ============================================================
-- 3. MOVIMENTAÇÕES COM CONTROLE (TGFITE)
-- ============================================================
SELECT TOP 20
    c.NUNOTA,
    c.TIPMOV,                              -- C, V, Q, T, L, J, etc
    c.CODTIPOPER,
    t.DESCROPER,
    i.CODPROD,
    p.DESCRPROD,
    i.CONTROLE,                            -- ⭐ PODE SER NULL/VAZIO
    i.QTDNEG,
    i.QTDENTREGUE,
    i.PENDENTE,                            -- S/N
    (i.QTDNEG - i.QTDENTREGUE) AS qtd_pendente,
    i.VLRUNIT,
    i.VLRTOT,
    i.ATUALESTOQUE                         -- >0 entrada, <0 saída, 0 não afeta
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
JOIN TGFPRO p ON p.CODPROD = i.CODPROD
JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER AND t.DHTIPOPER = c.DHTIPOPER
WHERE c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE <> 0
    AND i.RESERVA = 'N'
ORDER BY c.NUNOTA DESC

-- ============================================================
-- 4. CONSULTA COMPLETA PARA ENDPOINT V2
-- ============================================================
-- Query otimizada incluindo todas as informações necessárias

SELECT
    -- Data
    COALESCE(c.DTENTSAI, c.DTNEG) AS data_mov,
    c.DTNEG,
    c.DTENTSAI,
    
    -- Nota
    c.NUNOTA,
    c.TIPMOV,
    c.CODTIPOPER,
    t.DESCROPER AS descricao_operacao,
    t.ATUALEST AS atualiza_estoque,      -- B, E, N, R
    
    -- Produto
    i.CODPROD,
    p.DESCRPROD,
    p.COMPLDESC,
    p.CODVOL AS unidade,
    
    -- Controle (PODE SER NULL)
    i.CONTROLE,
    
    -- Parceiro
    c.CODPARC,
    par.NOMEPARC AS nome_parceiro,
    
    -- Centro de Custo (PODE SER NULL)
    c.CODCENCUS,
    cc.DESCRCENCUS,
    
    -- Usuário
    u.NOMEUSU AS usuario,
    
    -- Observações
    c.OBSERVACAO,
    i.OBSERVACAO AS obs_item,
    
    -- Quantidades
    i.QTDNEG,
    i.QTDENTREGUE,
    i.PENDENTE,
    (i.QTDNEG - i.QTDENTREGUE) AS qtd_pendente,
    CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END AS qtd_mov,
    
    -- Valores
    i.VLRUNIT,
    i.VLRTOT,
    CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END AS valor_mov

FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
JOIN TGFPRO p ON p.CODPROD = i.CODPROD
JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER AND t.DHTIPOPER = c.DHTIPOPER
LEFT JOIN TGFPAR par ON par.CODPARC = c.CODPARC
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
LEFT JOIN TSICUS cc ON cc.CODCENCUS = c.CODCENCUS

WHERE i.CODPROD = @CODPROD                -- Parâmetro
    AND c.STATUSNOTA = 'L'
    AND i.ATUALESTOQUE <> 0
    AND i.RESERVA = 'N'
    AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN @DATA_INICIO AND @DATA_FIM

ORDER BY data_mov ASC, c.NUNOTA ASC

-- ============================================================
-- 5. LOCALIZAÇÕES DE ESTOQUE (MÚLTIPLOS LOCAIS)
-- ============================================================
SELECT 
    e.CODLOCAL,
    l.DESCRLOCAL AS descricao,
    e.CONTROLE,                            -- ⭐ INCLUIR SEMPRE
    e.ESTOQUE
FROM TGFEST e
LEFT JOIN TGFLOC l ON l.CODLOCAL = e.CODLOCAL
WHERE e.CODPROD = @CODPROD
    AND e.CODPARC = 0                      -- Apenas estoque próprio
    AND e.ATIVO = 'S'
    AND e.ESTOQUE > 0
ORDER BY e.ESTOQUE DESC

-- EXEMPLO DE RESULTADO:
-- CODLOCAL: 101001, DESCRLOCAL: "ALMOX PECAS", CONTROLE: "", ESTOQUE: 150
-- CODLOCAL: 102001, DESCRLOCAL: "PNEU", CONTROLE: "NOVO", ESTOQUE: 4
-- CODLOCAL: 101005, DESCRLOCAL: "FERRAMENTARIA", CONTROLE: "6\"", ESTOQUE: 2

-- ============================================================
-- 6. INFORMAÇÕES COMPLETAS DO PRODUTO
-- ============================================================
SELECT 
    p.CODPROD,
    p.DESCRPROD,
    p.COMPLDESC,
    p.CODVOL AS unidade,
    p.ATIVO,
    p.USOPROD,
    p.CODGRUPOPROD,
    g.DESCRGRUPOPROD AS descricao_grupo,
    p.MARCA
FROM TGFPRO p
LEFT JOIN TGFGRU g ON g.CODGRUPOPROD = p.CODGRUPOPROD
WHERE p.CODPROD = @CODPROD

-- ============================================================
-- RESUMO - PONTOS IMPORTANTES
-- ============================================================
/*
1. ✅ CONTROLE é OPCIONAL (pode ser NULL, vazio ou com valor)
2. ✅ COMPLDESC é OPCIONAL (complemento da descrição)
3. ✅ CODCENCUS é OPCIONAL (nem toda movimentação tem centro de custo)
4. ✅ CODPARC = 0 indica estoque próprio
5. ✅ ATUALESTOQUE: >0 entrada, <0 saída, 0 não afeta
6. ✅ ATUALEST (TGFTOP): B (Baixa), E (Entrada), N (Nenhum), R (Reserva)
7. ✅ TIPMOV: C (Compra), V (Venda), Q (Requisição), T (Transferência), etc
8. ✅ PENDENTE: S (pendente), N (não pendente)
9. ✅ Sempre usar LEFT JOIN para tabelas opcionais (TGFPAR, TSICUS, TGFLOC)
10. ✅ Sempre usar ISNULL() ou COALESCE() para campos que podem ser NULL
*/

-- ============================================================
-- TABELAS PRINCIPAIS E SUAS RELAÇÕES
-- ============================================================
/*
TGFPRO (Produtos)
├─ TGFGRU (Grupos de Produtos)
├─ TGFEST (Estoque)
│  └─ TGFLOC (Locais de Estoque)
└─ TGFITE (Itens de Nota)
   └─ TGFCAB (Cabeçalho da Nota)
      ├─ TGFTOP (Tipo de Operação)
      ├─ TGFPAR (Parceiros)
      ├─ TSIUSU (Usuários)
      └─ TSICUS (Centro de Custo)
*/
