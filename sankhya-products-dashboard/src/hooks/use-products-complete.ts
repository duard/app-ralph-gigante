import { useQuery } from '@tanstack/react-query';
import { productsApi, locationsApi, groupsApi, type ProductFilters } from '@/lib/api/products-api';

/**
 * Hook para buscar produtos com paginação e filtros
 */
export function useProductsComplete(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', 'complete', filters],
    queryFn: () => productsApi.getWithStockLocations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
  });
}

/**
 * Hook para buscar produto por ID
 */
export function useProduct(codprod: number) {
  return useQuery({
    queryKey: ['product', codprod],
    queryFn: () => productsApi.getById(codprod),
    enabled: !!codprod,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar todos os locais de estoque
 */
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutos (locais mudam pouco)
  });
}

/**
 * Hook para buscar locais que tem estoque de um produto
 */
export function useProductLocations(codprod: number) {
  return useQuery({
    queryKey: ['product-locations', codprod],
    queryFn: () => locationsApi.getByProduct(codprod),
    enabled: !!codprod,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para buscar todos os grupos/categorias
 */
export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para buscar histórico de consumo de um produto (V1 - Simples)
 */
export function useProductConsumo(
  codprod: number,
  dataInicio: string,
  dataFim: string,
  page: number = 1,
  perPage: number = 50
) {
  return useQuery({
    queryKey: ['product-consumo', codprod, dataInicio, dataFim, page, perPage],
    queryFn: () => productsApi.getConsumoPeriodo(codprod, dataInicio, dataFim, page, perPage),
    enabled: !!codprod && !!dataInicio && !!dataFim,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar histórico de consumo de um produto (V2 - Detalhado)
 */
export function useProductConsumoV2(
  codprod: number,
  dataInicio: string,
  dataFim: string,
  page: number = 1,
  perPage: number = 50
) {
  return useQuery({
    queryKey: ['product-consumo-v2', codprod, dataInicio, dataFim, page, perPage],
    queryFn: () => productsApi.getConsumoPeriodoV2(codprod, dataInicio, dataFim, page, perPage),
    enabled: !!codprod && !!dataInicio && !!dataFim,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar visão 360° do produto (V3)
 */
export function useProduct360V3(codprod: number) {
  return useQuery({
    queryKey: ['product-360-v3', codprod],
    queryFn: () => productsApi.getProduto360V3(codprod),
    enabled: !!codprod,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para busca avançada
 */
export function useProductSearch(termo: string, limit: number = 50) {
  return useQuery({
    queryKey: ['product-search', termo, limit],
    queryFn: () => productsApi.searchAvancada(termo, limit),
    enabled: termo.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}
