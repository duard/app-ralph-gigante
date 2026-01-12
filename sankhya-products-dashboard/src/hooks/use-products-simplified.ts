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
  descrgrupoprod?: string | null;
  localizacao?: string | null;
  tipcontest?: string | null;
  liscontest?: string | null;
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
  codgrupoprod?: number;
  localizacao?: string;
  tipcontest?: string;
}

export function useProductsSimplified(params: UseProductsSimplifiedParams = {}) {
  const { search, page = 1, perPage = 20, ativo, codgrupoprod, localizacao, tipcontest } = params;

  return useQuery({
    queryKey: ['products', 'simplified', { search, page, perPage, ativo, codgrupoprod, localizacao, tipcontest }],
    queryFn: async () => {
      const response = await apiClient.get<SimplifiedProductsResponse>('/tgfpro/simplified', {
        params: {
          page,
          perPage,
          ...(search && { search }),
          ...(ativo && { ativo }),
          ...(codgrupoprod && { codgrupoprod }),
          ...(localizacao && { localizacao }),
          ...(tipcontest && { tipcontest }),
        },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
