/* ============================================================
   EXTRATO DE CONSUMO DETALHADO - PRODUTO 3680
   Sistema: Sankhya / SQL Server
   Período: 01/12/2025 a 31/12/2025

   VERSÃO 2 - Inclui:
   - Usuário que incluiu a nota (CODUSUINC)
   - Grupo do usuário que incluiu
   - Parceiro (CODPARC)
   - Centro de Custo (CODCENCUS)

   Objetivo: Identificar todos os setores que consumiram
   ============================================================ */

-- ============================================================
-- 1. MOVIMENTAÇÕES DETALHADAS COM USUÁRIO E GRUPO
-- ============================================================
SELECT
    COALESCE(c.DTENTSAI, c.DTNEG) AS data_mov,
    c.NUNOTA,
    c.TIPMOV,
    c.CODTIPOPER,

    -- Usuário que incluiu a nota
    c.CODUSUINC,
    u.NOMEUSU AS usuario_inclusao,
    u.CODGRUPO AS cod_grupo_usuario,
    g.NOMEGRUPO AS grupo_usuario,

    -- Parceiro
    c.CODPARC,
    p.NOMEPARC AS nome_parceiro,
    p.TIPPESSOA,

    -- Centro de Custo
    c.CODCENCUS,
    cc.DESCRCENCUS AS centro_custo,

    -- Quantidades e Valores
    CASE WHEN i.ATUALESTOQUE < 0 THEN -i.QTDNEG ELSE i.QTDNEG END AS qtd_mov,
    CASE WHEN i.ATUALESTOQUE < 0 THEN -i.VLRTOT ELSE i.VLRTOT END AS valor_mov,

    c.OBSERVACAO

FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
LEFT JOIN TSIGRU g ON g.CODGRUPO = u.CODGRUPO
LEFT JOIN TGFPAR p ON p.CODPARC = c.CODPARC
LEFT JOIN TSICUS cc ON cc.CODCENCUS = c.CODCENCUS

WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND i.ATUALESTOQUE <> 0
  AND i.RESERVA = 'N'
  AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '2025-12-01' AND '2025-12-31 23:59:59'

ORDER BY data_mov ASC, c.NUNOTA ASC;


-- ============================================================
-- 2. RESUMO POR GRUPO DE USUÁRIO (quem incluiu a nota)
-- ============================================================
SELECT
    g.CODGRUPO,
    COALESCE(g.NOMEGRUPO, 'SEM GRUPO') AS grupo_usuario,
    COUNT(DISTINCT c.NUNOTA) AS qtd_notas,
    SUM(ABS(i.QTDNEG)) AS qtd_total,
    SUM(ABS(i.VLRTOT)) AS valor_total

FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TSIUSU u ON u.CODUSU = c.CODUSUINC
LEFT JOIN TSIGRU g ON g.CODGRUPO = u.CODGRUPO

WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND i.ATUALESTOQUE < 0
  AND i.RESERVA = 'N'
  AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '2025-12-01' AND '2025-12-31 23:59:59'

GROUP BY g.CODGRUPO, g.NOMEGRUPO
ORDER BY qtd_total DESC;


-- ============================================================
-- 3. RESUMO POR CENTRO DE CUSTO
-- ============================================================
SELECT
    c.CODCENCUS,
    COALESCE(cc.DESCRCENCUS, 'SEM CENTRO CUSTO') AS centro_custo,
    COUNT(DISTINCT c.NUNOTA) AS qtd_notas,
    SUM(ABS(i.QTDNEG)) AS qtd_total,
    SUM(ABS(i.VLRTOT)) AS valor_total

FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TSICUS cc ON cc.CODCENCUS = c.CODCENCUS

WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND i.ATUALESTOQUE < 0
  AND i.RESERVA = 'N'
  AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '2025-12-01' AND '2025-12-31 23:59:59'

GROUP BY c.CODCENCUS, cc.DESCRCENCUS
ORDER BY qtd_total DESC;


-- ============================================================
-- 4. RESUMO POR PARCEIRO (se aplicável)
-- ============================================================
SELECT
    c.CODPARC,
    COALESCE(p.NOMEPARC, 'SEM PARCEIRO') AS parceiro,
    p.TIPPESSOA,
    COUNT(DISTINCT c.NUNOTA) AS qtd_notas,
    SUM(ABS(i.QTDNEG)) AS qtd_total,
    SUM(ABS(i.VLRTOT)) AS valor_total

FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
LEFT JOIN TGFPAR p ON p.CODPARC = c.CODPARC

WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND i.ATUALESTOQUE < 0
  AND i.RESERVA = 'N'
  AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '2025-12-01' AND '2025-12-31 23:59:59'

GROUP BY c.CODPARC, p.NOMEPARC, p.TIPPESSOA
ORDER BY qtd_total DESC;


-- ============================================================
-- 5. VERIFICAR SE EXISTEM OUTROS CAMPOS DE SETOR/DEPARTAMENTO
-- ============================================================
-- Verificar se TGFCAB tem campo de departamento ou área
SELECT TOP 5 *
FROM TGFCAB c
JOIN TGFITE i ON i.NUNOTA = c.NUNOTA
WHERE i.CODPROD = 3680
  AND c.STATUSNOTA = 'L'
  AND i.ATUALESTOQUE < 0
  AND COALESCE(c.DTENTSAI, c.DTNEG) BETWEEN '2025-12-01' AND '2025-12-31 23:59:59';
