import { apiClient } from './axios-instance';

export interface ProductWithLocations {
  codprod: number;
  descrprod: string;
  compldesc?: string;
  referencia?: string;
  marca?: string;
  codvol?: string;
  ativo: 'S' | 'N';
  codgrupoprod?: number;
  descrgrupoprod?: string;
  tipcontest?: string;
  liscontest?: string | string[];
  controleAtual?: string;

  // Última compra
  ultimaCompraData?: string;
  ultimaCompraValor?: number;
  ultimaCompraQtd?: number;

  // Metadados
  codusu?: number;
  nomeusu?: string;
  dtalter?: string;

  // Locais
  locais?: Array<{
    codlocal: number;
    descrlocal: string;
    controle?: string;
    estoque: number;
    estmin?: number;
    estmax?: number;
    codemp?: number;
  }>;

  // Grupo
  tgfgru?: {
    codgrupoprod: number;
    descgrupoprod: string;
  };

  // Estoque agregado
  estoque?: {
    estoqueTotal: number;
    estminTotal?: number;
    estmaxTotal?: number;
    locais?: number;
    abaixoMinimo?: boolean;
  };
}

export interface LocalEstoque {
  codlocal: number;
  descrlocal: string;
  controle: string;
  estoque: number;
  estmin?: number;
  estmax?: number;
  codemp?: number;
}

export interface Tgfloc {
  codlocal: number;
  descrlocal: string;
  ativo: 'S' | 'N';
}

export interface Tgfgru {
  codgrupoprod: number;
  descrgrupoprod: string;
  ativo: 'S' | 'N';
}

export interface ConsumoMovimentacao {
  data_referencia: string;
  tipo_registro: string;
  nunota?: number;
  tipmov?: string;
  tipo_movimentacao?: string;
  codparc?: number;
  nome_parceiro?: string;

  // Informações de usuário
  codusuinc?: number;
  usuario_inclusao?: string;
  codusualt?: number;
  usuario_alteracao?: string;
  dhalter?: string;

  // Informações da operação (TGFTOP)
  codtipoper?: number;
  descricao_operacao?: string;
  top_atualiza_estoque?: number;
  bonificacao?: string;

  // Controle e valores
  controle?: string;
  sequencia?: number;
  quantidade_mov: number;
  valor_mov: number;
  valor_unitario?: number;
  atualestoque?: number;

  // Saldos calculados
  saldo_qtd_anterior: number;
  saldo_qtd_final: number;
}

export interface ConsumoPeriodoResponse {
  codprod: number;
  dataInicio: string;
  dataFim: string;
  page: number;
  perPage: number;
  totalMovimentacoes: number;
  saldoAnterior: {
    tipo_registro: string;
    data_referencia: string;
    saldo_qtd: number;
    saldo_valor: number;
    saldo_valor_formatted?: string;
  };
  movimentacoes: ConsumoMovimentacao[];
  saldoAtual: {
    tipo_registro: string;
    data_referencia: string;
    saldo_qtd_final: number;
    saldo_valor_final: number;
    saldo_valor_final_formatted?: string;
  };
}

// ============ V2 TYPES ============
export interface ConsumoMovimentacaoV2 {
  tipoRegistro: string;
  dataReferencia: string;
  dtneg: string | null;
  dtentsai: string | null;
  nunota: number;
  tipmov: string;
  tipoOperacao: {
    codtipoper: number;
    descricao: string;
    atualizaEstoque: string;
  };
  codparc: number;
  nomeParceiro: string;
  centroCusto?: {
    codigo: number;
    descricao: string;
  };
  usuario: string;
  observacao: string | null;
  observacaoItem: string | null;
  controle: string | null;
  quantidadeMov: number;
  quantidadeNegociada: number | null;
  quantidadeEntregue: number | null;
  quantidadePendente: number | null;
  statusPendente: string | null;
  valorMov: number;
  valorMovFormatted: string;
  valorUnitario: number;
  saldoQtdAnterior: number;
  saldoQtdFinal: number;
  saldoValorAnterior: number;
  saldoValorFinal: number;
  saldoValorFinalFormatted: string;
  pmm: number;
}

