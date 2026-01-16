import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  PaginatedResult,
  buildPaginatedResult,
} from '../../common/pagination/pagination.types'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import { OrdemServicoFindAllDto } from './models/tcfose.dto'
import {
  OrdemServico,
  OrdemServicoDetalhada,
  ItemOrdemServico,
  MovimentacaoOS,
} from './models/tcfose.interface'

@Injectable()
export class TcfoseService {
  private readonly logger = new Logger(TcfoseService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  async findAll(
    dto: OrdemServicoFindAllDto,
  ): Promise<PaginatedResult<OrdemServico>> {
    const whereClauses: string[] = []

    if (dto.status) whereClauses.push(`OS.STATUS = '${dto.status}'`)
    if (dto.codparc) whereClauses.push(`OS.CODPARC = ${dto.codparc}`)
    if (dto.codtec) whereClauses.push(`OS.CODTEC = ${dto.codtec}`)
    if (dto.prioridade) whereClauses.push(`OS.PRIORIDADE = ${dto.prioridade}`)
    if (dto.tipo)
      whereClauses.push(
        `OS.TIPO LIKE '%${dto.tipo.trim().replace(/'/g, "''")}%'`,
      )

    if (dto.dtInicio && dto.dtFim) {
      whereClauses.push(
        `OS.DTABERTURA BETWEEN '${dto.dtInicio}' AND '${dto.dtFim}'`,
      )
    } else if (dto.dtInicio) {
      whereClauses.push(`OS.DTABERTURA >= '${dto.dtInicio}'`)
    } else if (dto.dtFim) {
      whereClauses.push(`OS.DTABERTURA <= '${dto.dtFim}'`)
    }

    if (dto.search) {
      const s = dto.search.trim().replace(/'/g, "''")
      whereClauses.push(
        `(OS.DEFEITO LIKE '%${s}%' OR OS.SOLUCAO LIKE '%${s}%' OR P.NOMEPARC LIKE '%${s}%' OR CAST(OS.NUMOSE AS VARCHAR) LIKE '%${s}%')`,
      )
    }

    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(' AND ')}`
      : ''

    const sort = dto.sort || 'OS.DTABERTURA DESC'
    const perPage = Number(dto.perPage) || 50
    const page = Number(dto.page) || 1
    const offset = (page - 1) * perPage

    const query = `
      SELECT TOP ${perPage + offset}
        OS.NUMOSE,
        OS.CODPARC,
        OS.DTABERTURA,
        OS.DTPREVENTREGA,
        OS.DTENCERRAMENTO,
        OS.STATUS,
        OS.CODEQUIP,
        OS.DEFEITO,
        OS.SOLUCAO,
        OS.OBSERVACAO,
        OS.CODTEC,
        OS.PRIORIDADE,
        OS.TIPO,
        OS.VLRTOTAL,
        OS.CODUSU,
        OS.DTINCLUSAO,
        P.NOMEPARC,
        P.TELEFONE,
        P.EMAIL,
        T.NOMEUSU AS NOME_TECNICO,
        U.NOMEUSU AS NOME_USUARIO,
        E.DESCRICAO AS DESC_EQUIPAMENTO,
        E.MODELO,
        E.NUMSERIE
      FROM TCFOSE OS WITH (NOLOCK)
      LEFT JOIN TGFPAR P WITH (NOLOCK) ON P.CODPARC = OS.CODPARC
      LEFT JOIN TSIUSU T WITH (NOLOCK) ON T.CODUSU = OS.CODTEC
      LEFT JOIN TSIUSU U WITH (NOLOCK) ON U.CODUSU = OS.CODUSU
      LEFT JOIN TCFEQU E WITH (NOLOCK) ON E.CODEQUIP = OS.CODEQUIP
      ${where}
      ORDER BY ${sort}
    `

    const countQuery = `
      SELECT COUNT(*) AS TOTAL
      FROM TCFOSE OS WITH (NOLOCK)
      LEFT JOIN TGFPAR P WITH (NOLOCK) ON P.CODPARC = OS.CODPARC
      ${where}
    `

    try {
      const results = await this.sankhyaApiService.executeQuery(query, [])
      const data = results.slice(offset).map((item: any) => this.mapToEntity(item))

      const [countResult] = await this.sankhyaApiService.executeQuery(
        countQuery,
        [],
      )
      const total = Number(countResult.TOTAL)

      return buildPaginatedResult({ data, total, page, perPage })
    } catch (error) {
      this.logger.error('Erro em findAll:', (error as any)?.message || error)
      throw new InternalServerErrorException(
        'Erro ao buscar ordens de serviço',
      )
    }
  }

  async findById(numose: number): Promise<OrdemServicoDetalhada> {
    const query = `
      SELECT
        OS.NUMOSE,
        OS.CODPARC,
        OS.DTABERTURA,
        OS.DTPREVENTREGA,
        OS.DTENCERRAMENTO,
        OS.STATUS,
        OS.CODEQUIP,
        OS.DEFEITO,
        OS.SOLUCAO,
        OS.OBSERVACAO,
        OS.CODTEC,
        OS.PRIORIDADE,
        OS.TIPO,
        OS.VLRTOTAL,
        OS.CODUSU,
        OS.DTINCLUSAO,
        P.NOMEPARC,
        P.TELEFONE,
        P.EMAIL,
        T.NOMEUSU AS NOME_TECNICO,
        U.NOMEUSU AS NOME_USUARIO,
        E.DESCRICAO AS DESC_EQUIPAMENTO,
        E.MODELO,
        E.NUMSERIE
      FROM TCFOSE OS WITH (NOLOCK)
      LEFT JOIN TGFPAR P WITH (NOLOCK) ON P.CODPARC = OS.CODPARC
      LEFT JOIN TSIUSU T WITH (NOLOCK) ON T.CODUSU = OS.CODTEC
      LEFT JOIN TSIUSU U WITH (NOLOCK) ON U.CODUSU = OS.CODUSU
      LEFT JOIN TCFEQU E WITH (NOLOCK) ON E.CODEQUIP = OS.CODEQUIP
      WHERE OS.NUMOSE = ${numose}
    `

    try {
      const results = await this.sankhyaApiService.executeQuery(query, [])
      if (results.length === 0) {
        throw new NotFoundException(
          `Ordem de serviço ${numose} não encontrada`,
        )
      }

      const os = this.mapToEntity(results[0])

      // Buscar itens
      const itens = await this.getItens(numose)
      // Buscar histórico
      const movimentacoes = await this.getMovimentacoes(numose)

      return {
        ...os,
        itens,
        movimentacoes,
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      this.logger.error('Erro em findById:', (error as any)?.message || error)
      throw new InternalServerErrorException(
        'Erro ao buscar ordem de serviço',
      )
    }
  }

  async getItens(numose: number): Promise<ItemOrdemServico[]> {
    const query = `
      SELECT
        I.NUMOSE,
        I.SEQUENCIA,
        I.CODPROD,
        I.QTDNEG,
        I.VLRUNIT,
        I.VLRTOTAL,
        I.TIPO,
        I.OBSERVACAO,
        P.DESCRPROD,
        P.REFERENCIA,
        P.CODVOL
      FROM TCFITE I WITH (NOLOCK)
      LEFT JOIN TGFPRO P WITH (NOLOCK) ON P.CODPROD = I.CODPROD
      WHERE I.NUMOSE = ${numose}
      ORDER BY I.SEQUENCIA
    `

    try {
      const results = await this.sankhyaApiService.executeQuery(query, [])
      return results.map((item: any) => ({
        numose: Number(item.NUMOSE),
        sequencia: Number(item.SEQUENCIA),
        codprod: Number(item.CODPROD),
        qtdneg: Number(item.QTDNEG),
        vlrunit: Number(item.VLRUNIT),
        vlrtotal: Number(item.VLRTOTAL),
        tipo: item.TIPO,
        observacao: item.OBSERVACAO,
        produto: {
          codprod: Number(item.CODPROD),
          descrprod: item.DESCRPROD,
          referencia: item.REFERENCIA,
          codvol: item.CODVOL,
        },
      }))
    } catch (error) {
      this.logger.error('Erro em getItens:', (error as any)?.message || error)
      return []
    }
  }

  async getMovimentacoes(numose: number): Promise<MovimentacaoOS[]> {
    const query = `
      SELECT
        M.NUMMOV,
        M.NUMOSE,
        M.DTMOV,
        M.CODUSUMOV,
        M.STATUSANT,
        M.STATUSNOVO,
        M.OBSERVACAO,
        U.NOMEUSU
      FROM TCFMOV M WITH (NOLOCK)
      LEFT JOIN TSIUSU U WITH (NOLOCK) ON U.CODUSU = M.CODUSUMOV
      WHERE M.NUMOSE = ${numose}
      ORDER BY M.DTMOV DESC
    `

    try {
      const results = await this.sankhyaApiService.executeQuery(query, [])
      return results.map((item: any) => ({
        nummov: Number(item.NUMMOV),
        numose: Number(item.NUMOSE),
        dtmov: new Date(item.DTMOV),
        codusumov: Number(item.CODUSUMOV),
        statusant: item.STATUSANT,
        statusnovo: item.STATUSNOVO,
        observacao: item.OBSERVACAO,
        usuario: {
          codusu: Number(item.CODUSUMOV),
          nomeusu: item.NOMEUSU,
        },
      }))
    } catch (error) {
      this.logger.error(
        'Erro em getMovimentacoes:',
        (error as any)?.message || error,
      )
      return []
    }
  }

  async getEstatisticas(): Promise<any> {
    const query = `
      SELECT
        COUNT(*) AS TOTAL_OS,
        SUM(CASE WHEN STATUS = 'A' THEN 1 ELSE 0 END) AS ABERTAS,
        SUM(CASE WHEN STATUS = 'E' THEN 1 ELSE 0 END) AS EM_ANDAMENTO,
        SUM(CASE WHEN STATUS = 'C' THEN 1 ELSE 0 END) AS CONCLUIDAS,
        SUM(CASE WHEN STATUS = 'X' THEN 1 ELSE 0 END) AS CANCELADAS,
        SUM(CASE WHEN STATUS = 'P' THEN 1 ELSE 0 END) AS PAUSADAS,
        SUM(CASE WHEN STATUS = 'G' THEN 1 ELSE 0 END) AS AGUARDANDO_PECAS,
        SUM(CASE WHEN PRIORIDADE = 4 THEN 1 ELSE 0 END) AS URGENTES,
        SUM(CASE WHEN PRIORIDADE = 3 THEN 1 ELSE 0 END) AS ALTA_PRIORIDADE,
        ISNULL(SUM(VLRTOTAL), 0) AS VALOR_TOTAL,
        AVG(CASE
          WHEN DTENCERRAMENTO IS NOT NULL
          THEN DATEDIFF(DAY, DTABERTURA, DTENCERRAMENTO)
        END) AS TEMPO_MEDIO_CONCLUSAO_DIAS
      FROM TCFOSE WITH (NOLOCK)
      WHERE DTABERTURA >= DATEADD(MONTH, -3, GETDATE())
    `

    try {
      const [stats] = await this.sankhyaApiService.executeQuery(query, [])
      return {
        totalOS: Number(stats.TOTAL_OS),
        abertas: Number(stats.ABERTAS),
        emAndamento: Number(stats.EM_ANDAMENTO),
        concluidas: Number(stats.CONCLUIDAS),
        canceladas: Number(stats.CANCELADAS),
        pausadas: Number(stats.PAUSADAS),
        aguardandoPecas: Number(stats.AGUARDANDO_PECAS),
        urgentes: Number(stats.URGENTES),
        altaPrioridade: Number(stats.ALTA_PRIORIDADE),
        valorTotal: Number(stats.VALOR_TOTAL),
        tempoMedioConclusaoDias: Number(stats.TEMPO_MEDIO_CONCLUSAO_DIAS || 0),
      }
    } catch (error) {
      this.logger.error(
        'Erro em getEstatisticas:',
        (error as any)?.message || error,
      )
      throw new InternalServerErrorException('Erro ao buscar estatísticas')
    }
  }

  async getTopTecnicos(): Promise<any[]> {
    const query = `
      SELECT TOP 10
        OS.CODTEC,
        U.NOMEUSU AS TECNICO,
        COUNT(*) AS TOTAL_OS,
        SUM(CASE WHEN OS.STATUS = 'C' THEN 1 ELSE 0 END) AS OS_CONCLUIDAS,
        SUM(CASE WHEN OS.STATUS IN ('A','E') THEN 1 ELSE 0 END) AS OS_PENDENTES,
        AVG(CASE
          WHEN OS.DTENCERRAMENTO IS NOT NULL
          THEN DATEDIFF(DAY, OS.DTABERTURA, OS.DTENCERRAMENTO)
        END) AS TEMPO_MEDIO_CONCLUSAO_DIAS,
        SUM(OS.VLRTOTAL) AS VALOR_TOTAL_SERVICOS
      FROM TCFOSE OS WITH (NOLOCK)
      INNER JOIN TSIUSU U WITH (NOLOCK) ON U.CODUSU = OS.CODTEC
      WHERE OS.DTABERTURA >= DATEADD(MONTH, -3, GETDATE())
      GROUP BY OS.CODTEC, U.NOMEUSU
      ORDER BY OS_CONCLUIDAS DESC
    `

    try {
      const results = await this.sankhyaApiService.executeQuery(query, [])
      return results.map((item: any) => ({
        codtec: Number(item.CODTEC),
        tecnico: item.TECNICO,
        totalOS: Number(item.TOTAL_OS),
        osConcluidas: Number(item.OS_CONCLUIDAS),
        osPendentes: Number(item.OS_PENDENTES),
        tempoMedioConclusaoDias: Number(
          item.TEMPO_MEDIO_CONCLUSAO_DIAS || 0,
        ),
        valorTotalServicos: Number(item.VALOR_TOTAL_SERVICOS),
        taxaConclusao: (
          (Number(item.OS_CONCLUIDAS) / Number(item.TOTAL_OS)) *
          100
        ).toFixed(2),
      }))
    } catch (error) {
      this.logger.error(
        'Erro em getTopTecnicos:',
        (error as any)?.message || error,
      )
      return []
    }
  }

  private mapToEntity(item: any): OrdemServico {
    return {
      numose: Number(item.NUMOSE),
      codparc: Number(item.CODPARC),
      dtabertura: new Date(item.DTABERTURA),
      dtpreventrega: item.DTPREVENTREGA ? new Date(item.DTPREVENTREGA) : undefined,
      dtencerramento: item.DTENCERRAMENTO ? new Date(item.DTENCERRAMENTO) : undefined,
      status: item.STATUS,
      codequip: item.CODEQUIP ? Number(item.CODEQUIP) : undefined,
      defeito: item.DEFEITO,
      solucao: item.SOLUCAO,
      observacao: item.OBSERVACAO,
      codtec: item.CODTEC ? Number(item.CODTEC) : undefined,
      prioridade: Number(item.PRIORIDADE),
      tipo: item.TIPO,
      vlrtotal: item.VLRTOTAL ? Number(item.VLRTOTAL) : undefined,
      codusu: item.CODUSU ? Number(item.CODUSU) : undefined,
      dtinclusao: item.DTINCLUSAO ? new Date(item.DTINCLUSAO) : undefined,
      parceiro: item.NOMEPARC
        ? {
            codparc: Number(item.CODPARC),
            nomeparc: item.NOMEPARC,
            telefone: item.TELEFONE,
            email: item.EMAIL,
          }
        : undefined,
      tecnico: item.NOME_TECNICO
        ? {
            codusu: Number(item.CODTEC),
            nomeusu: item.NOME_TECNICO,
          }
        : undefined,
      usuario: item.NOME_USUARIO
        ? {
            codusu: Number(item.CODUSU),
            nomeusu: item.NOME_USUARIO,
          }
        : undefined,
      equipamento: item.DESC_EQUIPAMENTO
        ? {
            codequip: Number(item.CODEQUIP),
            descricao: item.DESC_EQUIPAMENTO,
            modelo: item.MODELO,
            numserie: item.NUMSERIE,
          }
        : undefined,
    }
  }
}
