/**
 * Tipos TypeScript para módulo de consumo de produtos (TGFPRO2)
 * Espelham as interfaces do backend API
 */

/**
 * Movimentação de consumo de produtos
 */
export interface MovimentacaoConsumo {
  nunota: number;
  sequencia?: number;
  nunotaOrig?: number;
  sequenciaOrig?: number;
  numnota?: string;
  codemp?: number;
  codparc?: number;
  nomeparc?: string;
  dtneg?: string;
  dtmov?: string;
  statusnota?: string;
  statusnotaDescr?: string;
  codtipoper?: number;
  descrtipoper?: string;
  atualizaEstoque?: string;
  atualizaEstoqueDescr?: string;
  codusuinc?: number;
  nomeusu?: string;
  coddep?: number;
  descrDep?: string;
  codprod?: number;
  descrprod?: string;
  qtdneg?: number;
  vlrunit?: number;
  vlrtot?: number;
  codlocal?: number;
  descrlocal?: string;
}

/**
 * Consumo por departamento (resumo)
 */
export interface ConsumoResumoDepartamento {
  coddep?: number;
  descrDep?: string;
  totalMovimentacoes: number;
  quantidadeTotal: number;
  valorTotal: number;
  primeiraMov?: string;
  ultimaMov?: string;
  produtos: {
    codprod: number;
    descrprod?: string;
    quantidade: number;
    valor: number;
    percentual: number;
  }[];
}

/**
 * Consumo por usuário (resumo)
 */
export interface ConsumoResumoUsuario {
  codusuinc: number;
  nomeusu?: string;
  totalMovimentacoes: number;
  quantidadeTotal: number;
  valorTotal: number;
  primeiraMov?: string;
  ultimaMov?: string;
  departamentos: {
    coddep?: number;
    descrDep?: string;
    quantidade: number;
    valor: number;
  }[];
}

/**
 * Análise de consumo de um produto
 */
export interface ConsumoProduto {
  codprod: number;
  descrprod?: string;
  referencia?: string;
  marca?: string;
  totalMovimentacoes: number;
  quantidadeTotal: number;
  valorMedio: number;
  valorTotal: number;
  primeiraMov?: string;
  ultimaMov?: string;
  departamentos: {
    coddep?: number;
    descrDep?: string;
    quantidade: number;
    percentual: number;
  }[];
  usuarios: {
    codusuinc: number;
    nomeusu?: string;
    quantidade: number;
    percentual: number;
  }[];
}

/**
 * Análise de consumo por período
 */
export interface ConsumoAnalise {
  periodo: {
    inicio: string;
    fim: string;
    dias: number;
  };
  totais: {
    movimentacoes: number;
    produtos: number;
    departamentos: number;
    usuarios: number;
    quantidadeTotal: number;
    valorTotal: number;
  };
  topProdutos: {
    codprod: number;
    descrprod?: string;
    quantidade: number;
    valor: number;
    percentual: number;
  }[];
  topDepartamentos: {
    coddep?: number;
    descrDep?: string;
    quantidade: number;
    valor: number;
    percentual: number;
  }[];
  topUsuarios: {
    codusuinc: number;
    nomeusu?: string;
    quantidade: number;
    valor: number;
    percentual: number;
  }[];
  evolucaoDiaria?: {
    data: string;
    movimentacoes: number;
    quantidade: number;
    valor: number;
  }[];
}

/**
 * Filtros para busca de consumo
 */
export interface ConsumoFiltros {
  codprod?: number;
  coddep?: number;
  codusuinc?: number;
  dataInicio?: string;
  dataFim?: string;
  atualizaEstoque?: 'B' | 'E' | 'N' | 'R';
  codtipoper?: number;
  search?: string;
  agruparPor?: 'departamento' | 'usuario' | 'produto';
  page?: number;
  perPage?: number;
}

/**
 * Resposta paginada genérica
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasMore: boolean;
}