export interface ConsumoPeriodoV2Response {
  produto: {
    codprod: number;
    descrprod: string;
    complemento: string | null;
    unidade: string;
    ativo: string;
    tipcontest: string;
  };
  periodo: {
    dataInicio: string;
    dataFim: string;
    totalDias: number;
  };
  page: number;
  perPage: number;
  totalMovimentacoes: number;
  saldoAnterior: {
    tipoRegistro: string;
    dataReferencia: string;
    saldoQtd: number;
    saldoValor: number;
    saldoValorFormatted: string;
    valorUnitarioReferencia: number;
  };
  movimentacoes: ConsumoMovimentacaoV2[];
  totalMovimentacoesOnPage: number;
  metrics: {
    valorMedioPeriodo: number;
    valorMedioEntradas: number;
    totalConsumoBaixas: number;
    totalEntradasQtd: number;
    totalSaidasQtd: number;
    totalEntradasValor: number;
    totalSaidasValor: number;
    percentualConsumo: number;
    mediaConsumoDia: number;
    diasEstoqueDisponivel: number;
  };
  movimentoLiquido: number;
  saldoAtual: {
    tipoRegistro: string;
    dataReferencia: string;
    saldoQtdFinal: number;
    estoqueFisico: number;
    saldoValorFinal: number;
    saldoValorFinalFormatted: string;
    localizacoes: Array<{
      codlocal: number;
      descricao: string;
      controle: string | null;
      estoque: number;
    }>;
  };
}

// ============ V3 TYPES ============
export interface PedidoPendente {
  NUNOTA: number;
  DTNEG: string;
  qtd_negociada: number;
  qtd_entregue: number;
  qtd_pendente: number;
  nome_parceiro: string;
}

export interface HistoricoMensal {
  mes_ano: string;
  saldo_qtd: number;
  saldo_valor: number;
  saldo_valor_formatted: string;
  entradas_qtd: number;
  entradas_valor: number;
  consumo_qtd: number;
  consumo_valor: number;
}

export interface UltimaCompra {
  NUNOTA: number;
  DTNEG: string;
  data_entrada: string;
  valor_unitario: number;
  quantidade: number;
  nome_fornecedor: string;
  codparc: number;
  valor_unitario_formatted: string;
}

export interface MaiorConsumidor {
  CODPARC: number;
  nome_parceiro: string;
  total_qtd: number;
  total_valor: number;
  total_valor_formatted: string;
}

export interface Produto360V3Response {
  produto: {
    codprod: number;
    descrprod: string;
    complemento: string | null;
    unidade: string;
    ativo: string;
    tipcontest: string;
  };
  estoque_atual: {
    fisico: number;
    reservado: number;
    disponivel: number;
    valor_total: number;
    valor_total_formatted: string;
  };
  pedidos_pendentes: {
    compras: PedidoPendente[];
    vendas: PedidoPendente[];
    transferencias: PedidoPendente[];
  };
  historico_mensal: HistoricoMensal[];
  ultima_compra: UltimaCompra | null;
  maiores_consumidores: MaiorConsumidor[];
  metricas: {
    media_consumo_mensal: number;
    media_consumo_mensal_formatted: string;
    cobertura_estoque_meses: number;
  };
}

export interface ProductFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  codlocal?: number;
  codgrupoprod?: number;
  marca?: string;
  comControle?: boolean;
  semControle?: boolean;
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
  page?: number;
  perPage?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasMore: boolean;
}

/**
 * API client para produtos (TGFPRO)
 */
