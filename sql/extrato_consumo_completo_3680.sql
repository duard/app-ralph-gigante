-- ==================================================================
-- SQL Verificador: Extrato Completo de Consumo - Produto 3680
-- Objetivo: Verificar saldos, usuários, valores e movimentações completas
-- Período: Dezembro 2025
-- ==================================================================

-- 1. Verificar saldo atual do produto
SELECT
    'SALDO_ATUAL' AS tipo_verificacao,
    e.CODPROD,
    e.CODLOCAL,
    e.ESTOQUE AS quantidade_atual,
    e.ESTMIN AS estoque_minimo,
    e.ESTMAX AS estoque_maximo,
    e.ATIVO AS status_ativo,
    l.DESCRLocal AS local_descricao,
    e.DTENTRADA AS data_entrada_estoque
FROM TGFEST e
LEFT JOIN TGFLOC l ON l.CODLOCAL = e.CODLOCAL
WHERE e.CODPROD = 3680
  AND e.ATIVO = 'S';

-- 2. Extrato completo de movimentações (TOP 50 para análise)
SELECT
    'EXTRATO_MOVIMENTACOES' AS tipo_verificacao,
    ROW_NUMBER() OVER (ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) ASC, c.NUNOTA ASC) AS sequencia,
    c.NUNOTA,
    c.NUMNOTA,
    c.DTNEG AS data_negociacao,
    COALESCE(c.DTENTSAI, c.DTNEG) AS data_movimentacao,
    c.TIPMOV,
    CASE c.TIPMOV
        WHEN 'V' THEN 'Venda'
        WHEN 'P' THEN 'Pedido Venda'
        WHEN 'D' THEN 'Devolução Venda'
        WHEN 'A' THEN 'CT-e Venda'
        WHEN 'O' THEN 'Pedido Compra'
        WHEN 'C' THEN 'Nota Compra'
        WHEN 'E' THEN 'Devolução Compra'
        WHEN 'H' THEN 'CT-e Compra'
        WHEN 'T' THEN 'Transferência'
        WHEN 'J' THEN 'Pedido Requisição'
        WHEN 'Q' THEN 'Requisição'
        WHEN 'L' THEN 'Devolução Requisição'
        WHEN 'F' THEN 'Nota Produção'
        ELSE 'Outros'
    END AS tipo_movimentacao,
    c.STATUSNOTA,
    i.SEQUENCIA AS seq_item,
    i.CODPROD,
    i.QTDNEG AS quantidade_negociada,
    i.QTDENTREGUE AS quantidade_entregue,
    i.VLRUNIT AS valor_unitario,
    i.VLRTOT AS valor_total,
    i.ATUALESTOQUE AS impacto_estoque,
    CASE
        WHEN i.ATUALESTOQUE > 0 THEN 'ENTRADA'
        WHEN i.ATUALESTOQUE < 0 THEN 'SAÍDA'
        ELSE 'NEUTRO'
    END AS tipo_impacto,
    u.NOMEUSU AS usuario_solicitante,
    t.DESCROPER AS operacao_descricao,
    CASE t.ATUALEST
        WHEN 'B' THEN 'Baixa Estoque'
        WHEN 'E' THEN 'Entrada Estoque'
        WHEN 'R' THEN 'Reserva Estoque'
        WHEN 'N' THEN 'Não Movimenta'
        ELSE 'Indefinido'
    END AS atualizacao_estoque,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM TSILIB lib
            WHERE lib.NUCHAVE = c.NUNOTA
              AND lib.DHLIB IS NOT NULL
              AND lib.VLRLIBERADO >= 0
              AND lib.REPROVADO <> 'S'
        ) THEN 'APROVADO'
        ELSE 'PENDENTE'
    END AS status_aprovacao
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TGFTOP t ON t.CODTIPOPER = c.CODTIPOPER
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) = 12
  AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025
ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) ASC, c.NUNOTA ASC;

-- 3. Resumo por usuário (consumo total)
SELECT
    'RESUMO_POR_USUARIO' AS tipo_verificacao,
    u.NOMEUSU AS usuario,
    COUNT(DISTINCT c.NUNOTA) AS numero_solicitacoes,
    SUM(ABS(i.QTDNEG)) AS quantidade_total_consumida,
    SUM(ABS(i.VLRTOT)) AS valor_total_consumido,
    AVG(i.VLRUNIT) AS valor_medio_unitario,
    MIN(COALESCE(c.DTENTSAI, c.DTNEG)) AS primeira_solicitacao,
    MAX(COALESCE(c.DTENTSAI, c.DTNEG)) AS ultima_solicitacao
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) = 12
  AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025
  AND i.ATUALESTOQUE < 0  -- Apenas saídas/consumos
GROUP BY u.NOMEUSU
ORDER BY quantidade_total_consumida DESC;

-- 4. Verificação de aprovação das solicitações
SELECT
    'VERIFICACAO_APROVACAO' AS tipo_verificacao,
    c.NUNOTA,
    COALESCE(c.DTENTSAI, c.DTNEG) AS data_movimentacao,
    u.NOMEUSU AS solicitante,
    i.QTDNEG AS quantidade,
    i.VLRTOT AS valor,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM TSILIB lib
            WHERE lib.NUCHAVE = c.NUNOTA
              AND lib.DHLIB IS NOT NULL
              AND lib.VLRLIBERADO >= 0
              AND lib.REPROVADO <> 'S'
        ) THEN 'APROVADO - LIBERADO'
        WHEN EXISTS (
            SELECT 1 FROM TSILIB lib
            WHERE lib.NUCHAVE = c.NUNOTA
              AND lib.REPROVADO = 'S'
        ) THEN 'REPROVADO'
        ELSE 'PENDENTE DE APROVAÇÃO'
    END AS status_aprovacao,
    (
        SELECT TOP 1 lib.VLRLIBERADO
        FROM TSILIB lib
        WHERE lib.NUCHAVE = c.NUNOTA
        ORDER BY lib.DHLIB DESC
    ) AS valor_liberado
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) = 12
  AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025
ORDER BY COALESCE(c.DTENTSAI, c.DTNEG) ASC, c.NUNOTA ASC;

-- 5. Totais gerais do período
SELECT
    'TOTAIS_GERAIS' AS tipo_verificacao,
    COUNT(DISTINCT c.NUNOTA) AS total_notas,
    COUNT(*) AS total_movimentacoes,
    SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.QTDNEG ELSE 0 END) AS quantidade_entradas,
    SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN ABS(i.QTDNEG) ELSE 0 END) AS quantidade_saidas,
    SUM(CASE WHEN i.ATUALESTOQUE > 0 THEN i.VLRTOT ELSE 0 END) AS valor_entradas,
    SUM(CASE WHEN i.ATUALESTOQUE < 0 THEN ABS(i.VLRTOT) ELSE 0 END) AS valor_saidas,
    AVG(CASE WHEN i.ATUALESTOQUE < 0 THEN i.VLRUNIT ELSE NULL END) AS valor_medio_saidas,
    AVG(CASE WHEN i.ATUALESTOQUE > 0 THEN i.VLRUNIT ELSE NULL END) AS valor_medio_entradas,
    COUNT(DISTINCT u.CODUSU) AS usuarios_unicos
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND MONTH(COALESCE(c.DTENTSAI, c.DTNEG)) = 12
  AND YEAR(COALESCE(c.DTENTSAI, c.DTNEG)) = 2025;