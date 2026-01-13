import { Injectable } from '@nestjs/common'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'
import { PaginatedResult } from '../../common/pagination/pagination.types'
import { trimStrings } from '../../common/utils/string.utils'
import { TgfestFindAllDto } from './models/tgfest-find-all.dto'
import { Tgfest } from './models/tgfest.interface'

@Injectable()
export class TgfestService extends SankhyaBaseService<Tgfest> {
  getTableName(): string {
    return 'TGFEST'
  }

  getPrimaryKey(): string {
    return 'CODEMP,CODPROD,CODLOCAL,CONTROLE,CODPARC,TIPO'
  }

  getRelationsQuery(): string {
    return `
      LEFT JOIN TGFEMP ON TGFEST.CODEMP = TGFEMP.CODEMP
      LEFT JOIN TGFLOC ON TGFEST.CODLOCAL = TGFLOC.CODLOCAL
      LEFT JOIN TGFPAR ON TGFEST.CODPARC = TGFPAR.CODPARC
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
    `
  }
  /**
   * 📋 RESUMO DE ESTOQUE E ÚLTIMAS COMPRAS
   * Lista produtos com dados de estoque, grupo e últimas compras (query especial)
   */
  async getResumoUltimasCompras(dto: {
    page?: number
    perPage?: number
  }): Promise<PaginatedResult<any>> {
    const page = Number(dto.page) || 1
    const perPage = Number(dto.perPage) || 50
    const offset = (page - 1) * perPage
    // Query principal com paginação (usando OFFSET/FETCH NEXT para SQL Server 2012+)
    const query = `
      SELECT E.CODPROD, E.CONTROLE, P.DESCRPROD, P.CODGRUPOPROD, G.DESCRGRUPOPROD, E.ESTOQUE,
        ULT.DTNEG AS DATA_ULTIMA_COMPRA,
        ULT.VLRUNIT AS PRECO_ULTIMA_COMPRA,
        ULT.NUMNOTA AS NOTA_ULTIMA_COMPRA,
        ULT.CODPARC AS FORNECEDOR_ULTIMA_COMPRA,
        F.NOMEPARC AS NOME_FORNECEDOR,
        ULT.CODVEND AS COD_VENDEDOR,
        V.APELIDO AS NOME_VENDEDOR,
        ULT.CODUSUINC AS COD_USUARIO,
        U.NOMEUSU AS NOME_USUARIO,
        ULT.CODTIPOPER AS COD_TOP,
        TOPS.DESCROPER AS DESCRICAO_TOP,
        E.CODLOCAL AS LOCAL_ESTOQUE,
        E.ESTMIN AS ESTOQUE_MINIMO,
        E.ESTMAX AS ESTOQUE_MAXIMO
      FROM TGFEST E
      INNER JOIN TGFPRO P ON P.CODPROD = E.CODPROD
      LEFT JOIN TGFGRU G ON G.CODGRUPOPROD = P.CODGRUPOPROD
      OUTER APPLY (
        SELECT TOP 1 C.DTNEG, I.VLRUNIT, C.NUMNOTA, C.CODPARC, C.CODVEND, C.CODUSUINC, C.CODTIPOPER
        FROM TGFITE I
        INNER JOIN TGFCAB C ON C.NUNOTA = I.NUNOTA AND C.TIPMOV = 'C'
        WHERE I.CODPROD = E.CODPROD AND I.CONTROLE = E.CONTROLE
        ORDER BY C.DTNEG DESC, I.NUNOTA DESC
      ) ULT
      LEFT JOIN TGFPAR F ON F.CODPARC = ULT.CODPARC
      LEFT JOIN TGFVEN V ON V.CODVEND = ULT.CODVEND
      LEFT JOIN TSIUSU U ON U.CODUSU = ULT.CODUSUINC
      LEFT JOIN TGFTOP TOPS ON TOPS.CODTIPOPER = ULT.CODTIPOPER
      ORDER BY E.ESTOQUE DESC
      OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY`

    // Query para total
    const totalQuery = `SELECT COUNT(*) as total FROM TGFEST`

    const [response, totalResp] = await Promise.all([
      this.sankhyaApiService.executeQuery(query, []),
      this.sankhyaApiService.executeQuery(totalQuery, []),
    ])
    const data = response.map((item: any) => this.lowercaseKeys(item))
    const total = totalResp[0]?.total || 0
    return this.buildPaginatedResult({
      data,
      total,
      page,
      perPage,
    })
  }