export const productsApi = {
  /**
   * Listar produtos com paginação e filtros
   */
  async getAll(filters: ProductFilters = {}): Promise<PaginatedResult<ProductWithLocations>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.perPage) params.append('perPage', filters.perPage.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status === 'active') params.append('ativo', 'S');
    if (filters.status === 'inactive') params.append('ativo', 'N');
    if (filters.codlocal) params.append('codlocal', filters.codlocal.toString());
    if (filters.codgrupoprod) params.append('codgrupoprod', filters.codgrupoprod.toString());
    if (filters.marca) params.append('marca', filters.marca);
    if (filters.comControle) params.append('comControle', 'true');
    if (filters.semControle) params.append('semControle', 'true');

    const response = await apiClient.get('/tgfpro/ultra-search', { params });
    return response.data;
  },

  /**
   * Buscar produto por código
   */
  async getById(codprod: number): Promise<ProductWithLocations> {
    const response = await apiClient.get(`/tgfpro/${codprod}`);
    return response.data;
  },

  /**
   * Buscar produtos com array de locais de estoque
   */
  async getWithStockLocations(
    filters: ProductFilters = {}
  ): Promise<PaginatedResult<ProductWithLocations>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.perPage) params.append('perPage', filters.perPage.toString());
    if (filters.search) params.append('search', filters.search);

    // Converter status para formato Sankhya
    if (filters.status === 'active') params.append('ativo', 'S');
    if (filters.status === 'inactive') params.append('ativo', 'N');

    if (filters.codlocal) params.append('codlocal', filters.codlocal.toString());
    if (filters.codgrupoprod) params.append('codgrupoprod', filters.codgrupoprod.toString());

    console.log('[getWithStockLocations] Params:', Object.fromEntries(params.entries()));

    const response = await apiClient.get('/tgfpro/with-stock-locations', { params });
    console.log('[getWithStockLocations] Response:', response.data);
    return response.data;
  },

  /**
   * Buscar consumo/movimentações de produto por período (V1 - Simples)
   */
  async getConsumoPeriodo(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<ConsumoPeriodoResponse> {
    const params = new URLSearchParams({
      dataInicio,
      dataFim,
      page: page.toString(),
      perPage: perPage.toString(),
    });

    const response = await apiClient.get(`/tgfpro/consumo-periodo/${codprod}`, { params });
    return response.data;
  },

  /**
   * Buscar consumo/movimentações de produto por período (V2 - Detalhado)
   * Inclui TGFTOP, centro de custo, controle, observações, localizações
   */
  async getConsumoPeriodoV2(
    codprod: number,
    dataInicio: string,
    dataFim: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<ConsumoPeriodoV2Response> {
    const params = new URLSearchParams({
      dataInicio,
      dataFim,
      page: page.toString(),
      perPage: perPage.toString(),
    });

    const response = await apiClient.get(`/tgfpro/consumo-periodo-v2/${codprod}`, { params });
    return response.data;
  },

  /**
   * Buscar visão 360° do produto (V3)
   * Histórico mensal, pedidos pendentes, maiores consumidores, última compra
   */
  async getProduto360V3(codprod: number): Promise<Produto360V3Response> {
    const response = await apiClient.get(`/tgfpro/produto-360-v3/${codprod}`);
    return response.data;
  },

  /**
   * Busca avançada com relevância
   */
  async searchAvancada(
    termo: string,
    limit: number = 50
  ): Promise<PaginatedResult<ProductWithLocations>> {
    const response = await apiClient.get(`/tgfpro/search/${termo}`, { params: { limit } });
    return response.data;
  },
};

/**
 * API client para locais de estoque (TGFLOC)
 */
export const locationsApi = {
  /**
   * Listar todos os locais ativos
   */
  async getAll(): Promise<Tgfloc[]> {
    const response = await apiClient.get('/tgfloc');
    return response.data;
  },

  /**
   * Buscar local por código
   */
  async getById(codlocal: number): Promise<Tgfloc> {
    const response = await apiClient.get(`/tgfloc/${codlocal}`);
    return response.data;
  },

  /**
   * Buscar locais que tem estoque de um produto
   */
  async getByProduct(codprod: number): Promise<LocalEstoque[]> {
    const response = await apiClient.get(`/tgfloc/with-stock/${codprod}`);
    return response.data;
  },

  /**
   * Buscar locais com contagem de produtos
   */
  async getWithProductCount(): Promise<any[]> {
    const response = await apiClient.get('/tgfloc/with-product-count');
    return response.data;
  },

  /**
   * Obter estatísticas de um local
   */
  async getStatistics(codlocal: number): Promise<any> {
    const response = await apiClient.get(`/tgfloc/${codlocal}/statistics`);
    return response.data;
  },
};

/**
 * API client para grupos de produtos (TGFGRU)
 */
export const groupsApi = {
  /**
   * Listar todos os grupos ativos
   */
  async getAll(): Promise<Tgfgru[]> {
    const response = await apiClient.get('/sankhya/tgfgru', {
      params: { ativo: 'S', perPage: 1000 }, // Buscar todos grupos ativos
    });
    return response.data.data || response.data; // Tratar paginação
  },

  /**
   * Buscar grupo por código
   */
  async getById(codgrupoprod: number): Promise<Tgfgru> {
    const response = await apiClient.get(`/sankhya/tgfgru/${codgrupoprod}`);
    return response.data;
  },
};
