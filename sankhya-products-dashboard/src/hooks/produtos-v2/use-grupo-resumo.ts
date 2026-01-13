import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface GrupoResumo {
  codgrupoprod: number;
  descrgrupoprod: string;
  totalProdutos: number;
  produtosAtivos: number;
  produtosCriticos: number;
  valorEstoque: number;
}

export function useGrupoResumo(codgrupoprod: number) {
  return useQuery<GrupoResumo, Error>({
    queryKey: ['produtos-v2-grupo-resumo', codgrupoprod],
    queryFn: async () => {
      const response = await apiClient.get(`/produtos-v2/grupo/${codgrupoprod}/resumo`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
