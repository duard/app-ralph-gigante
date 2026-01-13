import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import {
  PaginatedResult,
  buildPaginatedResult,
} from '../../common/pagination/pagination.types'
import { ProductBasicDto, FindProductsDto } from './dto'

/**
 * Service para módulo TGFPRO2 (Products v2)
 * Baseado em: docs/tgfpro/queries/01-basic-listing.md
 *
 * Phase 1: Basic Listing
 * - findAll: Lista produtos ativos (paginado)
 * - findById: Busca por código
 * - search: Busca por descrição (LIKE)
 * - findByGroup: Filtro por grupo
 */
@Injectable()
export class Products2Service {
  private readonly logger = new Logger(Products2Service.name)

  constructor(private readonly sankhyaApi: SankhyaApiService) {}

  /**
   * Query 1.1: Lista Produtos Ativos (paginado)
   * Performance esperada: 200-500ms (gateway)
   * Cache futuro: 5 min TTL
   */
  async findAll(dto: FindProductsDto): Promise<PaginatedResult<ProductBasicDto>> {
    try {
      const page = dto.page ?? 1
      const perPage = dto.perPage ?? 20
      const offset = (page - 1) * perPage

      // TODO: Adicionar cache Redis (TTL: 5 min)
      // const cacheKey = `products2:list:${page}:${perPage}`

      const query = `
        SELECT
          CODPROD,
          DESCRPROD,
          REFERENCIA,
          ATIVO,
          USOPROD,
          VLRULTCOMPRA,
          DTALTER
        FROM TGFPRO WITH (NOLOCK)
        WHERE ATIVO = 'S'
          AND USOPROD = 'C'
        ORDER BY CODPROD DESC
        OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY
      `

      const countQuery = `
        SELECT COUNT(*) as total
        FROM TGFPRO WITH (NOLOCK)
        WHERE ATIVO = 'S'
          AND USOPROD = 'C'
      `

      const [data, countResult] = await Promise.all([
        this.sankhyaApi.executeQuery(query, []),
        this.sankhyaApi.executeQuery(countQuery, []),
      ])

      const total = countResult[0]?.total || 0

      const result = buildPaginatedResult({
        data,
        total,
        page,
        perPage,
      })

      this.logger.log(
        `findAll: ${data.length} produtos retornados (page: ${page}, total: ${total})`,
      )

      return result
    } catch (error) {
      this.logger.error('Erro em findAll:', (error as any)?.message || error)
      throw error
    }
  }

  /**
   * Query 1.2: Busca produto por código
   * Performance esperada: 200-400ms (gateway)
   * Cache futuro: 10 min TTL
   */
  async findById(codprod: number): Promise<ProductBasicDto> {
    try {
      // TODO: Adicionar cache Redis (TTL: 10 min)
      // const cacheKey = `products2:id:${codprod}`

      const query = `
        SELECT
          CODPROD,
          DESCRPROD,
          REFERENCIA,
          ATIVO,
          USOPROD,
          VLRULTCOMPRA,
          DTALTER
        FROM TGFPRO WITH (NOLOCK)
        WHERE CODPROD = ${codprod}
          AND ATIVO = 'S'
          AND USOPROD = 'C'
      `

      const data = await this.sankhyaApi.executeQuery(query, [])

      if (!data || data.length === 0) {
        throw new NotFoundException(
          `Produto com código ${codprod} não encontrado`,
        )
      }

      this.logger.log(`findById: Produto ${codprod} encontrado`)

      return data[0]
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      this.logger.error('Erro em findById:', (error as any)?.message || error)
      throw error
    }
  }

