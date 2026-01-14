import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ProdutoConsumoAnaliseParams {
  codprod: number;
  dataInicio: string;
  dataFim: string;
  groupBy?: 'usuario' | 'grupo' | 'parceiro' | 'mes' | 'tipooper' | 'none';
  page?: number;
  perPage?: number;
}

export interface ProdutoInfo {
  codprod: number;
  descrprod: string;
  ativo: string;
}

export interface PeriodoInfo {
  inicio: string;
  fim: string;
  dias: number;
}

export interface ResumoConsumo {
  totalMovimentacoes: number;
  totalLinhas: number;
  quantidadeConsumo: number;
  valorConsumo: number;
  quantidadeEntrada: number;
  valorEntrada: number;
  mediaDiariaConsumo: number;
  mediaPorMovimentacao: number;
}

export interface AgrupamentoItem {
  codigo?: number;
  nome?: string;
  codigoGrupo?: number;
  nomeGrupo?: string;
  codigoParceiro?: number;
  nomeParceiro?: string;
  mes?: string;
  tipoOperacao?: number;
  movimentacoes: number;
  quantidadeConsumo: number;
  valorConsumo: number;
  percentual: number;
}

export interface Agrupamento {
  tipo: string;
  dados: AgrupamentoItem[];
  total: number;
}

export interface MovimentacaoDetalhada {
  data: string;
  nunota: number;
  numnota?: number;
  codtipoper: number;
  atualestoque: number;
  tipoMovimento: string;
  codusuinc?: number;
  nomeusuinc?: string;
  codparc?: number;
  nomeparc?: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Movimentacoes {
  data: MovimentacaoDetalhada[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface ProdutoConsumoAnaliseResponse {
  produto: ProdutoInfo;
  periodo: PeriodoInfo;
  resumo: ResumoConsumo;
  agrupamento?: Agrupamento;
  movimentacoes: Movimentacoes;
}

export function useProductConsumoAnalise(params: ProdutoConsumoAnaliseParams) {
  return useQuery({
    queryKey: ['product-consumo-analise', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        dataInicio: params.dataInicio,
        dataFim: params.dataFim,
        ...(params.groupBy && { groupBy: params.groupBy }),
        ...(params.page && { page: params.page.toString() }),
        ...(params.perPage && { perPage: params.perPage.toString() }),
      });

      const response = await api.get<ProdutoConsumoAnaliseResponse>(
        `/tgfpro2/produtos/${params.codprod}/consumo/analise?${searchParams}`
      );
      return response.data;
    },
    enabled: Boolean(params.codprod && params.dataInicio && params.dataFim),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
