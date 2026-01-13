import { Injectable, Logger } from '@nestjs/common'
import { SankhyaApiService } from '../shared/sankhya-api.service'
import {
  PaginatedResult,
  buildPaginatedResult,
} from '../../common/pagination/pagination.types'
import {
  DashboardKpis,
  ProdutoV2,
  ProdutoV2Completo,
  FiltroOpcao,
  GrupoResumo,
  LocalResumo,
  ProdutoV2FindAllDto,
} from './models'

@Injectable()
export class ProdutosV2Service {
  private readonly logger = new Logger(ProdutosV2Service.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  async getDashboardKpis(): Promise<DashboardKpis> {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM TGFPRO WITH (NOLOCK) WHERE ATIVO = 'S') AS totalProdutos,
        (SELECT COUNT(DISTINCT CODGRUPOPROD) FROM TGFPRO WITH (NOLOCK) WHERE ATIVO = 'S') AS totalGrupos,
        (SELECT COUNT(DISTINCT CODLOCAL) FROM TGFEST WITH (NOLOCK) WHERE ATIVO = 'S') AS totalLocais,
        (SELECT COUNT(DISTINCT P.CODPROD) FROM TGFPRO P WITH (NOLOCK)
          INNER JOIN TGFEST E WITH (NOLOCK) ON P.CODPROD = E.CODPROD
          WHERE P.ATIVO = 'S' AND E.ATIVO = 'S' AND E.ESTOQUE < E.ESTMIN AND E.ESTMIN > 0
        ) AS produtosCriticos,
        (SELECT COUNT(DISTINCT P.CODPROD) FROM TGFPRO P WITH (NOLOCK)
          LEFT JOIN TGFEST E WITH (NOLOCK) ON P.CODPROD = E.CODPROD AND E.ATIVO = 'S'
          WHERE P.ATIVO = 'S' AND (E.ESTOQUE IS NULL OR E.ESTOQUE = 0)
        ) AS produtosSemMovimento,
        (SELECT ISNULL(SUM(E.ESTOQUE), 0) FROM TGFEST E WITH (NOLOCK) WHERE E.ATIVO = 'S') AS valorTotalEstoque
    `
    try {
      const result = await this.sankhyaApiService.executeQuery(query, [])
      if (result.length > 0) {
        return {
          totalProdutos: Number(result[0].totalProdutos) || 0,
          totalGrupos: Number(result[0].totalGrupos) || 0,
          totalLocais: Number(result[0].totalLocais) || 0,
          produtosCriticos: Number(result[0].produtosCriticos) || 0,
          produtosSemMovimento: Number(result[0].produtosSemMovimento) || 0,
          valorTotalEstoque: Number(result[0].valorTotalEstoque) || 0,
        }
      }
      return {
        totalProdutos: 0,
        totalGrupos: 0,
        totalLocais: 0,
        produtosCriticos: 0,
        produtosSemMovimento: 0,
        valorTotalEstoque: 0,
      }
    } catch (error) {
      this.logger.error(
        'Erro em getDashboardKpis:',
        (error as any)?.message || error,
      )
      throw error
    }
  }

  async findAll(dto: ProdutoV2FindAllDto): Promise<PaginatedResult<ProdutoV2>> {
    const whereClauses: string[] = []

    if (dto.search) {
      const s = dto.search.trim().replace(/'/g, "''")
      whereClauses.push(
        `(P.DESCRPROD LIKE '%${s}%' OR P.REFERENCIA LIKE '%${s}%' OR P.MARCA LIKE '%${s}%')`,
      )
    }

    if (dto.grupos && dto.grupos.length > 0) {
      whereClauses.push(`P.CODGRUPOPROD IN (${dto.grupos.join(',')})`)
    }

    if (dto.locais && dto.locais.length > 0) {
      whereClauses.push(`E.CODLOCAL IN (${dto.locais.join(',')})`)
    }

    if (dto.controles && dto.controles.length > 0) {
      const controlesCond = dto.controles
        .map((c) => `P.TIPCONTEST = '${c.replace(/'/g, "''")}'`)
        .join(' OR ')
      whereClauses.push(`(${controlesCond})`)
    }

    if (dto.marcas && dto.marcas.length > 0) {
      const marcasCond = dto.marcas
        .map((m) => `P.MARCA = '${m.replace(/'/g, "''")}'`)
        .join(' OR ')
      whereClauses.push(`(${marcasCond})`)
    }

    if (dto.ativo) {
      whereClauses.push(`P.ATIVO = '${dto.ativo}'`)
    }

    if (dto.comEstoque) {
      whereClauses.push(`E.ESTOQUE > 0`)
    }

    if (dto.semEstoque) {
      whereClauses.push(`(E.ESTOQUE IS NULL OR E.ESTOQUE = 0)`)
    }

    if (dto.critico) {
      whereClauses.push(`E.ESTOQUE < E.ESTMIN AND E.ESTMIN > 0`)
    }

    if (dto.estoqueMin !== undefined) {
      whereClauses.push(`E.ESTOQUE >= ${dto.estoqueMin}`)
    }

    if (dto.estoqueMax !== undefined) {
      whereClauses.push(`E.ESTOQUE <= ${dto.estoqueMax}`)
    }

    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(' AND ')}`
      : ''

    const perPage = Math.min(Number(dto.perPage) || 50, 200)
    const page = Number(dto.page) || 1
    const offset = (page - 1) * perPage

    const validSortColumns: Record<string, string> = {
      codprod: 'P.CODPROD',
      descrprod: 'P.DESCRPROD',
      grupo: 'G.DESCRGRUPOPROD',
      estoque: 'E.ESTOQUE',
      marca: 'P.MARCA',
    }
    let orderBy = 'P.CODPROD DESC'
    if (dto.sort) {
      const [col, dir] = dto.sort.toLowerCase().split(/\s+/)
      const mappedCol = validSortColumns[col]
      if (mappedCol) {
        const direction = dir === 'asc' ? 'ASC' : 'DESC'
        orderBy = `${mappedCol} ${direction}`
      }
    }

    const query = `
      SELECT TOP ${perPage + offset}
        P.CODPROD, P.DESCRPROD, P.REFERENCIA, P.MARCA, P.CODVOL, P.ATIVO,
        P.CODGRUPOPROD, G.DESCRGRUPOPROD, P.LOCALIZACAO, P.TIPCONTEST, P.LISCONTEST,
        E.ESTOQUE, E.ESTMIN, E.ESTMAX,
        ISNULL(E.ESTOQUE, 0) AS VALORESTOQUE
      FROM TGFPRO P WITH (NOLOCK)
      LEFT JOIN TGFGRU G WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD
      LEFT JOIN (
        SELECT CODPROD, SUM(ESTOQUE) AS ESTOQUE, SUM(ESTMIN) AS ESTMIN, SUM(ESTMAX) AS ESTMAX
        FROM TGFEST WITH (NOLOCK)
        WHERE ATIVO = 'S'
        GROUP BY CODPROD
      ) E ON P.CODPROD = E.CODPROD
      ${where}
      ORDER BY ${orderBy}
    `

    try {
      const response = await this.sankhyaApiService.executeQuery(query, [])
      const data: ProdutoV2[] = response.slice(offset).map((item: any) => ({
        codprod: Number(item.CODPROD),
        descrprod: item.DESCRPROD,
        referencia: item.REFERENCIA || null,
        marca: item.MARCA || null,
        codvol: item.CODVOL || null,
        ativo: item.ATIVO,
        codgrupoprod: Number(item.CODGRUPOPROD || 0),
        descrgrupoprod: item.DESCRGRUPOPROD || null,
        localizacao: item.LOCALIZACAO || null,
        tipcontest: item.TIPCONTEST || null,
        liscontest: item.LISCONTEST || null,
        estoque: item.ESTOQUE != null ? Number(item.ESTOQUE) : null,
        estmin: item.ESTMIN != null ? Number(item.ESTMIN) : null,
        estmax: item.ESTMAX != null ? Number(item.ESTMAX) : null,
        valorEstoque:
          item.VALORESTOQUE != null ? Number(item.VALORESTOQUE) : null,
      }))

      const countQuery = `
        SELECT COUNT(DISTINCT P.CODPROD) as total
        FROM TGFPRO P WITH (NOLOCK)
        LEFT JOIN (
          SELECT CODPROD, SUM(ESTOQUE) AS ESTOQUE, SUM(ESTMIN) AS ESTMIN
          FROM TGFEST WITH (NOLOCK)
          WHERE ATIVO = 'S'
          GROUP BY CODPROD
        ) E ON P.CODPROD = E.CODPROD
        ${where}
      `
      const countResponse = await this.sankhyaApiService.executeQuery(
        countQuery,
        [],
      )
      const total =
        countResponse.length > 0 ? Number(countResponse[0].total) : 0

      return buildPaginatedResult({ data, total, page, perPage })
    } catch (error) {
      this.logger.error('Erro em findAll:', (error as any)?.message || error)
      throw error
    }
  }

  async getGruposComContagem(): Promise<FiltroOpcao[]> {
    const query = `
      SELECT G.CODGRUPOPROD AS codigo, G.DESCRGRUPOPROD AS descricao, COUNT(P.CODPROD) AS contagem
      FROM TGFGRU G WITH (NOLOCK)
      LEFT JOIN TGFPRO P WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD AND P.ATIVO = 'S'
      GROUP BY G.CODGRUPOPROD, G.DESCRGRUPOPROD
      ORDER BY G.DESCRGRUPOPROD
    `
    try {
      const result = await this.sankhyaApiService.executeQuery(query, [])
      return result.map((item: any) => ({
        codigo: Number(item.codigo),
        descricao: item.descricao || '',
        contagem: Number(item.contagem) || 0,
      }))
    } catch (error) {
      this.logger.error(
        'Erro em getGruposComContagem:',
        (error as any)?.message || error,
      )
      throw error
    }
  }

  async getLocaisComContagem(): Promise<FiltroOpcao[]> {
    const query = `
      SELECT L.CODLOCAL AS codigo, L.DESCRLOCAL AS descricao, COUNT(DISTINCT E.CODPROD) AS contagem
      FROM TGFLOC L WITH (NOLOCK)
      LEFT JOIN TGFEST E WITH (NOLOCK) ON L.CODLOCAL = E.CODLOCAL AND E.ATIVO = 'S'
      GROUP BY L.CODLOCAL, L.DESCRLOCAL
      ORDER BY L.DESCRLOCAL
    `
    try {
      const result = await this.sankhyaApiService.executeQuery(query, [])
      return result.map((item: any) => ({
        codigo: Number(item.codigo),
        descricao: item.descricao || '',
        contagem: Number(item.contagem) || 0,
      }))
    } catch (error) {
      this.logger.error(
        'Erro em getLocaisComContagem:',
        (error as any)?.message || error,
      )
      throw error
    }
  }

  async getControlesComContagem(): Promise<FiltroOpcao[]> {
    const query = `
      SELECT TIPCONTEST AS codigo, TIPCONTEST AS descricao, COUNT(*) AS contagem
      FROM TGFPRO WITH (NOLOCK)
      WHERE ATIVO = 'S' AND TIPCONTEST IS NOT NULL AND TIPCONTEST <> ''
      GROUP BY TIPCONTEST
      ORDER BY TIPCONTEST
    `
    try {
      const result = await this.sankhyaApiService.executeQuery(query, [])
      return result.map((item: any) => ({
        codigo: item.codigo || '',
        descricao: item.descricao || '',
        contagem: Number(item.contagem) || 0,
      }))
    } catch (error) {
      this.logger.error(
        'Erro em getControlesComContagem:',
        (error as any)?.message || error,
      )
      throw error
    }
  }

  async getMarcasComContagem(): Promise<FiltroOpcao[]> {
    const query = `
      SELECT MARCA AS codigo, MARCA AS descricao, COUNT(*) AS contagem
      FROM TGFPRO WITH (NOLOCK)
      WHERE ATIVO = 'S' AND MARCA IS NOT NULL AND MARCA <> ''
      GROUP BY MARCA
      ORDER BY MARCA
    `
    try {
      const result = await this.sankhyaApiService.executeQuery(query, [])
      return result.map((item: any) => ({
        codigo: item.codigo || '',
        descricao: item.descricao || '',
        contagem: Number(item.contagem) || 0,
      }))
    } catch (error) {
      this.logger.error(
        'Erro em getMarcasComContagem:',
        (error as any)?.message || error,
      )
      throw error
    }
  }

  async getGrupoResumo(codgrupoprod: number): Promise<GrupoResumo> {
    const query = `
      SELECT
        G.CODGRUPOPROD,
        G.DESCRGRUPOPROD,
        COUNT(P.CODPROD) AS totalProdutos,
        SUM(CASE WHEN P.ATIVO = 'S' THEN 1 ELSE 0 END) AS produtosAtivos,
        (SELECT COUNT(DISTINCT P2.CODPROD)
         FROM TGFPRO P2 WITH (NOLOCK)
         INNER JOIN TGFEST E2 WITH (NOLOCK) ON P2.CODPROD = E2.CODPROD
         WHERE P2.CODGRUPOPROD = G.CODGRUPOPROD AND P2.ATIVO = 'S'
           AND E2.ATIVO = 'S' AND E2.ESTOQUE < E2.ESTMIN AND E2.ESTMIN > 0
        ) AS produtosCriticos,
        ISNULL((SELECT SUM(E3.ESTOQUE)
         FROM TGFEST E3 WITH (NOLOCK)
         INNER JOIN TGFPRO P3 WITH (NOLOCK) ON E3.CODPROD = P3.CODPROD
         WHERE P3.CODGRUPOPROD = G.CODGRUPOPROD AND E3.ATIVO = 'S'
        ), 0) AS valorEstoque
      FROM TGFGRU G WITH (NOLOCK)
      LEFT JOIN TGFPRO P WITH (NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
      WHERE G.CODGRUPOPROD = ${codgrupoprod}
      GROUP BY G.CODGRUPOPROD, G.DESCRGRUPOPROD
    `
    try {
      const result = await this.sankhyaApiService.executeQuery(query, [])
      if (result.length > 0) {
        return {
          codgrupoprod: Number(result[0].CODGRUPOPROD),
          descrgrupoprod: result[0].DESCRGRUPOPROD || '',
          totalProdutos: Number(result[0].totalProdutos) || 0,
          produtosAtivos: Number(result[0].produtosAtivos) || 0,
          produtosCriticos: Number(result[0].produtosCriticos) || 0,
          valorEstoque: Number(result[0].valorEstoque) || 0,
        }
      }
      return {
        codgrupoprod,
        descrgrupoprod: '',
        totalProdutos: 0,
        produtosAtivos: 0,
        produtosCriticos: 0,
        valorEstoque: 0,
      }
    } catch (error) {
      this.logger.error(
        'Erro em getGrupoResumo:',
        (error as any)?.message || error,
      )
      throw error
    }
  }

  async getLocalResumo(codlocal: number): Promise<LocalResumo> {
    const query = `
      SELECT
        L.CODLOCAL,
        L.DESCRLOCAL,
        COUNT(DISTINCT E.CODPROD) AS totalProdutos,
        ISNULL(SUM(E.ESTOQUE), 0) AS valorEstoque
      FROM TGFLOC L WITH (NOLOCK)
      LEFT JOIN TGFEST E WITH (NOLOCK) ON L.CODLOCAL = E.CODLOCAL AND E.ATIVO = 'S'
      WHERE L.CODLOCAL = ${codlocal}
      GROUP BY L.CODLOCAL, L.DESCRLOCAL
    `
    try {
      const result = await this.sankhyaApiService.executeQuery(query, [])
      if (result.length > 0) {
        return {
          codlocal: Number(result[0].CODLOCAL),
          descrlocal: result[0].DESCRLOCAL || '',
          totalProdutos: Number(result[0].totalProdutos) || 0,
          valorEstoque: Number(result[0].valorEstoque) || 0,
        }
      }
      return {
        codlocal,
        descrlocal: '',
        totalProdutos: 0,
        valorEstoque: 0,
      }
    } catch (error) {
      this.logger.error(
        'Erro em getLocalResumo:',
        (error as any)?.message || error,
      )
      throw error
    }
  }

  async getProdutoCompleto(codprod: number): Promise<ProdutoV2Completo | null> {
    const query = `
      SELECT TOP 1
        P.CODPROD, P.DESCRPROD, P.COMPLDESC, P.CARACTERISTICAS, P.REFERENCIA,
        P.MARCA, P.CODVOL, P.ATIVO, P.CODGRUPOPROD, G.DESCRGRUPOPROD,
        P.LOCALIZACAO, P.TIPCONTEST, P.LISCONTEST, P.NCM, P.PESOBRUTO, P.PESOLIQ,
        P.USOPROD, P.ORIGPROD,
        E.ESTOQUE, E.ESTMIN, E.ESTMAX,
        ISNULL(E.ESTOQUE, 0) AS VALORESTOQUE
      FROM TGFPRO P WITH (NOLOCK)
      LEFT JOIN TGFGRU G WITH (NOLOCK) ON P.CODGRUPOPROD = G.CODGRUPOPROD
      LEFT JOIN (
        SELECT CODPROD, SUM(ESTOQUE) AS ESTOQUE, SUM(ESTMIN) AS ESTMIN, SUM(ESTMAX) AS ESTMAX
        FROM TGFEST WITH (NOLOCK)
        WHERE ATIVO = 'S'
        GROUP BY CODPROD
      ) E ON P.CODPROD = E.CODPROD
      WHERE P.CODPROD = ${codprod}
    `
    try {
      const result = await this.sankhyaApiService.executeQuery(query, [])
      if (result.length > 0) {
        const item = result[0]
        return {
          codprod: Number(item.CODPROD),
          descrprod: item.DESCRPROD,
          referencia: item.REFERENCIA || null,
          marca: item.MARCA || null,
          codvol: item.CODVOL || null,
          ativo: item.ATIVO,
          codgrupoprod: Number(item.CODGRUPOPROD || 0),
          descrgrupoprod: item.DESCRGRUPOPROD || null,
          localizacao: item.LOCALIZACAO || null,
          tipcontest: item.TIPCONTEST || null,
          liscontest: item.LISCONTEST || null,
          estoque: item.ESTOQUE != null ? Number(item.ESTOQUE) : null,
          estmin: item.ESTMIN != null ? Number(item.ESTMIN) : null,
          estmax: item.ESTMAX != null ? Number(item.ESTMAX) : null,
          valorEstoque:
            item.VALORESTOQUE != null ? Number(item.VALORESTOQUE) : null,
          compldesc: item.COMPLDESC || null,
          caracteristicas: item.CARACTERISTICAS || null,
          ncm: item.NCM || null,
          pesobruto: item.PESOBRUTO != null ? Number(item.PESOBRUTO) : null,
          pesoliq: item.PESOLIQ != null ? Number(item.PESOLIQ) : null,
          usoprod: item.USOPROD || null,
          origprod: item.ORIGPROD || null,
        }
      }
      return null
    } catch (error) {
      this.logger.error(
        'Erro em getProdutoCompleto:',
        (error as any)?.message || error,
      )
      throw error
    }
  }

  async findByGrupo(
    codgrupoprod: number,
    dto: ProdutoV2FindAllDto,
  ): Promise<PaginatedResult<ProdutoV2>> {
    return this.findAll({ ...dto, grupos: [codgrupoprod] })
  }

  async getEstoquePorLocal(codprod: number): Promise<any[]> {
    const query = `
      SELECT 
        E.CODLOCAL,
        L.DESCRLOCAL,
        E.ESTOQUE,
        E.ESTMIN,
        E.ESTMAX,
        ISNULL(E.ESTOQUE, 0) AS VALORESTOQUE
      FROM TGFEST E WITH (NOLOCK)
      INNER JOIN TGFLOC L WITH (NOLOCK) ON E.CODLOCAL = L.CODLOCAL
      WHERE E.CODPROD = ${codprod} AND E.ATIVO = 'S'
      ORDER BY L.DESCRLOCAL
    `
    try {
      const result = await this.sankhyaApiService.executeQuery(query, [])
      return result.map((item: any) => ({
        codlocal: Number(item.CODLOCAL),
        descrlocal: item.DESCRLOCAL || '',
        estoque: item.ESTOQUE != null ? Number(item.ESTOQUE) : null,
        estmin: item.ESTMIN != null ? Number(item.ESTMIN) : null,
        estmax: item.ESTMAX != null ? Number(item.ESTMAX) : null,
        valorEstoque:
          item.VALORESTOQUE != null ? Number(item.VALORESTOQUE) : null,
      }))
    } catch (error) {
      this.logger.error(
        'Erro em getEstoquePorLocal:',
        (error as any)?.message || error,
      )
      throw error
    }
  }

  async getConsumoMensal(
    codprod: number,
    periodo: number = 12,
  ): Promise<any[]> {
    const query = `
      SELECT 
        YEAR(T3.DTAINI) AS ano,
        MONTH(T3.DTAINI) AS mes,
        DATENAME(MONTH, T3.DTAINI) AS nomeMes,
        CASE 
          WHEN MONTH(T3.DTAINI) = 1 THEN 'Jan/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 2 THEN 'Fev/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 3 THEN 'Mar/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 4 THEN 'Abr/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 5 THEN 'Mai/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 6 THEN 'Jun/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 7 THEN 'Jul/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 8 THEN 'Ago/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 9 THEN 'Set/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 10 THEN 'Out/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 11 THEN 'Nov/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
          WHEN MONTH(T3.DTAINI) = 12 THEN 'Dez/' + RIGHT(CAST(YEAR(T3.DTAINI) AS VARCHAR), 2)
        END AS descricaoMes,
        ISNULL(SUM(T2.QTDNEG), 0) AS quantidade,
        ISNULL(SUM(T2.VLRDESD), 0) AS valor
      FROM TGFPRO T1 WITH (NOLOCK)
      LEFT JOIN TGFITE T2 WITH (NOLOCK) ON T1.CODPROD = T2.CODPROD
      LEFT JOIN TGFCAB T3 WITH (NOLOCK) ON T2.CODCAB = T3.CODCAB
      WHERE T1.CODPROD = ${codprod}
        AND T3.DTAINI >= DATEADD(MONTH, -${periodo}, GETDATE())
        AND T3.DTAINI < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)
        AND T3.TIPOPER = 'S'  -- Saidas
      GROUP BY YEAR(T3.DTAINI), MONTH(T3.DTAINI), T3.DTAINI
      ORDER BY T3.DTAINI
    `
    try {
      const result = await this.sankhyaApiService.executeQuery(query, [])
      return result.map((item: any) => ({
        ano: Number(item.ano),
        mes: Number(item.mes),
        descricaoMes:
          item.descricaoMes ||
          `${item.nomeMes}/${item.ano.toString().substr(-2)}`,
        quantidade: Number(item.quantidade) || 0,
        valor: Number(item.valor) || 0,
      }))
    } catch (error) {
      this.logger.error(
        'Erro em getConsumoMensal:',
        (error as any)?.message || error,
      )
      throw error
    }
  }

  async findByLocal(
    codlocal: number,
    dto: ProdutoV2FindAllDto,
  ): Promise<PaginatedResult<ProdutoV2>> {
    return this.findAll({ ...dto, locais: [codlocal] })
  }
}
