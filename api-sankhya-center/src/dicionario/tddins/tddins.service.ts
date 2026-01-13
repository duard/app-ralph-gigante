import { Injectable } from '@nestjs/common'
import { Tddins } from './models/tddins.interface'
import { TddinsFindAllDto } from './models/tddins-find-all.dto'
import { SankhyaApiService } from '../../sankhya/shared/sankhya-api.service'

type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

@Injectable()
export class TddinsService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  private mapToEntity(item: any): Tddins {
    return {
      nuinstancia: item.NUINSTANCIA,
      nometab: item.NOMETAB,
      nomeinstancia: item.NOMEINSTANCIA,
      descrinstancia: item.DESCRINSTANCIA,
      raiz: item.RAIZ,
      filtro: item.FILTRO,
      ativo: item.ATIVO,
      expressao: item.EXPRESSAO,
      nuinstanciapai: item.NUINSTANCIAPAI,
      nomescriptchave: item.NOMESCRIPTCHAVE,
      nuinstanciaext: item.NUINSTANCIAEXT,
      adicional: item.ADICIONAL,
      resourceid: item.RESOURCEID,
      definicaoinst: item.DEFINICAOINST,
      islib: item.ISLIB,
      controle: item.CONTROLE,
      descrtela: item.DESCRTELA,
      categoria: item.CATEGORIA,
      tipoform: item.TIPOFORM,
      domain: item.DOMAIN,
    }
  }

  async findAll(dto: TddinsFindAllDto): Promise<PaginatedResult<Tddins>> {
    const whereClauses: string[] = []

    if (dto.nuinstancia !== undefined) {
      whereClauses.push(`TDDINS.NUINSTANCIA = ${dto.nuinstancia}`)
    }
    if (dto.nometab) {
      whereClauses.push(`TDDINS.NOMETAB LIKE '%${dto.nometab}%'`)
    }
    if (dto.nomeinstancia) {
      whereClauses.push(`TDDINS.NOMEINSTANCIA LIKE '%${dto.nomeinstancia}%'`)
    }
    if (dto.ativo) {
      whereClauses.push(`TDDINS.ATIVO = '${dto.ativo}'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sort = dto.sort || 'TDDINS.NUINSTANCIA ASC'
    const limit = dto.perPage || 10
    const offset = ((dto.page || 1) - 1) * limit

    const query = `
      SELECT TOP ${limit} TDDINS.*
      FROM TDDINS
      ${where}
      ORDER BY ${sort}
    `

    const countQuery = `SELECT COUNT(*) as total FROM TDDINS ${where}`

    const [dataResult, countResult] = await Promise.all([
      this.sankhyaApiService.executeQuery(query, []),
      this.sankhyaApiService.executeQuery(countQuery, []),
    ])

    const data = dataResult.map(this.mapToEntity)
    const total = countResult[0]?.TOTAL || 0
    const lastPage = Math.ceil(total / limit)
    const hasMore = (dto.page || 1) < lastPage

    return {
      data,
      total,
      page: dto.page || 1,
      perPage: limit,
      lastPage,
      hasMore,
    }
  }

  async findById(nuinstancia: number): Promise<Tddins | null> {
    const query = `SELECT * FROM TDDINS WHERE NUINSTANCIA = ${nuinstancia}`
    const results = await this.sankhyaApiService.executeQuery(query, [])
    return results.length > 0 ? this.mapToEntity(results[0]) : null
  }
}