  /**
   * Query 1.3: Busca por descrição (LIKE)
   * Performance esperada: 300-500ms (gateway)
   * Cache futuro: 5 min TTL (varia por termo)
   */
  async search(dto: FindProductsDto): Promise<PaginatedResult<ProductBasicDto>> {
    try {
      const page = dto.page ?? 1
      const perPage = dto.perPage ?? 20
      const offset = (page - 1) * perPage

      if (!dto.search || dto.search.trim() === '') {
        // Se não tem termo de busca, retorna lista geral
        return this.findAll(dto)
      }

      const searchTerm = dto.search.trim().replace(/'/g, "''")

      // TODO: Adicionar cache Redis (TTL: 5 min)
      // const cacheKey = `products2:search:${searchTerm}:${page}:${perPage}`

      const query = `
        SELECT
          CODPROD,
          DESCRPROD,
          REFERENCIA,
          ATIVO,
          USOPROD,
          VLRULTCOMPRA,
          DTALTER
        FROM TGFPRO WITH (NOLOCK)
        WHERE ATIVO = 'S'
          AND USOPROD = 'C'
          AND DESCRPROD LIKE '%${searchTerm}%'
        ORDER BY CODPROD DESC
        OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY
      `

      const countQuery = `
        SELECT COUNT(*) as total
        FROM TGFPRO WITH (NOLOCK)
        WHERE ATIVO = 'S'
          AND USOPROD = 'C'
          AND DESCRPROD LIKE '%${searchTerm}%'
      `

      const [data, countResult] = await Promise.all([
        this.sankhyaApi.executeQuery(query, []),
        this.sankhyaApi.executeQuery(countQuery, []),
      ])

      const total = countResult[0]?.total || 0

      const result = buildPaginatedResult({
        data,
        total,
        page,
        perPage,
      })

      this.logger.log(
        `search: ${data.length} produtos encontrados para "${dto.search}" (total: ${total})`,
      )

      return result
    } catch (error) {
      this.logger.error('Erro em search:', (error as any)?.message || error)
      throw error
    }
  }

  /**
   * Query 1.4: Filtro por grupo (com JOIN)
   * Performance esperada: 300-500ms (gateway)
   * Cache futuro: 5 min TTL
   */
  async findByGroup(
    codgrupoprod: number,
    dto: FindProductsDto,
  ): Promise<PaginatedResult<ProductBasicDto>> {
    try {
      const page = dto.page ?? 1
      const perPage = dto.perPage ?? 20
      const offset = (page - 1) * perPage

      // TODO: Adicionar cache Redis (TTL: 5 min)
      // const cacheKey = `products2:group:${codgrupoprod}:${page}:${perPage}`

      const query = `
        SELECT
          PRO.CODPROD,
          PRO.DESCRPROD,
          PRO.REFERENCIA,
          PRO.ATIVO,
          PRO.USOPROD,
          PRO.VLRULTCOMPRA,
          PRO.DTALTER
        FROM TGFPRO PRO WITH (NOLOCK)
        INNER JOIN TGFGRU GRU WITH (NOLOCK)
          ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
        WHERE PRO.ATIVO = 'S'
          AND PRO.USOPROD = 'C'
          AND PRO.CODGRUPOPROD = ${codgrupoprod}
        ORDER BY PRO.CODPROD DESC
        OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY
      `

      const countQuery = `
        SELECT COUNT(*) as total
        FROM TGFPRO PRO WITH (NOLOCK)
        WHERE PRO.ATIVO = 'S'
          AND PRO.USOPROD = 'C'
          AND PRO.CODGRUPOPROD = ${codgrupoprod}
      `

      const [data, countResult] = await Promise.all([
        this.sankhyaApi.executeQuery(query, []),
        this.sankhyaApi.executeQuery(countQuery, []),
      ])

      const total = countResult[0]?.total || 0

      const result = buildPaginatedResult({
        data,
        total,
        page,
        perPage,
      })

      this.logger.log(
        `findByGroup: ${data.length} produtos do grupo ${codgrupoprod} (total: ${total})`,
      )

      return result
    } catch (error) {
      this.logger.error('Erro em findByGroup:', (error as any)?.message || error)
      throw error
    }
  }
}
