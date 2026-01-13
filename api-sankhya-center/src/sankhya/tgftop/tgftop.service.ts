import { Injectable } from '@nestjs/common'
import { Tgftop } from './models/tgftop.interface'
import { TgftopFindAllDto } from './models/tgftop-find-all.dto'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import { PaginatedResult } from '../../common/pagination/pagination.types'

@Injectable()
export class TgftopService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  getTableName(): string {
    return 'TGFTOP'
  }

  getPrimaryKey(): string {
    return 'CODTIPOPER'
  }

  getRelationsQuery(): string {
    return '' // No relations for this table
  }

  async findAll(dto: TgftopFindAllDto): Promise<PaginatedResult<Tgftop>> {
    const whereClauses: string[] = []

    if (dto.descrtipoper) {
      whereClauses.push(`DESCRTIPOPER LIKE '%${dto.descrtipoper}%'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const query = `SELECT TOP ${dto.perPage || 10} * FROM TGFTOP ${where} ORDER BY ${dto.sort || 'CODTIPOPER DESC'}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    const data: Tgftop[] = response.map((item: any) =>
      this.filterObjectKeys(this.mapToEntity(item), dto.fields || '*'),
    )

    const totalQuery = `SELECT COUNT(*) as total FROM TGFTOP ${where}`
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

  async findById(id: number): Promise<Tgftop | null> {
    const query = `SELECT * FROM TGFTOP WHERE ${this.getPrimaryKey()} = ${id}`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    if (response.length === 0) {
      return null
    }
    return this.mapToEntity(response[0])
  }

  mapToEntity(item: any): Tgftop {
    const entity = this.lowercaseKeys(item)
    return entity as Tgftop
  }

  private lowercaseKeys(obj: any): any {
    const result: any = {}
    Object.keys(obj).forEach((key) => {
      result[key.toLowerCase()] = obj[key]
    })
    return result
  }

  private filterObjectKeys(obj: any, fields: string): any {
    if (fields === '*') return obj
    const fieldList = fields.split(',').map((f) => f.trim())
    const isExcludeMode = fieldList.some((f) => f.startsWith('-'))

    if (isExcludeMode) {
      const excludeFields = fieldList
        .filter((f) => f.startsWith('-'))
        .map((f) => f.substring(1))
      const result: any = this.deepClone(obj)
      excludeFields.forEach((field) => {
        this.removeNestedProperty(result, field)
      })
      return result
    } else {
      const selectedFields = fieldList.filter((f) => f)
      const result: any = {}
      selectedFields.forEach((field) => {
        const value = this.getNestedProperty(obj, field)
        if (value !== undefined) {
          this.setNestedProperty(result, field, value)
        }
      })
      return result
    }
  }

  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (Array.isArray(obj)) return obj.map((item) => this.deepClone(item))
    const cloned: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key])
      }
    }
    return cloned
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
  }

  private removeNestedProperty(obj: any, path: string): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => current?.[key], obj)
    if (target && target[lastKey] !== undefined) {
      delete target[lastKey]
    }
  }

  private buildPaginatedResult({
    data,
    total,
    page,
    perPage,
  }: {
    data: any[]
    total: number
    page: number
    perPage: number
  }): PaginatedResult<Tgftop> {
    return {
      data,
      total,
      page,
      perPage,
      lastPage: Math.ceil(total / perPage),
      hasMore: page * perPage < total,
    }
  }
}
