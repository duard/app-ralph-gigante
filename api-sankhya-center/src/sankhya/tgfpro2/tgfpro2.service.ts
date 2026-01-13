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
    const { whereClause, params } = this.buildWhereClause(dto)

    // 1. Contar total de registros (sem paginação)
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM TGFPRO P WITH (NOLOCK)
      WHERE 1=1 ${whereClause}
    `

    const countResult = await this.sankhyaApiService.executeQuery(
      countQuery,
      params,
    )
    const total = Number(countResult[0]?.total || 0)

    // 2. Buscar apenas a página solicitada
    const sortOrder = dto.sort || 'CODPROD DESC'
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
        P.LOCALIZACAO,
        P.TIPCONTEST,
        P.LISCONTEST,
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
    const result = await this.sankhyaApiService.executeQuery(query, params)

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
   */
  private buildWhereClause(dto: ProdutoFindAllDto): {
    whereClause: string
    params: any[]
  } {
    const params: any[] = []
    let whereClause = ''

    if (dto.search) {
      whereClause += ` AND (P.DESCRPROD LIKE @search OR P.REFERENCIA LIKE @search OR P.MARCA LIKE @search)`
      params.push({ name: 'search', value: `%${dto.search}%` })
    }

    if (dto.descrprod) {
      whereClause += ` AND P.DESCRPROD LIKE @descrprod`
      params.push({ name: 'descrprod', value: `%${dto.descrprod}%` })
    }

    if (dto.referencia) {
      whereClause += ` AND P.REFERENCIA LIKE @referencia`
      params.push({ name: 'referencia', value: `%${dto.referencia}%` })
    }

    if (dto.marca) {
      whereClause += ` AND P.MARCA LIKE @marca`
      params.push({ name: 'marca', value: `%${dto.marca}%` })
    }

    if (dto.codgrupoprod) {
      whereClause += ` AND P.CODGRUPOPROD = @codgrupoprod`
      params.push({ name: 'codgrupoprod', value: dto.codgrupoprod })
    }

    if (dto.ativo) {
      whereClause += ` AND P.ATIVO = @ativo`
      params.push({ name: 'ativo', value: dto.ativo })
    }

    if (dto.localizacao) {
      whereClause += ` AND P.LOCALIZACAO LIKE @localizacao`
      params.push({ name: 'localizacao', value: `%${dto.localizacao}%` })
    }

    if (dto.tipcontest) {
      whereClause += ` AND P.TIPCONTEST LIKE @tipcontest`
      params.push({ name: 'tipcontest', value: `%${dto.tipcontest}%` })
    }

    if (dto.ncm) {
      whereClause += ` AND P.NCM LIKE @ncm`
      params.push({ name: 'ncm', value: `%${dto.ncm}%` })
    }

    return { whereClause, params }
  }

  /**
   * Mapeia o resultado da query para Produto2
   */
  private mapToProduto2(item: any): Produto2 {
    const produto: Produto2 = {
      codprod: Number(item.CODPROD),
      descrprod: item.DESCRPROD,
      compldesc: item.COMPLDESC,
      referencia: item.REFERENCIA,
      marca: item.MARCA,
      codgrupoprod: Number(item.CODGRUPOPROD || 0),
      codvol: item.CODVOL,
      ncm: item.NCM,
      ativo: item.ATIVO,
      localizacao: item.LOCALIZACAO,
      tipcontest: item.TIPCONTEST,
      liscontest: item.LISCONTEST,
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
      WHERE E.CODPROD = @codprod
        AND E.CODPARC = 0
        AND E.ATIVO = 'S'
      ORDER BY E.ESTOQUE DESC
    `

    const result = await this.sankhyaApiService.executeQuery(query, [
      { name: 'codprod', value: produto.codprod },
    ])

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
}