  async findByCompositeKey(
    codemp: number,
    codprod: number,
    codlocal: number,
    controle: string,
    codparc: number,
    tipo: string,
  ): Promise<Tgfest | null> {
    const query = `SELECT TGFEST.*, TGFEMP.NOMEFANTASIA, TGFLOC.NOME AS NOMELOCAL, TGFPAR.NOMPARC, TGFPRO.DESCRPROD FROM TGFEST ${this.getRelationsQuery()} WHERE TGFEST.CODEMP = ${codemp} AND TGFEST.CODPROD = ${codprod} AND TGFEST.CODLOCAL = ${codlocal} AND TGFEST.CONTROLE = '${controle}' AND TGFEST.CODPARC = ${codparc} AND TGFEST.TIPO = '${tipo}'`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    if (response.length === 0) {
      return null
    }
    const lowered = this.lowercaseKeys(response[0])
    const entity = this.mapToEntity(lowered)
    const trimmed = trimStrings(entity)
    return trimmed
  }

  mapToEntity(item: any): Tgfest {
    return item as Tgfest
  }

  /**
   * 📊 PRODUTOS COM ESTOQUE BAIXO
   * Lista produtos com estoque abaixo do mínimo por local
   */
  async getProdutosEstoqueBaixo(
    dto: { page?: number; perPage?: number } = {},
  ): Promise<PaginatedResult<any>> {
    const query = `
      SELECT TOP ${dto.perPage || 50}
        TGFEST.*,
        TGFPRO.DESCRPROD,
        TGFLOC.NOME as nome_local,
        TGFPAR.NOMPARC as nome_parceiro,
        (TGFEST.ESTMIN - TGFEST.ESTOQUE) as deficit,
        CASE
          WHEN TGFEST.ESTOQUE <= 0 THEN 'SEM ESTOQUE'
          WHEN TGFEST.ESTOQUE < TGFEST.ESTMIN THEN 'ABAIXO DO MÍNIMO'
          ELSE 'CRÍTICO'
        END as status_estoque
      FROM TGFEST
      ${this.getRelationsQuery()}
      WHERE TGFEST.ATIVO = 'S'
        AND TGFEST.ESTOQUE <= TGFEST.ESTMIN
        AND TGFEST.ESTMIN > 0
      ORDER BY (TGFEST.ESTMIN - TGFEST.ESTOQUE) DESC, TGFPRO.DESCRPROD ASC
    `

    const response = await this.sankhyaApiService.executeQuery(query, [])
    const data = response.map((item: any) =>
      trimStrings(this.lowercaseKeys(item)),
    )

    const totalQuery = `
      SELECT COUNT(*) as total FROM TGFEST
      WHERE ATIVO = 'S' AND ESTOQUE <= ESTMIN AND ESTMIN > 0
    `
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    const total = totalResponse.length > 0 ? totalResponse[0].total : 0

    return this.buildPaginatedResult({
      data,
      total,
      page: dto.page || 1,
      perPage: dto.perPage || 50,
    })
  }

  /**
   * 📈 PRODUTOS COM ESTOQUE ALTO
   * Lista produtos com estoque acima do máximo
   */
  async getProdutosEstoqueAlto(
    dto: { page?: number; perPage?: number } = {},
  ): Promise<PaginatedResult<any>> {
    const query = `
      SELECT TOP ${dto.perPage || 50}
        TGFEST.*,
        TGFPRO.DESCRPROD,
        TGFLOC.NOME as nome_local,
        TGFPAR.NOMPARC as nome_parceiro,
        (TGFEST.ESTOQUE - TGFEST.ESTMAX) as excesso,
        CASE
          WHEN TGFEST.ESTOQUE > TGFEST.ESTMAX * 2 THEN 'EXCESSO CRÍTICO'
          WHEN TGFEST.ESTOQUE > TGFEST.ESTMAX THEN 'ACIMA DO MÁXIMO'
          ELSE 'ELEVADO'
        END as status_estoque
      FROM TGFEST
      ${this.getRelationsQuery()}
      WHERE TGFEST.ATIVO = 'S'
        AND TGFEST.ESTOQUE > TGFEST.ESTMAX
        AND TGFEST.ESTMAX > 0
      ORDER BY (TGFEST.ESTOQUE - TGFEST.ESTMAX) DESC, TGFPRO.DESCRPROD ASC
    `

    const response = await this.sankhyaApiService.executeQuery(query, [])
    const data = response.map((item: any) =>
      trimStrings(this.lowercaseKeys(item)),
    )

    const totalQuery = `
      SELECT COUNT(*) as total FROM TGFEST
      WHERE ATIVO = 'S' AND ESTOQUE > ESTMAX AND ESTMAX > 0
    `
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    const total = totalResponse.length > 0 ? totalResponse[0].total : 0

    return this.buildPaginatedResult({
      data,
      total,
      page: dto.page || 1,
      perPage: dto.perPage || 50,
    })
  }

