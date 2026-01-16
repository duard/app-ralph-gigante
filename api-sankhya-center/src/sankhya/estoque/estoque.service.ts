import { Injectable } from '@nestjs/common'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'

@Injectable()
export class EstoqueService extends SankhyaBaseService<any> {
  getTableName(): string {
    return 'TGFEST'
  }

  getPrimaryKey(): string {
    return 'CODPROD'
  }

  getRelationsQuery(): string {
    return ''
  }

  mapToEntity(item: any): any {
    return item
  }

  async getResumo() {
    const query = `
      SELECT
        COUNT(DISTINCT CODPROD) as total_produtos,
        SUM(ESTOQUE) as total_quantidade,
        COUNT(CASE WHEN ESTOQUE = 0 THEN 1 END) as produtos_sem_estoque,
        COUNT(CASE WHEN ESTOQUE <= 5 THEN 1 END) as produtos_baixo_estoque
      FROM TGFEST
      WHERE ATIVO = 'S'
    `
    const result = await this.sankhyaApiService.executeQuery(query, [])
    return result[0]
  }

  async getBaixoEstoque(limite: number = 10) {
    const query = `
      SELECT TOP ${limite}
        TGFEST.CODPROD,
        TGFPRO.DESCRPROD,
        TGFEST.ESTOQUE,
        TGFEST.ESTMIN,
        TGFEST.ESTMAX
      FROM TGFEST
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
      WHERE TGFEST.ATIVO = 'S' AND TGFEST.ESTOQUE <= 5
      ORDER BY TGFEST.ESTOQUE ASC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getPorLocal() {
    const query = `
      SELECT
        CODLOCAL,
        COUNT(DISTINCT CODPROD) as total_produtos,
        SUM(ESTOQUE) as total_quantidade
      FROM TGFEST
      WHERE ATIVO = 'S'
      GROUP BY CODLOCAL
      ORDER BY total_quantidade DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getPorGrupo() {
    const query = `
      SELECT
        TGFPRO.CODGRUPOPROD,
        TGFGRU.DESCRGRUPOPROD,
        COUNT(DISTINCT TGFEST.CODPROD) as total_produtos,
        SUM(TGFEST.ESTOQUE) as total_quantidade
      FROM TGFEST
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
      LEFT JOIN TGFGRU ON TGFPRO.CODGRUPOPROD = TGFGRU.CODGRUPOPROD
      WHERE TGFEST.ATIVO = 'S'
      GROUP BY TGFPRO.CODGRUPOPROD, TGFGRU.DESCRGRUPOPROD
      ORDER BY total_quantidade DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getTopProdutos(limite: number = 10) {
    const query = `
      SELECT TOP ${limite}
        TGFEST.CODPROD,
        TGFPRO.DESCRPROD,
        TGFEST.ESTOQUE
      FROM TGFEST
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
      WHERE TGFEST.ATIVO = 'S'
      ORDER BY TGFEST.ESTOQUE DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getPorValor(limite: number = 10) {
    const query = `
      SELECT TOP ${limite}
        TGFEST.CODPROD,
        TGFPRO.DESCRPROD,
        TGFEST.ESTOQUE,
        TGFPRO.VLRUNIT,
        (TGFEST.ESTOQUE * TGFPRO.VLRUNIT) as valor_total
      FROM TGFEST
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
      WHERE TGFEST.ATIVO = 'S'
      ORDER BY (TGFEST.ESTOQUE * TGFPRO.VLRUNIT) DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getAbaixoMinimo(limite: number = 20) {
    const query = `
      SELECT TOP ${limite}
        TGFEST.CODPROD,
        TGFPRO.DESCRPROD,
        TGFEST.ESTOQUE,
        TGFEST.ESTMIN,
        TGFEST.ESTMAX,
        TGFEST.CODLOCAL,
        (TGFEST.ESTMIN - TGFEST.ESTOQUE) as deficit
      FROM TGFEST
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
      WHERE TGFEST.ATIVO = 'S' AND TGFEST.ESTOQUE < TGFEST.ESTMIN
      ORDER BY (TGFEST.ESTMIN - TGFEST.ESTOQUE) DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getMovimentacoesProduto(codprod: number, limite: number = 10) {
    const query = `
      SELECT TOP ${limite}
        TGFITE.NUNOTA,
        TGFITE.SEQUENCIA,
        TGFCAB.TIPMOV,
        CASE
          WHEN TGFCAB.TIPMOV = 'V' THEN 'Venda'
          WHEN TGFCAB.TIPMOV = 'P' THEN 'Pedido de Venda'
          WHEN TGFCAB.TIPMOV = 'D' THEN 'Devolução de Venda'
          WHEN TGFCAB.TIPMOV = 'A' THEN 'Conhecimento de Transporte (Venda)'
          WHEN TGFCAB.TIPMOV = 'O' THEN 'Pedido de Compra'
          WHEN TGFCAB.TIPMOV = 'C' THEN 'Compra'
          WHEN TGFCAB.TIPMOV = 'E' THEN 'Devolução de Compra'
          WHEN TGFCAB.TIPMOV = 'H' THEN 'Conhecimento de Transporte (Compra)'
          WHEN TGFCAB.TIPMOV = 'T' THEN 'Transferência'
          WHEN TGFCAB.TIPMOV = 'J' THEN 'Pedido de Requisição'
          WHEN TGFCAB.TIPMOV = 'Q' THEN 'Requisição'
          WHEN TGFCAB.TIPMOV = 'L' THEN 'Devolução de Requisição'
          WHEN TGFCAB.TIPMOV = 'F' THEN 'Nota de Produção'
          ELSE 'Outro'
        END as tipo_movimentacao,
        TGFCAB.DTNEG,
        TGFITE.QTDNEG,
        TGFITE.VLRTOT
      FROM TGFITE
      LEFT JOIN TGFCAB ON TGFITE.NUNOTA = TGFCAB.NUNOTA
      WHERE TGFITE.CODPROD = ${codprod}
      ORDER BY TGFCAB.DTNEG DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getNotasFiscaisProduto(codprod: number, limite: number = 10) {
    const query = `
      SELECT TOP ${limite}
        TGFCAB.NUNOTA,
        TGFCAB.TIPMOV,
        CASE
          WHEN TGFCAB.TIPMOV = 'V' THEN 'Venda'
          WHEN TGFCAB.TIPMOV = 'P' THEN 'Pedido de Venda'
          WHEN TGFCAB.TIPMOV = 'D' THEN 'Devolução de Venda'
          WHEN TGFCAB.TIPMOV = 'A' THEN 'Conhecimento de Transporte (Venda)'
          WHEN TGFCAB.TIPMOV = 'O' THEN 'Pedido de Compra'
          WHEN TGFCAB.TIPMOV = 'C' THEN 'Compra'
          WHEN TGFCAB.TIPMOV = 'E' THEN 'Devolução de Compra'
          WHEN TGFCAB.TIPMOV = 'H' THEN 'Conhecimento de Transporte (Compra)'
          WHEN TGFCAB.TIPMOV = 'T' THEN 'Transferência'
          WHEN TGFCAB.TIPMOV = 'J' THEN 'Pedido de Requisição'
          WHEN TGFCAB.TIPMOV = 'Q' THEN 'Requisição'
          WHEN TGFCAB.TIPMOV = 'L' THEN 'Devolução de Requisição'
          WHEN TGFCAB.TIPMOV = 'F' THEN 'Nota de Produção'
          ELSE 'Outro'
        END as tipo_movimentacao,
        TGFCAB.DTNEG,
        TGFCAB.VLRNOTA,
        TGFITE.QTDNEG,
        TGFITE.VLRTOT
      FROM TGFITE
      LEFT JOIN TGFCAB ON TGFITE.NUNOTA = TGFCAB.NUNOTA
      WHERE TGFITE.CODPROD = ${codprod}
      ORDER BY TGFCAB.DTNEG DESC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getInventario(codlocal?: number) {
    let where = "TGFEST.ATIVO = 'S'"
    if (codlocal) {
      where += ` AND TGFEST.CODLOCAL = ${codlocal}`
    }

    const query = `
      SELECT
        TGFEST.CODPROD,
        TGFPRO.DESCRPROD,
        TGFEST.ESTOQUE as estoque_sistema,
        TGFEST.ESTMIN,
        TGFEST.CODLOCAL
      FROM TGFEST
      LEFT JOIN TGFPRO ON TGFEST.CODPROD = TGFPRO.CODPROD
      WHERE ${where}
      ORDER BY TGFEST.CODPROD
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getConferencias(status?: string, limite: number = 20) {
    let where = 'TGFITE.ATUALESTOQUE != -1'
    if (status) {
      if (status === 'conferido') {
        where += ' AND TGFITE.QTDCONFERIDA = TGFITE.QTDNEG'
      } else if (status === 'pendente') {
        where += ' AND TGFITE.QTDCONFERIDA < TGFITE.QTDNEG'
      }
    }

    const query = `
      SELECT TOP ${limite}
        TGFITE.NUNOTA,
        TGFITE.SEQUENCIA,
        TGFITE.CODPROD,
        TGFPRO.DESCRPROD,
        TGFITE.QTDNEG,
        TGFITE.QTDCONFERIDA,
        TGFITE.QTDENTREGUE,
        TGFITE.PENDENTE
      FROM TGFITE
      LEFT JOIN TGFPRO ON TGFITE.CODPROD = TGFPRO.CODPROD
      WHERE ${where}
      ORDER BY TGFITE.NUNOTA DESC, TGFITE.SEQUENCIA ASC
    `
    return this.sankhyaApiService.executeQuery(query, [])
  }

  async getMetricsComprehensive(filters: {
    search?: string
    status?: string
    marca?: string
    comControle?: boolean
    semControle?: boolean
    comMovimento?: boolean
    semMovimento?: boolean
  }) {
    // Escape filters para evitar SQL injection
    const searchEscaped = filters.search
      ? filters.search.replace(/'/g, "''")
      : ''
    const marcaEscaped = filters.marca
      ? filters.marca.replace(/'/g, "''")
      : ''

    // Query para métricas gerais de estoque
    // Nota: valorTotalEstoque precisa de cálculo separado via TGFITE (preço última compra)
    const query = `
      SELECT
        COUNT(DISTINCT E.CODPROD) AS total,
        SUM(CASE WHEN E.ESTOQUE < 0 THEN 1 ELSE 0 END) AS negativos,
        SUM(CASE WHEN E.ESTOQUE < E.ESTMIN AND E.ESTMIN > 0 THEN 1 ELSE 0 END) AS abaixoMinimo,
        SUM(CASE WHEN E.ESTOQUE > E.ESTMAX AND E.ESTMAX > 0 THEN 1 ELSE 0 END) AS acimaMaximo,
        SUM(CASE WHEN E.ESTOQUE >= E.ESTMIN AND E.ESTOQUE <= E.ESTMAX THEN 1 ELSE 0 END) AS normais,
        0 AS semMovimento
      FROM TGFEST E WITH(NOLOCK)
      LEFT JOIN TGFPRO P WITH(NOLOCK) ON P.CODPROD = E.CODPROD
      WHERE E.ATIVO = 'S'
        ${filters.status === 'active' ? "AND P.ATIVO = 'S'" : ''}
        ${marcaEscaped ? `AND P.MARCA LIKE '%${marcaEscaped}%'` : ''}
        ${searchEscaped ? `AND (P.DESCRPROD LIKE '%${searchEscaped}%' OR CAST(P.CODPROD AS VARCHAR) LIKE '%${searchEscaped}%')` : ''}
    `

    const [result] = await this.sankhyaApiService.executeQuery(query, [])

    return {
      negativos: result?.negativos || 0,
      abaixoMinimo: result?.abaixoMinimo || 0,
      acimaMaximo: result?.acimaMaximo || 0,
      semMovimento: result?.semMovimento || 0,
      normais: result?.normais || 0,
      total: result?.total || 0,
      valorTotalEstoque: 0, // TODO: Calcular via TGFITE (preço última compra * estoque)
      trendNegativos: 0,
      trendAbaixoMinimo: 0,
      trendAcimaMaximo: 0,
      trendSemMovimento: 0,
      trendNormais: 0,
    }
  }

  async getProdutoLocais(codprod: number) {
    // Buscar informações do produto
    const produtoQuery = `
      SELECT CODPROD, DESCRPROD
      FROM TGFPRO WITH(NOLOCK)
      WHERE CODPROD = ${codprod}
    `
    const [produto] = await this.sankhyaApiService.executeQuery(produtoQuery, [])

    if (!produto) {
      return null
    }

    // Buscar estoque por local
    const locaisQuery = `
      SELECT
        E.CODLOCAL,
        L.DESCRLOCAL,
        E.ESTOQUE,
        E.RESERVADO,
        (E.ESTOQUE - ISNULL(E.RESERVADO, 0)) as disponivel,
        E.ESTMIN,
        E.ESTMAX,
        CASE
          WHEN E.ESTOQUE < 0 THEN 'negativo'
          WHEN E.ESTMIN > 0 AND E.ESTOQUE < E.ESTMIN THEN 'abaixo_minimo'
          WHEN E.ESTMAX > 0 AND E.ESTOQUE > E.ESTMAX THEN 'acima_maximo'
          ELSE 'normal'
        END as situacao
      FROM TGFEST E WITH(NOLOCK)
      LEFT JOIN TGFLOC L WITH(NOLOCK) ON L.CODLOCAL = E.CODLOCAL
      WHERE E.CODPROD = ${codprod} AND E.ATIVO = 'S'
      ORDER BY E.CODLOCAL
    `
    const locais = await this.sankhyaApiService.executeQuery(locaisQuery, [])

    // Calcular totais
    const totais = locais.reduce(
      (acc, local) => ({
        estoque: acc.estoque + (local.ESTOQUE || 0),
        reservado: acc.reservado + (local.RESERVADO || 0),
        disponivel: acc.disponivel + (local.disponivel || 0),
        qtdLocais: acc.qtdLocais + 1,
      }),
      { estoque: 0, reservado: 0, disponivel: 0, qtdLocais: 0 },
    )

    return {
      codprod: produto.CODPROD,
      descrprod: produto.DESCRPROD,
      locais: locais.map((local) => ({
        codlocal: local.CODLOCAL,
        descrlocal: local.DESCRLOCAL || `Local ${local.CODLOCAL}`,
        estoque: local.ESTOQUE || 0,
        reservado: local.RESERVADO || 0,
        disponivel: local.disponivel || 0,
        estmin: local.ESTMIN,
        estmax: local.ESTMAX,
        situacao: local.situacao,
      })),
      totais,
    }
  }
}
