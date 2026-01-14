import { Injectable, Logger } from '@nestjs/common'
import {
  PaginatedResult,
  buildPaginatedResult,
} from '../../common/pagination/pagination.types'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import {
  ProdutoFindAllDto,
  ConsumoFindAllDto,
  ProdutosSemNcmDto,
  ProdutoConsumoAnaliseQueryDto,
  ProdutoConsumoAnaliseResponseDto,
} from './dtos'
import {
  ProdutoInfoDto,
  PeriodoInfoDto,
  ResumoConsumoDto,
  AgrupamentoDto,
  AgrupamentoItemDto,
  MovimentacoesDto,
  MovimentacaoDetalhadaDto,
} from './dtos/produto-consumo-analise-response.dto'
import {
  Produto2,
  EstoqueLocal,
  MovimentacaoConsumo,
  ConsumoProduto,
  ConsumoAnalise,
} from './interfaces'

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
    this.logger.log(`Finding all products with filters: ${JSON.stringify(dto)}`)

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

    const countResult = await this.sankhyaApiService.executeQuery(
      countQuery,
      [],
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
        await this.enrichWithEstoque(produto, dto.includeEstoqueLocais || false)
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
      codlocalpadrao: item.CODLOCALPADRAO
        ? Number(item.CODLOCALPADRAO)
        : undefined,
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
      // Campos de tracking/auditoria
      codusu: item.CODUSU ? Number(item.CODUSU) : undefined,
      codusuinc: item.CODUSUINC ? Number(item.CODUSUINC) : undefined,
      dtcad: item.DTCAD,
      codusualt: item.CODUSUALT ? Number(item.CODUSUALT) : undefined,
      dtalter: item.DTALTER,
      nomeusu: item.NOMEUSU,
      dtlimacesso: item.DTLIMACESSO,
      nomeusuInc: item.NOMEUSU_INC,
      nomeusuAlt: item.NOMEUSU_ALT,
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

    if (item.DESCRLOCAL) {
      produto.tgfloc = {
        codlocal: produto.codlocalpadrao,
        descrlocal: item.DESCRLOCAL,
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
    Array<{
      codgrupoprod: number
      descrgrupoprod: string
      totalProdutos: number
    }>
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
    const countResult = await this.sankhyaApiService.executeQuery(
      countQuery,
      [],
    )
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
    const countResult = await this.sankhyaApiService.executeQuery(
      countQuery,
      [],
    )
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

  /**
   * ===========================================================================
   * MÉTODOS DE CONSUMO DE PRODUTOS
   * ===========================================================================
   */

  /**
   * Lista movimentações de consumo de produtos
   * Baseado em TGFVAR + TGFCAB + TGFITE com filtros avançados
   */
  async findConsumo(
    dto: ConsumoFindAllDto,
  ): Promise<PaginatedResult<MovimentacaoConsumo>> {
    this.logger.log(
      `Finding consumption movements with filters: ${JSON.stringify(dto)}`,
    )

    const page = dto.page || 1
    const perPage = dto.perPage || 10

    // Construir WHERE clause
    let whereClause = ' WHERE 1=1'

    if (dto.codprod) {
      whereClause += ` AND ITE.CODPROD = ${dto.codprod}`
    }

    if (dto.coddep) {
      whereClause += ` AND CAB.CODDEP = ${dto.coddep}`
    }

    if (dto.codusuinc) {
      whereClause += ` AND CAB.CODUSUINC = ${dto.codusuinc}`
    }

    if (dto.dataInicio) {
      whereClause += ` AND CAB.DTNEG >= '${dto.dataInicio}'`
    }

    if (dto.dataFim) {
      whereClause += ` AND CAB.DTNEG <= '${dto.dataFim}'`
    }

    if (dto.atualizaEstoque) {
      whereClause += ` AND TOPV.ATUALEST = '${dto.atualizaEstoque}'`
    }

    if (dto.codtipoper) {
      whereClause += ` AND CAB.CODTIPOPER = ${dto.codtipoper}`
    }

    if (dto.search) {
      const searchEscaped = dto.search.trim().replace(/'/g, "''")
      whereClause += ` AND (P.DESCRPROD LIKE '%${searchEscaped}%' OR TOPV.DESCROPER LIKE '%${searchEscaped}%')`
    }

    // Filtrar apenas movimentações que afetam estoque (baixa)
    // whereClause += ` AND TOPV.ATUALEST = 'B'`  // Comentado para permitir filtro manual

    // Contar total
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM TGFITE ITE WITH (NOLOCK)
      INNER JOIN TGFCAB CAB WITH (NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
      LEFT JOIN TGFTOP TOPV WITH (NOLOCK) ON TOPV.CODTIPOPER = CAB.CODTIPOPER
        AND TOPV.DHALTER = (
          SELECT MAX(TOP2.DHALTER)
          FROM TGFTOP TOP2 WITH (NOLOCK)
          WHERE TOP2.CODTIPOPER = CAB.CODTIPOPER
            AND TOP2.DHALTER <= CAB.DTNEG
        )
      LEFT JOIN TGFPRO P WITH (NOLOCK) ON P.CODPROD = ITE.CODPROD
      ${whereClause}
        AND CAB.STATUSNOTA != 'C'
    `

    const countResult = await this.sankhyaApiService.executeQuery(
      countQuery,
      [],
    )
    const total = Number(countResult[0]?.total || 0)

    // Buscar movimentações
    // Nota: Devido a limitações de tamanho de query da API Sankhya, usamos query simplificada
    // removemos campos como CODEMP, CODPARC, CODDEP, e fazemos formatação/mapeamento no backend
    const offset = (page - 1) * perPage
    const query = `
      SELECT
        ITE.NUNOTA,
        ITE.SEQUENCIA,
        ITE.CODPROD,
        ITE.QTDNEG,
        ITE.VLRUNIT,
        ITE.VLRTOT,
        ITE.CODLOCALORIG,
        CAB.NUMNOTA,
        CAB.DTNEG,
        CAB.DTMOV,
        CAB.HRMOV,
        CAB.STATUSNOTA,
        CAB.CODTIPOPER,
        CAB.CODUSUINC,
        TOPV.DESCROPER,
        TOPV.ATUALEST,
        USU.NOMEUSU,
        P.DESCRPROD
      FROM TGFITE ITE WITH (NOLOCK)
      INNER JOIN TGFCAB CAB WITH (NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
      LEFT JOIN TGFTOP TOPV WITH (NOLOCK) ON TOPV.CODTIPOPER = CAB.CODTIPOPER
        AND TOPV.DHALTER = (
          SELECT MAX(TOP2.DHALTER)
          FROM TGFTOP TOP2 WITH (NOLOCK)
          WHERE TOP2.CODTIPOPER = CAB.CODTIPOPER
            AND TOP2.DHALTER <= CAB.DTNEG
        )
      LEFT JOIN TSIUSU USU WITH (NOLOCK) ON USU.CODUSU = CAB.CODUSUINC
      LEFT JOIN TGFPRO P WITH (NOLOCK) ON P.CODPROD = ITE.CODPROD
      ${whereClause}
        AND CAB.STATUSNOTA != 'C'
      ORDER BY CAB.DTNEG DESC, ITE.NUNOTA DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${perPage} ROWS ONLY
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])
    const movimentacoes = result.map((item) =>
      this.mapToMovimentacaoConsumo(item),
    )

    return buildPaginatedResult({
      data: movimentacoes,
      total,
      page,
      perPage,
    })
  }

  /**
   * Analisa consumo de um produto específico
   */
  async findConsumoProduto(
    codprod: number,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<ConsumoProduto> {
    this.logger.log(
      `Analyzing consumption for product ${codprod} from ${dataInicio} to ${dataFim}`,
    )

    let whereClause = `
      WHERE ITE.CODPROD = ${codprod}
        AND CAB.STATUSNOTA != 'C'
        AND TOPV.ATUALEST = 'B'
    `

    if (dataInicio) {
      whereClause += ` AND CAB.DTNEG >= '${dataInicio}'`
    }

    if (dataFim) {
      whereClause += ` AND CAB.DTNEG <= '${dataFim}'`
    }

    // Query para dados gerais do produto e totais
    const queryGeral = `
      SELECT
        P.CODPROD,
        P.DESCRPROD,
        P.REFERENCIA,
        P.MARCA,
        COUNT(DISTINCT ITE.NUNOTA) AS TOTAL_MOVIMENTACOES,
        SUM(ITE.QTDNEG) AS QUANTIDADE_TOTAL,
        AVG(ITE.VLRUNIT) AS VALOR_MEDIO,
        SUM(ITE.VLRTOT) AS VALOR_TOTAL,
        MIN(CAB.DTNEG) AS PRIMEIRA_MOV,
        MAX(CAB.DTNEG) AS ULTIMA_MOV
      FROM TGFITE ITE WITH (NOLOCK)
      INNER JOIN TGFCAB CAB WITH (NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
      LEFT JOIN TGFTOP TOPV WITH (NOLOCK) ON TOPV.CODTIPOPER = CAB.CODTIPOPER
        AND TOPV.DHALTER = (
          SELECT MAX(TOP2.DHALTER)
          FROM TGFTOP TOP2 WITH (NOLOCK)
          WHERE TOP2.CODTIPOPER = CAB.CODTIPOPER
            AND TOP2.DHALTER <= CAB.DTNEG
        )
      INNER JOIN TGFPRO P WITH (NOLOCK) ON P.CODPROD = ITE.CODPROD
      ${whereClause}
      GROUP BY P.CODPROD, P.DESCRPROD, P.REFERENCIA, P.MARCA
    `

    const resultGeral = await this.sankhyaApiService.executeQuery(
      queryGeral,
      [],
    )

    if (!resultGeral.length) {
      return {
        codprod,
        descrprod: 'Produto não encontrado ou sem consumo',
        totalMovimentacoes: 0,
        quantidadeTotal: 0,
        valorMedio: 0,
        valorTotal: 0,
        departamentos: [],
        usuarios: [],
      }
    }

    const geral = resultGeral[0]

    // Query para consumo por departamento
    const queryDepartamentos = `
      SELECT
        CAB.CODDEP,
        DEP.DESCRDEP,
        SUM(ITE.QTDNEG) AS QUANTIDADE
      FROM TGFITE ITE WITH (NOLOCK)
      INNER JOIN TGFCAB CAB WITH (NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
      LEFT JOIN TGFTOP TOPV WITH (NOLOCK) ON TOPV.CODTIPOPER = CAB.CODTIPOPER
        AND TOPV.DHALTER = (
          SELECT MAX(TOP2.DHALTER)
          FROM TGFTOP TOP2 WITH (NOLOCK)
          WHERE TOP2.CODTIPOPER = CAB.CODTIPOPER
            AND TOP2.DHALTER <= CAB.DTNEG
        )
      LEFT JOIN TGFDEP DEP WITH (NOLOCK) ON DEP.CODDEP = CAB.CODDEP
      ${whereClause}
      GROUP BY CAB.CODDEP, DEP.DESCRDEP
      ORDER BY QUANTIDADE DESC
    `

    const resultDepartamentos = await this.sankhyaApiService.executeQuery(
      queryDepartamentos,
      [],
    )

    const quantidadeTotal = Number(geral.QUANTIDADE_TOTAL || 0)

    const departamentos = resultDepartamentos.map((item) => ({
      coddep: item.CODDEP ? Number(item.CODDEP) : undefined,
      descrDep: item.DESCRDEP || 'Sem departamento',
      quantidade: Number(item.QUANTIDADE || 0),
      percentual:
        quantidadeTotal > 0
          ? (Number(item.QUANTIDADE || 0) / quantidadeTotal) * 100
          : 0,
    }))

    // Query para consumo por usuário
    const queryUsuarios = `
      SELECT
        CAB.CODUSUINC,
        USU.NOMEUSU,
        SUM(ITE.QTDNEG) AS QUANTIDADE
      FROM TGFITE ITE WITH (NOLOCK)
      INNER JOIN TGFCAB CAB WITH (NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
      LEFT JOIN TGFTOP TOPV WITH (NOLOCK) ON TOPV.CODTIPOPER = CAB.CODTIPOPER
        AND TOPV.DHALTER = (
          SELECT MAX(TOP2.DHALTER)
          FROM TGFTOP TOP2 WITH (NOLOCK)
          WHERE TOP2.CODTIPOPER = CAB.CODTIPOPER
            AND TOP2.DHALTER <= CAB.DTNEG
        )
      LEFT JOIN TSIUSU USU WITH (NOLOCK) ON USU.CODUSU = CAB.CODUSUINC
      ${whereClause}
      GROUP BY CAB.CODUSUINC, USU.NOMEUSU
      ORDER BY QUANTIDADE DESC
    `

    const resultUsuarios = await this.sankhyaApiService.executeQuery(
      queryUsuarios,
      [],
    )

    const usuarios = resultUsuarios.map((item) => ({
      codusuinc: Number(item.CODUSUINC || 0),
      nomeusu: item.NOMEUSU || 'Usuário desconhecido',
      quantidade: Number(item.QUANTIDADE || 0),
      percentual:
        quantidadeTotal > 0
          ? (Number(item.QUANTIDADE || 0) / quantidadeTotal) * 100
          : 0,
    }))

    return {
      codprod: Number(geral.CODPROD),
      descrprod: geral.DESCRPROD,
      referencia: geral.REFERENCIA,
      marca: geral.MARCA,
      totalMovimentacoes: Number(geral.TOTAL_MOVIMENTACOES || 0),
      quantidadeTotal: Number(geral.QUANTIDADE_TOTAL || 0),
      valorMedio: Number(geral.VALOR_MEDIO || 0),
      valorTotal: Number(geral.VALOR_TOTAL || 0),
      primeiraMov: geral.PRIMEIRA_MOV,
      ultimaMov: geral.ULTIMA_MOV,
      departamentos,
      usuarios,
    }
  }

  /**
   * Análise completa de consumo por período
   */
  async findConsumoAnalise(
    dataInicio: string,
    dataFim: string,
    top: number = 10,
  ): Promise<ConsumoAnalise> {
    this.logger.log(`Analyzing consumption from ${dataInicio} to ${dataFim}`)

    // Use ATUALESTOQUE < 0 to identify stock reductions (consumo)
    // Based on sql-para-tentar-entender-consumo.sql pattern
    const whereBase = `
      WHERE CAB.DTNEG >= '${dataInicio}'
        AND CAB.DTNEG <= '${dataFim}'
        AND CAB.STATUSNOTA = 'L'
        AND ITE.ATUALESTOQUE < 0
    `

    // Split totais into multiple queries
    // NOTE: CODDEP field is BLOCKED by Sankhya API, so we skip departamentos count
    const q1 = `SELECT COUNT(DISTINCT ITE.NUNOTA)TM FROM TGFITE ITE WITH(NOLOCK)INNER JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA ${whereBase}`
    const q2 = `SELECT COUNT(DISTINCT ITE.CODPROD)TP FROM TGFITE ITE WITH(NOLOCK)INNER JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA ${whereBase}`
    const q3 = `SELECT SUM(ITE.QTDNEG)QT,SUM(ITE.VLRTOT)VT FROM TGFITE ITE WITH(NOLOCK)INNER JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA ${whereBase}`
    const q4 = `SELECT COUNT(DISTINCT CAB.CODUSUINC)TU FROM TGFCAB CAB WITH(NOLOCK)INNER JOIN TGFITE ITE WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA ${whereBase}`

    const [r1, r2, r3, r4] = await Promise.all([
      this.sankhyaApiService.executeQuery(q1, []),
      this.sankhyaApiService.executeQuery(q2, []),
      this.sankhyaApiService.executeQuery(q3, []),
      this.sankhyaApiService.executeQuery(q4, []),
    ])

    const quantidadeTotal = Number(r3[0].QT || 0)
    const valorTotal = Number(r3[0].VT || 0)

    // Top produtos
    const queryTopProdutos = `
      SELECT TOP ${top}
        ITE.CODPROD,
        P.DESCRPROD,
        SUM(ITE.QTDNEG) AS QTD,
        SUM(ITE.VLRTOT) AS VLR
      FROM TGFITE ITE WITH (NOLOCK)
      INNER JOIN TGFCAB CAB WITH (NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
      LEFT JOIN TGFPRO P WITH (NOLOCK) ON P.CODPROD = ITE.CODPROD
      ${whereBase}
      GROUP BY ITE.CODPROD, P.DESCRPROD
      ORDER BY QTD DESC
    `

    const resultTopProdutos = await this.sankhyaApiService.executeQuery(
      queryTopProdutos,
      [],
    )

    const topProdutos = resultTopProdutos.map((item) => ({
      codprod: Number(item.CODPROD),
      descrprod: item.DESCRPROD,
      quantidade: Number(item.QTD || 0),
      valor: Number(item.VLR || 0),
      percentual:
        quantidadeTotal > 0
          ? (Number(item.QTD || 0) / quantidadeTotal) * 100
          : 0,
    }))

    // Top departamentos - SKIPPED: CODDEP field is blocked by Sankhya API
    const topDepartamentos: any[] = []

    // Top usuários
    const queryTopUsuarios = `
      SELECT TOP ${top}
        CAB.CODUSUINC,
        SUM(ITE.QTDNEG) AS QTD,
        SUM(ITE.VLRTOT) AS VLR
      FROM TGFITE ITE WITH (NOLOCK)
      INNER JOIN TGFCAB CAB WITH (NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
      ${whereBase}
      GROUP BY CAB.CODUSUINC
      ORDER BY QTD DESC
    `

    const resultTopUsuarios = await this.sankhyaApiService.executeQuery(
      queryTopUsuarios,
      [],
    )

    const topUsuarios = resultTopUsuarios.map((item) => ({
      codusuinc: Number(item.CODUSUINC || 0),
      nomeusu: `Usuário ${item.CODUSUINC || 'N/A'}`,
      quantidade: Number(item.QTD || 0),
      valor: Number(item.VLR || 0),
      percentual:
        quantidadeTotal > 0
          ? (Number(item.QTD || 0) / quantidadeTotal) * 100
          : 0,
    }))

    // Calcular dias
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    const dias =
      Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return {
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
        dias,
      },
      totais: {
        movimentacoes: Number(r1[0].TM || 0),
        produtos: Number(r2[0].TP || 0),
        departamentos: 0, // CODDEP field blocked by Sankhya API
        usuarios: Number(r4[0].TU || 0),
        quantidadeTotal,
        valorTotal,
      },
      topProdutos,
      topDepartamentos,
      topUsuarios,
    }
  }

  /**
   * Análise completa de consumo de produto com agrupamentos
   * Suporta múltiplas visões: usuario, grupo, parceiro, mes, tipooper
   */
  async findProdutoConsumoAnalise(
    codprod: number,
    dto: ProdutoConsumoAnaliseQueryDto,
  ): Promise<ProdutoConsumoAnaliseResponseDto> {
    this.logger.log(
      `Analyzing product ${codprod} consumption from ${dto.dataInicio} to ${dto.dataFim} with groupBy=${dto.groupBy}`,
    )

    const { dataInicio, dataFim, groupBy = 'none', page = 1, perPage = 20 } = dto

    // 1. Buscar informações do produto
    const produto = await this.getProdutoInfo(codprod)

    // 2. Calcular período
    const periodo = this.calcularPeriodo(dataInicio, dataFim)

    // 3. Buscar resumo de consumo
    const resumo = await this.getResumoConsumo(codprod, dataInicio, dataFim, periodo.dias)

    // 4. Buscar agrupamento (se solicitado)
    let agrupamento: AgrupamentoDto | undefined
    if (groupBy && groupBy !== 'none') {
      agrupamento = await this.getAgrupamento(
        codprod,
        dataInicio,
        dataFim,
        groupBy,
        resumo.valorConsumo,
      )
    }

    // 5. Buscar movimentações detalhadas (paginadas)
    const movimentacoes = await this.getMovimentacoes(
      codprod,
      dataInicio,
      dataFim,
      page,
      perPage,
    )

    return {
      produto,
      periodo,
      resumo,
      agrupamento,
      movimentacoes,
    }
  }

  /**
   * Busca informações básicas do produto
   */
  private async getProdutoInfo(codprod: number): Promise<ProdutoInfoDto> {
    const query = `SELECT CODPROD,DESCRPROD,ATIVO FROM TGFPRO WITH(NOLOCK)WHERE CODPROD=${codprod}`
    const result = await this.sankhyaApiService.executeQuery(query, [])

    if (!result || result.length === 0) {
      throw new Error(`Produto ${codprod} não encontrado`)
    }

    return {
      codprod: Number(result[0].CODPROD),
      descrprod: result[0].DESCRPROD,
      ativo: result[0].ATIVO,
    }
  }

  /**
   * Calcula informações do período
   */
  private calcularPeriodo(dataInicio: string, dataFim: string): PeriodoInfoDto {
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    const dias =
      Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return {
      inicio: dataInicio,
      fim: dataFim,
      dias,
    }
  }

  /**
   * Busca resumo de consumo do produto
   */
  private async getResumoConsumo(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    dias: number,
  ): Promise<ResumoConsumoDto> {
    // Query otimizada para caber em ~450 chars
    const query = `SELECT COUNT(DISTINCT ITE.NUNOTA)AS TM,COUNT(*)AS TL,SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.QTDNEG ELSE 0 END)AS QC,SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.VLRTOT ELSE 0 END)AS VC,SUM(CASE WHEN ITE.ATUALESTOQUE>0 THEN ITE.QTDNEG ELSE 0 END)AS QE,SUM(CASE WHEN ITE.ATUALESTOQUE>0 THEN ITE.VLRTOT ELSE 0 END)AS VE FROM TGFITE ITE WITH(NOLOCK)JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA WHERE ITE.CODPROD=${codprod} AND CAB.DTNEG>='${dataInicio}'AND CAB.DTNEG<='${dataFim}'AND CAB.STATUSNOTA='L'`

    const result = await this.sankhyaApiService.executeQuery(query, [])

    const data = result[0] || {}
    const quantidadeConsumo = Number(data.QC || 0)
    const valorConsumo = Number(data.VC || 0)
    const totalMovimentacoes = Number(data.TM || 0)

    return {
      totalMovimentacoes,
      totalLinhas: Number(data.TL || 0),
      quantidadeConsumo,
      valorConsumo,
      quantidadeEntrada: Number(data.QE || 0),
      valorEntrada: Number(data.VE || 0),
      mediaDiariaConsumo: dias > 0 ? quantidadeConsumo / dias : 0,
      mediaPorMovimentacao:
        totalMovimentacoes > 0 ? quantidadeConsumo / totalMovimentacoes : 0,
    }
  }

  /**
   * Busca dados agrupados conforme tipo solicitado
   */
  private async getAgrupamento(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    tipo: string,
    valorTotal: number,
  ): Promise<AgrupamentoDto> {
    let dados: AgrupamentoItemDto[] = []

    switch (tipo) {
      case 'usuario':
        dados = await this.getAgrupamentoPorUsuario(
          codprod,
          dataInicio,
          dataFim,
          valorTotal,
        )
        break
      case 'grupo':
        dados = await this.getAgrupamentoPorGrupo(
          codprod,
          dataInicio,
          dataFim,
          valorTotal,
        )
        break
      case 'parceiro':
        dados = await this.getAgrupamentoPorParceiro(
          codprod,
          dataInicio,
          dataFim,
          valorTotal,
        )
        break
      case 'mes':
        dados = await this.getAgrupamentoPorMes(
          codprod,
          dataInicio,
          dataFim,
          valorTotal,
        )
        break
      case 'tipooper':
        dados = await this.getAgrupamentoPorTipoOper(
          codprod,
          dataInicio,
          dataFim,
          valorTotal,
        )
        break
    }

    return {
      tipo,
      dados,
      total: dados.length,
    }
  }

  /**
   * Agrupamento por usuário (quem CONSUMIU via CODPARC)
   */
  private async getAgrupamentoPorUsuario(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    valorTotal: number,
  ): Promise<AgrupamentoItemDto[]> {
    // Query otimizada <450 chars - JOIN via CODPARC para pegar quem consumiu
    const query = `SELECT TOP 10 U.CODUSU,U.NOMEUSU,U.CODGRUPO,COUNT(DISTINCT C.NUNOTA)AS M,SUM(CASE WHEN I.ATUALESTOQUE<0 THEN I.QTDNEG ELSE 0 END)AS Q,SUM(CASE WHEN I.ATUALESTOQUE<0 THEN I.VLRTOT ELSE 0 END)AS V FROM TGFITE I WITH(NOLOCK)JOIN TGFCAB C WITH(NOLOCK)ON C.NUNOTA=I.NUNOTA LEFT JOIN TSIUSU U WITH(NOLOCK)ON U.CODPARC=C.CODPARC WHERE I.CODPROD=${codprod} AND C.DTNEG>='${dataInicio}'AND C.DTNEG<='${dataFim}'AND C.STATUSNOTA='L'GROUP BY U.CODUSU,U.NOMEUSU,U.CODGRUPO ORDER BY Q DESC`

    const result = await this.sankhyaApiService.executeQuery(query, [])

    return result.map((item) => {
      const valor = Number(item.V || 0)
      return {
        codigo: Number(item.CODUSU || 0),
        nome: item.NOMEUSU || 'Sem usuário',
        codigoGrupo: item.CODGRUPO ? Number(item.CODGRUPO) : undefined,
        movimentacoes: Number(item.M || 0),
        quantidadeConsumo: Number(item.Q || 0),
        valorConsumo: valor,
        percentual: valorTotal > 0 ? (valor / valorTotal) * 100 : 0,
      }
    })
  }

  /**
   * Agrupamento por grupo de usuário (quem CONSUMIU via CODPARC)
   */
  private async getAgrupamentoPorGrupo(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    valorTotal: number,
  ): Promise<AgrupamentoItemDto[]> {
    // Query otimizada <450 chars - JOIN via CODPARC para pegar grupo de quem consumiu
    const query = `SELECT TOP 10 U.CODGRUPO,COUNT(DISTINCT C.NUNOTA)AS M,SUM(CASE WHEN I.ATUALESTOQUE<0 THEN I.QTDNEG ELSE 0 END)AS Q,SUM(CASE WHEN I.ATUALESTOQUE<0 THEN I.VLRTOT ELSE 0 END)AS V FROM TGFITE I WITH(NOLOCK)JOIN TGFCAB C WITH(NOLOCK)ON C.NUNOTA=I.NUNOTA LEFT JOIN TSIUSU U WITH(NOLOCK)ON U.CODPARC=C.CODPARC WHERE I.CODPROD=${codprod} AND C.DTNEG>='${dataInicio}'AND C.DTNEG<='${dataFim}'AND C.STATUSNOTA='L'GROUP BY U.CODGRUPO ORDER BY Q DESC`

    const result = await this.sankhyaApiService.executeQuery(query, [])

    return result.map((item) => {
      const valor = Number(item.V || 0)
      return {
        codigoGrupo: item.CODGRUPO ? Number(item.CODGRUPO) : undefined,
        nomeGrupo: `Grupo ${item.CODGRUPO || 'N/A'}`,
        movimentacoes: Number(item.M || 0),
        quantidadeConsumo: Number(item.Q || 0),
        valorConsumo: valor,
        percentual: valorTotal > 0 ? (valor / valorTotal) * 100 : 0,
      }
    })
  }

  /**
   * Agrupamento por parceiro
   */
  private async getAgrupamentoPorParceiro(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    valorTotal: number,
  ): Promise<AgrupamentoItemDto[]> {
    // Query otimizada <450 chars
    const query = `SELECT TOP 10 CAB.CODPARC,PAR.NOMEPARC,COUNT(DISTINCT CAB.NUNOTA)AS MOV,SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.QTDNEG ELSE 0 END)AS QTD,SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.VLRTOT ELSE 0 END)AS VLR FROM TGFITE ITE WITH(NOLOCK)JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA LEFT JOIN TGFPAR PAR WITH(NOLOCK)ON PAR.CODPARC=CAB.CODPARC WHERE ITE.CODPROD=${codprod} AND CAB.DTNEG>='${dataInicio}'AND CAB.DTNEG<='${dataFim}'AND CAB.STATUSNOTA='L'GROUP BY CAB.CODPARC,PAR.NOMEPARC ORDER BY QTD DESC`

    const result = await this.sankhyaApiService.executeQuery(query, [])

    return result.map((item) => {
      const valor = Number(item.VLR || 0)
      return {
        codigoParceiro: item.CODPARC ? Number(item.CODPARC) : undefined,
        nomeParceiro: item.NOMEPARC || 'Sem parceiro',
        movimentacoes: Number(item.MOV || 0),
        quantidadeConsumo: Number(item.QTD || 0),
        valorConsumo: valor,
        percentual: valorTotal > 0 ? (valor / valorTotal) * 100 : 0,
      }
    })
  }

  /**
   * Agrupamento por mês
   */
  private async getAgrupamentoPorMes(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    valorTotal: number,
  ): Promise<AgrupamentoItemDto[]> {
    // Query otimizada <450 chars
    const query = `SELECT SUBSTRING(CONVERT(VARCHAR,CAB.DTNEG,120),1,7)AS MES,COUNT(DISTINCT CAB.NUNOTA)AS MOV,SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.QTDNEG ELSE 0 END)AS QTD,SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.VLRTOT ELSE 0 END)AS VLR FROM TGFITE ITE WITH(NOLOCK)JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA WHERE ITE.CODPROD=${codprod} AND CAB.DTNEG>='${dataInicio}'AND CAB.DTNEG<='${dataFim}'AND CAB.STATUSNOTA='L'GROUP BY SUBSTRING(CONVERT(VARCHAR,CAB.DTNEG,120),1,7)ORDER BY MES DESC`

    const result = await this.sankhyaApiService.executeQuery(query, [])

    return result.map((item) => {
      const valor = Number(item.VLR || 0)
      return {
        mes: item.MES,
        movimentacoes: Number(item.MOV || 0),
        quantidadeConsumo: Number(item.QTD || 0),
        valorConsumo: valor,
        percentual: valorTotal > 0 ? (valor / valorTotal) * 100 : 0,
      }
    })
  }

  /**
   * Agrupamento por tipo de operação
   */
  private async getAgrupamentoPorTipoOper(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    valorTotal: number,
  ): Promise<AgrupamentoItemDto[]> {
    // Query otimizada <450 chars
    const query = `SELECT TOP 10 CAB.CODTIPOPER,COUNT(DISTINCT CAB.NUNOTA)AS MOV,SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.QTDNEG ELSE 0 END)AS QTD,SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.VLRTOT ELSE 0 END)AS VLR FROM TGFITE ITE WITH(NOLOCK)JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA WHERE ITE.CODPROD=${codprod} AND CAB.DTNEG>='${dataInicio}'AND CAB.DTNEG<='${dataFim}'AND CAB.STATUSNOTA='L'GROUP BY CAB.CODTIPOPER ORDER BY QTD DESC`

    const result = await this.sankhyaApiService.executeQuery(query, [])

    return result.map((item) => {
      const valor = Number(item.VLR || 0)
      return {
        tipoOperacao: item.CODTIPOPER ? Number(item.CODTIPOPER) : undefined,
        movimentacoes: Number(item.MOV || 0),
        quantidadeConsumo: Number(item.QTD || 0),
        valorConsumo: valor,
        percentual: valorTotal > 0 ? (valor / valorTotal) * 100 : 0,
      }
    })
  }

  /**
   * Busca movimentações detalhadas (paginadas)
   */
  private async getMovimentacoes(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    page: number,
    perPage: number,
  ): Promise<MovimentacoesDto> {
    // 1. Contar total
    const countQuery = `SELECT COUNT(*)AS T FROM TGFITE ITE WITH(NOLOCK)JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA WHERE ITE.CODPROD=${codprod} AND CAB.DTNEG>='${dataInicio}'AND CAB.DTNEG<='${dataFim}'AND CAB.STATUSNOTA='L'`
    const countResult = await this.sankhyaApiService.executeQuery(
      countQuery,
      [],
    )
    const total = Number(countResult[0]?.T || 0)

    // 2. Buscar página
    const offset = (page - 1) * perPage
    const query = `SELECT CAB.DTNEG,CAB.NUNOTA,CAB.NUMNOTA,CAB.CODTIPOPER,CAB.CODUSUINC,CAB.CODPARC,ITE.ATUALESTOQUE,ITE.QTDNEG,ITE.VLRUNIT,ITE.VLRTOT,USU.NOMEUSU,PAR.NOMEPARC FROM TGFITE ITE WITH(NOLOCK)JOIN TGFCAB CAB WITH(NOLOCK)ON CAB.NUNOTA=ITE.NUNOTA LEFT JOIN TSIUSU USU WITH(NOLOCK)ON USU.CODUSU=CAB.CODUSUINC LEFT JOIN TGFPAR PAR WITH(NOLOCK)ON PAR.CODPARC=CAB.CODPARC WHERE ITE.CODPROD=${codprod} AND CAB.DTNEG>='${dataInicio}'AND CAB.DTNEG<='${dataFim}'AND CAB.STATUSNOTA='L'ORDER BY CAB.DTNEG DESC OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY`

    const result = await this.sankhyaApiService.executeQuery(query, [])

    const data: MovimentacaoDetalhadaDto[] = result.map((item) => ({
      data: item.DTNEG,
      nunota: Number(item.NUNOTA),
      numnota: item.NUMNOTA ? Number(item.NUMNOTA) : undefined,
      codtipoper: Number(item.CODTIPOPER || 0),
      atualestoque: Number(item.ATUALESTOQUE || 0),
      tipoMovimento:
        Number(item.ATUALESTOQUE || 0) < 0
          ? 'CONSUMO'
          : Number(item.ATUALESTOQUE || 0) > 0
            ? 'ENTRADA'
            : 'NEUTRO',
      codusuinc: item.CODUSUINC ? Number(item.CODUSUINC) : undefined,
      nomeusuinc: item.NOMEUSU,
      codparc: item.CODPARC ? Number(item.CODPARC) : undefined,
      nomeparc: item.NOMEPARC,
      quantidade: Number(item.QTDNEG || 0),
      valorUnitario: Number(item.VLRUNIT || 0),
      valorTotal: Number(item.VLRTOT || 0),
    }))

    const lastPage = Math.ceil(total / perPage)

    return {
      data,
      page,
      perPage,
      total,
      lastPage,
    }
  }

  /**
   * Mapeia resultado SQL para MovimentacaoConsumo
   */
  private mapToMovimentacaoConsumo(item: any): MovimentacaoConsumo {
    // Formatar DTMOV (data + hora) em TypeScript ao invés de SQL para economizar tamanho de query
    let dtmovFormatted: string | undefined
    if (item.DTMOV && item.HRMOV) {
      const dtmov = new Date(item.DTMOV)
      const hrmov = new Date(item.HRMOV)
      const datePart = dtmov.toISOString().split('T')[0] // YYYY-MM-DD
      const timePart = hrmov.toISOString().split('T')[1].substring(0, 8) // HH:MM:SS
      dtmovFormatted = `${datePart} ${timePart}`
    }

    // Mapear descrições de STATUSNOTA em TypeScript ao invés de SQL
    const statusnotaDescr = this.getStatusNotaDescr(item.STATUSNOTA)

    // Mapear descrições de ATUALEST em TypeScript ao invés de SQL
    const atualizaEstoqueDescr = this.getAtualizaEstoqueDescr(item.ATUALEST)

    return {
      nunota: Number(item.NUNOTA),
      sequencia: item.SEQUENCIA ? Number(item.SEQUENCIA) : undefined,
      nunotaOrig: item.NUNOTA_ORIGEM ? Number(item.NUNOTA_ORIGEM) : undefined,
      sequenciaOrig: item.SEQUENCIA_ORIGEM
        ? Number(item.SEQUENCIA_ORIGEM)
        : undefined,
      numnota: item.NUMNOTA,
      codemp: undefined, // Removido da query para economizar tamanho
      codparc: undefined, // Removido da query para economizar tamanho
      nomeparc: undefined, // Será buscado separadamente se necessário
      dtneg: item.DTNEG,
      dtmov: dtmovFormatted,
      statusnota: item.STATUSNOTA,
      statusnotaDescr,
      codtipoper: item.CODTIPOPER ? Number(item.CODTIPOPER) : undefined,
      descrtipoper: item.DESCROPER,
      atualizaEstoque: item.ATUALEST,
      atualizaEstoqueDescr,
      codusuinc: item.CODUSUINC ? Number(item.CODUSUINC) : undefined,
      nomeusu: item.NOMEUSU,
      coddep: undefined, // Removido da query para economizar tamanho
      descrDep: undefined, // Será buscado separadamente se necessário
      codprod: item.CODPROD ? Number(item.CODPROD) : undefined,
      descrprod: item.DESCRPROD,
      qtdneg: item.QTDNEG ? Number(item.QTDNEG) : undefined,
      vlrunit: item.VLRUNIT ? Number(item.VLRUNIT) : undefined,
      vlrtot: item.VLRTOT ? Number(item.VLRTOT) : undefined,
      codlocal: item.CODLOCALORIG ? Number(item.CODLOCALORIG) : undefined,
      descrlocal: undefined, // Será buscado separadamente se necessário
    }
  }

  private getStatusNotaDescr(statusnota: string): string {
    switch (statusnota) {
      case 'A':
        return 'Atendimento'
      case 'L':
        return 'Liberada'
      case 'P':
        return 'Pendente'
      default:
        return 'Outro'
    }
  }

  private getAtualizaEstoqueDescr(atualest: string): string {
    switch (atualest) {
      case 'B':
        return 'Baixar estoque'
      case 'E':
        return 'Entrar no estoque'
      case 'N':
        return 'Não movimenta estoque'
      case 'R':
        return 'Reservar estoque'
      default:
        return 'Indefinido'
    }
  }

  /**
   * ===========================================================================
   * ENDPOINTS DE QUALIDADE DE DADOS
   * ===========================================================================
   */

  /**
   * Busca produtos sem NCM cadastrado
   * Endpoint de qualidade de dados para compliance fiscal
   */
  async findProdutosSemNCM(dto: ProdutosSemNcmDto): Promise<{
    produtos: any[]
    total: number
    page: number
    perPage: number
    lastPage: number
    hasMore: boolean
    totalAtivos: number
    totalCriticos: number
  }> {
    this.logger.log(
      `Finding products without NCM with filters: ${JSON.stringify(dto)}`,
    )

    const page = dto.page || 1
    const perPage = dto.perPage || 20

    // Construir WHERE clause base (sem NCM)
    let whereClause =
      " AND (P.NCM IS NULL OR P.NCM = '' OR LEN(LTRIM(RTRIM(P.NCM))) = 0)"

    // Adicionar filtros opcionais
    if (dto.search) {
      const searchEscaped = dto.search.trim().replace(/'/g, "''")
      whereClause += ` AND (P.DESCRPROD LIKE '%${searchEscaped}%' OR P.REFERENCIA LIKE '%${searchEscaped}%' OR P.MARCA LIKE '%${searchEscaped}%')`
    }

    if (dto.codgrupoprod) {
      whereClause += ` AND P.CODGRUPOPROD = ${dto.codgrupoprod}`
    }

    if (dto.ativo) {
      whereClause += ` AND P.ATIVO = '${dto.ativo}'`
    }

    if (dto.marca) {
      const marcaEscaped = dto.marca.trim().replace(/'/g, "''")
      whereClause += ` AND P.MARCA LIKE '%${marcaEscaped}%'`
    }

    if (dto.codlocal) {
      whereClause += ` AND P.CODLOCALPADRAO = ${dto.codlocal}`
    }

    if (dto.usoprod) {
      whereClause += ` AND P.USOPROD = '${dto.usoprod}'`
    }

    // 1. Contar total de registros (sem paginação)
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM TGFPRO P WITH (NOLOCK)
      WHERE P.CODPROD <> 0 ${whereClause}
    `

    const countResult = await this.sankhyaApiService.executeQuery(
      countQuery,
      [],
    )
    const total = Number(countResult[0]?.total || 0)

    // 2. Buscar página solicitada
    const sortOrder = dto.sort || 'P.CODPROD DESC'
    const offset = (page - 1) * perPage

    // IMPORTANTE: API Sankhya restrições via executeQuery:
    // ✅ PERMITIDO: P.CODUSU, P.USOPROD, JOIN com TSIUSU via P.CODUSU, JOIN com TGFLOC
    // ❌ BLOQUEADO (retorna erro 500):
    //    - P.DTALTER (data de alteração/modificação - campo existe mas API bloqueia)
    //    - P.DTCAD (data de cadastro - campo existe mas API bloqueia)
    //    - P.CODUSUINC, P.CODUSUALT (usuários inc/alt - campos existem mas API bloqueia)
    // MOTIVO: Restrições de segurança da API Sankhya para proteção de dados de auditoria
    const query = `
      SELECT
        P.CODPROD,
        P.DESCRPROD,
        P.COMPLDESC,
        P.REFERENCIA,
        P.MARCA,
        P.CODGRUPOPROD,
        P.CODVOL,
        P.ATIVO,
        P.NCM,
        P.LOCALIZACAO,
        P.CODLOCALPADRAO,
        P.USALOCAL,
        P.USOPROD,
        G.DESCRGRUPOPROD,
        V.DESCRVOL,
        L.DESCRLOCAL,
        U.CODUSU,
        U.NOMEUSU,
        U.DTLIMACESSO
      FROM TGFPRO P WITH (NOLOCK)
      LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
      LEFT JOIN TGFVOL V WITH (NOLOCK) ON V.CODVOL = P.CODVOL
      LEFT JOIN TGFLOC L WITH (NOLOCK) ON L.CODLOCAL = P.CODLOCALPADRAO
      LEFT JOIN TSIUSU U WITH (NOLOCK) ON U.CODUSU = P.CODUSU
      WHERE P.CODPROD <> 0 ${whereClause}
      ORDER BY ${sortOrder}
      OFFSET ${offset} ROWS
      FETCH NEXT ${perPage} ROWS ONLY
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])

    // Mapear resultados com criticidade
    const produtos = result.map((item) => {
      const estoqueTotal = 0 // Cannot get from query due to API restrictions
      const ativo = item.ATIVO === 'S'

      let criticidade: 'ALTA' | 'MEDIA' | 'BAIXA'
      if (ativo && estoqueTotal > 0) {
        criticidade = 'ALTA' // Ativo com estoque - impede vendas
      } else if (ativo) {
        criticidade = 'MEDIA' // Ativo sem estoque - pode ser reativado
      } else {
        criticidade = 'BAIXA' // Inativo - baixa prioridade
      }

      return {
        ...this.mapToProduto2(item),
        estoqueTotal,
        criticidade,
      }
    })

    // Filtrar por criticidade se solicitado (pós-processamento)
    let produtosFiltrados = produtos
    if (dto.criticidade) {
      produtosFiltrados = produtos.filter(
        (p) => p.criticidade === dto.criticidade,
      )
    }

    // Estatísticas gerais (baseadas no total)
    const lastPage = Math.ceil(total / perPage)
    const hasMore = page < lastPage

    // Buscar estatísticas TOTAIS (sem filtros, apenas produtos sem NCM, excluindo CODPROD = 0)
    const statsQueryAtivos = `
      SELECT COUNT(*) AS total
      FROM TGFPRO P WITH (NOLOCK)
      WHERE P.CODPROD <> 0
        AND (P.NCM IS NULL OR P.NCM = '' OR LEN(LTRIM(RTRIM(P.NCM))) = 0)
        AND P.ATIVO = 'S'
    `
    const statsResultAtivos = await this.sankhyaApiService.executeQuery(
      statsQueryAtivos,
      [],
    )
    const totalAtivos = Number(statsResultAtivos[0]?.total || 0)

    // Total crítico = ativos (já que não temos estoque em tempo real)
    const totalCriticos = 0

    return {
      produtos: produtosFiltrados,
      total,
      page,
      perPage,
      lastPage,
      hasMore,
      totalAtivos,
      totalCriticos,
    }
  }

  /**
   * Obtém estatísticas globais de produtos sem NCM
   * Usado pelos KPI cards (não afetado por filtros)
   */
  async getStatsProdutosSemNCM(): Promise<{
    total: number
    totalAtivos: number
    totalInativos: number
    totalCriticosAlta: number
  }> {
    this.logger.log('Getting global stats for products without NCM')

    // Total geral sem NCM (excluindo CODPROD = 0)
    const queryTotal = `
      SELECT COUNT(*) AS total
      FROM TGFPRO P WITH (NOLOCK)
      WHERE P.CODPROD <> 0
        AND (P.NCM IS NULL OR P.NCM = '' OR LEN(LTRIM(RTRIM(P.NCM))) = 0)
    `
    const resultTotal = await this.sankhyaApiService.executeQuery(
      queryTotal,
      [],
    )
    const total = Number(resultTotal[0]?.total || 0)

    // Total ativos sem NCM (excluindo CODPROD = 0)
    const queryAtivos = `
      SELECT COUNT(*) AS total
      FROM TGFPRO P WITH (NOLOCK)
      WHERE P.CODPROD <> 0
        AND (P.NCM IS NULL OR P.NCM = '' OR LEN(LTRIM(RTRIM(P.NCM))) = 0)
        AND P.ATIVO = 'S'
    `
    const resultAtivos = await this.sankhyaApiService.executeQuery(
      queryAtivos,
      [],
    )
    const totalAtivos = Number(resultAtivos[0]?.total || 0)

    // Total inativos = total - ativos
    const totalInativos = total - totalAtivos

    // Críticos ALTA = 0 (não temos acesso a estoque em tempo real)
    const totalCriticosAlta = 0

    return {
      total,
      totalAtivos,
      totalInativos,
      totalCriticosAlta,
    }
  }

  /**
   * Busca lista de grupos de produtos que possuem produtos sem NCM (para filtros)
   */
  async getGruposProdutos(): Promise<
    { codgrupoprod: number; descrgrupoprod: string }[]
  > {
    this.logger.log('Fetching product groups list (only with products without NCM)')

    const query = `
      SELECT DISTINCT G.CODGRUPOPROD, G.DESCRGRUPOPROD
      FROM TGFGRU G WITH (NOLOCK)
      INNER JOIN TGFPRO P WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD
      WHERE G.ATIVO = 'S'
        AND P.CODPROD <> 0
        AND (P.NCM IS NULL OR P.NCM = '' OR LEN(LTRIM(RTRIM(P.NCM))) = 0)
      ORDER BY G.DESCRGRUPOPROD ASC
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])

    return result.map((item) => ({
      codgrupoprod: Number(item.CODGRUPOPROD),
      descrgrupoprod: item.DESCRGRUPOPROD,
    }))
  }

  /**
   * Busca lista de locais de estoque que possuem produtos sem NCM (para filtros)
   */
  async getLocaisEstoque(): Promise<
    { codlocal: number; descrlocal: string }[]
  > {
    this.logger.log('Fetching stock locations list (only with products without NCM)')

    const query = `
      SELECT DISTINCT L.CODLOCAL, L.DESCRLOCAL
      FROM TGFLOC L WITH (NOLOCK)
      INNER JOIN TGFPRO P WITH (NOLOCK) ON P.CODLOCALPADRAO = L.CODLOCAL
      WHERE L.ATIVO = 'S'
        AND L.ANALITICO = 'S'
        AND P.CODPROD <> 0
        AND (P.NCM IS NULL OR P.NCM = '' OR LEN(LTRIM(RTRIM(P.NCM))) = 0)
      ORDER BY L.DESCRLOCAL ASC
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])

    return result.map((item) => ({
      codlocal: Number(item.CODLOCAL),
      descrlocal: item.DESCRLOCAL,
    }))
  }
}
