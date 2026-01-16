import { backendClient } from './client'
import type {
  OrdemServico,
  OrdemServicoDetalhada,
  ServicoOS,
  ApontamentoOS,
  ProdutoOS,
  EstatisticasOS,
  ProdutividadeExecutor,
  OrdemServicoFindAllParams,
  OrdemServicoListResponse,
  OSAtiva,
  ProdutoMaisUtilizado,
} from '@/types/ordens-servico'

const BASE_PATH = '/tcfoscab'

export const ordensServicoService = {
  /**
   * Lista todas as ordens de serviço com filtros
   */
  async findAll(params?: OrdemServicoFindAllParams): Promise<OrdemServicoListResponse> {
    const { data } = await backendClient.get<OrdemServicoListResponse>(BASE_PATH, { params })
    return data
  },

  /**
   * Busca OS por ID com todos os detalhes
   */
  async findById(nuos: number): Promise<OrdemServicoDetalhada> {
    const { data } = await backendClient.get<OrdemServicoDetalhada>(`${BASE_PATH}/${nuos}`)
    return data
  },

  /**
   * Busca serviços de uma OS
   */
  async findServicos(nuos: number): Promise<ServicoOS[]> {
    const { data } = await backendClient.get<ServicoOS[]>(`${BASE_PATH}/${nuos}/servicos`)
    return data
  },

  /**
   * Busca apontamentos de tempo de uma OS
   */
  async findApontamentos(nuos: number): Promise<ApontamentoOS[]> {
    const { data } = await backendClient.get<ApontamentoOS[]>(`${BASE_PATH}/${nuos}/apontamentos`)
    return data
  },

  /**
   * Busca produtos utilizados em uma OS
   */
  async findProdutos(nuos: number): Promise<ProdutoOS[]> {
    const { data } = await backendClient.get<ProdutoOS[]>(`${BASE_PATH}/${nuos}/produtos`)
    return data
  },

  /**
   * Estatísticas gerais de OS
   */
  async getEstatisticasGerais(params?: {
    dataInicio?: string
    dataFim?: string
  }): Promise<EstatisticasOS> {
    const { data } = await backendClient.get<EstatisticasOS>(`${BASE_PATH}/stats/geral`, {
      params,
    })
    return data
  },

  /**
   * Lista OS ativas (abertas ou em execução)
   */
  async getOSAtivas(): Promise<OSAtiva[]> {
    const { data } = await backendClient.get<OSAtiva[]>(`${BASE_PATH}/stats/ativas`)
    return data
  },

  /**
   * Produtividade de executores
   */
  async getProdutividade(params?: {
    dataInicio?: string
    dataFim?: string
  }): Promise<ProdutividadeExecutor[]> {
    const { data } = await backendClient.get<ProdutividadeExecutor[]>(
      `${BASE_PATH}/stats/produtividade`,
      { params }
    )
    return data
  },

  /**
   * Produtos mais utilizados
   */
  async getProdutosMaisUtilizados(params?: {
    dataInicio?: string
    dataFim?: string
  }): Promise<ProdutoMaisUtilizado[]> {
    const { data } = await backendClient.get<ProdutoMaisUtilizado[]>(
      `${BASE_PATH}/stats/produtos-mais-usados`,
      { params }
    )
    return data
  },
}
