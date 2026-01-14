import { Injectable, Logger } from '@nestjs/common'
import {
  PaginatedResult,
  buildPaginatedResult,
} from '../../common/pagination/pagination.types'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import { ProdutoFindAllDto } from './dtos'
import { Produto2, EstoqueLocal } from './interfaces'

/**
 * Service para gerenciar produtos com informações de estoque por local
 * Baseado no TGFPRO2-IMPLEMENTATION-GUIDE.md
 */
@Injectable()
export class Tgfpro2Service {
  private readonly logger = new Logger(Tgfpro2Service.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  /**
   * Lista produtos com opção de incluir estoque agregado
   */
  async findAll(dto: ProdutoFindAllDto): Promise<PaginatedResult<Produto2>> {
    this.logger.log(
      `Finding all products with filters: ${JSON.stringify(dto)}`,
    )

    const page = dto.page || 1
    const perPage = dto.perPage || 10

    // Construir WHERE clause
    const { whereClause } = this.buildWhereClause(dto)

    // 1. Contar total de registros (sem paginação)
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM TGFPRO P WITH (NOLOCK)
      WHERE 1=1 ${whereClause}
    `

    const countResult = await this.sankhyaApiService.executeQuery(countQuery, [])
    const total = Number(countResult[0]?.total || 0)

    // 2. Buscar apenas a página solicitada
    const sortOrder = dto.sort || 'CODPROD DESC'
    const offset = (page - 1) * perPage

    const query = `
      SELECT
        P.CODPROD,
        P.DESCRPROD,
        P.COMPLDESC,
        P.CARACTERISTICAS,
        P.REFERENCIA,
        P.REFFORN,
        P.MARCA,
        P.CODGRUPOPROD,
        P.CODVOL,
        P.CODVOLCOMPRA,
        P.NCM,
        P.ATIVO,
        P.PESOBRUTO,
        P.PESOLIQ,
        P.LOCALIZACAO,
        P.CODLOCALPADRAO,
        P.USALOCAL,
        P.CODCENCUS,
        P.TIPCONTEST,
        P.LISCONTEST,
        P.ESTMIN,
        P.ESTMAX,
        P.ALERTAESTMIN,
        P.PRAZOVAL,
        P.USANROFOGO,
        P.USOPROD,
        P.ORIGPROD,
        G.DESCRGRUPOPROD,
        V.DESCRVOL
      FROM TGFPRO P WITH (NOLOCK)
      LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
      LEFT JOIN TGFVOL V WITH (NOLOCK) ON V.CODVOL = P.CODVOL
      WHERE 1=1 ${whereClause}
      ORDER BY ${sortOrder}
      OFFSET ${offset} ROWS
      FETCH NEXT ${perPage} ROWS ONLY
    `

    // Executar query paginada
    const result = await this.sankhyaApiService.executeQuery(query, [])

    // Mapear resultados (apenas a página atual)
    const produtos = result.map((item) => this.mapToProduto2(item))

    // Enriquecer apenas os produtos da página atual (se solicitado)
    if (dto.includeEstoque || dto.includeEstoqueLocais) {
      for (const produto of produtos) {
        await this.enrichWithEstoque(
          produto,
          dto.includeEstoqueLocais || false,
        )
      }
    }

    return buildPaginatedResult({
      data: produtos,
      total,
      page,
      perPage,
    })
  }

  /**
   * Constrói a cláusula WHERE baseada nos filtros
   * Usa concatenação de strings com escape de aspas para segurança
   */
  private buildWhereClause(dto: ProdutoFindAllDto): {
    whereClause: string
    params: any[]
  } {
    let whereClause = ''

    if (dto.search) {
      const searchEscaped = dto.search.trim().replace(/'/g, "''")
      whereClause += ` AND (P.DESCRPROD LIKE '%${searchEscaped}%' OR P.REFERENCIA LIKE '%${searchEscaped}%' OR P.MARCA LIKE '%${searchEscaped}%')`
    }

    if (dto.descrprod) {
      const descrprodEscaped = dto.descrprod.trim().replace(/'/g, "''")
      whereClause += ` AND P.DESCRPROD LIKE '%${descrprodEscaped}%'`
    }

    if (dto.referencia) {
      const referenciaEscaped = dto.referencia.trim().replace(/'/g, "''")
      whereClause += ` AND P.REFERENCIA LIKE '%${referenciaEscaped}%'`
    }

    if (dto.marca) {
      const marcaEscaped = dto.marca.trim().replace(/'/g, "''")
      whereClause += ` AND P.MARCA LIKE '%${marcaEscaped}%'`
    }

    if (dto.codgrupoprod) {
      whereClause += ` AND P.CODGRUPOPROD = ${dto.codgrupoprod}`
    }

    if (dto.ativo) {
      whereClause += ` AND P.ATIVO = '${dto.ativo}'`
    }

    if (dto.localizacao) {
      const localizacaoEscaped = dto.localizacao.trim().replace(/'/g, "''")
      whereClause += ` AND P.LOCALIZACAO LIKE '%${localizacaoEscaped}%'`
    }

    if (dto.tipcontest) {
      const tipcontestEscaped = dto.tipcontest.trim().replace(/'/g, "''")
      whereClause += ` AND P.TIPCONTEST LIKE '%${tipcontestEscaped}%'`
    }

    if (dto.ncm) {
      const ncmEscaped = dto.ncm.trim().replace(/'/g, "''")
      whereClause += ` AND P.NCM LIKE '%${ncmEscaped}%'`
    }

    return { whereClause, params: [] }
  }

  /**
   * Mapeia o resultado da query para Produto2
   */
  private mapToProduto2(item: any): Produto2 {
    const produto: Produto2 = {
      codprod: Number(item.CODPROD),
      descrprod: item.DESCRPROD,
      compldesc: item.COMPLDESC,
      caracteristicas: item.CARACTERISTICAS,
      referencia: item.REFERENCIA,
      refforn: item.REFFORN,
      marca: item.MARCA,
      codgrupoprod: Number(item.CODGRUPOPROD || 0),
      codvol: item.CODVOL,
      codvolcompra: item.CODVOLCOMPRA,
      ncm: item.NCM,
      ativo: item.ATIVO,
      pesobruto: item.PESOBRUTO ? Number(item.PESOBRUTO) : undefined,
      pesoliq: item.PESOLIQ ? Number(item.PESOLIQ) : undefined,
      localizacao: item.LOCALIZACAO,
      codlocalpadrao: item.CODLOCALPADRAO ? Number(item.CODLOCALPADRAO) : undefined,
      usalocal: item.USALOCAL,
      codcencus: item.CODCENCUS ? Number(item.CODCENCUS) : undefined,
      tipcontest: item.TIPCONTEST,
      liscontest: item.LISCONTEST,
      estmin: item.ESTMIN ? Number(item.ESTMIN) : undefined,
      estmax: item.ESTMAX ? Number(item.ESTMAX) : undefined,
      alertaestmin: item.ALERTAESTMIN,
      prazoval: item.PRAZOVAL ? Number(item.PRAZOVAL) : undefined,
      usanrofogo: item.USANROFOGO,
      usoprod: item.USOPROD,
      origprod: item.ORIGPROD,
    }

    if (item.DESCRGRUPOPROD) {
      produto.tgfgru = {
        codgrupoprod: produto.codgrupoprod,
        descrgrupoprod: item.DESCRGRUPOPROD,
      }
    }

    if (item.DESCRVOL) {
      produto.tgfvol = {
        codvol: produto.codvol,
        descrvol: item.DESCRVOL,
      }
    }

    return produto
  }

  /**
   * Busca um produto específico por código
   */
  async findOne(
    codprod: number,
    includeEstoque = false,
    includeEstoqueLocais = false,
  ): Promise<Produto2 | null> {
    this.logger.log(`Finding product with codprod: ${codprod}`)

    const query = `
      SELECT
        P.CODPROD,
        P.DESCRPROD,
        P.COMPLDESC,
        P.CARACTERISTICAS,
        P.REFERENCIA,
        P.REFFORN,
        P.MARCA,
        P.CODGRUPOPROD,
        P.CODVOL,
        P.CODVOLCOMPRA,
        P.NCM,
        P.ATIVO,
        P.PESOBRUTO,
        P.PESOLIQ,
        P.LOCALIZACAO,
        P.CODLOCALPADRAO,
        P.USALOCAL,
        P.CODCENCUS,
        P.TIPCONTEST,
        P.LISCONTEST,
        P.ESTMIN,
        P.ESTMAX,
        P.ALERTAESTMIN,
        P.PRAZOVAL,
        P.USANROFOGO,
        P.USOPROD,
        P.ORIGPROD,
        G.DESCRGRUPOPROD,
        V.DESCRVOL
      FROM TGFPRO P WITH (NOLOCK)
      LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
      LEFT JOIN TGFVOL V WITH (NOLOCK) ON V.CODVOL = P.CODVOL
      WHERE P.CODPROD = ${codprod}
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])