  /**
   * 📍 CONFERÊNCIA POR LOCAL
   * Lista todos os produtos em um local específico
   */
  async getEstoquePorLocal(
    codlocal: number,
    dto: TgfestFindAllDto,
  ): Promise<PaginatedResult<any>> {
    const whereClauses: string[] = [`TGFEST.CODLOCAL = ${codlocal}`]

    if (dto.codprod) {
      whereClauses.push(`TGFEST.CODPROD = ${dto.codprod}`)
    }
    if (dto.ativo) {
      whereClauses.push(`TGFEST.ATIVO = '${dto.ativo}'`)
    }

    const where = whereClauses.join(' AND ')

    const query = `
      SELECT TOP ${dto.perPage || 100}
        TGFEST.*,
        TGFPRO.DESCRPROD,
        TGFLOC.NOME as nome_local,
        TGFPAR.NOMPARC as nome_parceiro,
        CASE
          WHEN TGFEST.ESTOQUE <= 0 THEN 'SEM ESTOQUE'
          WHEN TGFEST.ESTOQUE < TGFEST.ESTMIN THEN 'BAIXO'
          WHEN TGFEST.ESTOQUE > TGFEST.ESTMAX THEN 'ALTO'
          ELSE 'NORMAL'
        END as status_estoque
      FROM TGFEST
      ${this.getRelationsQuery()}
      WHERE ${where}
      ORDER BY TGFPRO.DESCRPROD ASC
    `

    const response = await this.sankhyaApiService.executeQuery(query, [])
    const data = response.map((item: any) =>
      trimStrings(this.lowercaseKeys(item)),
    )

    const totalQuery = `SELECT COUNT(*) as total FROM TGFEST WHERE ${where}`
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    const total = totalResponse.length > 0 ? totalResponse[0].total : 0

    return this.buildPaginatedResult({
      data,
      total,
      page: dto.page || 1,
      perPage: dto.perPage || 100,
    })
  }

  /**
   * 📦 ESTOQUE POR PRODUTO
   * Lista todos os locais onde um produto tem estoque
   */
  async getEstoquePorProduto(
    codprod: number,
    dto: TgfestFindAllDto,
  ): Promise<PaginatedResult<any>> {
    const whereClauses: string[] = [`TGFEST.CODPROD = ${codprod}`]

    if (dto.codlocal) {
      whereClauses.push(`TGFEST.CODLOCAL = ${dto.codlocal}`)
    }
    if (dto.ativo) {
      whereClauses.push(`TGFEST.ATIVO = '${dto.ativo}'`)
    }

    const where = whereClauses.join(' AND ')

    const query = `
      SELECT TOP ${dto.perPage || 50}
        TGFEST.*,
        TGFPRO.DESCRPROD,
        TGFLOC.NOME as nome_local,
        TGFPAR.NOMPARC as nome_parceiro,
        CASE
          WHEN TGFEST.ESTOQUE <= 0 THEN 'SEM ESTOQUE'
          WHEN TGFEST.ESTOQUE < TGFEST.ESTMIN THEN 'BAIXO'
          WHEN TGFEST.ESTOQUE > TGFEST.ESTMAX THEN 'ALTO'
          ELSE 'NORMAL'
        END as status_estoque
      FROM TGFEST
      ${this.getRelationsQuery()}
      WHERE ${where}
      ORDER BY TGFEST.ESTOQUE DESC, TGFLOC.NOME ASC
    `

    const response = await this.sankhyaApiService.executeQuery(query, [])
    const data = response.map((item: any) =>
      trimStrings(this.lowercaseKeys(item)),
    )

    const totalQuery = `SELECT COUNT(*) as total FROM TGFEST WHERE ${where}`
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    const total = totalResponse.length > 0 ? totalResponse[0].total : 0

    return this.buildPaginatedResult({
      data,
      total,
      page: dto.page || 1,
      perPage: dto.perPage || 50,
    })
  }

