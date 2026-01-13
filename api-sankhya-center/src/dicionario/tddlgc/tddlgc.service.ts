import { Injectable } from '@nestjs/common'
import { Tddlgc } from './models/tddlgc.interface'
import { TddlgcFindAllDto } from './models/tddlgc-find-all.dto'
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
export class TddlgcService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  private mapToEntity(item: any): Tddlgc {
    return {
      nuinstorig: item.NUINSTORIG,
      nucampoorig: item.NUCAMPOORIG,
      nuinstdest: item.NUINSTDEST,
      nucampodest: item.NUCAMPODEST,
      orig_obrigatoria: item.ORIG_OBRIGATORIA,
      ordem: item.ORDEM,
      controle: item.CONTROLE,
      domain: item.DOMAIN,
    }
  }

  async findAll(dto: TddlgcFindAllDto): Promise<PaginatedResult<Tddlgc>> {
    const whereClauses: string[] = []

    if (dto.nuinstorig !== undefined) {
      whereClauses.push(`TDDLGC.NUINSTORIG = ${dto.nuinstorig}`)
    }
    if (dto.nucampoorig !== undefined) {
      whereClauses.push(`TDDLGC.NUCAMPOORIG = ${dto.nucampoorig}`)
    }
    if (dto.nuinstdest !== undefined) {
      whereClauses.push(`TDDLGC.NUINSTDEST = ${dto.nuinstdest}`)
    }
    if (dto.nucampodest !== undefined) {
      whereClauses.push(`TDDLGC.NUCAMPODEST = ${dto.nucampodest}`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sort = dto.sort || 'TDDLGC.NUINSTORIG ASC'
    const limit = dto.perPage || 10
    const offset = ((dto.page || 1) - 1) * limit

    const query = `
      SELECT TOP ${limit} TDDLGC.*
      FROM TDDLGC
      ${where}
      ORDER BY ${sort}
    `

    const countQuery = `SELECT COUNT(*) as total FROM TDDLGC ${where}`

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
    nucampoorig: number,
    nuinstdest: number,
    nucampodest: number,
  ): Promise<Tddlgc | null> {
    const query = `SELECT * FROM TDDLGC WHERE NUINSTORIG = ${nuinstorig} AND NUCAMPOORIG = ${nucampoorig} AND NUINSTDEST = ${nuinstdest} AND NUCAMPODEST = ${nucampodest}`
    const results = await this.sankhyaApiService.executeQuery(query, [])
    return results.length > 0 ? this.mapToEntity(results[0]) : null
  }
}
