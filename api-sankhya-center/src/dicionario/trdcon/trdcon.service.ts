import { Injectable } from '@nestjs/common'
import { Trdcon } from './models/trdcon.interface'
import { TrdconFindAllDto } from './models/trdcon-find-all.dto'
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
export class TrdconService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  private mapToEntity(item: any): Trdcon {
    return {
      nucontrole: item.NUCONTROLE,
      descrcontrole: item.DESCRCONTROLE,
      tipocontrole: item.TIPOCONTROLE,
      tipofilhhos: item.TIPOFILHOS,
      orifilhos: item.ORIFILHOS,
      nome: item.NOME,
      adicional: item.ADICIONAL,
      controle: item.CONTROLE,
      domain: item.DOMAIN,
    }
  }

  async findAll(dto: TrdconFindAllDto): Promise<PaginatedResult<Trdcon>> {
    const whereClauses: string[] = []

    if (dto.nucontrole !== undefined) {
      whereClauses.push(`TRDCON.NUCONTROLE = ${dto.nucontrole}`)
    }
    if (dto.descrcontrole) {
      whereClauses.push(`TRDCON.DESCRCONTROLE LIKE '%${dto.descrcontrole}%'`)
    }
    if (dto.tipocontrole) {
      whereClauses.push(`TRDCON.TIPOCONTROLE = '${dto.tipocontrole}'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sort = dto.sort || 'TRDCON.NUCONTROLE ASC'
    const limit = dto.perPage || 10

    const query = `
      SELECT TOP ${limit} TRDCON.*
      FROM TRDCON
      ${where}
      ORDER BY ${sort}
    `

    const countQuery = `SELECT COUNT(*) as total FROM TRDCON ${where}`

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

  async findById(nucontrole: number): Promise<Trdcon | null> {
    const query = `SELECT * FROM TRDCON WHERE NUCONTROLE = ${nucontrole}`
    const results = await this.sankhyaApiService.executeQuery(query, [])
    return results.length > 0 ? this.mapToEntity(results[0]) : null
  }
}
