import { useQuery } from '@tanstack/react-query'
import { produtosV7Service } from '@/lib/api/produtos-v7-service'
import type { ProdutosV7Filters, ProdutosV7ListResponse } from '@/types/produtos-v7'

/**
 * Query keys para cache do React Query
 */
export const produtosV7QueryKeys = {
  all: ['produtos-v7'] as const,
  list: (filters: ProdutosV7Filters) => [...produtosV7QueryKeys.all, 'list', filters] as const,
  metrics: (filters: Partial<ProdutosV7Filters>) =>
    [...produtosV7QueryKeys.all, 'metrics', filters] as const,
  locais: (codprod: number) => [...produtosV7QueryKeys.all, 'locais', codprod] as const,
}

/**
 * Hook para buscar lista de produtos com filtros
 */
export function useProdutosV7(filters: ProdutosV7Filters) {
  return useQuery<ProdutosV7ListResponse, Error>({
    queryKey: produtosV7QueryKeys.list(filters),
    queryFn: () => produtosV7Service.findAll(filters),
    staleTime: 30 * 1000, // 30 segundos
    // Manter dados anteriores durante refetch para evitar flicker
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook para buscar métricas agregadas
 */
export function useProdutosV7Metrics(filters: Partial<ProdutosV7Filters>) {
  return useQuery({
    queryKey: produtosV7QueryKeys.metrics(filters),
    queryFn: () => produtosV7Service.getMetrics(filters),
    staleTime: 60 * 1000, // 1 minuto - métricas podem ser menos frequentes
    // Manter dados anteriores durante refetch
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook para buscar locais de um produto específico
 */
export function useProdutoLocais(codprod: number, enabled = true) {
  return useQuery({
    queryKey: produtosV7QueryKeys.locais(codprod),
    queryFn: () => produtosV7Service.getProdutoLocais(codprod),
    staleTime: 30 * 1000,
    enabled: enabled && !!codprod, // Só busca se enabled e codprod válido
  })
}
