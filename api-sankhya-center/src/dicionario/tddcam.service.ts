import { Injectable } from '@nestjs/common'
import { Tddcam } from './models/tddcam.interface'
import { TddcamFindAllDto } from './models/tddcam-find-all.dto'
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
export class TddcamService {
  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  getTableName(): string {
    return 'TDDCAM'
  }

  getPrimaryKey(): string {
    return 'NUCAMPO'
  }

  getRelationsQuery(): string {
    return ''
  }

  mapToEntity(item: any): Tddcam {
    const entity = this.lowercaseKeys(item)
    return trimStrings(entity) as Tddcam
  }

  async findAll(dto: TddcamFindAllDto): Promise<PaginatedResult<Tddcam>> {
    const whereClauses: string[] = []

    if (dto.nometab) {
      whereClauses.push(`TDDCAM.NOMETAB = '${dto.nometab}'`)
    }
    if (dto.nomecampo) {
      whereClauses.push(`TDDCAM.NOMECAMPO LIKE '%${dto.nomecampo}%'`)
    }
    if (dto.descrcampo) {
      whereClauses.push(`TDDCAM.DESCRCAMPO LIKE '%${dto.descrcampo}%'`)
    }
    if (dto.tipcampo) {
      whereClauses.push(`TDDCAM.TIPCAMPO = '${dto.tipcampo}'`)
    }
    if (dto.ordem !== undefined) {
      whereClauses.push(`TDDCAM.ORDEM = ${dto.ordem}`)
    }
    if (dto.sistema) {
      whereClauses.push(`TDDCAM.SISTEMA = '${dto.sistema}'`)
    }
    if (dto.calculado) {
      whereClauses.push(`TDDCAM.CALCULADO = '${dto.calculado}'`)
    }

    // Adicionar cláusula para excluir campos ocultos
    whereClauses.push(
      `NOT EXISTS(SELECT 1 FROM TDDPCO PCO WHERE PCO.NUCAMPO = TDDCAM.NUCAMPO AND PCO.NOME = 'hidden' AND RTRIM(CONVERT(VARCHAR(4000), PCO.VALOR)) = 'S')`,
    )

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const query = `
      SELECT TOP ${dto.perPage}
        TDDCAM.NUCAMPO,
        TDDCAM.NOMETAB,
        TDDCAM.NOMECAMPO,
        TDDCAM.DESCRCAMPO,
        TDDCAM.TIPCAMPO,
        TDDCAM.TAMANHO,
        TDDCAM.MASCARA,
        TDDCAM.PERMITEPESQUISA,
        TDDCAM.CALCULADO,
        TDDCAM.PERMITEPADRAO,
        TDDCAM.APRESENTACAO,
        TDDCAM.ORDEM,
        TDDCAM.VISIVELGRIDPESQUISA,
        TDDCAM.TIPOAPRESENTACAO,
        TDDCAM.SISTEMA,
        TDDCAM.ADICIONAL,
        TDDCAM.CONTROLE,
        TDDCAM.DOMAIN
      FROM TDDCAM WITH (NOLOCK)
      ${where}
      ORDER BY ${dto.sort || 'ORDEM'}
    `

    const response = await this.sankhyaApiService.executeQuery(query, [])
    const data: Tddcam[] = response.map((item: any) =>
      this.filterObjectKeys(
        trimStrings(this.mapToEntity(item)),
        dto.fields || '*',
      ),
    )

    const totalQuery = `SELECT COUNT(*) as total FROM TDDCAM WITH (NOLOCK) ${where}`
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    const total = totalResponse.length > 0 ? totalResponse[0].total : 0

    return buildPaginatedResult({
      data,
      total,
      page: dto.page,
      perPage: dto.perPage,
    })
  }

  async findByTable(nometab: string): Promise<Tddcam[]> {
    const query = `
      SELECT TOP 50
        NUCAMPO, NOMETAB, NOMECAMPO, DESCRCAMPO, TIPCAMPO, TAMANHO,
        MASCARA, PERMITEPESQUISA, CALCULADO, PERMITEPADRAO,
        APRESENTACAO, ORDEM, VISIVELGRIDPESQUISA, TIPOAPRESENTACAO,
        SISTEMA, ADICIONAL, CONTROLE, DOMAIN
      FROM TDDCAM
      WHERE NOMETAB = '${nometab}'
      ORDER BY ORDEM
    `

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
}
