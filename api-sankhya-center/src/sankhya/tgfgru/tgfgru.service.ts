import { Injectable } from '@nestjs/common'
import { Tgfgru } from './models/tgfgru.interface'
import { TgfgruFindAllDto } from './models/tgfgru-find-all.dto'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { trimStrings } from '../../common/utils/string.utils'

@Injectable()
export class TgfgruService extends SankhyaBaseService<Tgfgru> {
  getTableName(): string {
    return 'TGFGRU'
  }

  getPrimaryKey(): string {
    return 'CODGRUPOPROD'
  }

  getRelationsQuery(): string {
    return ''
  }

  async findAll(dto: TgfgruFindAllDto): Promise<PaginatedResult<Tgfgru>> {
    const whereClauses: string[] = []

    if (dto.descrgrupoprod) {
      whereClauses.push(`DESCRGRUPOPROD LIKE '%${dto.descrgrupoprod}%'`)
    }
    if (dto.codgrupai) {
      whereClauses.push(`CODGRUPAI = ${dto.codgrupai}`)
    }
    if (dto.analitico) {
      whereClauses.push(`ANALITICO = '${dto.analitico}'`)
    }
    if (dto.ativo) {
      whereClauses.push(`ATIVO = '${dto.ativo}'`)
    }
    if (dto.codnat) {
      whereClauses.push(`CODNAT = ${dto.codnat}`)
    }
    if (dto.codcencus) {
      whereClauses.push(`CODCENCUS = ${dto.codcencus}`)
    }
    if (dto.codproj) {
      whereClauses.push(`CODPROJ = ${dto.codproj}`)
    }
    if (dto.solcompra) {
      whereClauses.push(`SOLCOMPRA = '${dto.solcompra}'`)
    }
    if (dto.regrawms) {
      whereClauses.push(`REGRAWMS = '${dto.regrawms}'`)
    }
    if (dto.aprprodvda) {
      whereClauses.push(`APRPRODVDA = '${dto.aprprodvda}'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const query = `SELECT TOP ${dto.perPage || 10} * FROM TGFGRU ${where} ORDER BY ${dto.sort || 'CODGRUPOPROD DESC'}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    const data: Tgfgru[] = response.map((item: any) => {
      const lowered = this.lowercaseKeys(item)
      const entity = this.mapToEntity(lowered)
      const trimmed = trimStrings(entity)
      return this.filterObjectKeys(trimmed, dto.fields || '*')
    })

    const totalQuery = `SELECT COUNT(*) as total FROM TGFGRU ${where}`
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

  async findById(id: number): Promise<Tgfgru | null> {
    const query = `SELECT * FROM TGFGRU WHERE ${this.getPrimaryKey()} = ${id}`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    if (response.length === 0) {
      return null
    }
    const lowered = this.lowercaseKeys(response[0])
    const entity = this.mapToEntity(lowered)
    const trimmed = trimStrings(entity)
    return trimmed
  }

  mapToEntity(item: any): Tgfgru {
    return item as Tgfgru
  }
}
