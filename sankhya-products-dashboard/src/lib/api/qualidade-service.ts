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

export interface ProdutosSemNCMFilters {
  search?: string;
  codgrupoprod?: number;
  ativo?: 'S' | 'N';
  marca?: string;
  codlocal?: number;
  usoprod?: 'C' | 'V' | 'S';
  criticidade?: 'ALTA' | 'MEDIA' | 'BAIXA';
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface ProdutosSemNCMResponse {
  produtos: ProdutoSemNCM[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasMore: boolean;
  totalAtivos: number;
  totalCriticos: number;
}

/**
 * Busca produtos sem NCM cadastrado com filtros e paginação
 */
export async function getProdutosSemNCM(filters?: ProdutosSemNCMFilters): Promise<ProdutosSemNCMResponse> {
  const params = new URLSearchParams();

  if (filters?.search) params.append('search', filters.search);
  if (filters?.codgrupoprod) params.append('codgrupoprod', filters.codgrupoprod.toString());
  if (filters?.ativo) params.append('ativo', filters.ativo);
  if (filters?.marca) params.append('marca', filters.marca);
  if (filters?.codlocal) params.append('codlocal', filters.codlocal.toString());
  if (filters?.usoprod) params.append('usoprod', filters.usoprod);
  if (filters?.criticidade) params.append('criticidade', filters.criticidade);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.perPage) params.append('perPage', filters.perPage.toString());
  if (filters?.sort) params.append('sort', filters.sort);

  const queryString = params.toString();
  const url = `${BASE_URL}/sem-ncm${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<ProdutosSemNCMResponse>(url);
  return response.data;
}

export interface ProdutosSemNCMStats {
  total: number;
  totalAtivos: number;
  totalInativos: number;
  totalCriticosAlta: number;
}

/**
 * Busca estatísticas globais de produtos sem NCM (não afetado por filtros)
 */
export async function getStatsProdutosSemNCM(): Promise<ProdutosSemNCMStats> {
  const response = await apiClient.get<ProdutosSemNCMStats>(`${BASE_URL}/sem-ncm/stats`);
  return response.data;
}

/**
 * Helper para calcular percentual
 */
export function calcularPercentual(parte: number, total: number): number {
  if (total === 0) return 0;
  return (parte / total) * 100;
}

export interface GrupoProduto {
  codgrupoprod: number;
  descrgrupoprod: string;
}

export interface LocalEstoque {
  codlocal: number;
  descrlocal: string;
}

/**
 * Busca lista de grupos de produtos ativos (para filtros)
 */
export async function getGruposProdutos(): Promise<GrupoProduto[]> {
  const response = await apiClient.get<GrupoProduto[]>('/tgfpro2/grupos');
  return response.data;
}

/**
 * Busca lista de locais de estoque ativos (para filtros)
 */
export async function getLocaisEstoque(): Promise<LocalEstoque[]> {
  const response = await apiClient.get<LocalEstoque[]>('/tgfpro2/locais');
  return response.data;
}
