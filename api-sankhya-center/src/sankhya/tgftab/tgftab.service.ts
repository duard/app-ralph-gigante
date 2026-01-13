import { Injectable } from '@nestjs/common'
import { Tgftab } from './models/tgftab.interface'
import { TgftabFindAllDto } from './models/tgftab-find-all.dto'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { trimStrings } from '../../common/utils/string.utils'

@Injectable()
export class TgftabService extends SankhyaBaseService<Tgftab> {
  getTableName(): string {
    return 'TGFTAB'
  }

  getPrimaryKey(): string {
    return 'CODTAB'
  }

  getRelationsQuery(): string {
    return ''
  }

  async findAll(dto: TgftabFindAllDto): Promise<PaginatedResult<Tgftab>> {
    const whereClauses: string[] = []

    if (dto.codreg) {
      whereClauses.push(`CODREG = ${dto.codreg}`)
    }
    if (dto.nometab) {
      whereClauses.push(`NOMETAB LIKE '%${dto.nometab}%'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const query = `SELECT TOP ${dto.perPage || 10} * FROM TGFTAB ${where} ORDER BY ${dto.sort || 'CODTAB DESC'}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    const data: Tgftab[] = response.map((item: any) => {
      const lowered = this.lowercaseKeys(item)
      const entity = this.mapToEntity(lowered)
      const trimmed = trimStrings(entity)
      return this.filterObjectKeys(trimmed, dto.fields || '*')
    })

    const totalQuery = `SELECT COUNT(*) as total FROM TGFTAB ${where}`
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    const total = totalResponse.length > 0 ? totalResponse[0].total : 0

    return this.buildPaginatedResult({
      data,
      total,
      page: dto.page || 1,
      perPage: dto.perPage || 10,
    })
  }

  async findById(id: number): Promise<Tgftab | null> {
    const query = `SELECT * FROM TGFTAB WHERE ${this.getPrimaryKey()} = ${id}`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    if (response.length === 0) {
      return null
    }
    const lowered = this.lowercaseKeys(response[0])
    const entity = this.mapToEntity(lowered)
    const trimmed = trimStrings(entity)
    return trimmed
  }

  mapToEntity(item: any): Tgftab {
    return item as Tgftab
  }
}
