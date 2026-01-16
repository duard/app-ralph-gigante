/**
 * Queries SQL para Ordens de Serviço de Manutenção (TCFOSCAB)
 *
 * IMPORTANTE: A API Sankhya NÃO suporta parâmetros nomeados (@param).
 * Use as funções build*Query() para interpolar valores diretamente nas queries.
 */

// ========================================
// LISTAGEM E BUSCA
// ========================================

// Query principal SEM subqueries (API Sankhya não suporta bem subqueries no SELECT)
export const FIND_ALL_OS_QUERY = `
  SELECT
    cab.NUOS,
    cab.DTABERTURA,
    cab.DATAINI,
    cab.DATAFIN,
    cab.PREVISAO,
    cab.STATUS,
    cab.TIPO,
    cab.MANUTENCAO,
    cab.CODVEICULO,
    cab.CODPARC,
    cab.CODUSUINC,
    cab.CODUSU,
    cab.CODUSUFINALIZA,
    cab.KM,
    cab.HORIMETRO,
    cab.CODCENCUS,

    -- Joins
    v.PLACA,
    v.MARCAMODELO AS VEICULO_NOME,
    v.AD_TIPOEQPTO AS VEICULO_TIPO,
    p.RAZAOSOCIAL AS PARCEIRO_NOME,
    uInc.NOMEUSU AS USUARIO_INCLUSAO,
    uResp.NOMEUSU AS USUARIO_RESPONSAVEL,
    uFin.NOMEUSU AS USUARIO_FINALIZACAO

  FROM TCFOSCAB cab WITH(NOLOCK)
  LEFT JOIN TGFVEI v WITH(NOLOCK) ON v.CODVEICULO = cab.CODVEICULO
  LEFT JOIN TGFPAR p WITH(NOLOCK) ON p.CODPARC = cab.CODPARC
  LEFT JOIN TSIUSU uInc WITH(NOLOCK) ON uInc.CODUSU = cab.CODUSUINC
  LEFT JOIN TSIUSU uResp WITH(NOLOCK) ON uResp.CODUSU = cab.CODUSU
  LEFT JOIN TSIUSU uFin WITH(NOLOCK) ON uFin.CODUSU = cab.CODUSUFINALIZA
`;

// Query para buscar contadores de serviços para UMA OS
export function buildServicosCountQuerySingle(nuos: number): string {
  return `
    SELECT
      COUNT(*) AS TOTAL,
      SUM(CASE WHEN s.STATUS = 'F' THEN 1 ELSE 0 END) AS FINALIZADOS
    FROM TCFSERVOS s WITH(NOLOCK)
    WHERE s.NUOS = ${nuos}
  `
}


// ========================================
// BUSCAR OS POR ID
// ========================================

export function buildFindByIdQuery(nuos: number): string {
  return `
  SELECT
    cab.NUOS,
    cab.DTABERTURA,
    cab.DATAINI,
    cab.DATAFIN,
    cab.PREVISAO,
    cab.STATUS,
    cab.TIPO,
    cab.MANUTENCAO,
    cab.CODVEICULO,
    cab.CODPARC,
    cab.CODUSUINC,
    cab.CODUSU,
    cab.CODUSUFINALIZA,
    cab.KM,
    cab.HORIMETRO,
    cab.CODCENCUS,

    -- Veículo
    v.PLACA,
    v.MARCAMODELO AS VEICULO_NOME,

    -- Parceiro
    p.CODPARC AS PARCEIRO_COD,
    p.RAZAOSOCIAL AS PARCEIRO_NOME,

    -- Usuários
    uInc.CODUSU AS COD_USUARIO_INC,
    uInc.NOMEUSU AS USUARIO_INCLUSAO,
    uResp.CODUSU AS COD_USUARIO_RESP,
    uResp.NOMEUSU AS USUARIO_RESPONSAVEL,
    uFin.CODUSU AS COD_USUARIO_FIN,
    uFin.NOMEUSU AS USUARIO_FINALIZACAO

  FROM TCFOSCAB cab WITH(NOLOCK)
  LEFT JOIN TGFVEI v WITH(NOLOCK) ON v.CODVEICULO = cab.CODVEICULO
  LEFT JOIN TGFPAR p WITH(NOLOCK) ON p.CODPARC = cab.CODPARC
  LEFT JOIN TSIUSU uInc WITH(NOLOCK) ON uInc.CODUSU = cab.CODUSUINC
  LEFT JOIN TSIUSU uResp WITH(NOLOCK) ON uResp.CODUSU = cab.CODUSU
  LEFT JOIN TSIUSU uFin WITH(NOLOCK) ON uFin.CODUSU = cab.CODUSUFINALIZA
  WHERE cab.NUOS = ${nuos}`;
}

