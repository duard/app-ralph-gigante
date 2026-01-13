import { Injectable } from '@nestjs/common'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import { TgfiteFindAllDto } from './models/tgfite-find-all.dto'
import { Tgfite } from './models/tgfite.interface'

@Injectable()
export class TgfiteService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  getTableName(): string {
    return 'TGFITE'
  }

  getPrimaryKey(): string {
    return 'NUNOTA,SEQUENCIA'
  }

  /**
   * Define o token Sankhya para autenticação
   */
  async setSankhyaToken(token: string): Promise<void> {
    this.sankhyaApiService.setSankhyaTokenFromJwt({ sankhyaToken: token })
  }

  getRelationsQuery(): string {
    return `
      LEFT JOIN TGFPRO ON TGFITE.CODPROD = TGFPRO.CODPROD
      LEFT JOIN TGFGRU ON TGFPRO.CODGRUPOPROD = TGFGRU.CODGRUPOPROD
    `
  }

  async findAll(dto: TgfiteFindAllDto): Promise<PaginatedResult<Tgfite>> {
    const whereClauses: string[] = []

    if (dto.nunota) {
      whereClauses.push(`TGFITE.NUNOTA = ${dto.nunota}`)
    }
    if (dto.codprod) {
      whereClauses.push(`TGFITE.CODPROD = ${dto.codprod}`)
    }
    if (dto.codgrupoprod) {
      whereClauses.push(`TGFPRO.CODGRUPOPROD = ${dto.codgrupoprod}`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const query = `SELECT TOP ${dto.perPage || 10} TGFITE.*, TGFPRO.DESCRPROD, TGFPRO.REFERENCIA, TGFPRO.MARCA, TGFGRU.CODGRUPOPROD, TGFGRU.DESCRGRUPOPROD FROM TGFITE ${this.getRelationsQuery()} ${where} ORDER BY ${dto.sort || 'NUNOTA DESC, SEQUENCIA ASC'}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    const data: Tgfite[] = response.map((item: any) =>
      this.filterObjectKeys(this.mapToEntity(item), dto.fields || '*'),
    )

    const totalQuery = `SELECT COUNT(*) as total FROM TGFITE ${this.getRelationsQuery()} ${where}`
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

  async findById(nunota: number, sequencia: number): Promise<Tgfite | null> {
    const query = `SELECT TGFITE.*, TGFPRO.DESCRPROD, TGFPRO.REFERENCIA, TGFPRO.MARCA, TGFGRU.CODGRUPOPROD, TGFGRU.DESCRGRUPOPROD FROM TGFITE ${this.getRelationsQuery()} WHERE TGFITE.NUNOTA = ${nunota} AND TGFITE.SEQUENCIA = ${sequencia}`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    if (response.length === 0) {
      return null
    }
    return this.mapToEntity(response[0])
  }

  async getMovimentacoesLocais(
    dto: TgfiteFindAllDto,
  ): Promise<PaginatedResult<any>> {
    const whereClauses: string[] = []

    if (dto.nunota) {
      whereClauses.push(`TGFITE.NUNOTA = ${dto.nunota}`)
    }
    if (dto.codprod) {
      whereClauses.push(`TGFITE.CODPROD = ${dto.codprod}`)
    }
    // Filtrar itens com local de origem (movimentações)
    whereClauses.push(`TGFITE.CODLOCALORIG > 0`)

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const query = `SELECT TOP ${dto.perPage || 10} TGFITE.NUNOTA, TGFITE.SEQUENCIA, TGFITE.CODLOCALORIG, TGFITE.QTDNEG, TGFITE.VLRTOT FROM TGFITE ${where} ORDER BY ${dto.sort || 'NUNOTA DESC, SEQUENCIA ASC'}`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    const data: any[] = response.map((item: any) => {
      const lowered = this.lowercaseKeys(item)
      return this.filterObjectKeys(lowered, dto.fields || '*')
    })

    const totalQuery = `SELECT COUNT(*) as total FROM TGFITE ${where}`
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

  mapToEntity(item: any): Tgfite {
    const entity = this.lowercaseKeys(item)
    entity.tgfpro = item.codprod
      ? {
          codprod: item.codprod,
          descrprod: item.descrprod || '',
          referencia: item.referencia,
          marca: item.marca,
        }
      : undefined
    entity.tgfgru = item.codgrupoprod
      ? {
          codgrupoprod: item.codgrupoprod,
          descrgrupoprod: item.descrgrupoprod || '',
        }
      : undefined
    return entity as Tgfite
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
  }): PaginatedResult<Tgfite> {
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
