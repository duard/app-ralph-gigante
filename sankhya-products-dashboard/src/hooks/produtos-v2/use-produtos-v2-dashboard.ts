import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface DashboardKpis {
  totalProdutos: number;
  totalGrupos: number;
  totalLocais: number;
  produtosCriticos: number;
  produtosSemMovimento: number;
  valorTotalEstoque: number;
}

export function useProdutosV2Dashboard() {
  return useQuery<DashboardKpis, Error>({
    queryKey: ['produtos-v2-dashboard-kpis'],
    queryFn: async () => {
      const response = await apiClient.get('/produtos-v2/dashboard/kpis');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
