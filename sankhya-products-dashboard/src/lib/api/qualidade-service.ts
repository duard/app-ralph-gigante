/**
 * Serviço de API para qualidade de produtos (TGFPRO2)
 * Endpoints relacionados à qualidade de dados e compliance
 */

import { apiClient } from './axios-instance';
import type { Produto2 } from '@/types/consumo';

const BASE_URL = '/tgfpro2/qualidade';

export interface ProdutoSemNCM extends Produto2 {
  estoqueTotal: number;
  criticidade: 'ALTA' | 'MEDIA' | 'BAIXA';
}

export interface ProdutosSemNCMResponse {
  produtos: ProdutoSemNCM[];
  total: number;
  totalAtivos: number;
  totalComEstoque: number;
  totalCriticos: number;
}

/**
 * Busca produtos sem NCM cadastrado
 */
export async function getProdutosSemNCM(): Promise<ProdutosSemNCMResponse> {
  const response = await apiClient.get<ProdutosSemNCMResponse>(`${BASE_URL}/sem-ncm`);
  return response.data;
}

/**
 * Helper para calcular percentual
 */
export function calcularPercentual(parte: number, total: number): number {
  if (total === 0) return 0;
  return (parte / total) * 100;
}
