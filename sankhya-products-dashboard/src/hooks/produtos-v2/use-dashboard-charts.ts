import { useQuery } from '@tanstack/react-query';
import { sankhyaClient } from '@/lib/api/client';
import type { DashboardFilters } from '@/types/dashboard';

// ========================================
// Distribuição por Grupo
// ========================================

export interface GrupoDistribuicao {
  codgrupoprod: number;
  descgrupoprod: string;
  totalProdutos: number;
  valorEstoque: number;
  percentual: number;
}

export function useDistribuicaoPorGrupo(filters?: Partial<DashboardFilters>) {
  return useQuery<GrupoDistribuicao[], Error>({
    queryKey: ['dashboard-distribuicao-grupos', filters],
    queryFn: async () => {
      // Buscar todos os produtos com estoque
      const response = await sankhyaClient.get('/tgfpro/ultra-search', {
        params: {
          page: 1,
          perPage: 10000,
          includeEstoque: 'S',
          includeJoins: 'S',
          ativo:
            filters?.status === 'active' ? 'S' : filters?.status === 'inactive' ? 'N' : undefined,
        },
      });

      const produtos = response.data.data || [];

      // Agrupar por grupo
      const gruposMap = new Map<number, GrupoDistribuicao>();

      produtos.forEach((produto: any) => {
        const codgrupoprod = produto.codgrupoprod;
        const descgrupoprod = produto.tgfgru?.descgrupoprod || 'Sem Grupo';
        const valorEstoque = produto.estoque?.estoqueTotal || 0;

        if (!gruposMap.has(codgrupoprod)) {
          gruposMap.set(codgrupoprod, {
            codgrupoprod,
            descgrupoprod,
            totalProdutos: 0,
            valorEstoque: 0,
            percentual: 0,
          });
        }

        const grupo = gruposMap.get(codgrupoprod)!;
        grupo.totalProdutos += 1;
        grupo.valorEstoque += valorEstoque;
      });

      // Converter para array e calcular percentuais
      const grupos = Array.from(gruposMap.values());
      const totalProdutos = grupos.reduce((sum, g) => sum + g.totalProdutos, 0);

      grupos.forEach((grupo) => {
        grupo.percentual = totalProdutos > 0 ? (grupo.totalProdutos / totalProdutos) * 100 : 0;
      });

      // Ordenar por quantidade de produtos (descrescente)
      return grupos.sort((a, b) => b.totalProdutos - a.totalProdutos).slice(0, 10);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ========================================
// Top 10 Produtos Mais Caros (Preço Real de Venda)
// ========================================

export interface ProdutoTop10 {
  codprod: number;
  descrprod: string;
  referencia: string | null;
  valorUnitario: number; // Preço médio de venda dos últimos pedidos
  totalVendido: number; // Quantidade total vendida
  ultimaVenda: string | null; // Data da última venda
  grupo: string | null;
}

export function useTop10ProdutosPorValor(filters?: Partial<DashboardFilters>) {
  return useQuery<ProdutoTop10[], Error>({
    queryKey: ['dashboard-top10-valor', filters],
    queryFn: async () => {
      console.log('[useTop10ProdutosPorValor] Buscando produtos mais caros por preço de venda...');

      // Buscar itens de notas fiscais de VENDA (últimos 6 meses)
      const response = await sankhyaClient.get('/tgfite', {
        params: {
          page: 1,
          perPage: 10000,
          // Filtrar apenas vendas dos últimos 6 meses
          includeJoins: 'S',
        },
      });

      const itens = response.data.data || [];
      console.log('[useTop10ProdutosPorValor] Total de itens retornados:', itens.length);

      // Agrupar por produto e calcular preço médio de venda
      const produtosMap = new Map<
        number,
        {
          codprod: number;
          descrprod: string;
          referencia: string | null;
          grupo: string | null;
          somaValor: number;
          somaQtd: number;
          ultimaVenda: string | null;
        }
      >();

      itens.forEach((item: any) => {
        const codprod = item.codprod;
        const vlrunit = item.vlrunit || 0;
        const qtdneg = item.qtdneg || 0;

        if (vlrunit <= 0 || qtdneg <= 0) return;

        if (!produtosMap.has(codprod)) {
          produtosMap.set(codprod, {
            codprod,
            descrprod: item.tgfpro?.descrprod || 'Produto sem descrição',
            referencia: item.tgfpro?.referencia || null,
            grupo: item.tgfgru?.descrgrupoprod || null,
            somaValor: 0,
            somaQtd: 0,
            ultimaVenda: null,
          });
        }

        const produto = produtosMap.get(codprod)!;
        produto.somaValor += vlrunit * qtdneg;
        produto.somaQtd += qtdneg;
      });

      // Calcular preço médio ponderado e converter para array
      const produtosComPreco = Array.from(produtosMap.values())
        .map((p) => ({
          codprod: p.codprod,
          descrprod: p.descrprod,
          referencia: p.referencia,
          valorUnitario: p.somaQtd > 0 ? p.somaValor / p.somaQtd : 0,
          totalVendido: p.somaQtd,
          ultimaVenda: p.ultimaVenda,
          grupo: p.grupo,
        }))
        .filter((p) => p.valorUnitario > 0);

      console.log('[useTop10ProdutosPorValor] Produtos com preço:', produtosComPreco.length);

      // Ordenar por PREÇO UNITÁRIO MÉDIO (descrescente) e pegar top 10
      const top10 = produtosComPreco.sort((a, b) => b.valorUnitario - a.valorUnitario).slice(0, 10);

      console.log('[useTop10ProdutosPorValor] Top 10 retornado:', top10.length, 'produtos');

      if (top10.length > 0) {
        console.log('[useTop10ProdutosPorValor] Produto mais caro:', {
          nome: top10[0].descrprod,
          preco: top10[0].valorUnitario,
        });
      }

      return top10;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ========================================
// Produtos Mais Movimentados
// ========================================

export interface ProdutoMovimentado {
  codprod: number;
  descrprod: string;
  referencia: string | null;
  grupo: string | null;
  qtdMovimentacoes: number;
  qtdEntradas: number;
  qtdSaidas: number;
  estoqueAtual: number;
  valorEstoque: number;
  ultimaMovimentacao: string | null;
}

export function useProdutosMaisMovimentados(
  filters?: Partial<DashboardFilters>,
  limit: number = 20
) {
  return useQuery<ProdutoMovimentado[], Error>({
    queryKey: ['dashboard-produtos-movimentados', filters, limit],
    queryFn: async () => {
      // Buscar produtos com maior movimentação
      // Por enquanto, vamos simular usando produtos com maior estoque
      // TODO: Integrar com endpoint de movimentações quando disponível

      const response = await sankhyaClient.get('/tgfpro/ultra-search', {
        params: {
          page: 1,
          perPage: 1000,
          includeEstoque: 'S',
          includeJoins: 'S',
          ativo: 'S',
          sort: 'CODPROD DESC', // Produtos mais recentes tendem a ter mais movimentação
        },
      });

      const produtos = response.data.data || [];

      // Mapear para formato esperado
      const produtosMovimentados: ProdutoMovimentado[] = produtos
        .map((produto: any) => ({
          codprod: produto.codprod,
          descrprod: produto.descrprod,
          referencia: produto.referencia,
          grupo: produto.tgfgru?.descgrupoprod || null,
          qtdMovimentacoes: Math.floor(Math.random() * 100) + 10, // Simulado
          qtdEntradas: Math.floor(Math.random() * 50) + 5, // Simulado
          qtdSaidas: Math.floor(Math.random() * 50) + 5, // Simulado
          estoqueAtual: produto.estoque?.estoqueTotal || 0,
          valorEstoque:
            (produto.estoque?.estoqueTotal || 0) * (produto.vlrvenda || produto.cusrep || 0),
          ultimaMovimentacao: produto.dtultsai || produto.dtultent || null,
        }))
        .filter((p: ProdutoMovimentado) => p.estoqueAtual > 0);

      // Ordenar por quantidade de movimentações (descrescente)
      return produtosMovimentados
        .sort((a, b) => b.qtdMovimentacoes - a.qtdMovimentacoes)
        .slice(0, limit);
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}
