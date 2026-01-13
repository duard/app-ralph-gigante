import { Injectable, Logger } from '@nestjs/common'
import { SankhyaApiService } from '../../shared/sankhya-api.service'

/**
 * Filtros comuns para as métricas de dashboard.
 */
export interface DashFilters {
  codemp?: string | number
  coddep?: string | number
  dataInicio?: string
  dataFim?: string
}

/**
 * Serviço robusto para o Dashboard de RH do Sankhya.
 * Implementa métricas de Turnover, Demografia e Gestão baseadas em SQLs de referência.
 */
@Injectable()
export class RhDashboardService {
  private readonly logger = new Logger(RhDashboardService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  /**
   * Helper robusto para formatar cláusulas IN em SQL.
   * Evita "IN ()" que causa erro 500 no banco de dados.
   */
  private formatInClause(column: string, values: any): string {
    if (!values) return ''
    const arr = Array.isArray(values) ? values : [values]
    const filtered = arr.filter(
      (v) => v !== null && v !== undefined && String(v).trim() !== '',
    )
    if (filtered.length === 0) return ''

    // Garante que valores numéricos ou strings sejam tratados adequadamente
    const sanitized = filtered.map((v) =>
      typeof v === 'string' && isNaN(Number(v)) ? `'${v}'` : v,
    )
    return ` AND ${column} IN (${sanitized.join(',')}) `
  }

  /**
   * Obtém estatísticas gerais consolidadas (KPIs principais).
   */
  async obterEstatisticas(filtros: DashFilters): Promise<any> {
    const where = this.construirWhereComum(filtros)
    const dateFilterAdmitidos = filtros.dataInicio
      ? `AND DTADM >= '${filtros.dataInicio}'`
      : 'AND DTADM >= DATEADD(MONTH, -12, GETDATE())'
    const dateFilterDemitidos = filtros.dataInicio
      ? `AND DTDEM >= '${filtros.dataInicio}'`
      : 'AND DTDEM >= DATEADD(MONTH, -12, GETDATE())'
    const dateFilterEndAdm = filtros.dataFim
      ? `AND DTADM <= '${filtros.dataFim}'`
      : ''
    const dateFilterEndDem = filtros.dataFim
      ? `AND DTDEM <= '${filtros.dataFim}'`
      : ''

    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN SITUACAO = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN SITUACAO IN (2, 3, 4, 5, 6, 9) THEN 1 ELSE 0 END) as afastados,
        SUM(CASE WHEN SITUACAO = '0' THEN 1 ELSE 0 END) as demitidos,
        (SELECT COUNT(*) FROM TFPFUN WHERE 1=1 ${dateFilterAdmitidos} ${dateFilterEndAdm} ${this.formatInClause('CODEMP', filtros.codemp)} ${this.formatInClause('CODDEP', filtros.coddep)}) as admitidos_12m,
        (SELECT COUNT(*) FROM TFPFUN WHERE SITUACAO = '0' ${dateFilterDemitidos} ${dateFilterEndDem} ${this.formatInClause('CODEMP', filtros.codemp)} ${this.formatInClause('CODDEP', filtros.coddep)}) as demitidos_12m
      FROM TFPFUN funcionarios
      ${where}
    `
    try {
      const resultado = await this.sankhyaApiService.executeQuery(query, [])
      return resultado[0]
    } catch (error) {
      this.logger.error(
        'Erro em obterEstatisticas:',
        error.message,
        error.response?.data,
      )
      throw error
    }
  }

  /**
   * Obtém a tendência detalhada de Turnover.
   */
  async obterTurnover(filtros: DashFilters): Promise<any[]> {
    const [hires, exits] = await Promise.all([
      this.obterHiresMensais(filtros),
      this.obterExitsMensais(filtros),
    ])

    return this.mesclarDadosMensais(hires, exits)
  }

  private async obterHiresMensais(filtros: DashFilters): Promise<any[]> {
    const empFilter = this.formatInClause('CODEMP', filtros.codemp)
    const depFilter = this.formatInClause('CODDEP', filtros.coddep)
    const dateStart = filtros.dataInicio || '2024-01-01'
    const dateEnd = filtros.dataFim ? `AND DTADM <= '${filtros.dataFim}'` : ''
    const query = `
      SELECT 
        LEFT(CONVERT(VARCHAR, DTADM, 120), 7) as month,
        COUNT(*) as hires
      FROM TFPFUN
      WHERE DTADM >= '${dateStart}' ${dateEnd} ${empFilter} ${depFilter}
      GROUP BY LEFT(CONVERT(VARCHAR, DTADM, 120), 7)
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  private async obterExitsMensais(filtros: DashFilters): Promise<any[]> {
    const empFilter = this.formatInClause('CODEMP', filtros.codemp)
    const depFilter = this.formatInClause('CODDEP', filtros.coddep)
    const dateStart = filtros.dataInicio || '2024-01-01'
    const dateEnd = filtros.dataFim ? `AND DTDEM <= '${filtros.dataFim}'` : ''
    const query = `
      SELECT 
        LEFT(CONVERT(VARCHAR, DTDEM, 120), 7) as month,
        COUNT(*) as exits
      FROM TFPFUN
      WHERE SITUACAO = '0' 
        AND DTDEM IS NOT NULL 
        AND DTDEM >= '${dateStart}'
        ${dateEnd}
        ${empFilter} ${depFilter}
      GROUP BY LEFT(CONVERT(VARCHAR, DTDEM, 120), 7)
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  private mesclarDadosMensais(hires: any[], exits: any[]): any[] {
    const mapa = new Map<
      string,
      { month: string; hires: number; exits: number }
    >()

    hires.forEach((h) => {
      mapa.set(h.month, { month: h.month, hires: h.hires, exits: 0 })
    })

    exits.forEach((e) => {
      const registro = mapa.get(e.month) || {
        month: e.month,
        hires: 0,
        exits: 0,
      }
      registro.exits = e.exits
      mapa.set(e.month, registro)
    })

    return Array.from(mapa.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    )
  }

  /**
   * Obtém a distribuição demográfica (Faixa Etária e Tempo de Casa).
   */
  async obterDemografia(filtros: DashFilters): Promise<any> {
    const where = this.construirWhereComum(
      filtros,
      ' funcionarios.SITUACAO = 1 ',
    )

    const queryFaixaEtaria = `
      SELECT 
        CASE
          WHEN DATEDIFF(YEAR, DTNASC, GETDATE()) < 20 THEN 'Menos de 20'
          WHEN DATEDIFF(YEAR, DTNASC, GETDATE()) BETWEEN 20 AND 29 THEN '20-29'
          WHEN DATEDIFF(YEAR, DTNASC, GETDATE()) BETWEEN 30 AND 39 THEN '30-39'
          WHEN DATEDIFF(YEAR, DTNASC, GETDATE()) BETWEEN 40 AND 49 THEN '40-49'
          ELSE '50+'
        END AS label,
        COUNT(*) AS value
      FROM TFPFUN funcionarios
      ${where}
      GROUP BY 
        CASE
          WHEN DATEDIFF(YEAR, DTNASC, GETDATE()) < 20 THEN 'Menos de 20'
          WHEN DATEDIFF(YEAR, DTNASC, GETDATE()) BETWEEN 20 AND 29 THEN '20-29'
          WHEN DATEDIFF(YEAR, DTNASC, GETDATE()) BETWEEN 30 AND 39 THEN '30-39'
          WHEN DATEDIFF(YEAR, DTNASC, GETDATE()) BETWEEN 40 AND 49 THEN '40-49'
          ELSE '50+'
        END
    `

    const queryTempoCasa = `
      SELECT 
        CASE 
          WHEN DATEDIFF(YEAR, DTADM, GETDATE()) < 1 THEN '0-1 ano'
          WHEN DATEDIFF(YEAR, DTADM, GETDATE()) BETWEEN 1 AND 3 THEN '1-3 anos'
          WHEN DATEDIFF(YEAR, DTADM, GETDATE()) BETWEEN 3 AND 5 THEN '3-5 anos'
          ELSE '5+ anos'
        END AS label,
        COUNT(*) AS value
      FROM TFPFUN funcionarios
      ${where}
      GROUP BY 
        CASE 
          WHEN DATEDIFF(YEAR, DTADM, GETDATE()) < 1 THEN '0-1 ano'
          WHEN DATEDIFF(YEAR, DTADM, GETDATE()) BETWEEN 1 AND 3 THEN '1-3 anos'
          WHEN DATEDIFF(YEAR, DTADM, GETDATE()) BETWEEN 3 AND 5 THEN '3-5 anos'
          ELSE '5+ anos'
        END
    `

    const [faixaEtaria, tempoCasa] = await Promise.all([
      this.sankhyaApiService.executeQuery(queryFaixaEtaria, []),
      this.sankhyaApiService.executeQuery(queryTempoCasa, []),
    ])

    return { faixaEtaria, tempoCasa }
  }

  /**
   * Identifica talentos de alto risco (ex: gestores ou sêniores com alto tempo de casa).
   */
  async obterTalentosRisco(filtros: DashFilters): Promise<any[]> {
    const where = this.construirWhereComum(
      filtros,
      ' funcionarios.SITUACAO = 1 ',
    )
    const query = `
      SELECT TOP 10
        funcionarios.CODFUNC as id,
        funcionarios.NOMEFUNC as name,
        cargo.DESCRCARGO as position,
        empresa.NOMEFANTASIA as company,
        DATEDIFF(YEAR, funcionarios.DTADM, GETDATE()) as years_in_company,
        usuarios.FOTO as photo
      FROM TFPFUN funcionarios
      JOIN TFPCAR cargo ON cargo.CODCARGO = funcionarios.CODCARGO
      JOIN TSIEMP empresa ON empresa.CODEMP = funcionarios.CODEMP
      LEFT JOIN TSIUSU usuarios ON usuarios.CODFUNC = funcionarios.CODFUNC AND usuarios.CODEMP = funcionarios.CODEMP
      ${where}
      ORDER BY funcionarios.DTADM ASC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  /**
   * Obtém resumo das requisições (TFPREQ) com descritivos.
   */
  async obterResumoRequisicoes(filtros: DashFilters): Promise<any[]> {
    const empFilter = this.formatInClause('codemp', filtros.codemp)
    const depFilter = this.formatInClause('coddep', filtros.coddep)
    const dateFilter = filtros.dataInicio
      ? `AND DTCRIACAO >= '${filtros.dataInicio}'`
      : ''
    const dateEndFilter = filtros.dataFim
      ? `AND DTCRIACAO <= '${filtros.dataFim}'`
      : ''

    const query = `
      SELECT 
        STATUS as "status",
        COUNT(*) as "total"
      FROM TFPREQ
      WHERE 1=1 ${empFilter} ${depFilter} ${dateFilter} ${dateEndFilter}
      GROUP BY STATUS
    `
    const rows = await this.sankhyaApiService.executeQuery(query, [])

    const statusMap: Record<number, string> = {
      0: 'Pendente',
      1: 'Em Análise',
      2: 'Concluído',
      3: 'Cancelado',
      [-1]: 'Reprovado',
      [-2]: 'Expirado',
    }

    return rows.map((row) => ({
      status: statusMap[Number(row.status)] || `Outros (${row.status})`,
      total: row.total,
    }))
  }

  /**
   * Obtém as ausências recentes (TFPFAL).
   */
  async obterAusencias(filtros: DashFilters): Promise<any[]> {
    const empFilter = this.formatInClause('f.CODEMP', filtros.codemp)
    const depFilter = this.formatInClause('f.CODDEP', filtros.coddep)
    const dateFilter = filtros.dataInicio
      ? `AND fal.dtfalta >= '${filtros.dataInicio}'`
      : `AND fal.dtfalta >= DATEADD(MONTH, -1, GETDATE())`
    const dateEndFilter = filtros.dataFim
      ? `AND fal.dtfalta <= '${filtros.dataFim}'`
      : ''

    const query = `
      SELECT TOP 50
        f.NOMEFUNC as employee_name,
        emp.NOMEFANTASIA as company_name,
        dep.DESCRDEP as department_name,
        fal.dtfalta as absence_date,
        fal.horas as hours,
        fal.descrhistocor as reason
      FROM TFPFAL fal
      JOIN TFPFUN f ON f.CODFUNC = fal.codfunc AND f.CODEMP = fal.codemp
      JOIN TSIEMP emp ON emp.CODEMP = f.CODEMP
      JOIN TFPDEP dep ON dep.CODDEP = f.CODDEP
      WHERE 1=1 ${dateFilter} ${dateEndFilter} ${empFilter} ${depFilter}
      ORDER BY fal.dtfalta DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  private construirWhereComum(
    filtros: DashFilters,
    condicaoBase: string = '1=1',
  ): string {
    let where = ` WHERE ${condicaoBase} `
    where += this.formatInClause('funcionarios.CODEMP', filtros.codemp)
    where += this.formatInClause('funcionarios.CODDEP', filtros.coddep)
    return where
  }

  /**
   * Monitor detalhado de requisições com SLA (SQL1).
   */
  async obterMonitorRequisicoes(filtros: DashFilters): Promise<any[]> {
    const empFilter = this.formatInClause('REQ.CODEMP', filtros.codemp)
    const depFilter = this.formatInClause('FUN.CODDEP', filtros.coddep)
    const dateStart = filtros.dataInicio
      ? `'${filtros.dataInicio}'`
      : 'DATEADD(DAY, -30, GETDATE())'
    const dateEnd = filtros.dataFim ? `'${filtros.dataFim}'` : 'GETDATE()'

    const query = `
      SELECT 
        REQ.ID,
        REQ.DTCRIACAO,
        CAST(DATEADD(day, 20, req.DTCRIACAO) as date) as DtLimite,
        REQ.STATUS,
        CASE
          WHEN REQ.STATUS = 0 THEN 'AGUARDANDO AÇÃO'
          WHEN REQ.STATUS = 1 THEN 'AGUARDANDO AÇÃO'
          WHEN REQ.STATUS = 2 THEN 'APROVADO'
          WHEN REQ.STATUS = 3 THEN 'REJEITADO'
          WHEN REQ.STATUS = -2 THEN 'CANCELADO'
          ELSE CONCAT(CAST(req.STATUS as nvarchar(4)), ' ', 'STATUS DESCONHECIDO')
        END AS REQ_STATUS,
        CASE
          WHEN REQ.STATUS in (2, 3, -2) THEN 0 
          ELSE DATEDIFF(day, GETDATE(), DATEADD(day, 20, req.DTCRIACAO)) 
        END as DiasRestantes,
        CASE 
          WHEN REQ.ORIGEMTIPO = 'R' THEN 'Rescisão'
          WHEN REQ.ORIGEMTIPO = 'V' THEN 'Férias'
          WHEN REQ.ORIGEMTIPO = 'S' THEN 'Alt. Cargo/Salário'
          WHEN REQ.ORIGEMTIPO = 'G' THEN 'Alt. Carga Horária'
          WHEN REQ.ORIGEMTIPO = 'D' THEN '13º Salário'
          WHEN REQ.ORIGEMTIPO = 'E' THEN 'Alt. Endereço'
          WHEN REQ.ORIGEMTIPO = 'T' THEN 'Transferência'
          WHEN REQ.ORIGEMTIPO = 'C' THEN 'Alt. Cadastral'
          WHEN REQ.ORIGEMTIPO = 'F' THEN 'Afastamento'
          ELSE CONCAT(REQ.ORIGEMTIPO, ' - ', 'Outros')
        END AS ORIGEM_TIPO,
        emp.NOMEFANTASIA as Empresa,
        FUN.NOMEFUNC as Funcionario,
        CAR.DESCRCARGO as Cargo,
        USU.NOMEUSU as Solicitante,
        REQ.OBSERVACAO,
        CASE
          WHEN REQ.STATUS in (2, 3 ,-2) THEN '#FFFFFF'
          WHEN DATEDIFF(day, GETDATE(), DATEADD(day, 20, req.DTCRIACAO)) BETWEEN 1 AND 3 THEN '#FFA500'
          WHEN DATEDIFF(day, GETDATE(), DATEADD(day, 20, req.DTCRIACAO)) = 0 THEN '#FF0000'
          WHEN DATEDIFF(day, GETDATE(), DATEADD(day, 20, req.DTCRIACAO)) < 0 THEN '#000000'
          ELSE '#008bff'
        END AS BKCOLOR
      FROM TFPREQ REQ
      JOIN TFPFUN FUN ON FUN.CODFUNC = REQ.CODFUNC AND FUN.CODEMP = REQ.CODEMP
      JOIN TSIUSU USU ON USU.CODUSU = REQ.CODUSU
      JOIN TFPCAR CAR ON CAR.CODCARGO = FUN.CODCARGO
      JOIN TSIEMP emp on emp.CODEMP = req.CODEMP
      WHERE REQ.id > 0 
        AND REQ.DTCRIACAO BETWEEN ${dateStart} AND ${dateEnd}
        ${empFilter} ${depFilter}
      ORDER BY REQ.DTCRIACAO DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  /**
   * Monitor de processamento de folha e rescisões (SQL2).
   */
  async obterMonitorFolha(filtros: DashFilters): Promise<any[]> {
    const empFilter = this.formatInClause('BAS.CODEMP', filtros.codemp)
    const depFilter = this.formatInClause('FUN.CODDEP', filtros.coddep)
    const dateStart = filtros.dataInicio
      ? `'${filtros.dataInicio}'`
      : 'DATEADD(DAY, -30, GETDATE())'
    const dateEnd = filtros.dataFim ? `'${filtros.dataFim}'` : 'GETDATE()'

    const query = `
      SELECT 
        CASE
          WHEN BAS.TIPFOLHA = 'R' THEN 'Rescisão'
          WHEN BAS.TIPFOLHA = 'A' THEN 'Adiantamento'
          WHEN BAS.TIPFOLHA = 'D' THEN 'Décimo Terceiro'
          WHEN BAS.TIPFOLHA = 'N' THEN 'Pagamento Salário'
          WHEN BAS.TIPFOLHA = 'F' THEN 'Férias'
          ELSE 'Outro'
        END AS TIPFOLHA_DESC,
        emp.NOMEFANTASIA AS Empresa,
        FUN.NOMEFUNC as Funcionario,
        CAR.DESCRCARGO as Cargo,
        BAS.SALBRUTO as SalBruto,
        BAS.SALLIQ as SalLiquido,
        CASE
          WHEN BAS.STATUS = 1 THEN 'Fechada'
          WHEN BAS.STATUS = 4 THEN 'Conferida'
          WHEN BAS.STATUS = 5 THEN 'Integrada'
          ELSE 'Pendente'
        END AS STATUS_DESC,
        BAS.DTPAGAMENTO as DataPagamento,
        USU.NOMEUSU as Solicitante
      FROM TFPBAS BAS
      JOIN TFPFUN FUN ON FUN.CODFUNC = BAS.CODFUNC AND FUN.CODEMP = BAS.CODEMP
      JOIN TSIUSU USU ON USU.CODUSU = BAS.CODUSU
      JOIN TFPCAR CAR ON CAR.CODCARGO = FUN.CODCARGO
      JOIN TSIEMP emp ON emp.CODEMP = BAS.CODEMP
      WHERE BAS.CODUSU > 0
        AND BAS.TIPFOLHA NOT IN ('A','D','N','O')
        AND BAS.DTPAGAMENTO BETWEEN ${dateStart} AND ${dateEnd}
        ${empFilter} ${depFilter}
      ORDER BY BAS.DTPAGAMENTO DESC
    `
    try {
      return await this.sankhyaApiService.executeQuery(query, [])
    } catch (error) {
      this.logger.error(
        'Erro em obterMonitorFolha:',
        error.message,
        (error as any).response?.data || error,
      )
      throw error
    }
  }

  /**
   * Monitor de demografia avançada (Baseado no funcionario1.sql).
   * Retorna contagens por Escolaridade, Estado Civil, Nacionalidade e Sexo.
   */
  async obterDemografiaAvancada(filtros: DashFilters): Promise<any> {
    const empFilter = this.formatInClause('FUN.CODEMP', filtros.codemp)
    const depFilter = this.formatInClause('FUN.CODDEP', filtros.coddep)

    const createQuery = (campo: string, tabela: string = 'TFPFUN') => `
      SELECT 
        OP.OPCAO as label,
        COUNT(*) as value
      FROM TFPFUN FUN
      LEFT JOIN TDDCAM CAM ON CAM.NOMETAB = '${tabela}' AND CAM.NOMECAMPO = '${campo}'
      LEFT JOIN TDDOPC OP ON OP.NUCAMPO = CAM.NUCAMPO AND OP.VALOR = FUN.${campo}
      WHERE SITUACAO IN (1,2,3,4,5,6,7) AND CODCATEGESOCIAL = 101
        ${empFilter} ${depFilter}
      GROUP BY OP.OPCAO
      ORDER BY value DESC
    `

    const [escolaridade, estadoCivil, nacionalidade, sexo] = await Promise.all([
      this.sankhyaApiService.executeQuery(createQuery('NIVESC'), []),
      this.sankhyaApiService.executeQuery(createQuery('ESTADOCIVIL'), []),
      this.sankhyaApiService.executeQuery(createQuery('NACIONALIDADE'), []),
      this.sankhyaApiService.executeQuery(createQuery('SEXO'), []),
    ])

    return {
      escolaridade,
      estadoCivil,
      nacionalidade,
      sexo,
    }
  }
}
