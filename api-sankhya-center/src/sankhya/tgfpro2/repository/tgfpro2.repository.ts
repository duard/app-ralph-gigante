import { Injectable, Logger } from '@nestjs/common'
import { SankhyaApiService } from '../../shared/sankhya-api.service'
import { ProdutoFindAllDto } from '../dtos'
import { Produto2 } from '../interfaces'

@Injectable()
export class Tgfpro2Repository {
  private readonly logger = new Logger(Tgfpro2Repository.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  async countAll(dto: ProdutoFindAllDto): Promise<number> {
    const { whereClause, params } = this.buildWhereClause(dto)

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM TGFPRO P WITH (NOLOCK)
      WHERE 1=1 ${whereClause}
    `

    const result = await this.sankhyaApiService.executeQuery(countQuery, params)
    return Number(result[0]?.total || 0)
  }

  async findAll(
    dto: ProdutoFindAllDto,
    offset: number,
  ): Promise<any[]> {
    const { whereClause, params } = this.buildWhereClause(dto)
    const perPage = dto.perPage || 10
    const sortOrder = dto.sort || 'CODPROD DESC'

    const query = `
      SELECT
        P.CODPROD,
        P.DESCRPROD,
        P.COMPLDESC,
        P.CARACTERISTICAS,
        P.REFERENCIA,
        P.REFFORN,
        P.MARCA,
        P.CODGRUPOPROD,
        P.CODVOL,
        P.CODVOLCOMPRA,
        P.NCM,
        P.ATIVO,
        P.PESOBRUTO,
        P.PESOLIQ,
        P.LOCALIZACAO,
        P.CODLOCALPADRAO,
        P.USALOCAL,
        P.CODCENCUS,
        P.TIPCONTEST,
        P.LISCONTEST,
        P.ESTMIN,
        P.ESTMAX,
        P.ALERTAESTMIN,
        P.PRAZOVAL,
        P.USANROFOGO,
        P.USOPROD,
        P.ORIGPROD,
        G.DESCRGRUPOPROD,
        V.DESCRVOL
      FROM TGFPRO P WITH (NOLOCK)
      LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
      LEFT JOIN TGFVOL V WITH (NOLOCK) ON V.CODVOL = P.CODVOL
      WHERE 1=1 ${whereClause}
      ORDER BY ${sortOrder}
      OFFSET ${offset} ROWS
      FETCH NEXT ${perPage} ROWS ONLY
    `
    return this.sankhyaApiService.executeQuery(query, params)
  }

  private buildWhereClause(dto: ProdutoFindAllDto): {
    whereClause: string
    params: any[]
  } {
    let whereClause = ''
    const params: any[] = []

    if (dto.search) {
      whereClause += ` AND (P.DESCRPROD LIKE ? OR P.REFERENCIA LIKE ? OR P.MARCA LIKE ?)`
      const searchTerm = `%${dto.search.trim()}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    if (dto.descrprod) {
      whereClause += ` AND P.DESCRPROD LIKE ?`
      params.push(`%${dto.descrprod.trim()}%`)
    }

    if (dto.referencia) {
      whereClause += ` AND P.REFERENCIA LIKE ?`
      params.push(`%${dto.referencia.trim()}%`)
    }

    if (dto.marca) {
      whereClause += ` AND P.MARCA LIKE ?`
      params.push(`%${dto.marca.trim()}%`)
    }

    if (dto.codgrupoprod) {
      whereClause += ` AND P.CODGRUPOPROD = ?`
      params.push(dto.codgrupoprod)
    }

    if (dto.ativo) {
      whereClause += ` AND P.ATIVO = ?`
      params.push(dto.ativo)
    }

    if (dto.localizacao) {
      whereClause += ` AND P.LOCALIZACAO LIKE ?`
      params.push(`%${dto.localizacao.trim()}%`)
    }

    if (dto.tipcontest) {
      whereClause += ` AND P.TIPCONTEST LIKE ?`
      params.push(`%${dto.tipcontest.trim()}%`)
    }

    if (dto.ncm) {
      whereClause += ` AND P.NCM LIKE ?`
      params.push(`%${dto.ncm.trim()}%`)
    }

    return { whereClause, params }
  }
}