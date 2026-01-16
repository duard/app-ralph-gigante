import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { ordensServicoService } from '@/lib/api/ordens-servico-service'
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

// Query keys
export const osQueryKeys = {
  all: ['ordens-servico'] as const,
  lists: () => [...osQueryKeys.all, 'list'] as const,
  list: (params?: OrdemServicoFindAllParams) => [...osQueryKeys.lists(), params] as const,
  details: () => [...osQueryKeys.all, 'detail'] as const,
  detail: (nuos: number) => [...osQueryKeys.details(), nuos] as const,
  servicos: (nuos: number) => [...osQueryKeys.detail(nuos), 'servicos'] as const,
  apontamentos: (nuos: number) => [...osQueryKeys.detail(nuos), 'apontamentos'] as const,
  produtos: (nuos: number) => [...osQueryKeys.detail(nuos), 'produtos'] as const,
  stats: () => [...osQueryKeys.all, 'stats'] as const,
  statsGeral: (params?: { dataInicio?: string; dataFim?: string }) =>
    [...osQueryKeys.stats(), 'geral', params] as const,
  statsAtivas: () => [...osQueryKeys.stats(), 'ativas'] as const,
  statsProdutividade: (params?: { dataInicio?: string; dataFim?: string }) =>
    [...osQueryKeys.stats(), 'produtividade', params] as const,
  statsProdutos: (params?: { dataInicio?: string; dataFim?: string }) =>
    [...osQueryKeys.stats(), 'produtos', params] as const,
}

/**
 * Hook para listar ordens de serviço com filtros
 */
export function useOrdensServico(params?: OrdemServicoFindAllParams) {
  return useQuery({
    queryKey: osQueryKeys.list(params),
    queryFn: () => ordensServicoService.findAll(params),
    staleTime: 30000, // 30 segundos
  })
}

/**
 * Hook para buscar OS por ID
 */
export function useOrdemServico(nuos: number) {
  return useQuery({
    queryKey: osQueryKeys.detail(nuos),
    queryFn: () => ordensServicoService.findById(nuos),
    enabled: !!nuos,
    staleTime: 60000, // 1 minuto
  })
}

/**
 * Hook para buscar serviços de uma OS
 */
export function useServicosOS(nuos: number) {
  return useQuery({
    queryKey: osQueryKeys.servicos(nuos),
    queryFn: () => ordensServicoService.findServicos(nuos),
    enabled: !!nuos,
    staleTime: 60000,
  })
}

/**
 * Hook para buscar apontamentos de uma OS
 */
export function useApontamentosOS(nuos: number) {
  return useQuery({
    queryKey: osQueryKeys.apontamentos(nuos),
    queryFn: () => ordensServicoService.findApontamentos(nuos),
    enabled: !!nuos,
    staleTime: 30000,
  })
}

/**
 * Hook para buscar produtos de uma OS
 */
export function useProdutosOS(nuos: number) {
  return useQuery({
    queryKey: osQueryKeys.produtos(nuos),
    queryFn: () => ordensServicoService.findProdutos(nuos),
    enabled: !!nuos,
    staleTime: 60000,
  })
}

/**
 * Hook para estatísticas gerais
 */
export function useEstatisticasGerais(params?: { dataInicio?: string; dataFim?: string }) {
  return useQuery({
    queryKey: osQueryKeys.statsGeral(params),
    queryFn: () => ordensServicoService.getEstatisticasGerais(params),
    staleTime: 120000, // 2 minutos
  })
}

/**
 * Hook para OS ativas
 */
export function useOSAtivas() {
  return useQuery({
    queryKey: osQueryKeys.statsAtivas(),
    queryFn: () => ordensServicoService.getOSAtivas(),
    staleTime: 30000,
    refetchInterval: 60000, // Auto-refresh a cada 1 minuto
  })
}

/**
 * Hook para produtividade de executores
 */
export function useProdutividade(params?: { dataInicio?: string; dataFim?: string }) {
  return useQuery({
    queryKey: osQueryKeys.statsProdutividade(params),
    queryFn: () => ordensServicoService.getProdutividade(params),
    staleTime: 120000,
  })
}

/**
 * Hook para produtos mais utilizados
 */
export function useProdutosMaisUtilizados(params?: { dataInicio?: string; dataFim?: string }) {
  return useQuery({
    queryKey: osQueryKeys.statsProdutos(params),
    queryFn: () => ordensServicoService.getProdutosMaisUtilizados(params),
    staleTime: 300000, // 5 minutos
  })
}
