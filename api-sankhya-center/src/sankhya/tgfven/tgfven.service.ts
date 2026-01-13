import { Injectable } from '@nestjs/common'
import { Tgfven } from './models/tgfven.interface'
import { TgfvenFindAllDto } from './models/tgfven-find-all.dto'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { trimStrings } from '../../common/utils/string.utils'

@Injectable()
export class TgfvenService extends SankhyaBaseService<Tgfven> {
  getTableName(): string {
    return 'TGFVEN'
  }

  getPrimaryKey(): string {
    return 'CODVEND'
  }

  getRelationsQuery(): string {
    return `
      LEFT JOIN TGFPAR ON TGFVEN.CODPARC = TGFPAR.CODPARC
    `
  }

  async findAll(dto: TgfvenFindAllDto): Promise<PaginatedResult<Tgfven>> {
    const whereClauses: string[] = []

    if (dto.codparc) {
      whereClauses.push(`TGFVEN.CODPARC = ${dto.codparc}`)
    }
    if (dto.nomeparc) {
      whereClauses.push(`TGFPAR.NOMEPARC LIKE '%${dto.nomeparc}%'`)
    }
    if (dto.apelido) {
      whereClauses.push(`TGFVEN.APELIDO LIKE '%${dto.apelido}%'`)
    }
    if (dto.tipvend) {
      whereClauses.push(`TGFVEN.TIPVEND = '${dto.tipvend}'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const page = dto.page || 1
    const perPage = dto.perPage || 10
    const offset = (page - 1) * perPage
    const query = `SELECT TGFVEN.*, TGFPAR.NOMEPARC FROM TGFVEN ${this.getRelationsQuery()} ${where} ORDER BY ${dto.sort || 'CODVEND DESC'} OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    const data: Tgfven[] = response.map((item: any) => {
      const lowered = this.lowercaseKeys(item)
      const entity = this.mapToEntity(lowered)
      const trimmed = trimStrings(entity)
      return this.filterObjectKeys(trimmed, dto.fields || '*')
    })

    const totalQuery = `SELECT COUNT(*) as total FROM TGFVEN ${this.getRelationsQuery()} ${where}`
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    const total = totalResponse.length > 0 ? totalResponse[0].total : 0

    return this.buildPaginatedResult({
      data,
      total,
      page,
      perPage,
    })
  }

  async findById(id: number): Promise<Tgfven | null> {
    const query = `SELECT TGFVEN.*, TGFPAR.NOMEPARC FROM TGFVEN ${this.getRelationsQuery()} WHERE TGFVEN.${this.getPrimaryKey()} = ${id}`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    if (response.length === 0) {
      return null
    }
    const lowered = this.lowercaseKeys(response[0])
    const entity = this.mapToEntity(lowered)
    const trimmed = trimStrings(entity)
    return trimmed
  }

  mapToEntity(item: any): Tgfven {
    const entity = item
    entity.tgfpar = item.codparc
      ? { codparc: item.codparc, nomeparc: item.nomeparc || '' }
      : undefined
    return entity as Tgfven
  }
}
