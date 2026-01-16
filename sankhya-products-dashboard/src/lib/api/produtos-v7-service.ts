import { sankhyaClient } from './client'
import type {
  ProdutosV7Filters,
  ProdutosV7ListResponse,
  ProdutosV7Metrics,
  ProdutoLocaisResponse,
} from '@/types/produtos-v7'

const BASE_PATH = '/tgfpro'

/**
 * Service para a nova tela de produtos V7
 * Centraliza chamadas para endpoints otimizados
 */
export const produtosV7Service = {
  /**
   * Lista produtos com estoque agregado de todos os locais
   */
  async findAll(filters: ProdutosV7Filters): Promise<ProdutosV7ListResponse> {
    const params: Record<string, any> = {
      page: filters.page,
      perPage: filters.perPage,
    }

    // Filtros básicos
    if (filters.search) params.search = filters.search
    if (filters.codgrupoprod) params.codgrupoprod = filters.codgrupoprod
    if (filters.marca) params.marca = filters.marca
    if (filters.ativo && filters.ativo !== 'all') params.ativo = filters.ativo

    // Ordenação
    if (filters.sortBy && filters.sortOrder) {
      const sortMap: Record<string, string> = {
        codprod: 'CODPROD',
        descrprod: 'DESCRPROD',
        estoqueTotal: 'ESTOQUE_TOTAL',
        vlrunit: 'VLRUNIT',
        marca: 'MARCA',
      }
      const column = sortMap[filters.sortBy] || 'DESCRPROD'
      params.sort = `${column} ${filters.sortOrder.toUpperCase()}`
    }

    // Usar endpoint ultra-search que já inclui estoque
    params.includeEstoque = 'S'

    // Filtros de estoque (aplicados no backend)
    if (filters.comEstoque) params.comEstoque = 'true'
    if (filters.semEstoque) params.semEstoque = 'true'

    const { data } = await sankhyaClient.get<ProdutosV7ListResponse>(
      `${BASE_PATH}/ultra-search`,
      { params }
    )

    return data
  },

  /**
   * Busca métricas agregadas baseadas nos filtros
   */
  async getMetrics(filters: Partial<ProdutosV7Filters>): Promise<ProdutosV7Metrics> {
    const params: Record<string, any> = {}

    // Aplicar mesmos filtros da listagem
    if (filters.search) params.search = filters.search
    if (filters.codgrupoprod) params.codgrupoprod = filters.codgrupoprod
    if (filters.codlocal) params.codlocal = filters.codlocal
    if (filters.marca) params.marca = filters.marca
    if (filters.ativo && filters.ativo !== 'all') params.ativo = filters.ativo

    // Buscar todos produtos para calcular métricas
    // Usamos perPage alto para pegar tudo de uma vez
    const { data } = await sankhyaClient.get(`${BASE_PATH}/ultra-search`, {
      params: {
        ...params,
        page: 1,
        perPage: 10000, // Pegar todos para agregação
        includeEstoque: 'S',
      },
    })

    const produtos = data.data || []

    // Calcular métricas
    const total = data.total || 0
    const ativos = produtos.filter((p: any) => p.ativo === 'S').length
    const inativos = produtos.filter((p: any) => p.ativo === 'N').length

    const comEstoque = produtos.filter(
      (p: any) => p.estoque && p.estoque.estoqueTotal > 0
    ).length
    const semEstoque = produtos.filter(
      (p: any) => !p.estoque || p.estoque.estoqueTotal === 0
    ).length

    const valorTotalEstoque = produtos.reduce((sum: number, p: any) => {
      const estoque = p.estoque?.estoqueTotal || 0
      const custo = p.custoMedio || 0
      return sum + estoque * custo
    }, 0)

    const estoqueTotal = produtos.reduce((sum: number, p: any) => {
      return sum + (p.estoque?.estoqueTotal || 0)
    }, 0)

    const valorMedioUnitario =
      produtos.length > 0
        ? produtos.reduce((sum: number, p: any) => sum + (p.vlrunit || 0), 0) /
          produtos.length
        : 0

    const comControle = produtos.filter(
      (p: any) => p.usacontrole === 'S'
    ).length
    const semControle = produtos.filter(
      (p: any) => p.usacontrole === 'N' || !p.usacontrole
    ).length

    // Contar locais únicos
    const locaisSet = new Set()
    produtos.forEach((p: any) => {
      if (p.estoque?.locais) {
        p.estoque.locais.forEach((l: any) => locaisSet.add(l.codlocal))
      }
    })
    const qtdTotalLocais = locaisSet.size

    return {
      total,
      ativos,
      inativos,
      comEstoque,
      semEstoque,
      valorTotalEstoque,
      valorMedioUnitario,
      estoqueTotal,
      qtdTotalLocais,
      comControle,
      semControle,
    }
  },

  /**
   * Busca estoque de um produto em todos os locais
   */
  async getProdutoLocais(codprod: number): Promise<ProdutoLocaisResponse> {
    const { data } = await sankhyaClient.get<ProdutoLocaisResponse>(
      `/estoque/produtos/${codprod}/locais`
    )
    return data
  },
}
