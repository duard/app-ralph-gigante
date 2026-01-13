import { Injectable, Logger } from '@nestjs/common'
import { SankhyaApiService } from '../../sankhya/shared/sankhya-api.service'
import { PaginatedResult } from '../pagination/pagination.types'

@Injectable()
export abstract class SankhyaBaseService<T> {
  protected readonly logger = new Logger(SankhyaBaseService.name)
  constructor(protected readonly sankhyaApiService: SankhyaApiService) {
    this.logger.log(
      'SankhyaBaseService instanciado para ' + this.getTableName(),
    )
  }

  /**
   * Define o token Sankhya para autenticação
   */
  async setSankhyaToken(token: string): Promise<void> {
    this.sankhyaApiService.setSankhyaTokenFromJwt({ sankhyaToken: token })
  }

  abstract getTableName(): string
  abstract getPrimaryKey(): string
  abstract mapToEntity(item: any): T

  protected buildWhere(dto: any): string {
    this.logger.debug(`[buildWhere] DTO recebido: ${JSON.stringify(dto)}`)
    return ''
  }

  protected buildPaginatedResult({
    data,
    total,
    page,
    perPage,
  }: any): PaginatedResult<T> {
    const lastPage = Math.ceil(total / perPage)
    this.logger.debug(
      `[buildPaginatedResult] total: ${total}, page: ${page}, perPage: ${perPage}, lastPage: ${lastPage}`,
    )
    return { data, total, page, perPage, lastPage, hasMore: page < lastPage }
  }
  abstract getRelationsQuery(): string // Additional JOINs if needed

  protected filterObjectKeys(obj: any, fields: string): any {
    if (fields === '*') return obj
    const fieldList = fields.split(',').map((f) => f.trim())
    const isExcludeMode = fieldList.some((f) => f.startsWith('-'))

    if (isExcludeMode) {
      // Exclude mode: include all except those starting with -
      const excludeFields = fieldList
        .filter((f) => f.startsWith('-'))
        .map((f) => f.substring(1))
      const result: any = this.deepClone(obj)
      excludeFields.forEach((field) => {
        this.removeNestedProperty(result, field)
      })
      return result
    } else {
      // Include mode: only include specified fields
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
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
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

  protected lowercaseKeys(obj: any): any {
    const result: any = {}
    Object.keys(obj).forEach((key) => {
      result[key.toLowerCase()] = obj[key]
    })
    return result
  }

  async findAll(dto: any): Promise<PaginatedResult<T>> {
    this.logger.log(
      `[findAll] Iniciando busca paginada para ${this.getTableName()} com DTO: ${JSON.stringify(dto)}`,
    )
    const where = this.buildWhere ? this.buildWhere(dto) : ''
    const orderBy = dto.sort ? `ORDER BY ${dto.sort}` : ''
    const tableName = this.getTableName()
    const query = `SELECT TOP ${dto.perPage} ${tableName}.* FROM ${tableName} ${where} ${orderBy}`
    this.logger.debug(`[findAll] Query executada: ${query}`)
    try {
      const response = await this.sankhyaApiService.executeQuery(query, [])
      this.logger.debug(
        `[findAll] Resposta recebida: ${JSON.stringify(response)}`,
      )
      const data: T[] = response.map((item: any) => this.mapToEntity(item))
      const totalQuery = `SELECT COUNT(*) as total FROM ${tableName} ${where}`
      this.logger.debug(`[findAll] Query de contagem: ${totalQuery}`)
      const totalResponse = await this.sankhyaApiService.executeQuery(
        totalQuery,
        [],
      )
      this.logger.debug(
        `[findAll] Resposta de contagem: ${JSON.stringify(totalResponse)}`,
      )
      const total = totalResponse[0]?.total || 0
      return this.buildPaginatedResult
        ? this.buildPaginatedResult({
            data,
            total,
            page: dto.page,
            perPage: dto.perPage,
          })
        : {
            data,
            total,
            page: dto.page,
            perPage: dto.perPage,
            lastPage: Math.ceil(total / dto.perPage),
            hasMore: dto.page * dto.perPage < total,
          }
    } catch (err) {
      this.logger.error(`[findAll] Erro ao executar queries:`, err)
      // Lança HttpException para resposta detalhada e compatível com REST
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { HttpException } = require('@nestjs/common')
      throw new HttpException(
        {
          status: 'error',
          message: err.message,
          stack: err.stack,
          error: err,
        },
        500,
      )
    }
  }

  async findById(id: number): Promise<T | null> {
    this.logger.log(
      `[findById] Buscando por ID ${id} na tabela ${this.getTableName()}`,
    )
    const tableName = this.getTableName()
    const primaryKey = this.getPrimaryKey()
    // Evitar SELECT * por segurança - usar campos essenciais incluindo liscontest
    const query = `SELECT ${primaryKey}, DESCRPROD, REFERENCIA, ATIVO, TITCONTEST, LISCONTEST, CODGRUPOPROD, DESCRGRUPOPROD FROM ${tableName} WHERE ${primaryKey} = ${id}`
    this.logger.debug(`[findById] Query executada: ${query}`)
    try {
      const response = await this.sankhyaApiService.executeQuery(query, [])
      this.logger.debug(
        `[findById] Resposta recebida: ${JSON.stringify(response)}`,
      )
      return response.length > 0 ? this.mapToEntity(response[0]) : null
    } catch (err) {
      this.logger.error(
        `[findById] Erro ao buscar por ID na tabela ${this.getTableName()}:`,
        err.message || err,
      )
      // Lança HttpException para resposta detalhada e compatível com REST
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { HttpException } = require('@nestjs/common')
      throw new HttpException(
        {
          status: 'error',
          message: err.message,
          stack: err.stack,
          error: err,
        },
        500,
      )
    }
  }
}