// ========================================
// SERVIÇOS DA OS
// ========================================

export function buildFindServicosQuery(nuos: number): string {
  return `
  SELECT
    s.NUOS,
    s.SEQUENCIA,
    s.CODPROD,
    s.QTD,
    s.VLRUNIT,
    s.VLRTOT,
    s.DATAINI,
    s.DATAFIN,
    s.TEMPO,
    s.STATUS,
    s.OBSERVACAO,

    -- Produto
    p.DESCRPROD,
    p.REFERENCIA,
    p.CODVOL,

    -- Apontamentos deste serviço
    (SELECT COUNT(*) FROM TCFSERVOSATO a
     WHERE a.NUOS = s.NUOS AND a.SEQUENCIA = s.SEQUENCIA) AS QTD_APONTAMENTOS,

    -- Tempo total apontado (em minutos)
    (SELECT SUM(DATEDIFF(MINUTE, a.DHINI, a.DHFIN))
     FROM TCFSERVOSATO a
     WHERE a.NUOS = s.NUOS AND a.SEQUENCIA = s.SEQUENCIA
     AND a.DHINI IS NOT NULL AND a.DHFIN IS NOT NULL) AS TEMPO_TOTAL_MINUTOS

  FROM TCFSERVOS s WITH(NOLOCK)
  LEFT JOIN TGFPRO p WITH(NOLOCK) ON p.CODPROD = s.CODPROD
  WHERE s.NUOS = ${nuos}
  ORDER BY s.SEQUENCIA`;
}

// ========================================
// APONTAMENTOS DE TEMPO
// ========================================

export function buildFindApontamentosQuery(nuos: number): string {
  return `
  SELECT
    a.NUOS,
    a.ID,
    a.SEQUENCIA,
    a.CODEXEC,
    a.DHINI,
    a.DHFIN,
    a.INTERVALO,
    a.STATUS,
    a.DHAPONT,

    -- Executor
    u.NOMEUSU AS EXECUTOR_NOME,

    -- Cálculos de tempo
    DATEDIFF(MINUTE, a.DHINI, a.DHFIN) AS MINUTOS_TRABALHADOS,

    -- Intervalo em minutos
    CAST(
      CASE
        WHEN a.INTERVALO IS NULL THEN 0
        WHEN a.INTERVALO >= 100 AND (a.INTERVALO % 100) < 60
          THEN (a.INTERVALO / 100) * 60 + (a.INTERVALO % 100)
        ELSE a.INTERVALO
      END
    AS INT) AS INTERVALO_MINUTOS,

    -- Minutos líquidos
    DATEDIFF(MINUTE, a.DHINI, a.DHFIN) - CAST(
      CASE
        WHEN a.INTERVALO IS NULL THEN 0
        WHEN a.INTERVALO >= 100 AND (a.INTERVALO % 100) < 60
          THEN (a.INTERVALO / 100) * 60 + (a.INTERVALO % 100)
        ELSE a.INTERVALO
      END
    AS INT) AS MINUTOS_LIQUIDOS,

    -- Serviço relacionado
    s.CODPROD AS SERVICO_CODPROD,
    p.DESCRPROD AS SERVICO_DESCRICAO

  FROM TCFSERVOSATO a WITH(NOLOCK)
  LEFT JOIN TSIUSU u WITH(NOLOCK) ON u.CODUSU = a.CODEXEC
  LEFT JOIN TCFSERVOS s WITH(NOLOCK) ON s.NUOS = a.NUOS AND s.SEQUENCIA = a.SEQUENCIA
  LEFT JOIN TGFPRO p WITH(NOLOCK) ON p.CODPROD = s.CODPROD
  WHERE a.NUOS = ${nuos}
    AND a.DHINI IS NOT NULL
    AND a.DHFIN IS NOT NULL
  ORDER BY a.SEQUENCIA, a.DHINI`;
}

// ========================================
// PRODUTOS/PEÇAS UTILIZADOS
// ========================================

