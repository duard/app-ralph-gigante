import { Injectable, Logger } from '@nestjs/common'
import {
  PaginatedResult,
  buildPaginatedResult,
} from '../../common/pagination/pagination.types'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import { ProdutoFindAllDto, ConsumoFindAllDto } from './dtos'
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
      // Campos de tracking/auditoria
      codusuinc: item.CODUSUINC ? Number(item.CODUSUINC) : undefined,
      dtcad: item.DTCAD,
      codusualt: item.CODUSUALT ? Number(item.CODUSUALT) : undefined,
      dtalter: item.DTALTER,
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
    this.logger.log(`Finding consumption movements with filters: ${JSON.stringify(dto)}`)

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

    const countResult = await this.sankhyaApiService.executeQuery(countQuery, [])
    const total = Number(countResult[0]?.total || 0)

    // Buscar movimentações
    const offset = (page - 1) * perPage
    const query = `
      SELECT
        ITE.NUNOTA,
        ITE.SEQUENCIA,
        ITE.CODPROD,
        ITE.QTDNEG,
        ITE.VLRUNIT,
        ITE.VLRTOT,
        ITE.CODLOCALORIG AS CODLOCAL,
        CAB.NUMNOTA,
        CAB.CODEMP,
        CAB.CODPARC,
        CAB.DTNEG,
        CONVERT(VARCHAR(10), CAB.DTMOV, 120) + ' ' + CONVERT(VARCHAR(8), CAB.HRMOV, 108) AS DTMOV,
        CAB.STATUSNOTA,
        CASE CAB.STATUSNOTA
          WHEN 'A' THEN 'Atendimento'
          WHEN 'L' THEN 'Liberada'
          WHEN 'P' THEN 'Pendente'
          ELSE 'Outro'
        END AS STATUSNOTA_DESCR,
        CAB.CODTIPOPER,
        CAB.CODDEP,
        CAB.CODUSUINC,
        TOPV.DESCROPER AS DESCRTIPOPER,
        TOPV.ATUALEST AS ATUALIZA_ESTOQUE,
        CASE TOPV.ATUALEST
          WHEN 'B' THEN 'Baixar estoque'
          WHEN 'E' THEN 'Entrar no estoque'
          WHEN 'N' THEN 'Não movimenta estoque'
          WHEN 'R' THEN 'Reservar estoque'
          ELSE 'Indefinido'
        END AS ATUALIZA_ESTOQUE_DESCR,
        USU.NOMEUSU,
        P.DESCRPROD,
        DEP.DESCRDEP,
        LOC.DESCRLOCAL,
        PAR.NOMEPARC
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
      LEFT JOIN TGFDEP DEP WITH (NOLOCK) ON DEP.CODDEP = CAB.CODDEP
      LEFT JOIN TGFLOC LOC WITH (NOLOCK) ON LOC.CODLOCAL = ITE.CODLOCALORIG
      LEFT JOIN TGFPAR PAR WITH (NOLOCK) ON PAR.CODPARC = CAB.CODPARC
      ${whereClause}
        AND CAB.STATUSNOTA != 'C'
      ORDER BY CAB.DTNEG DESC, ITE.NUNOTA DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${perPage} ROWS ONLY
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])
    const movimentacoes = result.map((item) => this.mapToMovimentacaoConsumo(item))

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

    const resultGeral = await this.sankhyaApiService.executeQuery(queryGeral, [])

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
      percentual: quantidadeTotal > 0 ? (Number(item.QUANTIDADE || 0) / quantidadeTotal) * 100 : 0,
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

    const resultUsuarios = await this.sankhyaApiService.executeQuery(queryUsuarios, [])

    const usuarios = resultUsuarios.map((item) => ({
      codusuinc: Number(item.CODUSUINC || 0),
      nomeusu: item.NOMEUSU || 'Usuário desconhecido',
      quantidade: Number(item.QUANTIDADE || 0),
      percentual: quantidadeTotal > 0 ? (Number(item.QUANTIDADE || 0) / quantidadeTotal) * 100 : 0,
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

    const whereBase = `
      WHERE CAB.DTNEG >= '${dataInicio}'
        AND CAB.DTNEG <= '${dataFim}'
        AND CAB.STATUSNOTA != 'C'
        AND TOPV.ATUALEST = 'B'
    `

    // Totais gerais
    const queryTotais = `
      SELECT
        COUNT(DISTINCT ITE.NUNOTA) AS TOTAL_MOVIMENTACOES,
        COUNT(DISTINCT ITE.CODPROD) AS TOTAL_PRODUTOS,
        COUNT(DISTINCT CAB.CODDEP) AS TOTAL_DEPARTAMENTOS,
        COUNT(DISTINCT CAB.CODUSUINC) AS TOTAL_USUARIOS,
        SUM(ITE.QTDNEG) AS QUANTIDADE_TOTAL,
        SUM(ITE.VLRTOT) AS VALOR_TOTAL
      FROM TGFITE ITE WITH (NOLOCK)
      INNER JOIN TGFCAB CAB WITH (NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
      LEFT JOIN TGFTOP TOPV WITH (NOLOCK) ON TOPV.CODTIPOPER = CAB.CODTIPOPER
        AND TOPV.DHALTER = (
          SELECT MAX(TOP2.DHALTER)
          FROM TGFTOP TOP2 WITH (NOLOCK)
          WHERE TOP2.CODTIPOPER = CAB.CODTIPOPER
            AND TOP2.DHALTER <= CAB.DTNEG
        )
      ${whereBase}
    `

    const resultTotais = await this.sankhyaApiService.executeQuery(queryTotais, [])
    const totais = resultTotais[0]

    const quantidadeTotal = Number(totais.QUANTIDADE_TOTAL || 0)
    const valorTotal = Number(totais.VALOR_TOTAL || 0)

    // Top produtos
    const queryTopProdutos = `
      SELECT TOP ${top}
        ITE.CODPROD,
        P.DESCRPROD,
        SUM(ITE.QTDNEG) AS QUANTIDADE,
        SUM(ITE.VLRTOT) AS VALOR
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
      ${whereBase}
      GROUP BY ITE.CODPROD, P.DESCRPROD
      ORDER BY QUANTIDADE DESC
    `

    const resultTopProdutos = await this.sankhyaApiService.executeQuery(
      queryTopProdutos,
      [],
    )

    const topProdutos = resultTopProdutos.map((item) => ({
      codprod: Number(item.CODPROD),
      descrprod: item.DESCRPROD,
      quantidade: Number(item.QUANTIDADE || 0),
      valor: Number(item.VALOR || 0),
      percentual: quantidadeTotal > 0 ? (Number(item.QUANTIDADE || 0) / quantidadeTotal) * 100 : 0,
    }))

    // Top departamentos
    const queryTopDepartamentos = `
      SELECT TOP ${top}
        CAB.CODDEP,
        DEP.DESCRDEP,
        SUM(ITE.QTDNEG) AS QUANTIDADE,
        SUM(ITE.VLRTOT) AS VALOR
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
      ${whereBase}
      GROUP BY CAB.CODDEP, DEP.DESCRDEP
      ORDER BY QUANTIDADE DESC
    `

    const resultTopDepartamentos = await this.sankhyaApiService.executeQuery(
      queryTopDepartamentos,
      [],
    )

    const topDepartamentos = resultTopDepartamentos.map((item) => ({
      coddep: item.CODDEP ? Number(item.CODDEP) : undefined,
      descrDep: item.DESCRDEP || 'Sem departamento',
      quantidade: Number(item.QUANTIDADE || 0),
      valor: Number(item.VALOR || 0),
      percentual: quantidadeTotal > 0 ? (Number(item.QUANTIDADE || 0) / quantidadeTotal) * 100 : 0,
    }))

    // Top usuários
    const queryTopUsuarios = `
      SELECT TOP ${top}
        CAB.CODUSUINC,
        USU.NOMEUSU,
        SUM(ITE.QTDNEG) AS QUANTIDADE,
        SUM(ITE.VLRTOT) AS VALOR
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
      ${whereBase}
      GROUP BY CAB.CODUSUINC, USU.NOMEUSU
      ORDER BY QUANTIDADE DESC
    `

    const resultTopUsuarios = await this.sankhyaApiService.executeQuery(
      queryTopUsuarios,
      [],
    )

    const topUsuarios = resultTopUsuarios.map((item) => ({
      codusuinc: Number(item.CODUSUINC || 0),
      nomeusu: item.NOMEUSU || 'Usuário desconhecido',
      quantidade: Number(item.QUANTIDADE || 0),
      valor: Number(item.VALOR || 0),
      percentual: quantidadeTotal > 0 ? (Number(item.QUANTIDADE || 0) / quantidadeTotal) * 100 : 0,
    }))

    // Calcular dias
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return {
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
        dias,
      },
      totais: {
        movimentacoes: Number(totais.TOTAL_MOVIMENTACOES || 0),
        produtos: Number(totais.TOTAL_PRODUTOS || 0),
        departamentos: Number(totais.TOTAL_DEPARTAMENTOS || 0),
        usuarios: Number(totais.TOTAL_USUARIOS || 0),
        quantidadeTotal,
        valorTotal,
      },
      topProdutos,
      topDepartamentos,
      topUsuarios,
    }
  }

  /**
   * Mapeia resultado SQL para MovimentacaoConsumo
   */
  private mapToMovimentacaoConsumo(item: any): MovimentacaoConsumo {
    return {
      nunota: Number(item.NUNOTA),
      sequencia: item.SEQUENCIA ? Number(item.SEQUENCIA) : undefined,
      nunotaOrig: item.NUNOTA_ORIGEM ? Number(item.NUNOTA_ORIGEM) : undefined,
      sequenciaOrig: item.SEQUENCIA_ORIGEM ? Number(item.SEQUENCIA_ORIGEM) : undefined,
      numnota: item.NUMNOTA,
      codemp: item.CODEMP ? Number(item.CODEMP) : undefined,
      codparc: item.CODPARC ? Number(item.CODPARC) : undefined,
      nomeparc: item.NOMEPARC,
      dtneg: item.DTNEG,
      dtmov: item.DTMOV,
      statusnota: item.STATUSNOTA,
      statusnotaDescr: item.STATUSNOTA_DESCR,
      codtipoper: item.CODTIPOPER ? Number(item.CODTIPOPER) : undefined,
      descrtipoper: item.DESCRTIPOPER,
      atualizaEstoque: item.ATUALIZA_ESTOQUE,
      atualizaEstoqueDescr: item.ATUALIZA_ESTOQUE_DESCR,
      codusuinc: item.CODUSUINC ? Number(item.CODUSUINC) : undefined,
      nomeusu: item.NOMEUSU,
      coddep: item.CODDEP ? Number(item.CODDEP) : undefined,
      descrDep: item.DESCRDEP,
      codprod: item.CODPROD ? Number(item.CODPROD) : undefined,
      descrprod: item.DESCRPROD,
      qtdneg: item.QTDNEG ? Number(item.QTDNEG) : undefined,
      vlrunit: item.VLRUNIT ? Number(item.VLRUNIT) : undefined,
      vlrtot: item.VLRTOT ? Number(item.VLRTOT) : undefined,
      codlocal: item.CODLOCAL ? Number(item.CODLOCAL) : undefined,
      descrlocal: item.DESCRLOCAL,
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
  async findProdutosSemNCM(): Promise<{
    produtos: Produto2[]
    total: number
    totalAtivos: number
    totalComEstoque: number
    totalCriticos: number
  }> {
    this.logger.log('Finding products without NCM')

    // Query para buscar produtos sem NCM
    // Usando CTE para permitir referência ao campo calculado ESTOQUE_TOTAL
    const query = `
      WITH ProdutosSemNCM AS (
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
          G.DESCRGRUPOPROD,
          V.DESCRVOL,
          -- Campos de tracking/auditoria
          P.CODUSUINC,
          P.DTALTER,
          P.DTCAD,
          P.CODUSUALT,
          USUINC.NOMEUSU AS NOMEUSU_INC,
          USUALT.NOMEUSU AS NOMEUSU_ALT,
          -- Calcular estoque total
          ISNULL((
            SELECT SUM(LOC.ESTOQUE)
            FROM TGFLOC LOC WITH (NOLOCK)
            WHERE LOC.CODPROD = P.CODPROD
          ), 0) AS ESTOQUE_TOTAL
        FROM TGFPRO P WITH (NOLOCK)
        LEFT JOIN TGFGRU G WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
        LEFT JOIN TGFVOL V WITH (NOLOCK) ON V.CODVOL = P.CODVOL
        LEFT JOIN TSIUSU USUINC WITH (NOLOCK) ON USUINC.CODUSU = P.CODUSUINC
        LEFT JOIN TSIUSU USUALT WITH (NOLOCK) ON USUALT.CODUSU = P.CODUSUALT
        WHERE (P.NCM IS NULL OR P.NCM = '' OR LEN(LTRIM(RTRIM(P.NCM))) = 0)
      )
      SELECT *
      FROM ProdutosSemNCM
      ORDER BY
        CASE
          WHEN ATIVO = 'S' AND ESTOQUE_TOTAL > 0 THEN 1  -- Críticos: ativos com estoque
          WHEN ATIVO = 'S' AND ESTOQUE_TOTAL = 0 THEN 2  -- Médios: ativos sem estoque
          ELSE 3  -- Baixos: inativos
        END,
        DESCRPROD
    `

    const result = await this.sankhyaApiService.executeQuery(query, [])

    // Mapear resultados com criticidade
    const produtos = result.map((item) => {
      const estoqueTotal = Number(item.ESTOQUE_TOTAL || 0)
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

    // Estatísticas
    const total = produtos.length
    const totalAtivos = produtos.filter(p => p.ativo === 'S').length
    const totalComEstoque = produtos.filter(p => p['estoqueTotal'] > 0).length
    const totalCriticos = produtos.filter(p => p['criticidade'] === 'ALTA').length

    return {
      produtos,
      total,
      totalAtivos,
      totalComEstoque,
      totalCriticos,
    }
  }
}
