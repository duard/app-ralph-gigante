import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/types/api';

export interface ProdutoV2 {
  codprod: number;
  descrprod: string;
  referencia: string | null;
  marca: string | null;
  codvol: string | null;
  ativo: string;
  codgrupoprod: number;
  descrgrupoprod: string | null;
  localizacao: string | null;
  tipcontest: string | null;
  liscontest: string | null;
  estoque: number | null;
  estmin: number | null;
  estmax: number | null;
  valorEstoque: number | null;
}

export interface ProdutoV2FindAllDto {
  page?: number;
  perPage?: number;
  sort?: string;
  search?: string;
  grupos?: number[];
  locais?: number[];
  controles?: string[];
  marcas?: string[];
  ativo?: string;
  comEstoque?: boolean;
  semEstoque?: boolean;
  critico?: boolean;
  estoqueMin?: number;
  estoqueMax?: number;
}

export function useProdutosV2Listagem(dto: ProdutoV2FindAllDto) {
  const queryKey = [
    'produtos-v2-listagem',
    dto.page,
    dto.perPage,
    dto.sort,
    dto.search,
    dto.grupos,
    dto.locais,
    dto.controles,
    dto.marcas,
    dto.ativo,
    dto.comEstoque,
    dto.semEstoque,
    dto.critico,
    dto.estoqueMin,
    dto.estoqueMax,
  ];

  return useQuery<PaginatedResponse<ProdutoV2>, Error>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();

      if (dto.page) params.append('page', dto.page.toString());
      if (dto.perPage) params.append('perPage', dto.perPage.toString());
      if (dto.sort) params.append('sort', dto.sort);
      if (dto.search) params.append('search', dto.search);
      if (dto.grupos) dto.grupos.forEach((g) => params.append('grupos', g.toString()));
      if (dto.locais) dto.locais.forEach((l) => params.append('locais', l.toString()));
      if (dto.controles) dto.controles.forEach((c) => params.append('controles', c));
      if (dto.marcas) dto.marcas.forEach((m) => params.append('marcas', m));
      if (dto.ativo) params.append('ativo', dto.ativo);
      if (dto.comEstoque) params.append('comEstoque', 'true');
      if (dto.semEstoque) params.append('semEstoque', 'true');
      if (dto.critico) params.append('critico', 'true');
      if (dto.estoqueMin !== undefined) params.append('estoqueMin', dto.estoqueMin.toString());
      if (dto.estoqueMax !== undefined) params.append('estoqueMax', dto.estoqueMax.toString());

      const response = await apiClient.get(`/produtos-v2/listagem?${params.toString()}`);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