export function buildFindProdutosQuery(nuos: number): string {
  return `
  SELECT
    pr.NUOS,
    pr.SEQUENCIA,
    pr.CODPROD,
    pr.CODLOCAL,
    pr.CODVOL,
    pr.CONTROLE,
    pr.QTDNEG,
    pr.VLRUNIT,
    pr.VLRTOT,
    pr.OBSERVACAO,

    -- Produto
    p.DESCRPROD,
    p.REFERENCIA,
    p.MARCA,
    p.CODGRUPOPROD,
    g.DESCRGRUPOPROD,

    -- Local de estoque
    l.DESCRLOCAL

  FROM TCFPRODOS pr WITH(NOLOCK)
  LEFT JOIN TGFPRO p WITH(NOLOCK) ON p.CODPROD = pr.CODPROD
  LEFT JOIN TGFGRU g WITH(NOLOCK) ON g.CODGRUPOPROD = p.CODGRUPOPROD
  LEFT JOIN TGFLOC l WITH(NOLOCK) ON l.CODLOCAL = pr.CODLOCAL
  WHERE pr.NUOS = ${nuos}
  ORDER BY pr.SEQUENCIA`;
}

// ========================================
// ESTATÍSTICAS E DASHBOARDS
// ========================================

export function buildEstatisticasGeralQuery(dataInicio: string, dataFim: string): string {
  return `
  SELECT
    COUNT(*) AS TOTAL_OS,
    SUM(CASE WHEN STATUS = 'F' THEN 1 ELSE 0 END) AS FINALIZADAS,
    SUM(CASE WHEN STATUS = 'E' THEN 1 ELSE 0 END) AS EM_EXECUCAO,
    SUM(CASE WHEN STATUS = 'A' THEN 1 ELSE 0 END) AS ABERTAS,
    SUM(CASE WHEN STATUS = 'R' THEN 1 ELSE 0 END) AS REABERTAS,

    -- Por tipo de manutenção
    SUM(CASE WHEN MANUTENCAO = 'P' THEN 1 ELSE 0 END) AS PREVENTIVAS,
    SUM(CASE WHEN MANUTENCAO = 'C' THEN 1 ELSE 0 END) AS CORRETIVAS,
    SUM(CASE WHEN MANUTENCAO = 'O' THEN 1 ELSE 0 END) AS OUTRAS,

    -- Atrasadas
    SUM(CASE
      WHEN STATUS IN ('A','E') AND DATAFIN IS NULL AND PREVISAO < GETDATE()
      THEN 1 ELSE 0
    END) AS ATRASADAS,

    -- Tempos médios
    AVG(DATEDIFF(DAY, DATAINI, ISNULL(DATAFIN, GETDATE()))) AS MEDIA_DIAS_MANUTENCAO,
    AVG(CASE
      WHEN DATAFIN IS NOT NULL
      THEN DATEDIFF(DAY, DATAINI, DATAFIN)
    END) AS MEDIA_DIAS_FINALIZADAS,

    -- Totais
    COUNT(DISTINCT CODVEICULO) AS TOTAL_VEICULOS,
    COUNT(DISTINCT CODUSU) AS TOTAL_RESPONSAVEIS

  FROM TCFOSCAB WITH(NOLOCK)
  WHERE DTABERTURA >= '${dataInicio}'
    AND DTABERTURA <= '${dataFim}'`;
}

export const GET_OS_ATIVAS_RESUMO_QUERY = `
  SELECT
    cab.NUOS,
    cab.CODVEICULO,
    v.PLACA,
    v.MARCAMODELO AS VEICULO,
    cab.STATUS,
    cab.MANUTENCAO,
    cab.DATAINI,
    cab.PREVISAO,
    DATEDIFF(DAY, cab.DATAINI, GETDATE()) AS DIAS_EM_MANUTENCAO,

    -- Situação
    CASE
      WHEN cab.PREVISAO < GETDATE() THEN 'ATRASADA'
      WHEN cab.PREVISAO < DATEADD(DAY, 2, GETDATE()) THEN 'PROXIMA_VENCIMENTO'
      ELSE 'NO_PRAZO'
    END AS SITUACAO,

    -- Contadores
    (SELECT COUNT(*) FROM TCFSERVOS s WHERE s.NUOS = cab.NUOS) AS QTD_SERVICOS,
    (SELECT COUNT(*) FROM TCFSERVOS s WHERE s.NUOS = cab.NUOS AND s.STATUS = 'F') AS SERVICOS_CONCLUIDOS,
    (SELECT COUNT(*) FROM TCFSERVOS s WHERE s.NUOS = cab.NUOS AND s.STATUS = 'E') AS SERVICOS_EM_ANDAMENTO,

    -- Próximo serviço
    (SELECT TOP 1 p.DESCRPROD
     FROM TCFSERVOS s
     LEFT JOIN TGFPRO p ON p.CODPROD = s.CODPROD
     WHERE s.NUOS = cab.NUOS AND s.STATUS IN ('A','E')
     ORDER BY s.SEQUENCIA) AS PROXIMO_SERVICO

  FROM TCFOSCAB cab WITH(NOLOCK)
  LEFT JOIN TGFVEI v WITH(NOLOCK) ON v.CODVEICULO = cab.CODVEICULO
  WHERE cab.STATUS IN ('A', 'E')
    AND cab.DATAFIN IS NULL
  ORDER BY
    CASE
      WHEN cab.PREVISAO < GETDATE() THEN 1
      WHEN cab.PREVISAO < DATEADD(DAY, 2, GETDATE()) THEN 2
      ELSE 3
    END,
    cab.PREVISAO
`;

