import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/lib/api/productService'
import type { ProductListResponse, ProductFilters } from '@/types/product'

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await productService.getProducts(filters)
      return response.data as ProductListResponse
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}