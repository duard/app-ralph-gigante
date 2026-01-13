import { Injectable } from '@nestjs/common'
import { Tddpco } from './models/tddpco.interface'
import { TddpcoFindAllDto } from './models/tddpco-find-all.dto'
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
export class TddpcoService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  private mapToEntity(item: any): Tddpco {
    return {
      nucampo: item.NUCAMPO,
      nome: item.NOME,
      valor: item.VALOR,
      controle: item.CONTROLE,
      domain: item.DOMAIN,
    }
  }

  async findAll(dto: TddpcoFindAllDto): Promise<PaginatedResult<Tddpco>> {
    const whereClauses: string[] = []

    if (dto.nucampo !== undefined) {
      whereClauses.push(`TDDPCO.NUCAMPO = ${dto.nucampo}`)
    }
    if (dto.nome) {
      whereClauses.push(`TDDPCO.NOME LIKE '%${dto.nome}%'`)
    }
    if (dto.valor) {
      whereClauses.push(`TDDPCO.VALOR LIKE '%${dto.valor}%'`)
    }
    if (dto.controle) {
      whereClauses.push(`TDDPCO.CONTROLE = '${dto.controle}'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sort = dto.sort || 'TDDPCO.NUCAMPO ASC, TDDPCO.NOME ASC'
    const limit = dto.perPage || 10
    const offset = ((dto.page || 1) - 1) * limit

    const query = `
      SELECT TOP ${limit} TDDPCO.*
      FROM TDDPCO
      ${where}
      ORDER BY ${sort}
    `

    const countQuery = `SELECT COUNT(*) as total FROM TDDPCO ${where}`

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

  async findById(nucampo: number, nome: string): Promise<Tddpco | null> {
    const query = `SELECT * FROM TDDPCO WHERE NUCAMPO = ${nucampo} AND NOME = '${nome}'`
    const results = await this.sankhyaApiService.executeQuery(query, [])
    return results.length > 0 ? this.mapToEntity(results[0]) : null
  }
}
