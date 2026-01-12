import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  productService,
  type ProductPayload,
  type ProductSearchParams,
} from '../api/product-service';

import { toast } from 'sonner';

// Query key factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductSearchParams = {}) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  stats: () => [...productKeys.all, 'stats'] as const,
  byCategory: (categoryId: number) => [...productKeys.lists(), { categoryId }] as const,
};

/**
 * Hook for fetching products list with pagination, filtering, and sorting
 */
export function useProductsQuery(params?: ProductSearchParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (response) => {
      // Transform backend data to match frontend Product interface
      if (response && response.data) {
        const transformedData = response.data.map((item: any) => ({
          id: item.codprod,
          codprod: item.codprod,
          descrprod: item.descrprod || '',
          reffab: item.referencia || undefined, // backend 'referencia' -> frontend 'reffab'
          codvol: item.codvol || undefined,
          vlrvenda: undefined, // Not available in basic list
          vlrcusto: undefined, // Not available in basic list
          estoque: undefined, // Not available in basic list
          estmin: item.estmin || undefined,
          ativo: item.ativo || 'S',
          codgrupoprod: item.codgrupoprod || undefined,
          descrgrupoprod: undefined, // Not available in basic list
          codmarca: undefined, // backend has 'marca' as string, frontend expects number
          ncm: item.ncm || undefined,
          cest: item.cest || undefined,
          pesoliq: item.pesoliq || undefined,
          pesobruto: item.pesobruto || undefined,
          observacao: item.observacao || undefined,
          imagem: item.imagem || undefined,
          dtcad: item.dtcad || undefined,
          dtalter: item.dtalter || undefined,
        }));

        return {
          ...response,
          data: transformedData,
        };
      }
      return response;
    },
  });
}

/**
 * Hook for fetching a single product by ID
 */
export function useProductQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for searching products
 */
export function useProductSearchQuery(query: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => productService.searchProducts(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => response.data || [],
  });
}

/**
 * Hook for fetching product categories
 */
export function useProductCategoriesQuery() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes - categories rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook for fetching product statistics
 */
export function useProductStatsQuery() {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: () => productService.getProductStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

/**
 * Hook for fetching products by category
 */
export function useProductsByCategoryQuery(categoryId: number, enabled = true) {
  return useQuery({
    queryKey: productKeys.byCategory(categoryId),
    queryFn: () => productService.getProductsByCategory(categoryId),
    enabled: enabled && !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for creating a new product
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductPayload) => productService.createProduct(data),
    onSuccess: (data) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });

      toast.success('Produto criado com sucesso');

      return data;
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao criar produto';
      toast.error(message);
    },
  });
}

/**
 * Hook for updating an existing product
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductPayload> }) =>
      productService.updateProduct(id, data),
    onSuccess: (data, variables) => {
      // Update specific product in cache
      queryClient.setQueryData(productKeys.detail(variables.id), data);

      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });

      toast.success('Produto atualizado com sucesso');

      return data;
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar produto';
      toast.error(message);
    },
  });
}

/**
 * Hook for deleting a product
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: (_, productId) => {
      // Remove product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) });

      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });

      toast.success('Produto excluído com sucesso');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao excluir produto';
      toast.error(message);
    },
  });
}

/**
 * Hook for deleting multiple products
 */
export function useDeleteProductsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => productService.deleteProducts(ids),
    onSuccess: (_, variables) => {
      const productIds = variables as number[];
      // Remove products from cache
      productIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      });

      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });

      toast.success(`${productIds.length} produto(s) excluído(s) com sucesso`);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao excluir produtos';
      toast.error(message);
    },
  });
}

/**
 * Hook for toggling product status
 */
export function useToggleProductStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.toggleProductStatus(id),
    onSuccess: (data, variables) => {
      const productId = variables as number;
      // Update product in cache
      queryClient.setQueryData(productKeys.detail(productId), data);

      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });

      toast.success('Status do produto atualizado com sucesso');

      return data;
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar status';
      toast.error(message);
    },
  });
}

/**
 * Hook for updating product stock
 */
export function useUpdateStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      productService.updateStock(id, quantity),
    onSuccess: (_, variables) => {
      // Remove product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(variables.id) });

      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });

      toast.success('Estoque atualizado com sucesso');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar estoque';
      toast.error(message);
    },
  });
}

/**
 * Hook for prefetching product data (for optimistic loading)
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: () => productService.getProductById(id),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };
}

/**
 * Hook for invalidating all product-related queries
 */
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: productKeys.all });
  };
}