    if (!result || result.length === 0) {
      return null
    }

    const produto = this.mapToProduto2(result[0])

    // Enriquecer com estoque se solicitado
    if (includeEstoque || includeEstoqueLocais) {
      await this.enrichWithEstoque(produto, includeEstoqueLocais)
    }

    return produto
  }

  /**
   * Busca estoque por local de um produto específico
   */
  async findEstoqueLocais(codprod: number): Promise<EstoqueLocal[]> {
    this.logger.log(`Finding stock locations for product: ${codprod}`)

    const query = `
      SELECT
        E.CODLOCAL,
        L.DESCRLOCAL,
        E.CONTROLE,
        E.ESTOQUE AS quantidade,
        E.ESTMIN,
        E.ESTMAX
      FROM TGFEST E WITH (NOLOCK)
      LEFT JOIN TGFLOC L WITH (NOLOCK) ON L.CODLOCAL = E.CODLOCAL
      WHERE E.CODPROD = ${codprod}
        AND E.CODPARC = 0
        AND E.ATIVO = 'S'
      ORDER BY E.ESTOQUE DESC
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])

    return result.map((item) => {
      const quantidade = Number(item.quantidade || 0)
      const estmin = Number(item.ESTMIN || 0)
      const estmax = Number(item.ESTMAX || 0)

      let statusLocal: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'EXCESSO' = 'NORMAL'
      if (quantidade <= estmin * 0.5) statusLocal = 'CRITICO'
      else if (quantidade <= estmin) statusLocal = 'BAIXO'
      else if (quantidade > estmax) statusLocal = 'EXCESSO'

      const percOcupacao = estmax > 0 ? (quantidade / estmax) * 100 : 0

      return {
        codlocal: Number(item.CODLOCAL),
        descrlocal: item.DESCRLOCAL || '',
        controle: item.CONTROLE || null,
        quantidade,
        estmin,
        estmax,
        statusLocal,
        percOcupacao: Number(percOcupacao.toFixed(2)),
      }
    })
  }

  /**
   * Enriquece o produto com informações de estoque
   */
  private async enrichWithEstoque(
    produto: Produto2,
    includeLocais: boolean,
  ): Promise<void> {
    const query = `
      SELECT
        E.CODLOCAL,
        L.DESCRLOCAL,
        E.CONTROLE,
        E.ESTOQUE AS quantidade,
        E.ESTMIN,
        E.ESTMAX
      FROM TGFEST E WITH (NOLOCK)
      LEFT JOIN TGFLOC L WITH (NOLOCK) ON L.CODLOCAL = E.CODLOCAL
      WHERE E.CODPROD = ${produto.codprod}
        AND E.CODPARC = 0
        AND E.ATIVO = 'S'
      ORDER BY E.ESTOQUE DESC
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])

    if (result.length > 0) {
      const locais: EstoqueLocal[] = result.map((item) => {
        const quantidade = Number(item.quantidade || 0)
        const estmin = Number(item.ESTMIN || 0)
        const estmax = Number(item.ESTMAX || 0)

        let statusLocal: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'EXCESSO' = 'NORMAL'
        if (quantidade <= estmin * 0.5) statusLocal = 'CRITICO'
        else if (quantidade <= estmin) statusLocal = 'BAIXO'
        else if (quantidade > estmax) statusLocal = 'EXCESSO'

        const percOcupacao = estmax > 0 ? (quantidade / estmax) * 100 : 0

        return {
          codlocal: Number(item.CODLOCAL),
          descrlocal: item.DESCRLOCAL || '',
          controle: item.CONTROLE || null,
          quantidade,
          estmin,
          estmax,
          statusLocal,
          percOcupacao: Number(percOcupacao.toFixed(2)),
        }
      })

      if (includeLocais) {
        produto.estoqueLocais = locais
      }

      // Calcular agregados
      const totalGeral = locais.reduce((sum, l) => sum + l.quantidade, 0)
      const totalMin = locais.reduce((sum, l) => sum + l.estmin, 0)
      const totalMax = locais.reduce((sum, l) => sum + l.estmax, 0)

      let statusGeral: 'NORMAL' | 'BAIXO' | 'CRITICO' | 'EXCESSO' = 'NORMAL'
      if (totalGeral <= totalMin * 0.5) statusGeral = 'CRITICO'
      else if (totalGeral <= totalMin) statusGeral = 'BAIXO'
      else if (totalGeral > totalMax) statusGeral = 'EXCESSO'

      produto.estoque = {
        totalGeral,
        totalMin,
        totalMax,
        qtdeLocais: locais.length,
        statusGeral,
      }
    }
  }

  /**
   * Lista todos os grupos de produtos com contagem
   */
  async findAllGrupos(): Promise<
    Array<{ codgrupoprod: number; descrgrupoprod: string; totalProdutos: number }>
  > {
    this.logger.log('Finding all product groups with count')

    const query = `
      SELECT
        G.CODGRUPOPROD,
        G.DESCRGRUPOPROD,
        COUNT(P.CODPROD) as TOTAL_PRODUTOS
      FROM TGFGRU G WITH (NOLOCK)
      LEFT JOIN TGFPRO P WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD AND P.ATIVO = 'S'
      GROUP BY G.CODGRUPOPROD, G.DESCRGRUPOPROD
      ORDER BY G.DESCRGRUPOPROD
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])

    return result.map((item) => ({
      codgrupoprod: Number(item.CODGRUPOPROD),
      descrgrupoprod: item.DESCRGRUPOPROD,
      totalProdutos: Number(item.TOTAL_PRODUTOS || 0),
    }))
  }

  /**
   * Busca produtos de um grupo específico
   */
  async findByGrupo(
    codgrupoprod: number,
    page = 1,
    perPage = 10,
  ): Promise<PaginatedResult<Produto2>> {
    this.logger.log(`Finding products for group: ${codgrupoprod}`)

    // Contar total
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM TGFPRO P WITH (NOLOCK)
      WHERE P.CODGRUPOPROD = ${codgrupoprod} AND P.ATIVO = 'S'
    `
    const countResult = await this.sankhyaApiService.executeQuery(countQuery, [])
    const total = Number(countResult[0]?.total || 0)

    // Buscar produtos
    const offset = (page - 1) * perPage
    const query = `
      SELECT
        P.CODPROD,
        P.DESCRPROD,
        P.COMPLDESC,
        P.REFERENCIA,
        P.REFFORN,
        P.MARCA,
        P.CODGRUPOPROD,
        P.CODVOL,
        P.NCM,
        P.ATIVO,
        G.DESCRGRUPOPROD,
        V.DESCRVOL
      FROM TGFPRO P WITH (NOLOCK)
      LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
      LEFT JOIN TGFVOL V WITH (NOLOCK) ON V.CODVOL = P.CODVOL
      WHERE P.CODGRUPOPROD = ${codgrupoprod} AND P.ATIVO = 'S'
      ORDER BY P.DESCRPROD
      OFFSET ${offset} ROWS
      FETCH NEXT ${perPage} ROWS ONLY
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])
    const produtos = result.map((item) => this.mapToProduto2(item))

    return buildPaginatedResult({ data: produtos, total, page, perPage })
  }

  /**
   * Lista todos os locais de estoque
   */
  async findAllLocais(): Promise<
    Array<{ codlocal: number; descrlocal: string; totalProdutos: number }>
  > {
    this.logger.log('Finding all stock locations with count')

    const query = `
      SELECT
        L.CODLOCAL,
        L.DESCRLOCAL,
        COUNT(DISTINCT E.CODPROD) as TOTAL_PRODUTOS
      FROM TGFLOC L WITH (NOLOCK)
      LEFT JOIN TGFEST E WITH (NOLOCK) ON E.CODLOCAL = L.CODLOCAL AND E.ATIVO = 'S' AND E.ESTOQUE > 0
      GROUP BY L.CODLOCAL, L.DESCRLOCAL
      ORDER BY L.DESCRLOCAL
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])

    return result.map((item) => ({
      codlocal: Number(item.CODLOCAL),
      descrlocal: item.DESCRLOCAL,
      totalProdutos: Number(item.TOTAL_PRODUTOS || 0),
    }))
  }

  /**
   * Busca produtos em um local específico
   */
  async findByLocal(
    codlocal: number,
    page = 1,
    perPage = 10,
  ): Promise<PaginatedResult<Produto2>> {
    this.logger.log(`Finding products for location: ${codlocal}`)

    // Contar total
    const countQuery = `
      SELECT COUNT(DISTINCT P.CODPROD) AS total
      FROM TGFPRO P WITH (NOLOCK)
      INNER JOIN TGFEST E WITH (NOLOCK) ON E.CODPROD = P.CODPROD
      WHERE E.CODLOCAL = ${codlocal}
        AND E.ATIVO = 'S'
        AND E.ESTOQUE > 0
        AND P.ATIVO = 'S'
    `
    const countResult = await this.sankhyaApiService.executeQuery(countQuery, [])
    const total = Number(countResult[0]?.total || 0)

    // Buscar produtos
    const offset = (page - 1) * perPage
    const query = `
      SELECT
        P.CODPROD,
        P.DESCRPROD,
        P.COMPLDESC,
        P.REFERENCIA,
        P.MARCA,
        P.CODGRUPOPROD,
        P.CODVOL,
        P.NCM,
        P.ATIVO,
        G.DESCRGRUPOPROD,
        V.DESCRVOL,
        E.ESTOQUE,
        E.ESTMIN,
        E.ESTMAX
      FROM TGFPRO P WITH (NOLOCK)
      INNER JOIN TGFEST E WITH (NOLOCK) ON E.CODPROD = P.CODPROD
      LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
      LEFT JOIN TGFVOL V WITH (NOLOCK) ON V.CODVOL = P.CODVOL
      WHERE E.CODLOCAL = ${codlocal}
        AND E.ATIVO = 'S'
        AND E.ESTOQUE > 0
        AND P.ATIVO = 'S'
      ORDER BY P.DESCRPROD
      OFFSET ${offset} ROWS
      FETCH NEXT ${perPage} ROWS ONLY
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])
    const produtos = result.map((item) => this.mapToProduto2(item))

    return buildPaginatedResult({ data: produtos, total, page, perPage })
  }
}
