-- ==================================================================
-- SQL refatorada: Compras pendentes (versão refatorada)
-- Arquivo criado a partir de: docs/sqls/compras-pendentes.sql
-- Objetivo: reduzir repetição de lógica (diasLimite / dhLimiteCalc / CONTROLE_DIAS)
--           e tornar mais legível usando CTEs e uma tabela de mapeamento de prioridades.
-- Observações para execução em SQL Server:
--  - Se [SANKHYA].[STP_GET_CODUSULOGADO]() for uma função escalar, a chamada abaixo funciona.
--  - Se for uma stored procedure, substitua pela forma adequada para obter o usuário logado.
-- ==================================================================

WITH
-- Mapa simples de prioridades para evitar repetir CASEs
priority_map AS (
  SELECT 0 AS prio, 1 AS days UNION ALL
  SELECT 1, 3 UNION ALL
  SELECT 2, 5 UNION ALL
  SELECT 3, 10 UNION ALL
  SELECT 4, 30
),
-- Usuário logado (duas formas encontradas no projeto original)
logged AS (
  SELECT
    (SELECT [SANKHYA].[STP_GET_CODUSULOGADO]()) AS logged_user_1,
    (SELECT CODUSU FROM [SANKHYA].[TSIULG] WHERE SPID = @@SPID) AS logged_user_2
),
-- Base de joins (mesma lógica de joins do SQL original)
base AS (
  SELECT
    CAB.NUNOTA,
    PRO.DESCRPROD,
    ITE.CONTROLE,
    CAB.OBSERVACAO,
    CAB.AD_PRIORIDADE,
    CAB.DTNEG,
    LIB.DHLIB,
    CAB.CODVEICULO,
    VEI.PLACA,
    USU.NOMEUSU,
    CAB.AD_DTLIMITE,
    CAB.DTALTER,
    CAB.CODUSU,
    CAB.CODPARC,
    CAB.CODVEND,
    CAB.NUMCOTACAO,
    ITE.CODPROD,
    (QTDNEG - QTDENTREGUE) AS QTD_PEND
  FROM [SANKHYA].[TGFCAB] CAB
    JOIN [SANKHYA].[TGFITE] ITE ON ITE.NUNOTA = CAB.NUNOTA
    JOIN [SANKHYA].[TGFPRO] PRO ON PRO.CODPROD = ITE.CODPROD
    JOIN [SANKHYA].[TGFVEI] VEI ON VEI.CODVEICULO = CAB.CODVEICULO
    JOIN [SANKHYA].[TSIUSU] USU ON USU.CODUSU = COALESCE(CAB.CODUSUINC, CAB.CODUSU)
    JOIN [SANKHYA].[TSILIB] LIB ON LIB.NUCHAVE = CAB.NUNOTA
    LEFT JOIN [SANKHYA].[TGFEST] E ON E.CODPROD = ITE.CODPROD AND E.CONTROLE = ITE.CONTROLE
    JOIN [SANKHYA].[TGFPAR] PAR ON PAR.CODPARC = CAB.CODPARC
    LEFT JOIN [SANKHYA].[TGFVEN] VEN ON VEN.CODVEND = CAB.CODVEND
    LEFT JOIN [SANKHYA].[TGFCOT] COT ON COT.NUMCOTACAO = CAB.NUMCOTACAO
    LEFT JOIN [SANKHYA].[TGFCAB] REQ ON REQ.NUNOTA = (CASE WHEN CAB.NUMCOTACAO IS NOT NULL THEN COT.NUNOTAORIG ELSE CAB.AD_NUNOTAREQORIG END)
    LEFT JOIN [SANKHYA].[TSIUSU] USUREQ ON USUREQ.CODUSU = REQ.CODUSUINC
  WHERE (QTDNEG - QTDENTREGUE) > 0
    AND CAB.TIPMOV = 'Q'
    AND CAB.STATUSNOTA = 'L'
    AND CAB.CODTIPOPER IN (502,504,506,507)
    AND CAB.NUMCOTACAO IS NULL
    AND CAB.NUREM IS NULL
    AND ITE.CODPROD NOT IN (5568,6689,8076)
),
-- Cálculos derivados centralizados (usa priority_map para obter diasLimite)
calc AS (
  SELECT
    b.*,
    ISNULL(pm.days, 0) AS diasLimite,
    DATEADD(DAY, ISNULL(pm.days, 0), b.DHLIB) AS dhLimiteCalc,
    DATEDIFF(day, GETDATE(), DATEADD(DAY, ISNULL(pm.days, 0), b.DHLIB)) AS CONTROLE_DIAS
  FROM base b
  LEFT JOIN priority_map pm ON pm.prio = b.AD_PRIORIDADE
)

