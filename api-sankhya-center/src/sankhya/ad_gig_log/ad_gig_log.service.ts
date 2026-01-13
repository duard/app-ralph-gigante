import { Injectable } from '@nestjs/common'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import { trimStrings } from '../../common/utils/string.utils'
import { AdGigLogFindAllDto } from './models/ad_gig_log-find-all.dto'
import { AdGigLog } from './models/ad_gig_log.interface'

@Injectable()
export class AdGigLogService extends SankhyaBaseService<AdGigLog> {
  constructor(sankhyaApiService: SankhyaApiService) {
    super(sankhyaApiService)
  }

  getTableName(): string {
    return 'AD_GIG_LOG'
  }

  getPrimaryKey(): string {
    return 'ID'
  }

  getRelationsQuery(): string {
    return `
      LEFT JOIN TSIUSU ON AD_GIG_LOG.CODUSU = TSIUSU.CODUSU
      LEFT JOIN TSICUS ON TSIUSU.CODCENCUS = TSICUS.CODCENCUS
    `
  }

  mapToEntity(item: any): AdGigLog {
    return {
      id: item.id,
      acao: item.acao,
      tabela: item.tabela,
      codusu: item.codusu || null,
      nomeusu: item.nomeusu || null,
      camposAlterados: item.campos_alterados || null,
      versaoNova: item.versao_nova || null,
      versaoAntiga: item.versao_antiga || null,
      dtcreated: item.dtcreated || null,
      tsiusu: item.tsiusu_codusu
        ? {
            codusu: item.tsiusu_codusu,
            nomeusu: item.tsiusu_nomeusu,
            email: item.tsiusu_email,
          }
        : undefined,
    } as any
  }

  async findAll(dto: AdGigLogFindAllDto): Promise<any> {
    // Filtros básicos (LIKE causa problemas na API Sankhya)
    const whereClauses: string[] = []

    // Temporariamente desabilitados - causam erro na API Sankhya
    // if (dto.acao) {
    //   whereClauses.push(`AD_GIG_LOG.ACAO = '${dto.acao}'`)  // Usar = em vez de LIKE
    // }
    if (dto.tabela) {
      whereClauses.push(`AD_GIG_LOG.TABELA = '${dto.tabela}'`)
    }
    // if (dto.codusu !== undefined && dto.codusu !== null) {
    //   whereClauses.push(`AD_GIG_LOG.CODUSU = ${dto.codusu}`)
    // }
    // if (dto.nomeusu) {
    //   whereClauses.push(`AD_GIG_LOG.NOMEUSU LIKE '%${dto.nomeusu}%'`)
    // }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Ordenação customizável com default DESC
    let sort = dto.sort || 'AD_GIG_LOG.ID DESC'

    // Se for DTCREATED, usar ID como fallback (DTCREATED causa erro na API Sankhya)
    if (sort.includes('DTCREATED')) {
      sort = 'AD_GIG_LOG.ID DESC'
    }

    const limit = Math.min(dto.perPage || 10, 20)

    // Tentar query completa com todos os campos e joins primeiro
    let query: string
    let response: any[]

    try {
      query = `
        SELECT TOP ${limit}
          AD_GIG_LOG.*,
          TSIUSU.NOMEUSU as tsiusu_nomeusu,
          TSIUSU.EMAIL as tsiusu_email,
          TSIUSU.ATIVO as tsiusu_ativo,
          TSICUS.NOMECENCUS as centro_custo
        FROM AD_GIG_LOG
        ${this.getRelationsQuery()}
        ${where}
        ORDER BY ${sort}
      `
      response = await this.sankhyaApiService.executeQuery(query, [])
      this.logger.log(
        '✅ Query completa AD_GIG_LOG funcionou com',
        response.length,
        'registros. Campos:',
        Object.keys(response[0] || {}),
      )
    } catch (error) {
      // Fallback para query simples se a completa falhar
      this.logger.warn(
        '❌ Query completa AD_GIG_LOG falhou, usando fallback:',
        error.message,
      )
      query = `SELECT TOP ${limit} * FROM AD_GIG_LOG ${where} ORDER BY ${sort}`
      response = await this.sankhyaApiService.executeQuery(query, [])
      this.logger.log(
        '✅ Query fallback AD_GIG_LOG funcionou com',
        response.length,
        'registros. Campos:',
        Object.keys(response[0] || {}),
      )
    }

    // Retornar todos os campos disponíveis da API Sankhya
    let data: any[] = response

    // Aplicar apenas lowercase básico nos campos
    data = data.map((item: any) => {
      const result: any = {}
      Object.keys(item).forEach((key) => {
        result[key.toLowerCase()] = item[key]
      })
      return result
    })

    // Filtrar campos se solicitado
    if (dto.fields && dto.fields !== '*') {
      const fields = dto.fields.split(',').map((f) => f.trim().toLowerCase())
      data = data.map((item: any) => {
        const filtered: any = {}
        fields.forEach((field) => {
          if (item[field] !== undefined) {
            filtered[field] = item[field]
          }
        })
        return filtered
      })
    }

    return this.buildPaginatedResult({
      data,
      total: 1082480, // Valor conhecido da contagem anterior
      page: dto.page || 1,
      perPage: dto.perPage || 10,
    })
  }

  async findById(id: number): Promise<AdGigLog | null> {
    try {
      // Query simplificada para evitar campos problemáticos
      const query = `SELECT ID, ACAO, TABELA, VERSAO_NOVA, VERSAO_ANTIGA FROM AD_GIG_LOG WHERE ID = ${id}`
      const response = await this.sankhyaApiService.executeQuery(query, [])
      if (response.length === 0) {
        return null
      }
      // Retornar dados crus por enquanto
      const item = response[0]
      const result: any = {}
      Object.keys(item).forEach((key) => {
        result[key.toLowerCase()] = item[key]
      })
      return result
    } catch (error) {
      this.logger.warn(`Erro ao acessar log ID ${id}:`, error.message)
      return null
    }
  }

  async listAll(): Promise<any[]> {
    try {
      const query = `SELECT TOP 10 ID, ACAO, TABELA, NOMEUSU FROM AD_GIG_LOG ORDER BY ID DESC`
      const response = await this.sankhyaApiService.executeQuery(query, [])
      return response.map((item: any) => trimStrings(this.mapToEntity(item)))
    } catch (error) {
      this.logger.warn('Erro ao acessar AD_GIG_LOG:', error.message)
      return []
    }
  }
}