  /**
   * 📊 DASHBOARD DE ESTOQUE
   * Resumo geral do estoque da empresa
   */
  async getDashboardEstoque(): Promise<any> {
    const queries = [
      // Total de produtos com estoque
      `SELECT COUNT(*) as total_produtos FROM TGFEST WHERE ATIVO = 'S' AND ESTOQUE > 0`,

      // Produtos abaixo do mínimo
      `SELECT COUNT(*) as produtos_baixo FROM TGFEST WHERE ATIVO = 'S' AND ESTOQUE <= ESTMIN AND ESTMIN > 0`,

      // Produtos acima do máximo
      `SELECT COUNT(*) as produtos_alto FROM TGFEST WHERE ATIVO = 'S' AND ESTOQUE > ESTMAX AND ESTMAX > 0`,

      // Valor total do estoque
      `SELECT SUM(TGFEST.ESTOQUE * ISNULL(TGFPRO.PRECOBASE, 0)) as valor_total FROM TGFEST LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD WHERE TGFEST.ATIVO = 'S'`,

      // Locais ativos
      `SELECT COUNT(DISTINCT CODLOCAL) as locais_ativos FROM TGFEST WHERE ATIVO = 'S'`,
    ]

    const results = await Promise.all(
      queries.map((query) => this.sankhyaApiService.executeQuery(query, [])),
    )

    return {
      total_produtos: results[0][0]?.total_produtos || 0,
      produtos_baixo: results[1][0]?.produtos_baixo || 0,
      produtos_alto: results[2][0]?.produtos_alto || 0,
      valor_total_estoque: results[3][0]?.valor_total || 0,
      locais_ativos: results[4][0]?.locais_ativos || 0,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * 🔍 PRODUTOS SEM MOVIMENTAÇÃO
   * Lista produtos sem movimentação em determinado período
   */
  async getProdutosSemMovimentacao(
    dias: number = 90,
    dto: { page?: number; perPage?: number } = {},
  ): Promise<PaginatedResult<any>> {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - dias)

    const query = `
      SELECT TOP ${dto.perPage || 50}
        TGFEST.*,
        TGFPRO.DESCRPROD,
        TGFLOC.NOME as nome_local,
        TGFPAR.NOMPARC as nome_parceiro,
        DATEDIFF(day, ISNULL(TGFEST.DTENTRADA, '1900-01-01'), GETDATE()) as dias_sem_movimento
      FROM TGFEST
      ${this.getRelationsQuery()}
      WHERE TGFEST.ATIVO = 'S'
        AND TGFEST.ESTOQUE > 0
        AND NOT EXISTS (
          SELECT 1 FROM TGFITE I
          INNER JOIN TGFCAB C ON I.NUNOTA = C.NUNOTA
          WHERE I.CODPROD = TGFEST.CODPROD
            AND C.DTNEG > '${dataLimite.toISOString().split('T')[0]}'
            AND C.STATUSNFE != 'C' -- Não cancelada
        )
      ORDER BY TGFEST.DTENTRADA ASC, TGFPRO.DESCRPROD ASC
    `

    const response = await this.sankhyaApiService.executeQuery(query, [])
    const data = response.map((item: any) =>
      trimStrings(this.lowercaseKeys(item)),
    )

    const totalQuery = `
      SELECT COUNT(*) as total FROM TGFEST
      WHERE ATIVO = 'S' AND ESTOQUE > 0
        AND NOT EXISTS (
          SELECT 1 FROM TGFITE I
          INNER JOIN TGFCAB C ON I.NUNOTA = C.NUNOTA
          WHERE I.CODPROD = TGFEST.CODPROD
            AND C.DTNEG > '${dataLimite.toISOString().split('T')[0]}'
            AND C.STATUSNFE != 'C'
        )
    `
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    const total = totalResponse.length > 0 ? totalResponse[0].total : 0

    return this.buildPaginatedResult({
      data,
      total,
      page: dto.page || 1,
      perPage: dto.perPage || 50,
    })
  }

  /**
   * 🔍 BUSCA AVANÇADA DE PRODUTOS
   * Busca poderosa em múltiplos campos com filtros avançados
   */
  async searchAvancado(dto: {
    query: string
    page?: number
    perPage?: number
    estoqueMin?: number
    estoqueMax?: number
    ativo?: string
  }): Promise<any> {
    const startTime = Date.now()
    const page = Number(dto.page) || 1
    const perPage = Number(dto.perPage) || 50
    const offset = (page - 1) * perPage

    // Construir cláusula WHERE dinâmica baseada nos parâmetros
    const whereConditions: string[] = []
    const searchTerms = dto.query.trim().split(/\s+/)

    // Condição de busca principal (produto, grupo, fornecedor, local)
    const searchConditions: string[] = []
    searchTerms.forEach((term) => {
      const escapedTerm = term.replace(/'/g, "''")
      searchConditions.push(`(
        P.DESCRPROD LIKE '%${escapedTerm}%' OR
        G.DESCRGRUPOPROD LIKE '%${escapedTerm}%' OR
        F.NOMPARC LIKE '%${escapedTerm}%' OR
        L.NOME LIKE '%${escapedTerm}%'
      )`)
    })

    if (searchConditions.length > 0) {
      whereConditions.push(`(${searchConditions.join(' AND ')})`)
    }

    // Filtros opcionais
    if (dto.ativo) {
      whereConditions.push(`TGFEST.ATIVO = '${dto.ativo}'`)
    }

    if (dto.estoqueMin !== undefined) {
      whereConditions.push(`TGFEST.ESTOQUE >= ${dto.estoqueMin}`)
    }

    if (dto.estoqueMax !== undefined) {
      whereConditions.push(`TGFEST.ESTOQUE <= ${dto.estoqueMax}`)
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Query principal com score de relevância
    const mainQuery = `
      WITH SEARCH_RESULTS AS (
        SELECT
          TGFEST.CODPROD,
          TGFEST.CONTROLE,
          TGFEST.CODLOCAL,
          TGFEST.CODPARC,
          TGFEST.ESTOQUE,
          TGFEST.ESTMIN,
          TGFEST.ESTMAX,
          TGFEST.ATIVO,
          P.DESCRPROD,
          P.CODGRUPOPROD,
          G.DESCRGRUPOPROD,
          L.NOME AS NOME_LOCAL,
          F.NOMPARC AS NOME_PARCEIRO,
          -- Calcular score de relevância baseado nos termos de busca
          (
            CASE 
              WHEN LOWER(P.DESCRPROD) LIKE LOWER('%${dto.query}%') THEN 100
              WHEN P.DESCRPROD LIKE '%${dto.query.replace(/\s+/g, '%')}%' THEN 80
              ELSE 0
            END +
            CASE 
              WHEN LOWER(G.DESCRGRUPOPROD) LIKE LOWER('%${dto.query}%') THEN 50
              ELSE 0
            END +
            CASE 
              WHEN LOWER(F.NOMPARC) LIKE LOWER('%${dto.query}%') THEN 30
              ELSE 0
            END +
            CASE 
              WHEN LOWER(L.NOME) LIKE LOWER('%${dto.query}%') THEN 20
              ELSE 0
            END
          ) AS SEARCH_SCORE
        FROM TGFEST
        ${this.getRelationsQuery()}
        ${whereClause}
      )
      SELECT 
        *,
        CASE 
          WHEN SEARCH_SCORE >= 100 THEN 'Alta'
          WHEN SEARCH_SCORE >= 50 THEN 'Média'
          ELSE 'Baixa'
        END AS RELEVANCIA
      FROM SEARCH_RESULTS
      ORDER BY SEARCH_SCORE DESC, DESCRPROD ASC
      OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY
    `

    // Query para total
    const totalQuery = `
      SELECT COUNT(*) as total 
      FROM TGFEST
      ${this.getRelationsQuery()}
      ${whereClause}
    `

    const [response, totalResp] = await Promise.all([
      this.sankhyaApiService.executeQuery(mainQuery, []),
      this.sankhyaApiService.executeQuery(totalQuery, []),
    ])

    const data = response.map((item: any) => {
      const processed = this.lowercaseKeys(item)
      // Remover campos sensíveis ou desnecessários
      delete processed.sankhya_token
      delete processed.password
      return processed
    })

    const total = totalResp[0]?.total || 0
    const searchTime = `${Date.now() - startTime}ms`

    return {
      data,
      total,
      page,
      perPage,
      searchTime,
      query: dto.query,
      filters: {
        ativo: dto.ativo,
        estoqueMin: dto.estoqueMin,
        estoqueMax: dto.estoqueMax,
      },
      hasMore: page * perPage < total,
      lastPage: Math.ceil(total / perPage),
    }
  }
}