SELECT
  -- logged users
  l.logged_user_1,
  l.logged_user_2,

  -- campos principais
  c.NUNOTA,
  c.DESCRPROD,
  c.CONTROLE,
  c.OBSERVACAO,
  c.AD_PRIORIDADE,

  -- datas formatadas e calculadas
  CONVERT(VARCHAR, c.DTNEG, 103) AS DTNEG2,
  c.DHLIB,
  c.diasLimite,
  c.dhLimiteCalc,

  -- aplicação e usuário
  CASE WHEN c.CODVEICULO = 0 THEN 'Uso e Consumo' ELSE c.PLACA END AS APLICACAO,
  c.NOMEUSU,
  CONVERT(VARCHAR, c.AD_DTLIMITE, 103) AS DTLIMITE,

  -- prioridade textual (preserva comportamento original)
  CASE
    WHEN c.AD_PRIORIDADE = 4 AND DATEDIFF(day, GETDATE(), c.AD_DTLIMITE) <= 1 THEN 'PROGRAMADA URGENTE'
    ELSE CASE c.AD_PRIORIDADE
      WHEN 0 THEN 'EMERGÊNCIA'
      WHEN 1 THEN 'MUITO URGENTE'
      WHEN 2 THEN 'URGENTE'
      WHEN 3 THEN 'POUCO URGENTE'
      WHEN 4 THEN 'PROGRAMADA'
    END
  END AS PRIORIDADE,

  -- texto do prazo (mantido conforme implementação original)
  CASE WHEN c.AD_PRIORIDADE IS NOT NULL THEN CONCAT(
    CASE c.AD_PRIORIDADE WHEN 0 THEN 0 WHEN 1 THEN 1 WHEN 2 THEN 2 WHEN 3 THEN 5 WHEN 4 THEN 7 END,
    ' Dia(s)', CASE c.AD_PRIORIDADE WHEN 4 THEN ' ou +' END)
  ELSE NULL END AS PRAZO,

  -- controle de dias
  c.CONTROLE_DIAS,

  -- cores (BKCOLOR/FGCOLOR) usando CONTROLE_DIAS calculado (evitando reexecutar DATEADD/DATEDIFF repetidas vezes)
  CASE
    WHEN c.CONTROLE_DIAS < 0 AND c.DTALTER > '2010-01-01' THEN '#000000'
    WHEN c.CONTROLE_DIAS <= 1 AND c.DTALTER > '2010-01-01' THEN '#FF0000'
    WHEN c.CONTROLE_DIAS <= 2 AND c.CONTROLE_DIAS > 1 AND c.DTALTER > '2010-01-01' THEN '#e67e22'
    WHEN c.CONTROLE_DIAS <= 5 AND c.CONTROLE_DIAS > 2 AND c.DTALTER > '2010-01-01' THEN '#2874a6'
    WHEN c.CONTROLE_DIAS <= 7 AND c.CONTROLE_DIAS > 5 AND c.DTALTER > '2010-01-01' THEN '#b3b6b7'
    WHEN c.OBSERVACAO LIKE '%FILIPE%' OR c.OBSERVACAO LIKE '%WILSON%' OR c.OBSERVACAO LIKE '%CANDIDA%' OR c.OBSERVACAO LIKE '%NATALIA%' THEN '#e000ff'
  END AS BKCOLOR,

  CASE
    WHEN c.CONTROLE_DIAS <= 1 AND c.DTALTER > '2010-01-01' THEN '#FFFFFF'
    WHEN c.CONTROLE_DIAS <= 2 AND c.CONTROLE_DIAS > 1 AND c.DTALTER > '2010-01-01' THEN '#FFFFFF'
    WHEN c.CONTROLE_DIAS <= 5 AND c.CONTROLE_DIAS > 2 AND c.DTALTER > '2010-01-01' THEN '#FFFFFF'
    WHEN c.CONTROLE_DIAS <= 7 AND c.CONTROLE_DIAS > 5 AND c.DTALTER > '2010-01-01' THEN '#FFFFFF'
    WHEN c.OBSERVACAO LIKE '%FILIPE%' OR c.OBSERVACAO LIKE '%WILSON%' OR c.OBSERVACAO LIKE '%CANDIDA%' OR c.OBSERVACAO LIKE '%NATALIA%' THEN '#ffffff'
  END AS FGCOLOR

FROM calc c
  CROSS JOIN logged l

-- Mantemos a mesma lógica especial para o filtro de usuário (não mostrar para comprador 308 em certas condições)
WHERE (
    (SELECT CODUSU FROM [SANKHYA].[TSIULG] WHERE SPID = @@SPID) NOT IN (309)
    OR c.CODUSU <> 308
    OR (SELECT CODUSU FROM [SANKHYA].[TSIULG] WHERE SPID = @@SPID) IS NULL
)

ORDER BY c.CONTROLE_DIAS ASC, c.AD_PRIORIDADE, c.NUNOTA;

-- ==================================================================
-- Notas de refatoração:
-- 1) Ao invés de repetir o CASE/DATEADD/DATEDIFF, a lógica central foi movida para a CTE 'calc' (mais legível e mais fácil
--    de testar/ajustar). Se houver problemas de performance, experimente transformar a CTE em tabela temporária indexada.
-- 2) Se quiser testar incrementalmente, executar apenas o CTE 'base' com TOP 100 para validar joins e dados antes de
--    executar toda a query.
-- 3) Verificar se [SANKHYA].[STP_GET_CODUSULOGADO]() funciona no SQL Server sem FROM DUAL (remover "FROM DUAL" usado em Oracle).
-- ==================================================================