export function buildProdutividadeExecutoresQuery(dataInicio: string, dataFim: string): string {
  return `
  SELECT
    a.CODEXEC,
    u.NOMEUSU AS EXECUTOR_NOME,

    COUNT(DISTINCT a.NUOS) AS TOTAL_OS,
    COUNT(DISTINCT a.ID) AS TOTAL_APONTAMENTOS,

    -- Tempo total trabalhado
    SUM(DATEDIFF(MINUTE, a.DHINI, a.DHFIN)) AS TOTAL_MINUTOS_BRUTOS,
    SUM(DATEDIFF(MINUTE, a.DHINI, a.DHFIN)) / 60.0 AS TOTAL_HORAS_BRUTAS,

    -- Tempo líquido
    SUM(
      DATEDIFF(MINUTE, a.DHINI, a.DHFIN) -
      CAST(
        CASE
          WHEN a.INTERVALO IS NULL THEN 0
          WHEN a.INTERVALO >= 100 AND (a.INTERVALO % 100) < 60
            THEN (a.INTERVALO / 100) * 60 + (a.INTERVALO % 100)
          ELSE a.INTERVALO
        END AS INT)
    ) AS TOTAL_MINUTOS_LIQUIDOS,

    SUM(
      DATEDIFF(MINUTE, a.DHINI, a.DHFIN) -
      CAST(
        CASE
          WHEN a.INTERVALO IS NULL THEN 0
          WHEN a.INTERVALO >= 100 AND (a.INTERVALO % 100) < 60
            THEN (a.INTERVALO / 100) * 60 + (a.INTERVALO % 100)
          ELSE a.INTERVALO
        END AS INT)
    ) / 60.0 AS TOTAL_HORAS_LIQUIDAS,

    -- Média de minutos por apontamento
    AVG(DATEDIFF(MINUTE, a.DHINI, a.DHFIN)) AS MEDIA_MINUTOS_APONTAMENTO

  FROM TCFSERVOSATO a WITH(NOLOCK)
  LEFT JOIN TSIUSU u WITH(NOLOCK) ON u.CODUSU = a.CODEXEC
  INNER JOIN TCFOSCAB cab WITH(NOLOCK) ON cab.NUOS = a.NUOS
  WHERE a.DHINI >= '${dataInicio}'
    AND a.DHINI <= '${dataFim}'
    AND a.DHINI IS NOT NULL
    AND a.DHFIN IS NOT NULL
    AND cab.STATUS = 'F'
  GROUP BY a.CODEXEC, u.NOMEUSU
  ORDER BY TOTAL_HORAS_LIQUIDAS DESC`;
}

export function buildProdutosMaisUtilizadosQuery(dataInicio: string, dataFim: string): string {
  return `
  SELECT TOP 20
    pr.CODPROD,
    p.DESCRPROD,
    p.REFERENCIA,
    p.MARCA,
    g.DESCRGRUPOPROD,

    COUNT(DISTINCT pr.NUOS) AS QTD_OS,
    SUM(pr.QTDNEG) AS QTD_TOTAL,
    SUM(pr.VLRTOT) AS VALOR_TOTAL,
    AVG(pr.VLRUNIT) AS VALOR_MEDIO

  FROM TCFPRODOS pr WITH(NOLOCK)
  LEFT JOIN TGFPRO p WITH(NOLOCK) ON p.CODPROD = pr.CODPROD
  LEFT JOIN TGFGRU g WITH(NOLOCK) ON g.CODGRUPOPROD = p.CODGRUPOPROD
  INNER JOIN TCFOSCAB cab WITH(NOLOCK) ON cab.NUOS = pr.NUOS
  WHERE cab.DTABERTURA >= '${dataInicio}'
    AND cab.DTABERTURA <= '${dataFim}'
  GROUP BY pr.CODPROD, p.DESCRPROD, p.REFERENCIA, p.MARCA, g.DESCRGRUPOPROD
  ORDER BY QTD_OS DESC, VALOR_TOTAL DESC`;
}
