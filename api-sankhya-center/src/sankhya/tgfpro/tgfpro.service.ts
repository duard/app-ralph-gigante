import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common'
import {
  PaginatedResult,
  buildPaginatedResult,
} from '../../common/pagination/pagination.types'
import { SankhyaApiService } from '../../sankhya/shared/sankhya-api.service'
import { TgfproFindAllDto } from './models/tgfpro-find-all.dto'
import { Tgfpro } from './models/tgfpro.interface'
import { TgfproSimplified } from './models/tgfpro-simplified.interface'

@Injectable()
export class TgfproService {
  private readonly logger = new Logger(TgfproService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  private mapToEntity(item: any): Tgfpro {
    const entity: Tgfpro = {
      codprod: Number(item.CODPROD),
      descrprod: item.DESCRPROD,
      compldesc: item.COMPLDESC,
      caracteristicas: item.CARACTERISTICAS,
      referencia: item.REFERENCIA,
      codgrupoprod: Number(item.CODGRUPOPROD || 0),
      codvol: item.CODVOL,
      marca: item.MARCA,
      localizacao: item.LOCALIZACAO,
      pesobruto: Number(item.PESOBRUTO || 0),
      pesoliq: Number(item.PESOLIQ || 0),
      tipcontest: item.TIPCONTEST,
      liscontest: item.LISCONTEST,
      alertaestmin: 'N',
      promocao: 'N',
      temicms: 'N',
      temiss: 'N',
      temipivenda: 'N',
      temipicompra: 'N',
      temirf: 'N',
      teminss: 'N',
      percinss: 0,
      redbaseinss: 0,
      usoprod: item.USOPROD || '',
      origprod: item.ORIGPROD || '',
      tipsubst: '',
      tiplancnota: '',
      local: '',
      codmoeda: 0,
      dtalter: new Date(),
      hrdoobrada: '',
      icmsgerencia: '',
      codnat: 0,
      codcencus: 0,
      codproj: 0,
      temciap: 'N',
      implaudolote: 'N',
      dimensoestipo: '',
      padrao: 'N',
      solcompra: 'N',
      confere: 'N',
      remeter: 'N',
      temcomissao: 'N',
      ap1rctego: 'N',
      calculogiro: 'N',
      unidade: '',
      confcegapeso: 'N',
      regrawms: '',
      utilizawms: 'N',
      balanca: 'N',
      receituario: 'N',
      exigbenefic: 'N',
      geraplaprod: 'N',
      produtonfe: 0,
      tipgtinnfe: 0,
      codusu: 0,
      apresdetalhe: 'N',
      usalocal: 'N',
      codvolcompra: '',
      ativo: item.ATIVO,
      ncm: item.NCM,
      grupopis: '',
      grupocofins: '',
      grupocssl: '',
    }

    const descGrupo: string | undefined =
      (item.GRU_DESCRGRUPOPROD as string) || (item.DESCRGRUPOPROD as string)
    if (descGrupo) {
      entity.tgfgru = {
        codgrupoprod: entity.codgrupoprod,
        descgrupoprod: descGrupo,
      }
    }
    const descrVol: string | undefined =
      (item.VOL_DESCRVOL as string) || (item.DESCRVOL as string)
    if (descrVol) {
      entity.tgfvol = { codvol: entity.codvol, descrvol: descrVol }
    }
    const estoqueTotal = Number(item.ESTQ_ESTOQUE_TOTAL || 0)
    const estminTotal = Number(item.ESTQ_ESTMIN_TOTAL || 0)
    const estmaxTotal = Number(item.ESTQ_ESTMAX_TOTAL || 0)
    const locais = Number(item.ESTQ_QTDE_LOCAIS || 0)
    const abaixoMinimo =
      item.ESTQ_ABAIXO_MINIMO === 1 || item.ESTQ_ABAIXO_MINIMO === '1'
    if (estoqueTotal || estminTotal || estmaxTotal || locais || abaixoMinimo) {
      entity.estoque = {
        estoqueTotal,
        estminTotal,
        estmaxTotal,
        locais,
        abaixoMinimo,
      }
    }
    return entity
  }

  async findAll(dto: TgfproFindAllDto): Promise<PaginatedResult<Tgfpro>> {
    const whereClauses: string[] = []
    if (dto.codgrupoprod)
      whereClauses.push(`TGFPRO.CODGRUPOPROD = ${dto.codgrupoprod}`)
    if (dto.descrprod)
      whereClauses.push(
        `TGFPRO.DESCRPROD LIKE '%${dto.descrprod.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.referencia)
      whereClauses.push(
        `TGFPRO.REFERENCIA LIKE '%${dto.referencia.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.marca)
      whereClauses.push(
        `TGFPRO.MARCA LIKE '%${dto.marca.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.ativo) whereClauses.push(`TGFPRO.ATIVO = '${dto.ativo}'`)
    if (dto.ncm)
      whereClauses.push(
        `TGFPRO.NCM LIKE '%${dto.ncm.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.localizacao)
      whereClauses.push(
        `TGFPRO.LOCALIZACAO LIKE '%${dto.localizacao.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.codcencus) whereClauses.push(`TGFPRO.CODCENCUS = ${dto.codcencus}`)
    if (dto.tipcontest)
      whereClauses.push(
        `TGFPRO.TIPCONTEST LIKE '%${dto.tipcontest.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.liscontest)
      whereClauses.push(
        `TGFPRO.LISCONTEST LIKE '%${dto.liscontest.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.search) {
      const s = dto.search.trim().replace(/'/g, "''")
      whereClauses.push(
        `(TGFPRO.DESCRPROD LIKE '%${s}%' OR TGFPRO.REFERENCIA LIKE '%${s}%' OR TGFPRO.MARCA LIKE '%${s}%')`,
      )
    }
    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(' AND ')}`
      : ''
    const hasSpecificFilters = !!(
      dto.search ||
      dto.descrprod ||
      dto.referencia ||
      dto.marca ||
      dto.codgrupoprod ||
      dto.ativo ||
      dto.ncm ||
      dto.localizacao ||
      dto.codcencus ||
      dto.tipcontest ||
      dto.liscontest
    )
    const sort =
      dto.sort ||
      (hasSpecificFilters ? 'TGFPRO.DESCRPROD ASC' : 'TGFPRO.CODPROD DESC')
    const perPage = Number(dto.perPage) || 10
    const page = Number(dto.page) || 1
    const offset = (page - 1) * perPage

    const query = `SELECT TOP ${perPage + offset}
      TGFPRO.CODPROD,
      TGFPRO.DESCRPROD,
      TGFPRO.REFERENCIA,
      TGFPRO.MARCA,
      TGFPRO.CODVOL,
      TGFPRO.NCM,
      TGFPRO.LOCALIZACAO,
      TGFPRO.PESOBRUTO,
      TGFPRO.PESOLIQ,
      TGFPRO.ATIVO,
      TGFPRO.TIPCONTEST,
      TGFPRO.LISCONTEST,
      TGFPRO.USOPROD,
      TGFPRO.ORIGPROD,
      TGFPRO.CODGRUPOPROD
      FROM TGFPRO WITH (NOLOCK)
      ${where}
      ORDER BY ${sort}`

    try {
      const response = await this.sankhyaApiService.executeQuery(query, [])
      const data: Tgfpro[] = response
        .slice(offset)
        .map((item: any) => this.mapToEntity(item))
      const countQuery = `SELECT COUNT(*) as total FROM TGFPRO ${where}`
      const countResponse = await this.sankhyaApiService.executeQuery(
        countQuery,
        [],
      )
      const total = countResponse.length > 0 ? countResponse[0].total : 0
      return buildPaginatedResult({ data, total, page, perPage })
    } catch (error) {
      this.logger.error('Erro em findAll:', (error as any)?.message || error)
      throw new InternalServerErrorException('Erro ao buscar produtos')
    }
  }

  async findById(codprod: number): Promise<Tgfpro | null> {
    const query = `
      SELECT TOP 1
        TGFPRO.CODPROD, TGFPRO.DESCRPROD, TGFPRO.COMPLDESC, TGFPRO.CARACTERISTICAS, TGFPRO.REFERENCIA,
        TGFPRO.CODGRUPOPROD, TGFPRO.MARCA, TGFPRO.ATIVO, TGFPRO.CODVOL, TGFPRO.NCM, TGFPRO.LOCALIZACAO,
        TGFPRO.PESOBRUTO, TGFPRO.PESOLIQ, TGFPRO.TIPCONTEST, TGFPRO.LISCONTEST
      FROM TGFPRO WITH (NOLOCK)
      WHERE TGFPRO.CODPROD = ${codprod}
    `
    try {
      const results = await this.sankhyaApiService.executeQuery(query, [])
      return results.length > 0 ? this.mapToEntity(results[0]) : null
    } catch (error) {
      this.logger.error('Erro em findById:', (error as any)?.message || error)
      return null
    }
  }

  async findAllWithStock(
    dto: TgfproFindAllDto,
  ): Promise<PaginatedResult<Tgfpro>> {
    const effectiveDto: TgfproFindAllDto = { ...dto, includeEstoque: 'S' }
    return this.ultraSearch(effectiveDto)
  }

  async ultraSearch(dto: TgfproFindAllDto): Promise<PaginatedResult<Tgfpro>> {
    const whereClauses: string[] = []
    if (dto.codgrupoprod)
      whereClauses.push(`TGFPRO.CODGRUPOPROD = ${dto.codgrupoprod}`)
    if (dto.descrprod)
      whereClauses.push(
        `TGFPRO.DESCRPROD LIKE '%${dto.descrprod.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.referencia)
      whereClauses.push(
        `TGFPRO.REFERENCIA LIKE '%${dto.referencia.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.marca)
      whereClauses.push(
        `TGFPRO.MARCA LIKE '%${dto.marca.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.ativo) whereClauses.push(`TGFPRO.ATIVO = '${dto.ativo}'`)
    if (dto.ncm)
      whereClauses.push(
        `TGFPRO.NCM LIKE '%${dto.ncm.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.localizacao)
      whereClauses.push(
        `TGFPRO.LOCALIZACAO LIKE '%${dto.localizacao.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.codcencus) whereClauses.push(`TGFPRO.CODCENCUS = ${dto.codcencus}`)
    if (dto.tipcontest)
      whereClauses.push(
        `TGFPRO.TIPCONTEST LIKE '%${dto.tipcontest.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.liscontest)
      whereClauses.push(
        `TGFPRO.LISCONTEST LIKE '%${dto.liscontest.trim().replace(/'/g, "''")}%'`,
      )
    if (dto.search) {
      const s = dto.search.trim().replace(/'/g, "''")
      whereClauses.push(
        `(TGFPRO.DESCRPROD LIKE '%${s}%' OR TGFPRO.REFERENCIA LIKE '%${s}%' OR TGFPRO.MARCA LIKE '%${s}%')`,
      )
    }
    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(' AND ')}`
      : ''
    const hasSpecificFilters = !!(
      dto.search ||
      dto.descrprod ||
      dto.referencia ||
      dto.marca ||
      dto.codgrupoprod ||
      dto.ativo ||
      dto.ncm ||
      dto.localizacao ||
      dto.codcencus ||
      dto.tipcontest ||
      dto.liscontest
    )
    const sort =
      dto.sort ||
      (hasSpecificFilters ? 'TGFPRO.DESCRPROD ASC' : 'TGFPRO.CODPROD DESC')
    const perPage = Number(dto.perPage) || 10
    const page = Number(dto.page) || 1
    const offset = (page - 1) * perPage

    const includeJoins: boolean = (dto.includeJoins || 'S') === 'S'
    const includeEstoque: boolean = (dto.includeEstoque || 'N') === 'S'
    const baseSelect: string[] = [
      'TGFPRO.CODPROD',
      'TGFPRO.DESCRPROD',
      'TGFPRO.REFERENCIA',
      'TGFPRO.MARCA',
      'TGFPRO.CODVOL',
      'TGFPRO.NCM',
      'TGFPRO.LOCALIZACAO',
      'TGFPRO.PESOBRUTO',
      'TGFPRO.PESOLIQ',
      'TGFPRO.ATIVO',
      'TGFPRO.TIPCONTEST',
      'TGFPRO.LISCONTEST',
      'TGFPRO.USOPROD',
      'TGFPRO.ORIGPROD',
      'TGFPRO.CODGRUPOPROD',
    ]
    if (includeJoins) {
      baseSelect.push(
        'TGFVOL.DESCRVOL AS VOL_DESCRVOL',
        'TGFGRU.DESCRGRUPOPROD AS GRU_DESCRGRUPOPROD',
      )
    }
    if (includeEstoque) {
      baseSelect.push(
        'ESTQ.ESTOQUE_TOTAL AS ESTQ_ESTOQUE_TOTAL',
        'ESTQ.ESTMIN_TOTAL AS ESTQ_ESTMIN_TOTAL',
        'ESTQ.ESTMAX_TOTAL AS ESTQ_ESTMAX_TOTAL',
        'ESTQ.QTDE_LOCAIS AS ESTQ_QTDE_LOCAIS',
        'ESTQ.ABAIXO_MINIMO AS ESTQ_ABAIXO_MINIMO',
      )
    }

    let fromAndJoins = 'FROM TGFPRO WITH (NOLOCK)'
    if (includeJoins) {
      fromAndJoins +=
        ' LEFT JOIN TGFGRU WITH (NOLOCK) ON TGFPRO.CODGRUPOPROD = TGFGRU.CODGRUPOPROD'
      fromAndJoins +=
        ' LEFT JOIN TGFVOL WITH (NOLOCK) ON TGFPRO.CODVOL = TGFVOL.CODVOL'
    }
    if (includeEstoque) {
      fromAndJoins += ` LEFT JOIN (
        SELECT TGFEST.CODPROD,
               SUM(TGFEST.ESTOQUE) AS ESTOQUE_TOTAL,
               SUM(TGFEST.ESTMIN)   AS ESTMIN_TOTAL,
               SUM(TGFEST.ESTMAX)   AS ESTMAX_TOTAL,
               COUNT(DISTINCT TGFEST.CODLOCAL) AS QTDE_LOCAIS,
               CASE WHEN MAX(CASE WHEN TGFEST.ESTOQUE <= TGFEST.ESTMIN THEN 1 ELSE 0 END) = 1 THEN 1 ELSE 0 END AS ABAIXO_MINIMO
        FROM TGFEST WITH (NOLOCK)
        WHERE TGFEST.ATIVO = 'S'
        GROUP BY TGFEST.CODPROD
      ) ESTQ ON ESTQ.CODPROD = TGFPRO.CODPROD`
    }

    const query = `SELECT TOP ${perPage + offset}
      ${baseSelect.join(',\n      ')}
      ${fromAndJoins}
      ${where}
      ORDER BY ${sort}`

    this.logger.log('[UltraSearch] FULL SQL ->\n' + query)

    try {
      const response = await this.sankhyaApiService.executeQuery(query, [])
      const data: Tgfpro[] = response
        .slice(offset)
        .map((item: any) => this.mapToEntity(item))
      const countQuery = `SELECT COUNT(*) as total FROM TGFPRO ${where}`
      const countResponse = await this.sankhyaApiService.executeQuery(
        countQuery,
        [],
      )
      const total = countResponse.length > 0 ? countResponse[0].total : 0
      return buildPaginatedResult({ data, total, page, perPage })
    } catch (error) {
      this.logger.error(
        'Erro em ultraSearch:',
        (error as any)?.message || error,
      )
      return buildPaginatedResult({ data: [], total: 0, page, perPage })
    }
  }

  // Deprecated: canonical extrato builder was moved to ConsumoService
  async buildCanonicalExtrato(_: number, __: string, ___: string) {
    throw new Error('Deprecated: use ConsumoService.buildCanonicalExtrato')
  }

  async searchAvancada(termo: string, limit: number = 50): Promise<Tgfpro[]> {
    if (!termo || termo.trim().length < 2) return []
    const searchTerm = termo.trim().replace(/'/g, "''")
    const query = `
      SELECT TOP ${limit}
        TGFPRO.CODPROD, TGFPRO.DESCRPROD, TGFPRO.COMPLDESC, TGFPRO.CARACTERISTICAS, TGFPRO.REFERENCIA,
        TGFPRO.CODGRUPOPROD, TGFPRO.MARCA, TGFPRO.ATIVO, TGFPRO.CODVOL, TGFPRO.NCM, TGFPRO.LOCALIZACAO,
        TGFPRO.PESOBRUTO, TGFPRO.PESOLIQ, TGFPRO.TIPCONTEST, TGFPRO.LISCONTEST
      FROM TGFPRO WITH (NOLOCK)
      WHERE TGFPRO.ATIVO = 'S' AND (
        TGFPRO.DESCRPROD LIKE '%${searchTerm}%' OR
        TGFPRO.REFERENCIA LIKE '%${searchTerm}%' OR
        TGFPRO.MARCA LIKE '%${searchTerm}%'
      )
      ORDER BY TGFPRO.DESCRPROD ASC
    `
    try {
      const results = await this.sankhyaApiService.executeQuery(query, [])
      return results.map((item) => this.mapToEntity(item))
    } catch (error) {
      this.logger.error(
        'Erro em searchAvancada:',
        (error as any)?.message || error,
      )
      return []
    }
  }

  // Legacy consultarConsumoPeriodo removed; behavior now implemented in `consumo` module

  async findAllSimplified(params: {
    search?: string
    ativo?: string
    codgrupoprod?: number
    localizacao?: string
    tipcontest?: string
    expandControle?: boolean
    sort?: string
    comLocal?: boolean
    semLocal?: boolean
    page?: number
    perPage?: number
  }): Promise<PaginatedResult<TgfproSimplified>> {
    const whereClauses: string[] = []
    if (params.ativo) {
      whereClauses.push(`P.ATIVO = '${params.ativo}'`)
    }
    if (params.codgrupoprod) {
      whereClauses.push(`P.CODGRUPOPROD = ${params.codgrupoprod}`)
    }
    if (params.localizacao) {
      const loc = params.localizacao.trim().replace(/'/g, "''")
      whereClauses.push(`P.LOCALIZACAO LIKE '%${loc}%'`)
    }
    if (params.tipcontest) {
      const tip = params.tipcontest.trim().replace(/'/g, "''")
      whereClauses.push(`P.TIPCONTEST LIKE '%${tip}%'`)
    }
    if (params.search) {
      const s = params.search.trim().replace(/'/g, "''")
      whereClauses.push(
        `(P.DESCRPROD LIKE '%${s}%' OR P.REFERENCIA LIKE '%${s}%' OR P.MARCA LIKE '%${s}%')`,
      )
    }
    if (params.comLocal) {
      whereClauses.push(`P.LOCALIZACAO IS NOT NULL AND P.LOCALIZACAO <> ''`)
    }
    if (params.semLocal) {
      whereClauses.push(`(P.LOCALIZACAO IS NULL OR P.LOCALIZACAO = '')`)
    }
    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(' AND ')}`
      : ''

    const perPage = Math.min(Number(params.perPage) || 50, 200)
    const page = Number(params.page) || 1
    const offset = (page - 1) * perPage

    const validSortColumns: Record<string, string> = {
      codprod: 'P.CODPROD',
      descrprod: 'P.DESCRPROD',
      grupo: 'G.DESCRGRUPOPROD',
      localizacao: 'P.LOCALIZACAO',
      tipcontest: 'P.TIPCONTEST',
      ativo: 'P.ATIVO',
    }
    let orderBy = 'P.CODPROD DESC'
    if (params.sort) {
      const [col, dir] = params.sort.toLowerCase().split(/\s+/)
      const mappedCol = validSortColumns[col]
      if (mappedCol) {
        const direction = dir === 'asc' ? 'ASC' : 'DESC'
        orderBy = `${mappedCol} ${direction}`
      }
    }

    const query = `
      SELECT TOP ${perPage + offset}
        P.CODPROD, P.DESCRPROD, P.REFERENCIA, P.MARCA, P.CODVOL, P.ATIVO,
        P.CODGRUPOPROD, G.DESCRGRUPOPROD, P.LOCALIZACAO, P.TIPCONTEST, P.LISCONTEST,
        E.ESTOQUE, E.ESTMIN, E.ESTMAX
      FROM TGFPRO P WITH (NOLOCK)
      LEFT JOIN TGFGRU G WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD
      LEFT JOIN (
        SELECT CODPROD, SUM(ESTOQUE) AS ESTOQUE, SUM(ESTMIN) AS ESTMIN, SUM(ESTMAX) AS ESTMAX
        FROM TGFEST WITH (NOLOCK)
        WHERE ATIVO = 'S'
        GROUP BY CODPROD
      ) E ON P.CODPROD = E.CODPROD
      ${where}
      ORDER BY ${orderBy}
    `

    try {
      const response = await this.sankhyaApiService.executeQuery(query, [])
      const rawData = response.slice(offset)

      let data: TgfproSimplified[] = []

      if (params.expandControle) {
        for (const item of rawData) {
          const baseProduct: TgfproSimplified = {
            codprod: Number(item.CODPROD),
            descrprod: item.DESCRPROD,
            referencia: item.REFERENCIA || null,
            marca: item.MARCA || null,
            codvol: item.CODVOL || null,
            ativo: item.ATIVO,
            codgrupoprod: Number(item.CODGRUPOPROD || 0),
            descrgrupoprod: item.DESCRGRUPOPROD || null,
            localizacao: item.LOCALIZACAO || null,
            tipcontest: item.TIPCONTEST || null,
            liscontest: item.LISCONTEST || null,
            estoque: item.ESTOQUE != null ? Number(item.ESTOQUE) : null,
            estmin: item.ESTMIN != null ? Number(item.ESTMIN) : null,
            estmax: item.ESTMAX != null ? Number(item.ESTMAX) : null,
          }

          const liscontest = item.LISCONTEST as string | null
          if (liscontest && liscontest.trim()) {
            const controles = liscontest
              .split(/[,;\n\r]+/)
              .map((c: string) => c.trim())
              .filter((c: string) => c.length > 0)

            if (controles.length > 0) {
              controles.forEach((ctrl: string, idx: number) => {
                data.push({
                  ...baseProduct,
                  controleItem: ctrl,
                  controleIndex: idx + 1,
                  totalControles: controles.length,
                })
              })
            } else {
              data.push(baseProduct)
            }
          } else {
            data.push(baseProduct)
          }
        }
      } else {
        data = rawData.map((item: any) => ({
          codprod: Number(item.CODPROD),
          descrprod: item.DESCRPROD,
          referencia: item.REFERENCIA || null,
          marca: item.MARCA || null,
          codvol: item.CODVOL || null,
          ativo: item.ATIVO,
          codgrupoprod: Number(item.CODGRUPOPROD || 0),
          descrgrupoprod: item.DESCRGRUPOPROD || null,
          localizacao: item.LOCALIZACAO || null,
          tipcontest: item.TIPCONTEST || null,
          liscontest: item.LISCONTEST || null,
          estoque: item.ESTOQUE != null ? Number(item.ESTOQUE) : null,
          estmin: item.ESTMIN != null ? Number(item.ESTMIN) : null,
          estmax: item.ESTMAX != null ? Number(item.ESTMAX) : null,
        }))
      }

      const countQuery = `SELECT COUNT(*) as total FROM TGFPRO P WITH (NOLOCK) ${where}`
      const countResponse = await this.sankhyaApiService.executeQuery(
        countQuery,
        [],
      )
      const total =
        countResponse.length > 0 ? Number(countResponse[0].total) : 0

      return buildPaginatedResult({ data, total, page, perPage })
    } catch (error) {
      this.logger.error(
        'Erro em findAllSimplified:',
        (error as any)?.message || error,
      )
      throw new InternalServerErrorException(
        'Erro ao buscar produtos simplificados',
      )
    }
  }
}
