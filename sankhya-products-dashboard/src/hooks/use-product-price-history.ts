import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { get } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

/**
 * Product price history entry
 */
export interface PriceHistoryEntry {
  data_referencia: string;
  tipo_registro: string;
  nunota?: number;
  tipmov?: string;
  tipo_movimentacao?: string;
  codparc?: number;
  nome_parceiro?: string;
  usuario?: string;
  quantidade_mov?: number;
  valor_mov?: number;
  saldo_qtd_anterior?: number;
  saldo_qtd_final?: number;
  preco_unitario?: number;
}

/**
 * Price history response
 */
export interface PriceHistoryResponse {
  codprod: number;
  dataInicio: string;
  dataFim: string;
  page: number;
  perPage: number;
  totalMovimentacoes: number;
  saldoAnterior: {
    tipo_registro: string;
    data_referencia: string;
    saldo_qtd: number;
    saldo_valor: number;
    saldo_valor_formatted: string;
  };
  movimentacoes: PriceHistoryEntry[];
  movimentoLiquido: number;
  saldoAtual: {
    tipo_registro: string;
    data_referencia: string;
    saldo_qtd_final: number;
    saldo_valor_final: number;
    saldo_valor_final_formatted: string;
  };
  metrics?: any;
  error?: string;
}

/**
 * Custom hook for managing product price history
 */
export function useProductPriceHistory() {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch price history for a product within a date range
   */
  const fetchPriceHistory = useCallback(async (
    codprod: number,
    dataInicio: string,
    dataFim: string,
    page: number = 1,
    perPage: number = 50
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        dataInicio,
        dataFim,
        page: page.toString(),
        perPage: perPage.toString(),
      });

      const response = await get<PriceHistoryResponse>(
        `/tgfpro/consumo-periodo/${codprod}?${queryParams.toString()}`
      );

      if (response) {
        setPriceHistory(response);
        return response;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar histórico de preços';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch price history for the last 30 days
   */
  const fetchLast30Days = useCallback(async (codprod: number) => {
    const dataFim = new Date().toISOString().split('T')[0];
    const dataInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return fetchPriceHistory(codprod, dataInicio, dataFim);
  }, [fetchPriceHistory]);

  /**
   * Fetch price history for the last 90 days
   */
  const fetchLast90Days = useCallback(async (codprod: number) => {
    const dataFim = new Date().toISOString().split('T')[0];
    const dataInicio = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return fetchPriceHistory(codprod, dataInicio, dataFim);
  }, [fetchPriceHistory]);

  /**
   * Clear price history
   */
  const clearPriceHistory = useCallback(() => {
    setPriceHistory(null);
    setError(null);
  }, []);

  /**
   * Transform price history data for chart display
   */
  const getChartData = useCallback(() => {
    if (!priceHistory?.movimentacoes) return [];

    return priceHistory.movimentacoes
      .filter(mov => mov.valor_mov && mov.data_referencia)
      .map(mov => ({
        date: new Date(mov.data_referencia).toLocaleDateString('pt-BR'),
        price: Math.abs(mov.valor_mov || 0),
        quantity: Math.abs(mov.quantidade_mov || 0),
        unitPrice: mov.quantidade_mov ? Math.abs((mov.valor_mov || 0) / mov.quantidade_mov) : 0,
        type: mov.tipo_movimentacao || 'Movimentação',
      }));
  }, [priceHistory]);

  /**
   * Get average price from the period
   */
  const getAveragePrice = useCallback(() => {
    if (!priceHistory?.movimentacoes) return 0;
    
    const validMovs = priceHistory.movimentacoes.filter(mov => mov.valor_mov && mov.quantidade_mov);
    if (validMovs.length === 0) return 0;

    const totalPrice = validMovs.reduce((sum, mov) => sum + Math.abs(mov.valor_mov || 0), 0);
    const totalQuantity = validMovs.reduce((sum, mov) => sum + Math.abs(mov.quantidade_mov || 0), 0);
    
    return totalQuantity > 0 ? totalPrice / totalQuantity : 0;
  }, [priceHistory]);

  /**
   * Get price trend (increase/decrease percentage)
   */
  const getPriceTrend = useCallback(() => {
    const chartData = getChartData();
    if (chartData.length < 2) return { trend: 'stable', percentage: 0 };

    const firstPrice = chartData[0].unitPrice;
    const lastPrice = chartData[chartData.length - 1].unitPrice;
    
    if (firstPrice === 0) return { trend: 'stable', percentage: 0 };
    
    const percentage = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    return {
      trend: percentage > 5 ? 'increase' : percentage < -5 ? 'decrease' : 'stable',
      percentage: Math.abs(percentage)
    };
  }, [getChartData]);

  return {
    priceHistory,
    isLoading,
    error,
    fetchPriceHistory,
    fetchLast30Days,
    fetchLast90Days,
    clearPriceHistory,
    getChartData,
    getAveragePrice,
    getPriceTrend,
  };
}

export default useProductPriceHistory;