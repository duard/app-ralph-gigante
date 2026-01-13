'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-instance';

export interface StockMetrics {
  negativos: number;
  abaixoMinimo: number;
  acimaMaximo: number;
  semMovimento: number;
  normais: number;
  total: number;
  valorTotalEstoque: number;
  trendNegativos?: number;
  trendAbaixoMinimo?: number;
  trendAcimaMaximo?: number;
  trendSemMovimento?: number;
  trendNormais?: number;
}

export function useStockMetrics(filters?: any) {
  return useQuery({
    queryKey: ['stock-metrics', filters],
    queryFn: async () => {
      const response = await apiClient.get('/estoque/metrics-comprehensive', {
        params: filters,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useStockByLocation(codprod: number) {
  return useQuery({
    queryKey: ['stock-by-location', codprod],
    queryFn: async () => {
      const response = await apiClient.get(`/tgfpro/${codprod}/estoque-por-local`);
      return response.data;
    },
    enabled: !!codprod,
    staleTime: 2 * 60 * 1000,
  });
}
