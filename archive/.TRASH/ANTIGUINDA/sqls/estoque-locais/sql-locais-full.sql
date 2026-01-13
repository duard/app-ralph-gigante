-- SQL: visão detalhada de locais + métricas de estoque
-- Filtra por CODLOCALPAI (ex.: lista provida)
WITH
  parent_list
  AS
  (
    SELECT v.CODLOCALPAI
    FROM (VALUES
        (101010),
        (101012),
        (101014),
        (101016),
        (101018),
        (101020),
        (101022),
        (101024),
        (101025),
        (101027),
        (101029),
        (101002),
        (101004),
        (101006),
        (101008),
        (101009),
        (101011),
        (101013),
        (101015),
        (101017),
        (101019),
        (101021),
        (101023),
        (101026),
        (101028),
        (101001),
        (101003),
        (101005),
        (101007)
  ) v(CODLOCALPAI)
  ),
  -- locais selecionados (filhos da lista de pais)
  loc_candidates
  AS
  (
    SELECT L.*
    FROM [SANKHYA].[TGFLOC] L
      LEFT JOIN parent_list PL ON L.CODLOCALPAI = PL.CODLOCALPAI
    WHERE PL.CODLOCALPAI IS NOT NULL
  ),
  -- CTE recursiva para montar o caminho (trilha) do local até a raiz (pai do pai...)
  loc_path_rec
  AS
  (
    -- nível 0: o próprio local alvo
          SELECT
        L.CODLOCAL AS START_LOCAL,
        L.CODLOCAL,
        L.CODLOCALPAI,
        LTRIM(RTRIM(L.DESCRLOCAL)) AS DESCRLOCAL,
        CAST(LTRIM(RTRIM(L.DESCRLOCAL)) AS VARCHAR(MAX)) AS LOCAL_PATH,
        CAST(CONVERT(VARCHAR(20), L.CODLOCAL) AS VARCHAR(MAX)) AS LOCAL_PATH_CODES,
        0 AS DEPTH
      FROM loc_candidates L

    UNION ALL

      -- sobe um nível (pai) e concatena a descrição antes do path existente
      SELECT
        r.START_LOCAL,
        p.CODLOCAL,
        p.CODLOCALPAI,
        LTRIM(RTRIM(p.DESCRLOCAL)) AS DESCRLOCAL,
        CAST(LTRIM(RTRIM(p.DESCRLOCAL)) + ' > ' + r.LOCAL_PATH AS VARCHAR(MAX)) AS LOCAL_PATH,
        CAST(CONVERT(VARCHAR(20), p.CODLOCAL) + '.' + r.LOCAL_PATH_CODES AS VARCHAR(MAX)) AS LOCAL_PATH_CODES,
        r.DEPTH + 1 AS DEPTH
      FROM loc_path_rec r
        JOIN [SANKHYA].[TGFLOC] p ON p.CODLOCAL = r.CODLOCALPAI
  ),
  -- resumo: pegamos a maior profundidade (root → ... → local) por START_LOCAL
  path_summary
  AS
  (
    SELECT
      START_LOCAL AS CODLOCAL,
      MAX(LOCAL_PATH)    AS LOCAL_PATH,
      MAX(LOCAL_PATH_CODES) AS LOCAL_PATH_CODES,
      MAX(DEPTH) AS DEPTH
    FROM loc_path_rec
    GROUP BY START_LOCAL
  ),
  est_agg
  AS
  (
    SELECT
      E.CODLOCAL,
      COUNT(DISTINCT E.CODPROD)                              AS QTD_PRODUTOS,
      SUM(ISNULL(E.ESTOQUE,0))                               AS TOTAL_ESTOQUE,
      SUM(CASE WHEN ISNULL(E.ESTOQUE,0) > 0 THEN 1 ELSE 0 END) AS QTD_PROD_COM_ESTOQUE_POS,
      SUM(CASE WHEN ISNULL(E.ESTOQUE,0) < 0 THEN 1 ELSE 0 END) AS PROD_COM_ESTOQUE_NEG,
      SUM(CASE WHEN ISNULL(E.ESTOQUE,0) = 0 THEN 1 ELSE 0 END) AS PROD_COM_ESTOQUE_ZERO,
      -- lista resumida dos produtos (COD:DESCR(ESTOQUE)) (compatível com versões antigas do SQL Server)
      STUFF((
        SELECT ', ' + CAST(p2.CODPROD AS VARCHAR(20)) + ':' + LTRIM(RTRIM(LEFT(p2.DESCRPROD,100))) + '(' + CAST(e2.ESTOQUE AS VARCHAR(50)) + ')'
      FROM [SANKHYA].[TGFEST] e2
        JOIN [SANKHYA].[TGFPRO] p2 ON p2.CODPROD = e2.CODPROD
      WHERE e2.CODLOCAL = E.CODLOCAL
      ORDER BY LTRIM(RTRIM(p2.DESCRPROD))
      FOR XML PATH(''), TYPE
      ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS PROD_LIST
    FROM [SANKHYA].[TGFEST] E
      JOIN [SANKHYA].[TGFPRO] P ON P.CODPROD = E.CODPROD
    GROUP BY E.CODLOCAL
  )

SELECT
  L.CODLOCAL,
  LTRIM(RTRIM(L.DESCRLOCAL)) AS DESCRLOCAL,
  L.CODLOCALPAI,
  LTRIM(RTRIM(LP.DESCRLOCAL)) AS PARENT_DESCRLOCAL,
  PS.LOCAL_PATH, -- trilha do local (ex: "Matriz > Almox > ALMOX PECAS > I5-1")
  PS.LOCAL_PATH_CODES,
  PS.DEPTH AS LOCAL_DEPTH,
  L.ATIVO,
  L.ANALITICO,
  L.UTILIZAWMS,
  L.CAPACIDADEPRODUCAO,
  -- métricas de quantidade e lista de produtos com estoque
  ISNULL(EA.QTD_PROD_COM_ESTOQUE_POS,0) AS QTD_PROD_COM_ESTOQUE_POS,
  ISNULL(LTRIM(RTRIM(EA.PROD_LIST)),'') AS PRODUTOS_NO_LOCAL,

  -- métricas agregadas de estoque
  ISNULL(EA.QTD_PRODUTOS,0)          AS QTD_PRODUTOS_NO_LOCAL,
  ISNULL(EA.TOTAL_ESTOQUE,0)         AS TOTAL_ESTOQUE,
  ISNULL(EA.PROD_COM_ESTOQUE_NEG,0)  AS QTD_PROD_COM_ESTOQUE_NEG,
  ISNULL(EA.PROD_COM_ESTOQUE_ZERO,0) AS QTD_PROD_COM_ESTOQUE_ZERO

FROM [SANKHYA].[TGFLOC] L
  LEFT JOIN parent_list PL ON L.CODLOCALPAI = PL.CODLOCALPAI
  LEFT JOIN [SANKHYA].[TGFLOC] LP ON LP.CODLOCAL = L.CODLOCALPAI -- descrição do pai
  LEFT JOIN est_agg EA ON EA.CODLOCAL = L.CODLOCAL
  LEFT JOIN path_summary PS ON PS.CODLOCAL = L.CODLOCAL

WHERE PL.CODLOCALPAI IS NOT NULL
-- filtra somente os pais da lista
-- Opcional: AND L.ATIVO = 'S'
ORDER BY L.CODLOCAL;
