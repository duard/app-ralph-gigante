import { Injectable, Logger } from '@nestjs/common'
import { SankhyaApiService } from '../../../shared/sankhya-api.service'
import {
  DashboardFiltersDto,
  getPeriodoDates,
  GrupoEstoque,
  StatusClassificacao,
} from '../dto'
import {
  AlertaEstoqueEntity,
  DashboardSummaryEntity,
  InventarioEntity,
  InventarioSubgrupoEntity,
  KardexEntity,
  MovimentacaoSubgrupoEntity,
  MovimentacoesEntity,
  ProdutosParadosEntity,
  SubgrupoParadoEntity,
  TopProdutoEntity,
  TopProdutosEntity,
} from '../entities'

@Injectable()
export class EstoqueGiroService {
  private readonly logger = new Logger(EstoqueGiroService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  async getDashboardSummary(
    filters: DashboardFiltersDto,
  ): Promise<DashboardSummaryEntity> {
    const startTime = Date.now()

    try {
      const grupo = filters.codigoGrupo || GrupoEstoque.MANUTENCAO_AUTOMOTIVA
      const { inicio, fim } = getPeriodoDates(
        filters.periodo,
        filters.dataInicio,
        filters.dataFim,
      )

      this.logger.log(
        `[DASHBOARD] Grupo: ${grupo}, Periodo: ${filters.periodo}, DataInicio: ${filters.dataInicio}, DataFim: ${filters.dataFim}`,
      )
      const subgrupos = filters.subgrupos || this.getDefaultSubgrupos(grupo)
      this.logger.log(`[DASHBOARD] Subgrupos: ${JSON.stringify(subgrupos)}`)

      const queries = [
        this.buildInventarioQuery(grupo, subgrupos),
        this.buildMovimentacoesQuery(grupo, subgrupos, inicio, fim),
        this.buildProdutosParadosQuery(grupo, subgrupos),
        this.buildTopProdutosQuery(grupo, subgrupos, 50),
      ]
      queries.forEach((q, i) => {
        this.logger.debug(`[DASHBOARD] Query ${i}: ${q.sql}`)
      })

      const [
        inventarioResult,
        movimentacoesResult,
        paradosResult,
        topProdutosResult,
      ] = await Promise.allSettled(
        queries.map((q, i) => {
          this.logger.log(`[DASHBOARD] Executando query ${i}`)
          return this.sankhyaApiService.executeQuery(q.sql, q.params)
        }),
      )

      this.logger.debug(
        `[DASHBOARD] inventarioResult: ${JSON.stringify(inventarioResult)}`,
      )
      this.logger.debug(
        `[DASHBOARD] movimentacoesResult: ${JSON.stringify(movimentacoesResult)}`,
      )
      this.logger.debug(
        `[DASHBOARD] paradosResult: ${JSON.stringify(paradosResult)}`,
      )
      this.logger.debug(
        `[DASHBOARD] topProdutosResult: ${JSON.stringify(topProdutosResult)}`,
      )

      const inventario = this.parseInventarioResult(inventarioResult, grupo)
      const movimentacoes = this.parseMovimentacoesResult(
        movimentacoesResult,
        grupo,
        inicio,
        fim,
      )
      const parados = this.parseProdutosParadosResult(paradosResult, grupo)
      const topProdutos = this.parseTopProdutosResult(
        topProdutosResult,
        grupo,
        subgrupos[0],
      )

      const totalProdutos = inventario.totalProdutos
      const percentualParado =
        totalProdutos > 0
          ? (parados.totalProdutosParados / totalProdutos) * 100
          : 0

      const giroMedio =
        movimentacoes.porSubgrupo.length > 0
          ? movimentacoes.porSubgrupo.reduce((acc, s) => acc + s.giro, 0) /
            movimentacoes.porSubgrupo.length
          : 0

      let classificacaoGeral: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'RUIM'
      if (percentualParado < 30 && giroMedio > 2) {
        classificacaoGeral = 'EXCELENTE'
      } else if (percentualParado < 50 && giroMedio > 1) {
        classificacaoGeral = 'BOM'
      } else if (percentualParado < 70 && giroMedio > 0.5) {
        classificacaoGeral = 'REGULAR'
      } else {
        classificacaoGeral = 'RUIM'
      }

      const summary = new DashboardSummaryEntity({
        totalProdutos,
        totalEstoque: inventario.quantidadeTotalEstoque,
        valorEstoque: inventario.valorTotalEstoque || 0,
        produtosParados: parados.totalProdutosParados,
        percentualParado: Math.round(percentualParado * 100) / 100,
        produtosCriticos: topProdutos.totalCriticos,
        produtosBaixoEstoque: topProdutos.totalBaixo,
        produtosEquilibrados: topProdutos.totalEquilibrado,
        giroMedio: Math.round(giroMedio * 100) / 100,
        classificacaoGeral,
      })

      this.logger.debug(
        `Dashboard summary gerado em ${Date.now() - startTime}ms`,
      )

      return summary
    } catch (error) {
      this.logger.error('Erro ao gerar dashboard summary', error)
      throw error
    }
  }

  async getInventario(filters: DashboardFiltersDto): Promise<InventarioEntity> {
    const grupo = filters.codigoGrupo || GrupoEstoque.MANUTENCAO_AUTOMOTIVA
    const subgrupos = filters.subgrupos || this.getDefaultSubgrupos(grupo)

    const query = this.buildInventarioQuery(grupo, subgrupos)
    const result = await this.sankhyaApiService.executeQuery(
      query.sql,
      query.params,
    )

    return this.parseInventarioResult(
      { status: 'fulfilled', value: result },
      grupo,
    )
  }

  async getMovimentacoes(
    filters: DashboardFiltersDto,
  ): Promise<MovimentacoesEntity> {
    const grupo = filters.codigoGrupo || GrupoEstoque.MANUTENCAO_AUTOMOTIVA
    const subgrupos = filters.subgrupos || this.getDefaultSubgrupos(grupo)
    const { inicio, fim } = getPeriodoDates(
      filters.periodo,
      filters.dataInicio,
      filters.dataFim,
    )

    const query = this.buildMovimentacoesQuery(grupo, subgrupos, inicio, fim)
    const result = await this.sankhyaApiService.executeQuery(
      query.sql,
      query.params,
    )

    return this.parseMovimentacoesResult(
      { status: 'fulfilled', value: result },
      grupo,
      inicio,
      fim,
    )
  }

  async getProdutosParados(
    filters: DashboardFiltersDto,
  ): Promise<ProdutosParadosEntity> {
    const grupo = filters.codigoGrupo || GrupoEstoque.MANUTENCAO_AUTOMOTIVA
    const subgrupos = filters.subgrupos || this.getDefaultSubgrupos(grupo)

    const query = this.buildProdutosParadosQuery(grupo, subgrupos)
    const result = await this.sankhyaApiService.executeQuery(
      query.sql,
      query.params,
    )

    return this.parseProdutosParadosResult(
      { status: 'fulfilled', value: result },
      grupo,
    )
  }

  async getTopProdutos(
    filters: DashboardFiltersDto,
  ): Promise<TopProdutosEntity> {
    const grupo = filters.codigoGrupo || GrupoEstoque.MANUTENCAO_AUTOMOTIVA
    const subgrupos = filters.subgrupos || this.getDefaultSubgrupos(grupo)
    const limite = filters.limite || 50
    const pagina = filters.pagina || 1
    const itensPorPagina = filters.itensPorPagina || 20
    const statusClassificacao = filters.statusClassificacao

    const query = this.buildTopProdutosQuery(
      grupo,
      subgrupos,
      limite + (pagina - 1) * itensPorPagina,
    )
    const result = await this.sankhyaApiService.executeQuery(
      query.sql,
      query.params,
    )

    let produtos = this.parseTopProdutosResult(
      { status: 'fulfilled', value: result },
      grupo,
      subgrupos[0],
    ).produtos

    if (statusClassificacao) {
      produtos = produtos.filter((p) => p.status === statusClassificacao)
    }

    const offset = (pagina - 1) * itensPorPagina
    const produtosPaginados = produtos.slice(offset, offset + itensPorPagina)

    const totalCriticos = produtos.filter((p) => p.status === 'CRITICO').length
    const totalBaixo = produtos.filter((p) => p.status === 'BAIXO').length
    const totalEquilibrado = produtos.filter(
      (p) => p.status === 'EQUILIBRADO',
    ).length
    const totalSemEstoque = produtos.filter(
      (p) => p.status === 'SEM_ESTOQUE',
    ).length

    return new TopProdutosEntity({
      codigoGrupo: grupo,
      descricaoGrupo: this.getGrupoDescricao(grupo),
      codigoSubgrupo: subgrupos[0],
      descricaoSubgrupo: '',
      totalProdutosSubgrupo: produtos.length,
      totalNoTop: produtos.length,
      totalCriticos,
      totalBaixo,
      totalEquilibrado,
      totalSemEstoque,
      produtos: produtosPaginados.map((p, idx) => ({
        ...p,
        posicao: offset + idx + 1,
      })),
    })
  }

  async getKardex(
    filters: DashboardFiltersDto,
    limit: number = 100,
  ): Promise<KardexEntity[]> {
    const grupo = filters.codigoGrupo || GrupoEstoque.MANUTENCAO_AUTOMOTIVA
    const subgrupos = filters.subgrupos || this.getDefaultSubgrupos(grupo)
    const { inicio, fim } = getPeriodoDates(
      filters.periodo,
      filters.dataInicio,
      filters.dataFim,
    )

    const query = this.buildKardexQuery(grupo, subgrupos, inicio, fim, limit)
    const result = await this.sankhyaApiService.executeQuery(
      query.sql,
      query.params,
    )

    return this.parseKardexResult({ status: 'fulfilled', value: result })
  }

  async getAlertas(
    filters: DashboardFiltersDto,
  ): Promise<AlertaEstoqueEntity[]> {
    const topProdutos = await this.getTopProdutos(filters)

    const alertas: AlertaEstoqueEntity[] = []

    for (const produto of topProdutos.produtos) {
      if (produto.status === 'CRITICO') {
        alertas.push(
          new AlertaEstoqueEntity({
            tipo: 'CRITICO',
            codigoProduto: produto.codigo,
            descricaoProduto: produto.descricao,
            codigoSubgrupo: produto.codigoSubgrupo,
            descricaoSubgrupo: produto.descricaoSubgrupo,
            valorAtual: produto.estoque,
            valorReferencia: produto.totalConsumo * 0.5,
            mensagem: `Estoque crítico! Produto ${produto.descricao} tem apenas ${produto.estoque} unidades.`,
            acaoSugerida: `Comprar pelo menos ${Math.ceil(produto.totalConsumo * 0.3)} unidades`,
          }),
        )
      } else if (produto.status === 'BAIXO') {
        alertas.push(
          new AlertaEstoqueEntity({
            tipo: 'BAIXO',
            codigoProduto: produto.codigo,
            descricaoProduto: produto.descricao,
            codigoSubgrupo: produto.codigoSubgrupo,
            descricaoSubgrupo: produto.descricaoSubgrupo,
            valorAtual: produto.estoque,
            valorReferencia: produto.totalConsumo * 0.2,
            mensagem: `Estoque baixo! Produto ${produto.descricao} em reposição recomendada.`,
            acaoSugerida: `Revisar política de compra`,
          }),
        )
      }
    }

    return alertas.sort((a, b) => {
      const order: Record<string, number> = {
        CRITICO: 0,
        BAIXO: 1,
        ALTO: 2,
        NEGATIVO: 3,
      }
      return order[a.tipo] - order[b.tipo]
    })
  }

  private getDefaultSubgrupos(grupo: number): number[] {
    const subgruposMap: Record<number, number[]> = {
      20100: [20101, 20102, 20103, 20104, 20105, 20106, 20107, 20108],
      20101: [20101],
      20102: [20102],
      20103: [20103],
      20104: [20104],
      20105: [20105],
      20106: [20106],
      20107: [20107],
      20108: [20108],
    }
    return subgruposMap[grupo] || [grupo]
  }

  private buildInventarioQuery(
    grupo: number,
    subgrupos: number[],
  ): { sql: string; params: any[] } {
    const subgruposStr = subgrupos.join(',')
    const sql = `
      SELECT 
        PRO.CODGRUPOPROD as codigo,
        GRU.DESCRGRUPOPROD as descricao,
        COUNT(DISTINCT PRO.CODPROD) as total_produtos,
        SUM(EST.ESTOQUE) as qtd_estoque
      FROM TGFPRO PRO
      LEFT JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
      LEFT JOIN TGFEST EST ON PRO.CODPROD = EST.CODPROD
      WHERE PRO.CODGRUPOPROD IN (${subgruposStr})
        AND PRO.ATIVO = 'S'
      GROUP BY PRO.CODGRUPOPROD, GRU.DESCRGRUPOPROD
      ORDER BY PRO.CODGRUPOPROD
    `
    return { sql, params: [] }
  }

  private buildMovimentacoesQuery(
    grupo: number,
    subgrupos: number[],
    inicio: Date,
    fim: Date,
  ): { sql: string; params: any[] } {
    const subgruposStr = subgrupos.join(',')
    const sql = `
      SELECT 
        PRO.CODGRUPOPROD as codigo,
        GRU.DESCRGRUPOPROD as descricao,
        CASE 
          WHEN CAB.TIPMOV IN ('C', 'O') THEN 0  -- Compra e Ordem de compra = Entrada
          WHEN CAB.TIPMOV IN ('V', 'Q', 'D', 'I', 'R', 'U') THEN 1  -- Venda, Requisição, Devolução, etc = Saída
          ELSE 0
        END as tipo_movimento,
        COUNT(*) as qtd_movimentacoes,
        SUM(ITE.QTDNEG) as total_qtd
      FROM TGFITE ITE
      JOIN TGFCAB CAB ON ITE.NUNOTA = CAB.NUNOTA
      JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
      LEFT JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
      WHERE PRO.CODGRUPOPROD IN (${subgruposStr})
        AND CAB.STATUSNOTA = 'L'
        AND CAB.DTMOV BETWEEN ? AND ?
      GROUP BY PRO.CODGRUPOPROD, GRU.DESCRGRUPOPROD, 
               CASE 
                 WHEN CAB.TIPMOV IN ('C', 'O') THEN 0
                 WHEN CAB.TIPMOV IN ('V', 'Q', 'D', 'I', 'R', 'U') THEN 1
                 ELSE 0
               END
      ORDER BY PRO.CODGRUPOPROD, tipo_movimento
    `
    return {
      sql,
      params: [
        inicio.toISOString().split('T')[0],
        fim.toISOString().split('T')[0],
      ],
    }
  }

  private buildProdutosParadosQuery(
    grupo: number,
    subgrupos: number[],
  ): { sql: string; params: any[] } {
    const subgruposStr = subgrupos.join(',')
    const sql = `
      SELECT 
        PRO.CODGRUPOPROD as codigo,
        GRU.DESCRGRUPOPROD as descricao,
        COUNT(*) as total_parados
      FROM TGFPRO PRO
      LEFT JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
      WHERE PRO.CODGRUPOPROD IN (${subgruposStr})
        AND PRO.ATIVO = 'S'
        AND NOT EXISTS (
          SELECT 1 FROM TGFITE ITE 
          WHERE ITE.CODPROD = PRO.CODPROD 
            AND ITE.ATUALESTOQUE = 1 
            AND ITE.STATUSNOTA = 'L'
        )
      GROUP BY PRO.CODGRUPOPROD, GRU.DESCRGRUPOPROD
      ORDER BY total_parados DESC
    `
    return { sql, params: [] }
  }

  private buildTopProdutosQuery(
    grupo: number,
    subgrupos: number[],
    limite: number,
  ): { sql: string; params: any[] } {
    const subgruposStr = subgrupos.join(',')
    const sql = `
      SELECT TOP ${limite}
        PRO.CODPROD as codigo,
        PRO.DESCRPROD as descricao,
        PRO.CODGRUPOPROD as codigo_subgrupo,
        GRU.DESCRGRUPOPROD as descricao_subgrupo,
        PRO.MARCA as marca,
        SUM(EST.ESTOQUE) as estoque,
        ISNULL((
          SELECT SUM(QTDNEG) FROM TGFITE ITE 
          WHERE ITE.CODPROD = PRO.CODPROD 
            AND ITE.ATUALESTOQUE = 1 
            AND ITE.STATUSNOTA = 'L'
        ), 0) as total_consumo
      FROM TGFPRO PRO
      LEFT JOIN TGFEST EST ON PRO.CODPROD = EST.CODPROD
      LEFT JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
      WHERE PRO.CODGRUPOPROD IN (${subgruposStr})
        AND PRO.ATIVO = 'S'
      GROUP BY PRO.CODPROD, PRO.DESCRPROD, PRO.CODGRUPOPROD, GRU.DESCRGRUPOPROD, PRO.MARCA
      HAVING ISNULL((
        SELECT SUM(QTDNEG) FROM TGFITE ITE 
        WHERE ITE.CODPROD = PRO.CODPROD 
          AND ITE.ATUALESTOQUE = 1 
          AND ITE.STATUSNOTA = 'L'
      ), 0) > 0
      ORDER BY total_consumo DESC
    `
    return { sql, params: [] }
  }

  private buildKardexQuery(
    grupo: number,
    subgrupos: number[],
    inicio: Date,
    fim: Date,
    limite: number,
  ): { sql: string; params: any[] } {
    const subgruposStr = subgrupos.join(',')
    const sql = `
      SELECT TOP ${limite}
        PRO.CODPROD as codigo,
        PRO.DESCRPROD as descricao,
        PRO.CODGRUPOPROD as codigo_subgrupo,
        GRU.DESCRGRUPOPROD as descricao_subgrupo,
        SUM(EST.ESTOQUE) as estoque_atual,
        ISNULL((
          SELECT SUM(QTDNEG) FROM TGFITE ITE 
          WHERE ITE.CODPROD = PRO.CODPROD 
            AND ITE.ATUALESTOQUE = 0 
            AND ITE.STATUSNOTA = 'L'
        ), 0) as total_entrada,
        ISNULL((
          SELECT SUM(QTDNEG) FROM TGFITE ITE 
          WHERE ITE.CODPROD = PRO.CODPROD 
            AND ITE.ATUALESTOQUE = 1 
            AND ITE.STATUSNOTA = 'L'
        ), 0) as total_saida
      FROM TGFPRO PRO
      LEFT JOIN TGFEST EST ON PRO.CODPROD = EST.CODPROD
      LEFT JOIN TGFGRU GRU ON PRO.CODGRUPOPROD = GRU.CODGRUPOPROD
      WHERE PRO.CODGRUPOPROD IN (${subgruposStr})
        AND PRO.ATIVO = 'S'
      GROUP BY PRO.CODPROD, PRO.DESCRPROD, PRO.CODGRUPOPROD, GRU.DESCRGRUPOPROD
      ORDER BY estoque_atual DESC
    `
    return { sql, params: [] }
  }

  private parseInventarioResult(
    result: PromiseSettledResult<any[]>,
    grupo: number,
  ): InventarioEntity {
    const dados = result.status === 'fulfilled' ? result.value : []

    const subgrupos: InventarioSubgrupoEntity[] = dados.map((row) => {
      const qtdEstoque = Number(row.qtd_estoque) || 0
      const totalProdutos = Number(row.total_produtos) || 0
      const media = totalProdutos > 0 ? qtdEstoque / totalProdutos : 0

      let classificacao = 'NORMAL'
      if (media > 40) classificacao = 'ALTO'
      else if (media < 10) classificacao = 'BAIXO'

      return new InventarioSubgrupoEntity({
        codigo: Number(row.codigo),
        descricao: row.descricao?.trim() || '',
        totalProdutos,
        quantidadeEstoque: qtdEstoque,
        mediaPorProduto: Math.round(media * 100) / 100,
        giro: 0,
        classificacao,
      })
    })

    const totalProdutos = subgrupos.reduce((acc, s) => acc + s.totalProdutos, 0)
    const qtdTotalEstoque = subgrupos.reduce(
      (acc, s) => acc + s.quantidadeEstoque,
      0,
    )
    const mediaGeral = totalProdutos > 0 ? qtdTotalEstoque / totalProdutos : 0

    return new InventarioEntity({
      codigoGrupo: grupo,
      descricaoGrupo: this.getGrupoDescricao(grupo),
      totalSubgrupos: subgrupos.length,
      totalProdutos,
      quantidadeTotalEstoque: qtdTotalEstoque,
      mediaGeralPorProduto: Math.round(mediaGeral * 100) / 100,
      subgrupos,
    })
  }

  private parseMovimentacoesResult(
    result: PromiseSettledResult<any[]>,
    grupo: number,
    inicio: Date,
    fim: Date,
  ): MovimentacoesEntity {
    const dados = result.status === 'fulfilled' ? result.value : []

    const porSubgrupoMap = new Map<number, MovimentacaoSubgrupoEntity>()

    for (const row of dados) {
      const codigo = Number(row.codigo)
      if (!porSubgrupoMap.has(codigo)) {
        porSubgrupoMap.set(
          codigo,
          new MovimentacaoSubgrupoEntity({
            codigo,
            descricao: row.descricao?.trim() || '',
            entradas: 0,
            saidas: 0,
            qtdMovimentacoesEntrada: 0,
            qtdMovimentacoesSaida: 0,
            giro: 0,
            classificacao: 'NORMAL',
          }),
        )
      }

      const subgrupo = porSubgrupoMap.get(codigo)!
      const totalQtd = Number(row.total_qtd) || 0
      const qtdMov = Number(row.qtd_movimentacoes) || 0
      const tipo = Number(row.tipo_movimento)

      if (tipo === 0) {
        subgrupo.entradas += totalQtd
        subgrupo.qtdMovimentacoesEntrada += qtdMov
      } else if (tipo === 1) {
        subgrupo.saidas += totalQtd
        subgrupo.qtdMovimentacoesSaida += qtdMov
      }
    }

    const porSubgrupo = Array.from(porSubgrupoMap.values()).map((s) => {
      const estoqueAtual = s.entradas - s.saidas
      const giro = estoqueAtual > 0 ? s.saidas / estoqueAtual : 0

      let classificacao = 'NORMAL'
      if (giro > 10) classificacao = 'MUITO_ALTO'
      else if (giro > 3) classificacao = 'ALTO'
      else if (giro < 1) classificacao = 'BAIXO'

      return new MovimentacaoSubgrupoEntity({
        ...s,
        saldo: s.entradas - s.saidas,
        giro: Math.round(giro * 100) / 100,
        classificacao,
      })
    })

    const totalEntradas = porSubgrupo.reduce((acc, s) => acc + s.entradas, 0)
    const totalSaidas = porSubgrupo.reduce((acc, s) => acc + s.saidas, 0)

    return new MovimentacoesEntity({
      codigoGrupo: grupo,
      descricaoGrupo: this.getGrupoDescricao(grupo),
      periodo: 'ULTIMOS_12_MESES',
      dataInicio: inicio,
      dataFim: fim,
      totalEntradas,
      totalSaidas,
      saldoGeral: totalEntradas - totalSaidas,
      porSubgrupo,
    })
  }

  private parseProdutosParadosResult(
    result: PromiseSettledResult<any[]>,
    grupo: number,
  ): ProdutosParadosEntity {
    const dados = result.status === 'fulfilled' ? result.value : []

    const porSubgrupo: SubgrupoParadoEntity[] = dados.map(
      (row) =>
        new SubgrupoParadoEntity({
          codigo: Number(row.codigo),
          descricao: row.descricao?.trim() || '',
          totalParados: Number(row.total_parados) || 0,
          comEstoque: 0,
          semEstoque: Number(row.total_parados) || 0,
        }),
    )

    const totalProdutosParados = porSubgrupo.reduce(
      (acc, s) => acc + s.totalParados,
      0,
    )

    return new ProdutosParadosEntity({
      codigoGrupo: grupo,
      descricaoGrupo: this.getGrupoDescricao(grupo),
      totalProdutosParados,
      comEstoque: 0,
      semEstoque: totalProdutosParados,
      percentualParado: 0,
      porSubgrupo,
      produtos: [],
    })
  }

  private parseTopProdutosResult(
    result: PromiseSettledResult<any[]>,
    grupo: number,
    subgrupo?: number,
  ): TopProdutosEntity {
    const dados = result.status === 'fulfilled' ? result.value : []

    const produtos: TopProdutoEntity[] = dados.map((row, index) => {
      const estoque = Number(row.estoque) || 0
      const consumo = Number(row.total_consumo) || 0
      const ratio = consumo > 0 ? estoque / consumo : 0

      let status: StatusClassificacao
      if (estoque === 0) status = StatusClassificacao.SEM_ESTOQUE
      else if (ratio < 0.1) status = StatusClassificacao.CRITICO
      else if (ratio < 1.5) status = StatusClassificacao.BAIXO
      else status = StatusClassificacao.EQUILIBRADO

      return new TopProdutoEntity({
        posicao: index + 1,
        codigo: Number(row.codigo),
        descricao: row.descricao?.trim() || '',
        codigoSubgrupo: Number(row.codigo_subgrupo),
        descricaoSubgrupo: row.descricao_subgrupo?.trim() || '',
        marca: row.marca?.trim(),
        estoque,
        totalConsumo: consumo,
        totalEntrada: 0,
        ratio: Math.round(ratio * 100) / 100,
        status,
      })
    })

    const totalCriticos = produtos.filter((p) => p.status === 'CRITICO').length
    const totalBaixo = produtos.filter((p) => p.status === 'BAIXO').length
    const totalEquilibrado = produtos.filter(
      (p) => p.status === 'EQUILIBRADO',
    ).length
    const totalSemEstoque = produtos.filter(
      (p) => p.status === 'SEM_ESTOQUE',
    ).length

    const subgrupoInfo = dados[0] || {}

    return new TopProdutosEntity({
      codigoGrupo: grupo,
      descricaoGrupo: this.getGrupoDescricao(grupo),
      codigoSubgrupo: subgrupo,
      descricaoSubgrupo: subgrupoInfo.descricao_subgrupo,
      totalProdutosSubgrupo: produtos.length,
      totalNoTop: produtos.length,
      totalCriticos,
      totalBaixo,
      totalEquilibrado,
      totalSemEstoque,
      produtos,
    })
  }

  private parseKardexResult(
    result: PromiseSettledResult<any[]>,
  ): KardexEntity[] {
    const dados = result.status === 'fulfilled' ? result.value : []

    return dados.map((row) => {
      const estoque = Number(row.estoque_atual) || 0
      const entrada = Number(row.total_entrada) || 0
      const saida = Number(row.total_saida) || 0
      const giro = estoque > 0 ? saida / estoque : 0

      let classificacao = 'NORMAL'
      if (estoque === 0) classificacao = 'SEM_MOVIMENTACAO'
      else if (giro > 10) classificacao = 'ALTA_ROTACAO'
      else if (giro < 0.5) classificacao = 'BAIXA_ROTACAO'

      return new KardexEntity({
        codigo: Number(row.codigo),
        descricao: row.descricao?.trim() || '',
        codigoSubgrupo: Number(row.codigo_subgrupo),
        descricaoSubgrupo: row.descricao_subgrupo?.trim() || '',
        estoqueAtual: estoque,
        totalEntradas: entrada,
        totalSaidas: saida,
        saldoPeriodo: entrada - saida,
        giro: Math.round(giro * 100) / 100,
        classificacao,
      })
    })
  }

  private getGrupoDescricao(grupo: number): string {
    const descricoes: Record<number, string> = {
      20100: 'MANUTENCAO AUTOMOTIVA',
      20101: 'ELETRICA AUTOMOTIVA',
      20102: 'MECANICA',
      20103: 'HIDRAULICA',
      20104: 'CALDEIRARIA',
      20105: 'PINTURA AUTOMOTIVA',
      20106: 'RODAGEM',
      20107: 'LAVADOR',
      20108: 'BORRACHARIA',
    }
    return descricoes[grupo] || `GRUPO ${grupo}`
  }
}
