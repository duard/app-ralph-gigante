import { useQuery } from '@tanstack/react-query';
import { sankhyaClient } from '@/lib/api/client';
import type { DashboardKpis, BackendResumoResponse, DashboardFilters } from '@/types/dashboard';

export function useProdutosV2Dashboard(filters?: Partial<DashboardFilters>) {
  return useQuery<DashboardKpis, Error>({
    queryKey: ['produtos-v2-dashboard-kpis', filters],
    queryFn: async () => {
      // Preparar params baseados nos filtros
      const params: Record<string, any> = {};

      if (filters?.grupos && filters.grupos.length > 0) {
        params.grupos = filters.grupos.join(',');
      }
      if (filters?.locais && filters.locais.length > 0) {
        params.locais = filters.locais.join(',');
      }
      if (filters?.startDate) {
        params.dataInicial = filters.startDate;
      }
      if (filters?.endDate) {
        params.dataFinal = filters.endDate;
      }
      if (filters?.status && filters.status !== 'all') {
        params.ativo = filters.status === 'active' ? 'S' : 'N';
      }

      console.log('[useProdutosV2Dashboard] Fetching with filters:', params);

      // Buscar dados em paralelo
      const [resumoRes, gruposRes, locaisRes, produtosRes] = await Promise.allSettled([
        sankhyaClient.get<BackendResumoResponse>('/sankhya/dashboards/produtos/resumo', { params }),
        sankhyaClient.get('/sankhya/tgfgru', { params: { perPage: 1, page: 1, ativo: 'S' } }),
        sankhyaClient.get('/tgfloc', { params: { perPage: 1, page: 1 } }),
        // Buscar produtos para calcular métricas adicionais
        sankhyaClient.get('/tgfpro/ultra-search', {
          params: {
            page: 1,
            perPage: 5000, // Buscar todos para agregações
            includeEstoque: 'S',
            ...params,
          },
        }),
      ]);

      // Extrair dados do resumo
      const resumo = resumoRes.status === 'fulfilled' ? resumoRes.value.data : null;

      // Extrair totais de grupos e locais
      const totalGrupos = gruposRes.status === 'fulfilled' ? gruposRes.value.data.total || 0 : 0;
      const totalLocais = locaisRes.status === 'fulfilled' ? locaisRes.value.data.total || 0 : 0;

      // Extrair dados de produtos para cálculos adicionais
      const produtos = produtosRes.status === 'fulfilled' ? produtosRes.value.data.data || [] : [];

      if (!resumo) {
        throw new Error('Falha ao carregar resumo de produtos');
      }

      // Calcular métricas adicionais a partir dos produtos
      const produtosComEstoque = produtos.filter(
        (p: any) => p.estoque && p.estoque.estoqueTotal > 0
      );
      const produtosSemEstoque = produtos.filter(
        (p: any) => !p.estoque || p.estoque.estoqueTotal === 0
      );

      const quantidadeEmEstoque = produtos.reduce((sum: number, p: any) => {
        return sum + (p.estoque?.estoqueTotal || 0);
      }, 0);

      const ticketMedio =
        resumo.totalProdutos > 0 ? resumo.valorTotalEstoque / resumo.totalProdutos : 0;

      console.log('[useProdutosV2Dashboard] Calculated KPIs:', {
        totalProdutos: resumo.totalProdutos,
        produtosComEstoque: produtosComEstoque.length,
        produtosSemEstoque: produtosSemEstoque.length,
        quantidadeEmEstoque,
      });

      return {
        totalProdutos: resumo.totalProdutos,
        totalAtivos: resumo.totalAtivos,
        totalInativos: resumo.totalInativos,
        totalGrupos,
        totalLocais,
        quantidadeEmEstoque,
        valorTotalEstoque: resumo.valorTotalEstoque,
        produtosCriticos: resumo.produtosEstoqueBaixo,
        produtosSemEstoque: produtosSemEstoque.length,
        ticketMedio,
        dataResumo: resumo.dataResumo,
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled: true,
  });
}
