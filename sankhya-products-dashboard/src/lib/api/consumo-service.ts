/**
 * Serviço de API para consumo de produtos (TGFPRO2)
 * Integra com backend em /api-sankhya-center
 */

import { apiClient } from './axios-instance';
import type {
  MovimentacaoConsumo,
  ConsumoProduto,
  ConsumoAnalise,
  ConsumoFiltros,
  PaginatedResponse,
} from '@/types/consumo';

const BASE_URL = '/tgfpro2/consumo';

/**
 * Lista movimentações de consumo com filtros
 */
export async function getMovimentacoesConsumo(
  filtros: ConsumoFiltros = {}
): Promise<PaginatedResponse<MovimentacaoConsumo>> {
  const params = new URLSearchParams();

  if (filtros.codprod) params.append('codprod', filtros.codprod.toString());
  if (filtros.coddep) params.append('coddep', filtros.coddep.toString());
  if (filtros.codusuinc) params.append('codusuinc', filtros.codusuinc.toString());
  if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
  if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
  if (filtros.atualizaEstoque) params.append('atualizaEstoque', filtros.atualizaEstoque);
  if (filtros.codtipoper) params.append('codtipoper', filtros.codtipoper.toString());
  if (filtros.search) params.append('search', filtros.search);
  if (filtros.agruparPor) params.append('agruparPor', filtros.agruparPor);
  if (filtros.page) params.append('page', filtros.page.toString());
  if (filtros.perPage) params.append('perPage', filtros.perPage.toString());

  const response = await apiClient.get<PaginatedResponse<MovimentacaoConsumo>>(
    `${BASE_URL}?${params.toString()}`
  );

  return response.data;
}

/**
 * Analisa consumo de um produto específico
 */
export async function getConsumoProduto(
  codprod: number,
  dataInicio?: string,
  dataFim?: string
): Promise<ConsumoProduto> {
  const params = new URLSearchParams();

  if (dataInicio) params.append('dataInicio', dataInicio);
  if (dataFim) params.append('dataFim', dataFim);

  const response = await apiClient.get<ConsumoProduto>(
    `${BASE_URL}/produto/${codprod}?${params.toString()}`
  );

  return response.data;
}

/**
 * Análise completa de consumo por período
 */
export async function getConsumoAnalise(
  dataInicio: string,
  dataFim: string,
  top: number = 10
): Promise<ConsumoAnalise> {
  const params = new URLSearchParams({
    dataInicio,
    dataFim,
    top: top.toString(),
  });

  const response = await apiClient.get<ConsumoAnalise>(
    `${BASE_URL}/analise?${params.toString()}`
  );

  return response.data;
}

/**
 * Helper para formatar datas para o formato YYYY-MM-DD
 */
export function formatarDataParaAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Helper para calcular período padrão (últimos N dias)
 */
export function getPeriodoPadrao(dias: number = 30): { dataInicio: string; dataFim: string } {
  const dataFim = new Date();
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - dias);

  return {
    dataInicio: formatarDataParaAPI(dataInicio),
    dataFim: formatarDataParaAPI(dataFim),
  };
}

/**
 * Helper para formatar valores monetários
 */
export function formatarValor(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Helper para formatar percentuais
 */
export function formatarPercentual(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(valor / 100);
}
