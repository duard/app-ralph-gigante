import { useQuery } from '@tanstack/react-query';
import { sankhyaClient } from '@/lib/api/client';
import type { Grupo, Local, PaginatedResponse } from '@/types/dashboard';

export function useGrupos() {
  return useQuery<Grupo[], Error>({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await sankhyaClient.get<PaginatedResponse<Grupo>>('/sankhya/tgfgru', {
        params: {
          ativo: 'S',
          perPage: 1000,
          page: 1,
        },
      });
      return response.data.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useLocais() {
  return useQuery<Local[], Error>({
    queryKey: ['locais'],
    queryFn: async () => {
      const response = await sankhyaClient.get<PaginatedResponse<Local>>('/tgfloc', {
        params: {
          perPage: 1000,
          page: 1,
        },
      });
      return response.data.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
