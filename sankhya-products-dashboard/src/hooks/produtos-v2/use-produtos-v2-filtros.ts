import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface FiltroOpcao {
  codigo: number | string;
  descricao: string;
  contagem: number;
}

export function useProdutosV2Filtros() {
  const gruposQuery = useQuery<FiltroOpcao[], Error>({
    queryKey: ['produtos-v2-filtros-grupos'],
    queryFn: async () => {
      const response = await apiClient.get('/produtos-v2/filtros/grupos');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const locaisQuery = useQuery<FiltroOpcao[], Error>({
    queryKey: ['produtos-v2-filtros-locais'],
    queryFn: async () => {
      const response = await apiClient.get('/produtos-v2/filtros/locais');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const controlesQuery = useQuery<FiltroOpcao[], Error>({
    queryKey: ['produtos-v2-filtros-controles'],
    queryFn: async () => {
      const response = await apiClient.get('/produtos-v2/filtros/controles');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const marcasQuery = useQuery<FiltroOpcao[], Error>({
    queryKey: ['produtos-v2-filtros-marcas'],
    queryFn: async () => {
      const response = await apiClient.get('/produtos-v2/filtros/marcas');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    grupos: gruposQuery.data || [],
    locais: locaisQuery.data || [],
    controles: controlesQuery.data || [],
    marcas: marcasQuery.data || [],
    isLoading:
      gruposQuery.isLoading ||
      locaisQuery.isLoading ||
      controlesQuery.isLoading ||
      marcasQuery.isLoading,
    error: gruposQuery.error || locaisQuery.error || controlesQuery.error || marcasQuery.error,
  };
}
