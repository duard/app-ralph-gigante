import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-instance';

export interface SimplifiedProduct {
  codprod: number;
  descrprod: string;
  referencia?: string | null;
  marca?: string | null;
  codvol?: string | null;
  ativo: string;
  codgrupoprod?: number;
}

export interface SimplifiedProductsResponse {
  data: SimplifiedProduct[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasMore: boolean;
}

export interface UseProductsSimplifiedParams {
  search?: string;
  page?: number;
  perPage?: number;
  ativo?: string;
}

export function useProductsSimplified(params: UseProductsSimplifiedParams = {}) {
  const { search, page = 1, perPage = 20, ativo } = params;

  return useQuery({
    queryKey: ['products', 'simplified', { search, page, perPage, ativo }],
    queryFn: async () => {
      const response = await apiClient.get<SimplifiedProductsResponse>('/tgfpro/simplified', {
        params: {
          page,
          perPage,
          ...(search && { search }),
          ...(ativo && { ativo }),
        },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
