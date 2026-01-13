// ========================================
// Dashboard KPIs Types
// ========================================

export interface DashboardKpis {
  // Produtos
  totalProdutos: number;
  totalAtivos: number;
  totalInativos: number;

  // Estoque
  quantidadeEmEstoque: number;
  valorTotalEstoque: number;
  produtosCriticos: number;
  produtosSemEstoque: number;

  // Organização
  totalGrupos: number;
  totalLocais: number;

  // Métricas calculadas
  ticketMedio: number;

  // Metadados
  dataResumo?: string;
}

// ========================================
// Filtros Types (re-export do store)
// ========================================

export type {
  DashboardFilters,
  PeriodoPreset,
  StatusFilter,
  EstoqueFilter,
} from '@/stores/dashboard-filters-store';

// ========================================
// Grupo e Local Types
// ========================================

export interface Grupo {
  codgrupoprod: number;
  descgrupoprod: string;
  ativo?: string;
}

export interface Local {
  codlocal: number;
  descrlocal: string;
  ativo?: string;
}

// ========================================
// Response Types
// ========================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasMore: boolean;
}

// Backend response do endpoint de resumo
export interface BackendResumoResponse {
  totalProdutos: number;
  totalAtivos: number;
  totalInativos: number;
  valorTotalEstoque: number;
  quantidadeTotalEstoque: number;
  produtosEstoqueBaixo: number;
  dataResumo: string;
}

// ========================================
// KPI Card Props
// ========================================

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number; // Percentual de variação
    isPositive: boolean;
  };
  href?: string;
  onClick?: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

// ========================================
// Filtros Ativos Types
// ========================================

export interface ActiveFilter {
  key: string;
  label: string;
  value: string | number | string[];
  onRemove: () => void;
}
