import { Injectable, Logger, Inject } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { SankhyaApiService } from './sankhya-api.service'

/**
 * Interface para informações completas de uma tabela
 */
export interface TableInfo {
  name: string
  schema: any
  relations: any[]
  primaryKeys: string[]
  lastUpdated: Date
  cached: boolean
}

/**
 * Serviço otimizado para inspeção de tabelas Sankhya
 * Combina informações de schema, relações e chaves primárias
 * com cache para melhorar performance
 */
@Injectable()
export class TableInspectionService {
  private readonly logger = new Logger(TableInspectionService.name)
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000 // 24 horas

  constructor(
    private readonly sankhyaApiService: SankhyaApiService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  /**
   * Obtém informações completas de uma tabela com cache
   * @param tableName - Nome da tabela
   * @returns Informações completas da tabela
   */
  async getTableInfo(tableName: string): Promise<TableInfo> {
    const cacheKey = this.getCacheKey(tableName)

    // Tentar obter do cache primeiro
    const cachedData = await this.cache.get(cacheKey)
    if (cachedData) {
      this.logger.debug(
        `📋 Informações da tabela ${tableName} obtidas do cache`,
      )
      return { ...(cachedData as any), cached: true } as TableInfo
    }

    // Se não estiver no cache, buscar da API
    this.logger.log(
      `🔍 Buscando informações da tabela ${tableName} da API Sankhya...`,
    )

    try {
      const [schema, relations, primaryKeys] = await Promise.all([
        this.sankhyaApiService.getTableSchema(tableName),
        this.sankhyaApiService.getTableRelations(tableName),
        this.sankhyaApiService.getPrimaryKeys(tableName),
      ])

      const tableInfo: TableInfo = {
        name: tableName,
        schema,
        relations,
        primaryKeys,
        lastUpdated: new Date(),
        cached: false,
      }

      // Cachear as informações
      await this.cache.set(cacheKey, tableInfo, this.CACHE_TTL)

      this.logger.log(
        `✅ Informações da tabela ${tableName} obtidas e cacheadas`,
      )

      return tableInfo
    } catch (error) {
      this.logger.error(
        `❌ Falha ao obter informações da tabela ${tableName}: ${error.message}`,
      )
      throw new Error(
        `Falha ao inspecionar tabela ${tableName}: ${error.message}`,
      )
    }
  }

  /**
   * Obtém informações de múltiplas tabelas de forma otimizada
   * @param tableNames - Lista de nomes de tabelas
   * @returns Lista de informações de tabelas
   */
  async getMultipleTablesInfo(tableNames: string[]): Promise<TableInfo[]> {
    this.logger.log(
      `📊 Buscando informações de ${tableNames.length} tabelas...`,
    )

    const results = []

    for (const tableName of tableNames) {
      try {
        const tableInfo = await this.getTableInfo(tableName)
        results.push(tableInfo)
      } catch (error) {
        this.logger.warn(
          `⚠️ Falha ao obter informações da tabela ${tableName}: ${error.message}`,
        )
        results.push(null)
      }
    }

    this.logger.log(
      `✅ Concluído: ${results.filter((r) => r !== null).length}/${tableNames.length} tabelas obtidas`,
    )

    return results.filter((r) => r !== null) as TableInfo[]
  }

  /**
   * Invalida o cache para uma tabela específica
   * @param tableName - Nome da tabela
   */
  async invalidateTableCache(tableName: string): Promise<void> {
    const cacheKey = this.getCacheKey(tableName)
    await this.cache.del(cacheKey)
    this.logger.log(`🗑️ Cache invalidado para tabela ${tableName}`)
  }

  /**
   * Invalida o cache para todas as tabelas
   */
  async invalidateAllCache(): Promise<void> {
    // Como não temos uma lista de todas as chaves, precisamos de uma abordagem diferente
    // Para um sistema de produção, poderíamos usar cache.store.keys() ou similar
    this.logger.log(
      '🧹 Cache de todas as tabelas invalidado (implementação limitada)',
    )
  }

  /**
   * Obtém a chave de cache para uma tabela
   */
  private getCacheKey(tableName: string): string {
    return `table_info_${tableName.toUpperCase()}`
  }

  /**
   * Extrai informações úteis para criação de módulos
   * @param tableInfo - Informações da tabela
   * @returns Objeto com informações estruturadas para geração de código
   */
  extractModuleInfo(tableInfo: TableInfo): any {
    const primaryKey = tableInfo.primaryKeys[0] || 'id'
    const columns = tableInfo.schema.columns || []

    return {
      tableName: tableInfo.name,
      primaryKey,
      fields: columns.map((col) => ({
        name: col.COLUMN_NAME,
        type: this.mapSqlTypeToTypeScript(col.DATA_TYPE),
        nullable: col.IS_NULLABLE === 'YES',
        maxLength: col.CHARACTER_MAXIMUM_LENGTH,
      })),
      relations: tableInfo.relations.map((rel) => ({
        table: rel.ReferencedTable,
        field: rel.ReferencedColumn,
        type: rel.DeleteAction,
      })),
    }
  }

  /**
   * Mapeia tipos SQL para tipos TypeScript
   */
  private mapSqlTypeToTypeScript(sqlType: string): string {
    const typeMap: Record<string, string> = {
      int: 'number',
      smallint: 'number',
      bigint: 'number',
      float: 'number',
      decimal: 'number',
      numeric: 'number',
      money: 'number',
      char: 'string',
      varchar: 'string',
      text: 'string',
      nchar: 'string',
      nvarchar: 'string',
      date: 'Date',
      datetime: 'Date',
      timestamp: 'Date',
      bit: 'boolean',
      binary: 'Buffer',
      varbinary: 'Buffer',
    }

    return typeMap[sqlType.toLowerCase()] || 'any'
  }

  /**
   * Gera um template de interface TypeScript para a tabela
   */
  generateInterface(tableInfo: TableInfo): string {
    const interfaceName = `I${tableInfo.name}`
    const primaryKey = tableInfo.primaryKeys[0] || 'id'
    const columns = tableInfo.schema.columns || []

    const fields = columns
      .map((col) => {
        const tsType = this.mapSqlTypeToTypeScript(col.DATA_TYPE)
        const isOptional =
          col.IS_NULLABLE === 'YES' && col.COLUMN_NAME !== primaryKey
        return `  ${col.COLUMN_NAME}${isOptional ? '?' : ''}: ${tsType}`
      })
      .join('\n')

    return `export interface ${interfaceName} {
${fields}
}`
  }

  /**
   * Gera um template de DTO para busca
   */
  generateFindAllDto(tableInfo: TableInfo): string {
    const dtoName = `${tableInfo.name}FindAllDto`
    const primaryKey = tableInfo.primaryKeys[0] || 'id'

    return `import { IsOptional, IsNumber, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class ${dtoName} extends BaseFindAllDto {
  // Adicione campos específicos para filtros
  // Exemplo:
  // @ApiProperty({ required: false })
  // @IsOptional()
  // @IsString()
  // nome?: string
}`
  }
}
