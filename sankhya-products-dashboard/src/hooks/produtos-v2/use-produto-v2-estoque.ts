import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { EstoquePorLocal } from '@/types/produto-v2';

export interface EstoquePorLocalAPI {
  codlocal: number;
  descrlocal: string;
  estoque: number | null;
  estmin: number | null;
  estmax: number | null;
  custoger: number | null;
  valorEstoque: number | null;
}

export function useProdutoV2Estoque(codprod: number) {
  return useQuery<EstoquePorLocalAPI[], Error>({
    queryKey: ['produtos-v2-estoque-por-local', codprod],
    queryFn: async () => {
      const response = await apiClient.get(`/produtos-v2/${codprod}/estoque-por-local`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
