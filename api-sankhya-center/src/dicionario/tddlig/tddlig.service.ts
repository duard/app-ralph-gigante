import { Injectable } from '@nestjs/common'
import { Tddlig } from './models/tddlig.interface'
import { TddligFindAllDto } from './models/tddlig-find-all.dto'
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
export class TddligService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  private mapToEntity(item: any): Tddlig {
    return {
      nuinstorig: item.NUINSTORIG,
      nuinstdest: item.NUINSTDEST,
      tipligacao: item.TIPLIGACAO,
      expressao: item.EXPRESSAO,
      inserir: item.INSERIR,
      alterar: item.ALTERAR,
      excluir: item.EXCLUIR,
      obrigatoria: item.OBRIGATORIA,
      condicao: item.CONDICAO,
      adicional: item.ADICIONAL,
      nomeligacao: item.NOMELIGACAO,
      controle: item.CONTROLE,
      domain: item.DOMAIN,
    }
  }

  async findAll(dto: TddligFindAllDto): Promise<PaginatedResult<Tddlig>> {
    const whereClauses: string[] = []

    if (dto.nuinstorig !== undefined) {
      whereClauses.push(`TDDLIG.NUINSTORIG = ${dto.nuinstorig}`)
    }
    if (dto.nuinstdest !== undefined) {
      whereClauses.push(`TDDLIG.NUINSTDEST = ${dto.nuinstdest}`)
    }
    if (dto.tipligacao) {
      whereClauses.push(`TDDLIG.TIPLIGACAO = '${dto.tipligacao}'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sort = dto.sort || 'TDDLIG.NUINSTORIG ASC, TDDLIG.NUINSTDEST ASC'
    const limit = dto.perPage || 10
    const offset = ((dto.page || 1) - 1) * limit

    const query = `
      SELECT TOP ${limit} TDDLIG.*
      FROM TDDLIG
      ${where}
      ORDER BY ${sort}
    `

    const countQuery = `SELECT COUNT(*) as total FROM TDDLIG ${where}`

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

  async findById(
    nuinstorig: number,
    nuinstdest: number,
  ): Promise<Tddlig | null> {
    const query = `SELECT * FROM TDDLIG WHERE NUINSTORIG = ${nuinstorig} AND NUINSTDEST = ${nuinstdest}`
    const results = await this.sankhyaApiService.executeQuery(query, [])
    return results.length > 0 ? this.mapToEntity(results[0]) : null
  }
}
