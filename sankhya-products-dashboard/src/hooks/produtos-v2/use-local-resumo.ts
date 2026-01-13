import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface LocalResumo {
  codlocal: number;
  descrlocal: string;
  totalProdutos: number;
  valorEstoque: number;
}

export function useLocalResumo(codlocal: number) {
  return useQuery<LocalResumo, Error>({
    queryKey: ['produtos-v2-local-resumo', codlocal],
    queryFn: async () => {
      const response = await apiClient.get(`/produtos-v2/local/${codlocal}/resumo`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
