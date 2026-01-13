import { Injectable, Logger } from '@nestjs/common'
import { Tddtab } from './models/tddtab.interface'
import { TddtabFindAllDto } from './models/tddtab-find-all.dto'
import { SankhyaApiService } from '../sankhya/shared/sankhya-api.service'

// Tipos locais enquanto não temos os imports corretos
type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

const buildPaginatedResult = <T>(params: {
  data: T[]
  total: number
  page: number
  perPage: number
}): PaginatedResult<T> => {
  const { data, total, page, perPage } = params
  const lastPage = Math.ceil(total / perPage)
  const hasMore = page < lastPage
  return {
    data,
    total,
    page,
    perPage,
    lastPage,
    hasMore,
  }
}

const trimStrings = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (obj instanceof Date) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => trimStrings(item))
  }

  const result: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] =
        typeof obj[key] === 'string' ? obj[key].trim() : trimStrings(obj[key])
    }
  }

  return result
}

@Injectable()
export class TddtabService {
  private readonly logger = new Logger(TddtabService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  getTableName(): string {
    return 'TDDTAB'
  }

  getPrimaryKey(): string {
    return 'NOMETAB'
  }

  getRelationsQuery(): string {
    return ''
  }

  mapToEntity(item: any): Tddtab {
    const entity = this.lowercaseKeys(item)
    return trimStrings(entity) as Tddtab
  }

  async findAll(dto: TddtabFindAllDto): Promise<PaginatedResult<Tddtab>> {
    const whereClauses: string[] = []

    if (dto.nometab) {
      whereClauses.push(`TDDTAB.NOMETAB LIKE '%${dto.nometab}%'`)
    }
    if (dto.descrtab) {
      whereClauses.push(`TDDTAB.DESCRTAB LIKE '%${dto.descrtab}%'`)
    }
    if (dto.adicional) {
      whereClauses.push(`TDDTAB.ADICIONAL = '${dto.adicional}'`)
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sort = dto.sort || 'TDDTAB.NOMETAB ASC'
    const limit = dto.perPage || 10
    const offset = ((dto.page || 1) - 1) * limit

    const query = `
      SELECT TOP ${limit}
        TDDTAB.NOMETAB,
        TDDTAB.DESCRTAB,
        TDDTAB.TIPONUMERACAO,
        TDDTAB.NUCAMPONUMERACAO,
        TDDTAB.ADICIONAL,
        TDDTAB.CONTROLE,
        TDDTAB.DOMAIN
      FROM TDDTAB WITH (NOLOCK)
      ${where}
      ORDER BY ${sort}
    `

    const countQuery = `SELECT COUNT(*) as total FROM TDDTAB WITH (NOLOCK) ${where}`

    try {
      const [dataResult, countResult] = await Promise.all([
        this.sankhyaApiService.executeQuery(query, []),
        this.sankhyaApiService.executeQuery(countQuery, []),
      ])

      const data: Tddtab[] = dataResult.map((item: any) =>
        this.filterObjectKeys(
          trimStrings(this.mapToEntity(item)),
          dto.fields || '*',
        ),
      )

      const total = countResult[0]?.TOTAL || 0

      return buildPaginatedResult({
        data,
        total,
        page: dto.page || 1,
        perPage: limit,
      })
    } catch (error) {
      this.logger.error('Erro ao buscar TDDTAB:', error.message)
      return buildPaginatedResult({
        data: [],
        total: 0,
        page: dto.page || 1,
        perPage: limit,
      })
    }
  }

  async findByName(nometab: string): Promise<Tddtab | null> {
    const query = `
      SELECT NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL, CONTROLE, DOMAIN
      FROM TDDTAB
      WHERE NOMETAB = '${nometab}'
    `

    const response = await this.sankhyaApiService.executeQuery(query, [])
    if (response.length === 0) {
      return null
    }
    const lowered = this.lowercaseKeys(response[0])
    return trimStrings(this.mapToEntity(lowered))
  }

  async listAll(): Promise<Tddtab[]> {
    const query = `SELECT TOP 100 NOMETAB, DESCRTAB FROM TDDTAB ORDER BY NOMETAB`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    return response.map((item: any) => {
      const lowered = this.lowercaseKeys(item)
      return trimStrings(this.mapToEntity(lowered))
    })
  }

  private lowercaseKeys(obj: any): any {
    const result: any = {}
    Object.keys(obj).forEach((key) => {
      result[key.toLowerCase()] = obj[key]
    })
    return result
  }

  private filterObjectKeys(obj: any, fields: string): any {
    if (!fields || fields === '*') return obj
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
}
