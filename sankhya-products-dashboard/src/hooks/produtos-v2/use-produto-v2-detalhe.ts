import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ProdutoV2Completo } from '@/types/produto-v2';

export function useProdutoV2Detalhe(codprod: number) {
  return useQuery<ProdutoV2Completo, Error>({
    queryKey: ['produtos-v2-produto-completo', codprod],
    queryFn: async () => {
      const response = await apiClient.get(`/produtos-v2/${codprod}/completo`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
