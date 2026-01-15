# ULTRA PLAN: Rich Products Listing Section
## Frontend React 19 Implementation

> **Created**: 2026-01-15
> **Target**: Create new "produtos" section with rich data display and action menu for detailed consumption analysis
> **Tech Stack**: React 19 (client-side only), TanStack Query, Zustand, Radix UI, Tailwind CSS
> **Note**: NO server components - full client-side implementation

---

## 1. EXECUTIVE SUMMARY

### Goal
Create a comprehensive products listing page that displays rich data (stock, price trends, controls, consumption patterns) and provides action menus for viewing detailed product analysis including consumption and price history.

### Key Features
- **Rich Data Display**: Show products with 15+ fields including stock, price trends, CONTROLE variations
- **Advanced Filters**: Filter by marca, grupo, TIPCONTEST, stock status, active/inactive
- **Action Menu**: Quick access to consumption analysis, price history, product details
- **Performance**: Virtual scrolling for 13,281 products, optimized queries
- **Integration**: Seamless navigation to existing consumption analysis screens

### Success Criteria
- Load 13,281 products in <2s
- Filters update in <500ms
- Clear visual indicators for products with CONTROLE variations
- Click-through to consumption analysis works smoothly
- Responsive design (desktop, tablet, mobile)

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 File Structure

```
sankhya-products-dashboard/
└── src/
    ├── app/
    │   └── produtos-ricos/                    # NEW: Rich products section
    │       ├── page.tsx                        # Main page component
    │       ├── components/
    │       │   ├── produtos-ricos-table.tsx    # Main table with virtual scrolling
    │       │   ├── produtos-filter-bar.tsx     # Advanced filters component
    │       │   ├── produto-action-menu.tsx     # Dropdown action menu
    │       │   ├── produto-rich-card.tsx       # Card view (mobile)
    │       │   ├── produto-details-dialog.tsx  # Quick view modal
    │       │   ├── preco-trend-badge.tsx       # Price trend indicator
    │       │   ├── controle-badge.tsx          # CONTROLE variation indicator
    │       │   └── stock-status-badge.tsx      # Stock level indicator
    │       └── hooks/
    │           ├── use-produtos-ricos.ts       # Data fetching hook
    │           └── use-produtos-filters.ts     # Filter state management
    │
    ├── lib/
    │   └── api/
    │       └── produtos-ricos-service.ts       # NEW: API service for rich data
    │
    └── stores/
        └── produtos-ricos-store.ts             # NEW: Zustand store for state
```

### 2.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interaction                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              produtos-ricos/page.tsx (Main Page)                 │
│  - Layout structure                                              │
│  - Header with title and actions                                │
│  - Filter bar                                                    │
│  - Products table/card view                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
    ┌─────────────────┐ ┌──────────────┐ ┌────────────────┐
    │   Filter Bar    │ │ Products     │ │  Action Menu   │
    │                 │ │ Table        │ │                │
    └─────────────────┘ └──────────────┘ └────────────────┘
                ▲               │               │
                │               ▼               ▼
                │   ┌────────────────────┐  ┌─────────────────┐
                │   │  Virtual Scroll    │  │ Quick View      │
                │   │  (@tanstack/       │  │ Dialog          │
                │   │   react-virtual)   │  │                 │
                │   └────────────────────┘  └─────────────────┘
                │               │               │
                └───────────────┼───────────────┘
                                ▼
            ┌────────────────────────────────────────┐
            │   use-produtos-ricos.ts (TanStack)     │
            │   - Fetches data with filters          │
            │   - Caching and invalidation           │
            │   - Pagination support                 │
            └────────────────────────────────────────┘
                                │
                                ▼
            ┌────────────────────────────────────────┐
            │  produtos-ricos-service.ts (API Layer) │
            │  - GET /tgfpro2/produtos/ricos         │
            │  - Query params: filters, pagination   │
            └────────────────────────────────────────┘
                                │
                                ▼
            ┌────────────────────────────────────────┐
            │     Backend NestJS API                 │
            │  - tgfpro2.service.ts                  │
            │  - Returns rich product data           │
            └────────────────────────────────────────┘
```

### 2.3 State Management Strategy

**TanStack Query** (primary data fetching):
- Server state caching
- Automatic refetching
- Optimistic updates
- Pagination

**Zustand Store** (UI state):
- Filter selections
- Sort preferences
- View mode (table/cards)
- Selected products for bulk actions

**React Hook Form** (form state):
- Filter form validation
- Reset functionality

---

## 3. DATA MODEL & API INTEGRATION

### 3.1 Rich Product Data Type

```typescript
export interface ProdutoRico {
  // Basic Info
  codprod: number;
  descrprod: string;
  marca: string | null;
  codgrupoprod: number | null;
  descrgrupoprod: string | null;
  ativo: 'S' | 'N';

  // Control System
  tipcontest: 'N' | 'S' | 'E' | 'L' | 'P';
  liscontest: string | null;
  hasControle: boolean;  // Derived: true if TIPCONTEST !== 'N'
  controleCount: number; // Number of variations (if has controle)

  // Stock Data
  estoqueTotal: number;
  estoquePorLocal: Array<{
    codlocal: number;
    nomelocal: string;
    estoque: number;
  }>;
  temEstoque: boolean; // Derived: estoqueTotal > 0

  // Price Analysis (last 6 months)
  precoMedioPonderado: number | null;
  precoUltimaCompra: number | null;
  precoMinimo: number | null;
  precoMaximo: number | null;
  variacaoPrecoPercentual: number | null;
  tendenciaPreco: 'AUMENTO' | 'QUEDA' | 'ESTAVEL' | null;

  // Consumption Indicators
  qtdComprasUltimos6Meses: number;
  totalGastoUltimos6Meses: number;
  consumoMedio: number | null; // Average monthly consumption

  // Metadata
  codusuinc: number | null;
  nomeusuinc: string | null;
  dtalter: string | null;
  codusualt: number | null;
  nomeusualt: string | null;
}
```

### 3.2 API Endpoints Required

#### 3.2.1 GET /tgfpro2/produtos/ricos

**Purpose**: Fetch paginated list of products with rich aggregated data

**Query Parameters**:
```typescript
{
  page?: number;           // Default: 1
  pageSize?: number;       // Default: 50, Max: 100

  // Filters
  ativo?: 'S' | 'N' | 'all';          // Default: 'all'
  tipcontest?: string;                 // 'N', 'S', 'E', 'L', 'P', 'all'
  marca?: string;                      // Brand name (partial match)
  codgrupoprod?: number;               // Group code
  temEstoque?: boolean;                // true/false

  // Search
  search?: string;                     // Search in descrprod, marca

  // Sorting
  sortBy?: string;                     // Field name
  sortOrder?: 'asc' | 'desc';         // Default: 'asc'
}
```

**Response**:
```typescript
{
  data: ProdutoRico[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  stats: {
    totalProdutos: number;
    comEstoque: number;
    semEstoque: number;
    comControle: number;
    ativos: number;
    inativos: number;
  };
}
```

#### 3.2.2 GET /tgfpro2/produtos/:codprod/consumo/analise

**Already exists!** Will be used when user clicks action menu to view consumption details.

**Parameters**:
- `codprod`: Product code
- `dataInicio`: Start date (YYYY-MM-DD)
- `dataFim`: End date (YYYY-MM-DD)

**Returns**: Full consumption analysis with price history (already implemented in backend)

#### 3.2.3 GET /tgfpro2/filtros/opcoes

**Purpose**: Get available filter options (brands, groups)

**Response**:
```typescript
{
  marcas: Array<{ nome: string; count: number }>;
  grupos: Array<{
    codgrupoprod: number;
    descrgrupoprod: string;
    count: number
  }>;
  tiposControle: Array<{
    tipo: 'N' | 'S' | 'E' | 'L' | 'P';
    descricao: string;
    count: number;
  }>;
}
```

---

## 4. COMPONENT SPECIFICATIONS

### 4.1 Main Page Component

**File**: `src/app/produtos-ricos/page.tsx`

**Responsibilities**:
- Page layout and structure
- Coordinate filter bar and table
- Handle view mode switching (table/cards)
- Breadcrumb navigation

**Key Features**:
```tsx
export default function ProdutosRicosPage() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  return (
    <BaseLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Produtos - Dados Completos
            </h2>
            <p className="text-muted-foreground">
              Análise completa de produtos com preços, estoque e consumo
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button onClick={() => setViewMode('table')}>Tabela</Button>
            <Button onClick={() => setViewMode('cards')}>Cards</Button>
          </div>
        </div>

        {/* Filter Bar */}
        <ProdutosFilterBar />

        {/* Stats Summary */}
        <ProdutosStatsCards />

        {/* Main Content */}
        {viewMode === 'table' ? (
          <ProdutosRicosTable />
        ) : (
          <ProdutosRicosCards />
        )}
      </div>
    </BaseLayout>
  );
}
```

### 4.2 Filter Bar Component

**File**: `src/app/produtos-ricos/components/produtos-filter-bar.tsx`

**Responsibilities**:
- Display filter controls
- Manage filter state
- Reset filters
- Export functionality

**Filters**:
1. **Search Input**: Text search (descrprod, marca)
2. **Status**: Active/Inactive/All
3. **Tipo Controle**: N/S/E/L/P/All
4. **Marca**: Dropdown with autocomplete
5. **Grupo**: Dropdown
6. **Stock Status**: With Stock / Without Stock / All

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  [Search Input...........................]  [Status ▼]      │
│  [Marca ▼]  [Grupo ▼]  [Controle ▼]  [Estoque ▼]           │
│  [Reset Filters] [Export CSV]                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Products Table Component

**File**: `src/app/produtos-ricos/components/produtos-ricos-table.tsx`

**Responsibilities**:
- Display products in tabular format
- Virtual scrolling for performance
- Sortable columns
- Action menu per row

**Columns** (15 total):
1. **CODPROD** (sortable, fixed width 100px)
2. **Descrição** (sortable, min-width 250px)
3. **Marca** (sortable, 150px)
4. **Grupo** (sortable, 150px)
5. **Controle** (badge showing TIPCONTEST, 120px)
6. **Estoque** (numeric with color, 100px)
7. **Preço Médio** (currency, 120px)
8. **Última Compra** (currency, 120px)
9. **Variação %** (badge with color, 100px)
10. **Tendência** (icon: ↑↓→, 80px)
11. **Compras 6m** (numeric, 100px)
12. **Gasto 6m** (currency, 120px)
13. **Status** (Active/Inactive badge, 80px)
14. **Última Alteração** (date, 120px)
15. **Actions** (menu, 60px)

**Virtual Scrolling**:
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60, // Row height
  overscan: 10,
});
```

### 4.4 Action Menu Component

**File**: `src/app/produtos-ricos/components/produto-action-menu.tsx`

**Actions**:
```
┌─────────────────────────────────┐
│ 👁️  Ver Detalhes Rápidos         │
│ 📊 Análise de Consumo           │
│ 💰 Histórico de Preços          │
│ 📦 Estoque por Local            │
│ ─────────────────────────────   │
│ ✏️  Editar Produto               │
│ 📄 Gerar PDF                    │
│ 🔗 Copiar Link                  │
└─────────────────────────────────┘
```

**Navigation**:
- "Análise de Consumo" → `/produtos/${codprod}/consumo-v3?dataInicio=...&dataFim=...`
- "Ver Detalhes Rápidos" → Opens modal with quick view
- "Histórico de Preços" → Opens modal with price chart

### 4.5 Quick View Dialog Component

**File**: `src/app/produtos-ricos/components/produto-details-dialog.tsx`

**Content**:
```
┌──────────────────────────────────────────────────────────┐
│  Produto: [DESCRPROD]                              [X]   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │ Informações     │  │ Estoque por Local           │   │
│  │ Básicas         │  │ • Local 1: 100 un           │   │
│  │                 │  │ • Local 2: 50 un            │   │
│  │ Código: 3680    │  │ • Local 3: 25 un            │   │
│  │ Marca: XYZ      │  │                             │   │
│  │ Grupo: ABC      │  │ Total: 175 un               │   │
│  └─────────────────┘  └─────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Análise de Preço (últimos 6 meses)              │   │
│  │                                                   │   │
│  │  [Line Chart showing price over time]            │   │
│  │                                                   │   │
│  │  Min: R$ 20.00  |  Max: R$ 25.00  |  Média: R$ 22.50│
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  [Ver Análise Completa]  [Fechar]                       │
└──────────────────────────────────────────────────────────┘
```

### 4.6 Badge Components

**4.6.1 Price Trend Badge**
```tsx
// src/app/produtos-ricos/components/preco-trend-badge.tsx
export function PrecoTrendBadge({ tendencia, variacao }: Props) {
  const config = {
    AUMENTO: { color: 'red', icon: TrendingUp, text: 'Subiu' },
    QUEDA: { color: 'green', icon: TrendingDown, text: 'Caiu' },
    ESTAVEL: { color: 'gray', icon: Minus, text: 'Estável' },
  };

  const { color, icon: Icon, text } = config[tendencia] || config.ESTAVEL;

  return (
    <Badge variant={color}>
      <Icon className="w-3 h-3 mr-1" />
      {text} {variacao !== null ? `${variacao.toFixed(1)}%` : ''}
    </Badge>
  );
}
```

**4.6.2 CONTROLE Badge**
```tsx
// src/app/produtos-ricos/components/controle-badge.tsx
export function ControleBadge({ tipcontest, controleCount }: Props) {
  const config = {
    N: { label: 'Simples', color: 'default' },
    S: { label: 'Lista', color: 'blue' },
    E: { label: 'Série', color: 'purple' },
    L: { label: 'Lote', color: 'orange' },
    P: { label: 'Parceiro', color: 'pink' },
  };

  const { label, color } = config[tipcontest] || config.N;

  return (
    <Badge variant={color}>
      {label}
      {controleCount > 1 && <span className="ml-1">({controleCount})</span>}
    </Badge>
  );
}
```

**4.6.3 Stock Status Badge**
```tsx
// src/app/produtos-ricos/components/stock-status-badge.tsx
export function StockStatusBadge({ estoque }: { estoque: number }) {
  const getStatus = () => {
    if (estoque === 0) return { label: 'Sem Estoque', color: 'red' };
    if (estoque < 10) return { label: 'Baixo', color: 'yellow' };
    if (estoque < 50) return { label: 'Médio', color: 'blue' };
    return { label: 'OK', color: 'green' };
  };

  const { label, color } = getStatus();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={color}>{label}</Badge>
      <span className="text-sm text-muted-foreground">{estoque} un</span>
    </div>
  );
}
```

---

## 5. HOOKS & DATA MANAGEMENT

### 5.1 Data Fetching Hook

**File**: `src/app/produtos-ricos/hooks/use-produtos-ricos.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { produtosRicosService } from '@/lib/api/produtos-ricos-service';
import { useProdutosRicosStore } from '@/stores/produtos-ricos-store';

export function useProdutosRicos() {
  const filters = useProdutosRicosStore((state) => state.filters);
  const pagination = useProdutosRicosStore((state) => state.pagination);
  const sortBy = useProdutosRicosStore((state) => state.sortBy);

  const query = useQuery({
    queryKey: ['produtos-ricos', filters, pagination, sortBy],
    queryFn: () => produtosRicosService.getProdutos({
      page: pagination.page,
      pageSize: pagination.pageSize,
      filters,
      sortBy,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    produtos: query.data?.data || [],
    meta: query.data?.meta,
    stats: query.data?.stats,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
```

### 5.2 Filters Hook

**File**: `src/app/produtos-ricos/hooks/use-produtos-filters.ts`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProdutosRicosStore } from '@/stores/produtos-ricos-store';

const filterSchema = z.object({
  search: z.string().optional(),
  ativo: z.enum(['S', 'N', 'all']).default('all'),
  tipcontest: z.string().optional(),
  marca: z.string().optional(),
  codgrupoprod: z.number().optional(),
  temEstoque: z.boolean().optional(),
});

export type FilterFormValues = z.infer<typeof filterSchema>;

export function useProdutosFilters() {
  const setFilters = useProdutosRicosStore((state) => state.setFilters);
  const resetFilters = useProdutosRicosStore((state) => state.resetFilters);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: '',
      ativo: 'all',
      tipcontest: 'all',
      temEstoque: undefined,
    },
  });

  const handleSubmit = (values: FilterFormValues) => {
    setFilters(values);
  };

  const handleReset = () => {
    form.reset();
    resetFilters();
  };

  return {
    form,
    handleSubmit,
    handleReset,
  };
}
```

### 5.3 Zustand Store

**File**: `src/stores/produtos-ricos-store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProdutosRicosState {
  // Filters
  filters: {
    search?: string;
    ativo?: 'S' | 'N' | 'all';
    tipcontest?: string;
    marca?: string;
    codgrupoprod?: number;
    temEstoque?: boolean;
  };

  // Pagination
  pagination: {
    page: number;
    pageSize: number;
  };

  // Sorting
  sortBy: {
    field: string;
    order: 'asc' | 'desc';
  };

  // View mode
  viewMode: 'table' | 'cards';

  // Selected products
  selectedProducts: number[];

  // Actions
  setFilters: (filters: ProdutosRicosState['filters']) => void;
  resetFilters: () => void;
  setPagination: (pagination: Partial<ProdutosRicosState['pagination']>) => void;
  setSortBy: (sortBy: ProdutosRicosState['sortBy']) => void;
  setViewMode: (viewMode: 'table' | 'cards') => void;
  toggleProductSelection: (codprod: number) => void;
  clearSelection: () => void;
}

export const useProdutosRicosStore = create<ProdutosRicosState>()(
  persist(
    (set) => ({
      filters: {},
      pagination: { page: 1, pageSize: 50 },
      sortBy: { field: 'descrprod', order: 'asc' },
      viewMode: 'table',
      selectedProducts: [],

      setFilters: (filters) => set({ filters, pagination: { page: 1, pageSize: 50 } }),
      resetFilters: () => set({ filters: {}, pagination: { page: 1, pageSize: 50 } }),
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination },
      })),
      setSortBy: (sortBy) => set({ sortBy }),
      setViewMode: (viewMode) => set({ viewMode }),
      toggleProductSelection: (codprod) => set((state) => ({
        selectedProducts: state.selectedProducts.includes(codprod)
          ? state.selectedProducts.filter((id) => id !== codprod)
          : [...state.selectedProducts, codprod],
      })),
      clearSelection: () => set({ selectedProducts: [] }),
    }),
    {
      name: 'produtos-ricos-storage',
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
        sortBy: state.sortBy,
        viewMode: state.viewMode,
      }),
    }
  )
);
```

---

## 6. API SERVICE IMPLEMENTATION

**File**: `src/lib/api/produtos-ricos-service.ts`

```typescript
import { sankhyaClient } from './client';
import type { ProdutoRico } from '@/types/produto-rico';

export interface ProdutosRicosResponse {
  data: ProdutoRico[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  stats: {
    totalProdutos: number;
    comEstoque: number;
    semEstoque: number;
    comControle: number;
    ativos: number;
    inativos: number;
  };
}

export interface ProdutosRicosParams {
  page?: number;
  pageSize?: number;
  filters?: {
    search?: string;
    ativo?: 'S' | 'N' | 'all';
    tipcontest?: string;
    marca?: string;
    codgrupoprod?: number;
    temEstoque?: boolean;
  };
  sortBy?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export const produtosRicosService = {
  /**
   * Get produtos with rich aggregated data
   */
  async getProdutos(params?: ProdutosRicosParams): Promise<ProdutosRicosResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString());

    if (params?.filters) {
      const { search, ativo, tipcontest, marca, codgrupoprod, temEstoque } = params.filters;
      if (search) queryParams.set('search', search);
      if (ativo && ativo !== 'all') queryParams.set('ativo', ativo);
      if (tipcontest && tipcontest !== 'all') queryParams.set('tipcontest', tipcontest);
      if (marca) queryParams.set('marca', marca);
      if (codgrupoprod) queryParams.set('codgrupoprod', codgrupoprod.toString());
      if (temEstoque !== undefined) queryParams.set('temEstoque', temEstoque.toString());
    }

    if (params?.sortBy) {
      queryParams.set('sortBy', params.sortBy.field);
      queryParams.set('sortOrder', params.sortBy.order);
    }

    const queryString = queryParams.toString();
    const url = `/tgfpro2/produtos/ricos${queryString ? `?${queryString}` : ''}`;

    return sankhyaClient.get<ProdutosRicosResponse>(url).then((response) => response.data);
  },

  /**
   * Get filter options
   */
  async getFilterOptions() {
    return sankhyaClient.get('/tgfpro2/filtros/opcoes').then((response) => response.data);
  },

  /**
   * Export to CSV
   */
  async exportToCSV(filters?: ProdutosRicosParams['filters']): Promise<Blob> {
    const queryParams = new URLSearchParams();

    if (filters) {
      const { search, ativo, tipcontest, marca, codgrupoprod, temEstoque } = filters;
      if (search) queryParams.set('search', search);
      if (ativo && ativo !== 'all') queryParams.set('ativo', ativo);
      if (tipcontest && tipcontest !== 'all') queryParams.set('tipcontest', tipcontest);
      if (marca) queryParams.set('marca', marca);
      if (codgrupoprod) queryParams.set('codgrupoprod', codgrupoprod.toString());
      if (temEstoque !== undefined) queryParams.set('temEstoque', temEstoque.toString());
    }

    const queryString = queryParams.toString();
    const url = `/tgfpro2/produtos/ricos/export${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    return response.blob();
  },
};
```

---

## 7. BACKEND REQUIREMENTS

### 7.1 New Endpoint: GET /tgfpro2/produtos/ricos

**File**: `src/sankhya/tgfpro2/tgfpro2.controller.ts`

```typescript
@Get('produtos/ricos')
@ApiOperation({ summary: 'Lista produtos com dados ricos agregados' })
async getProdutosRicos(
  @Query('page') page = 1,
  @Query('pageSize') pageSize = 50,
  @Query('search') search?: string,
  @Query('ativo') ativo?: 'S' | 'N',
  @Query('tipcontest') tipcontest?: string,
  @Query('marca') marca?: string,
  @Query('codgrupoprod') codgrupoprod?: number,
  @Query('temEstoque') temEstoque?: boolean,
  @Query('sortBy') sortBy = 'DESCRPROD',
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
) {
  return this.tgfpro2Service.getProdutosRicos({
    page,
    pageSize,
    search,
    ativo,
    tipcontest,
    marca,
    codgrupoprod,
    temEstoque,
    sortBy,
    sortOrder,
  });
}
```

**File**: `src/sankhya/tgfpro2/tgfpro2.service.ts`

**Implementation Strategy**:

The query will be complex, combining data from multiple tables:

```sql
WITH EstoquePorProduto AS (
  SELECT
    E.CODPROD,
    SUM(E.ESTOQUE) AS ESTOQUE_TOTAL
  FROM TGFEST E WITH(NOLOCK)
  WHERE E.ATIVO = 'S'
  GROUP BY E.CODPROD
),
ComprasRecentes AS (
  SELECT
    ITE.CODPROD,
    COUNT(DISTINCT ITE.NUNOTA) AS QTD_COMPRAS,
    MIN(ITE.VLRUNIT) AS PRECO_MIN,
    MAX(ITE.VLRUNIT) AS PRECO_MAX,
    SUM(ITE.VLRTOT) AS TOTAL_GASTO,
    SUM(ITE.QTDNEG) AS TOTAL_QTD,
    SUM(ITE.VLRTOT) / NULLIF(SUM(ITE.QTDNEG), 0) AS PRECO_MEDIO
  FROM TGFITE ITE WITH(NOLOCK)
  JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
  WHERE CAB.TIPMOV = 'C'
    AND CAB.STATUSNOTA = 'L'
    AND ITE.ATUALESTOQUE > 0
    AND CAB.DTNEG >= DATEADD(MONTH, -6, GETDATE())
  GROUP BY ITE.CODPROD
),
UltimaCompra AS (
  SELECT
    ITE.CODPROD,
    FIRST_VALUE(ITE.VLRUNIT) OVER (
      PARTITION BY ITE.CODPROD
      ORDER BY CAB.DTNEG DESC
    ) AS PRECO_ULTIMA
  FROM TGFITE ITE WITH(NOLOCK)
  JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
  WHERE CAB.TIPMOV = 'C'
    AND CAB.STATUSNOTA = 'L'
    AND ITE.ATUALESTOQUE > 0
    AND CAB.DTNEG >= DATEADD(MONTH, -6, GETDATE())
)
SELECT
  P.CODPROD,
  P.DESCRPROD,
  P.MARCA,
  P.CODGRUPOPROD,
  G.DESCRGRUPOPROD,
  P.ATIVO,
  P.TIPCONTEST,
  P.LISCONTEST,
  CASE WHEN P.TIPCONTEST <> 'N' THEN 1 ELSE 0 END AS HAS_CONTROLE,
  ISNULL(E.ESTOQUE_TOTAL, 0) AS ESTOQUE_TOTAL,
  CASE WHEN ISNULL(E.ESTOQUE_TOTAL, 0) > 0 THEN 1 ELSE 0 END AS TEM_ESTOQUE,
  CR.PRECO_MEDIO AS PRECO_MEDIO_PONDERADO,
  UC.PRECO_ULTIMA AS PRECO_ULTIMA_COMPRA,
  CR.PRECO_MIN AS PRECO_MINIMO,
  CR.PRECO_MAX AS PRECO_MAXIMO,
  CR.QTD_COMPRAS AS QTD_COMPRAS_6M,
  CR.TOTAL_GASTO AS TOTAL_GASTO_6M,
  P.CODUSUINC,
  USUINC.NOMEUSU AS NOMEUSU_INC,
  P.DTALTER,
  P.CODUSUALT,
  USUALT.NOMEUSU AS NOMEUSU_ALT
FROM TGFPRO P WITH(NOLOCK)
LEFT JOIN TGFGRU G WITH(NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
LEFT JOIN EstoquePorProduto E ON E.CODPROD = P.CODPROD
LEFT JOIN ComprasRecentes CR ON CR.CODPROD = P.CODPROD
LEFT JOIN UltimaCompra UC ON UC.CODPROD = P.CODPROD
LEFT JOIN TSIUSU USUINC WITH(NOLOCK) ON USUINC.CODUSU = P.CODUSUINC
LEFT JOIN TSIUSU USUALT WITH(NOLOCK) ON USUALT.CODUSU = P.CODUSUALT
WHERE 1=1
  -- Apply filters dynamically
  AND (@ativo IS NULL OR P.ATIVO = @ativo)
  AND (@search IS NULL OR P.DESCRPROD LIKE '%' + @search + '%' OR P.MARCA LIKE '%' + @search + '%')
  AND (@tipcontest IS NULL OR P.TIPCONTEST = @tipcontest)
  AND (@marca IS NULL OR P.MARCA LIKE '%' + @marca + '%')
  AND (@codgrupoprod IS NULL OR P.CODGRUPOPROD = @codgrupoprod)
  AND (@temEstoque IS NULL OR (
    (@temEstoque = 1 AND ISNULL(E.ESTOQUE_TOTAL, 0) > 0) OR
    (@temEstoque = 0 AND ISNULL(E.ESTOQUE_TOTAL, 0) = 0)
  ))
ORDER BY
  CASE WHEN @sortBy = 'DESCRPROD' AND @sortOrder = 'asc' THEN P.DESCRPROD END ASC,
  CASE WHEN @sortBy = 'DESCRPROD' AND @sortOrder = 'desc' THEN P.DESCRPROD END DESC,
  -- Add more sort cases as needed
OFFSET (@page - 1) * @pageSize ROWS
FETCH NEXT @pageSize ROWS ONLY
```

**Performance Optimization**:
- Use indexed columns in WHERE clauses
- CTEs for better readability and potentially better execution plans
- OFFSET/FETCH for pagination
- Consider creating materialized view if query is slow

### 7.2 New Endpoint: GET /tgfpro2/filtros/opcoes

Returns available filter options for dropdowns.

```typescript
async getFilterOptions() {
  const [marcas, grupos, tiposControle] = await Promise.all([
    this.getMarcasWithCount(),
    this.getGruposWithCount(),
    this.getTiposControleWithCount(),
  ]);

  return { marcas, grupos, tiposControle };
}
```

---

## 8. ROUTING & NAVIGATION

### 8.1 Add Route to routes.tsx

**File**: `src/config/routes.tsx`

Add after line 45 (produtos-simples):

```tsx
const ProdutosRicos = lazy(
  () => import(/* webpackChunkName: "produtos" */ '@/app/produtos-ricos/page')
);
```

Add route definition around line 310:

```tsx
{
  path: '/produtos-ricos',
  element: (
    <ProtectedRoute>
      <ProdutosRicos />
    </ProtectedRoute>
  ),
},
```

### 8.2 Update Sidebar Navigation

**File**: `src/components/sidebar/nav-items.tsx` (or similar)

Add menu item:

```tsx
{
  title: 'Produtos Ricos',
  href: '/produtos-ricos',
  icon: PackageSearch,
  description: 'Análise completa de produtos com dados ricos',
}
```

---

## 9. PERFORMANCE OPTIMIZATIONS

### 9.1 Virtual Scrolling

Use `@tanstack/react-virtual` for rendering only visible rows:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const rowVirtualizer = useVirtualizer({
  count: produtos.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60, // Row height in pixels
  overscan: 10, // Render 10 extra rows above/below viewport
});

const virtualItems = rowVirtualizer.getVirtualItems();
```

**Benefits**:
- Renders only ~20-30 rows at a time
- Smooth scrolling with 13,281 products
- Memory efficient

### 9.2 Query Caching

TanStack Query provides automatic caching:

```tsx
{
  queryKey: ['produtos-ricos', filters, pagination, sortBy],
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  cacheTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
  refetchOnWindowFocus: false, // Don't refetch on tab switch
}
```

### 9.3 Debounced Search

Prevent excessive API calls during typing:

```tsx
import { useDebouncedValue } from '@/hooks/use-debounced-value';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebouncedValue(searchTerm, 500); // 500ms delay

// Use debouncedSearch in filter state
```

### 9.4 Code Splitting

Already handled by lazy loading in routes:

```tsx
const ProdutosRicos = lazy(() => import('@/app/produtos-ricos/page'));
```

This ensures the produtos-ricos bundle is only loaded when user navigates to the page.

---

## 10. RESPONSIVE DESIGN

### 10.1 Breakpoints

```tsx
const breakpoints = {
  mobile: '< 768px',    // Show card view by default
  tablet: '768px - 1024px', // Show simplified table (fewer columns)
  desktop: '> 1024px',  // Show full table with all columns
};
```

### 10.2 Mobile-First Approach

**Mobile** (< 768px):
- Force card view
- Stack filters vertically
- Hide less important columns in table view
- Swipe actions on cards

**Tablet** (768px - 1024px):
- Show 8 essential columns only
- Horizontal scroll for table
- Collapsible filter bar

**Desktop** (> 1024px):
- Full table with all 15 columns
- Side-by-side filter bar
- Hover states and tooltips

### 10.3 Responsive Table Columns

```tsx
const columns = useMemo(() => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const allColumns = [...]; // All 15 columns

  if (isMobile) return []; // Force card view
  if (isTablet) return allColumns.filter(col => col.priority === 'high');
  return allColumns;
}, []);
```

---

## 11. TESTING STRATEGY

### 11.1 Unit Tests

**Hook Tests**:
```tsx
// src/app/produtos-ricos/hooks/__tests__/use-produtos-ricos.test.ts
describe('useProdutosRicos', () => {
  it('should fetch produtos with filters', async () => {
    // Test implementation
  });

  it('should handle pagination', async () => {
    // Test implementation
  });

  it('should cache results', async () => {
    // Test implementation
  });
});
```

**Component Tests**:
```tsx
// src/app/produtos-ricos/components/__tests__/produtos-filter-bar.test.tsx
describe('ProdutosFilterBar', () => {
  it('should render all filter controls', () => {
    // Test implementation
  });

  it('should apply filters on submit', () => {
    // Test implementation
  });

  it('should reset filters', () => {
    // Test implementation
  });
});
```

### 11.2 Integration Tests

```tsx
// src/app/produtos-ricos/__tests__/page.integration.test.tsx
describe('ProdutosRicos Page', () => {
  it('should load and display products', async () => {
    render(<ProdutosRicosPage />);

    await waitFor(() => {
      expect(screen.getByText(/Produtos - Dados Completos/i)).toBeInTheDocument();
    });

    expect(screen.getAllByRole('row')).toHaveLength(51); // 50 + header
  });

  it('should filter products by marca', async () => {
    render(<ProdutosRicosPage />);

    const marcaSelect = screen.getByLabelText('Marca');
    fireEvent.change(marcaSelect, { target: { value: 'MARCA X' } });

    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(11); // 10 + header
    });
  });

  it('should navigate to consumo analysis', async () => {
    render(<ProdutosRicosPage />);

    const actionMenu = screen.getAllByRole('button', { name: /actions/i })[0];
    fireEvent.click(actionMenu);

    const analyzeButton = screen.getByText('Análise de Consumo');
    fireEvent.click(analyzeButton);

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/consumo'));
  });
});
```

### 11.3 E2E Tests (Playwright)

```tsx
// e2e/produtos-ricos.spec.ts
test.describe('Produtos Ricos', () => {
  test('should display produtos and allow filtering', async ({ page }) => {
    await page.goto('/produtos-ricos');

    await expect(page.locator('h2')).toContainText('Produtos - Dados Completos');

    // Wait for products to load
    await expect(page.locator('table tbody tr')).toHaveCount(50);

    // Apply filter
    await page.fill('input[placeholder*="Buscar"]', 'LUVA');
    await page.click('button:has-text("Filtrar")');

    // Verify filtered results
    await expect(page.locator('table tbody tr')).toHaveCount(5);

    // Open action menu
    await page.click('button[aria-label="Actions"]');
    await page.click('text=Análise de Consumo');

    // Verify navigation
    await expect(page).toHaveURL(/\/produtos\/\d+\/consumo/);
  });
});
```

---

## 12. ACCESSIBILITY (A11Y)

### 12.1 Keyboard Navigation

- All filters: Tab, Enter, Escape
- Table rows: Arrow keys for navigation
- Action menu: Tab to focus, Enter to open, Arrow keys to navigate, Enter to select
- Modal dialogs: Escape to close, Tab trap inside modal

### 12.2 ARIA Labels

```tsx
<button
  aria-label={`View actions for product ${produto.descrprod}`}
  aria-haspopup="menu"
>
  <MoreVertical />
</button>

<table aria-label="Products rich data table">
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">Descrição</th>
    </tr>
  </thead>
</table>
```

### 12.3 Screen Reader Support

- Announce filter results: "Showing 156 products of 13,281 total"
- Announce sorting: "Sorted by Descrição, ascending order"
- Loading states: "Loading products..."
- Error states: "Error loading products. Please try again."

### 12.4 Color Contrast

All badges and status indicators must meet WCAG AA standards:
- Text on background: minimum 4.5:1 ratio
- Use icons in addition to colors for status (not color alone)

---

## 13. ERROR HANDLING

### 13.1 API Error States

```tsx
const { produtos, isError, error, refetch } = useProdutosRicos();

if (isError) {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold">Erro ao carregar produtos</h3>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={refetch} className="mt-4">
        Tentar Novamente
      </Button>
    </div>
  );
}
```

### 13.2 Empty States

```tsx
if (produtos.length === 0 && !isLoading) {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <Package className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
      <p className="text-muted-foreground">
        Tente ajustar os filtros ou adicionar novos produtos
      </p>
      <Button onClick={handleResetFilters} variant="outline" className="mt-4">
        Limpar Filtros
      </Button>
    </div>
  );
}
```

### 13.3 Timeout Handling

```tsx
const query = useQuery({
  // ... other options
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

---

## 14. IMPLEMENTATION PHASES

### Phase 1: Backend Foundation (Days 1-2)
1. ✅ Create `/tgfpro2/produtos/ricos` endpoint
2. ✅ Implement complex SQL query with CTEs
3. ✅ Add pagination and filtering logic
4. ✅ Create `/tgfpro2/filtros/opcoes` endpoint
5. ✅ Add DTO types for responses
6. ✅ Test with validated products (3680, 2257, 2859, etc.)

### Phase 2: Frontend Core (Days 3-4)
1. ✅ Create page structure (`produtos-ricos/page.tsx`)
2. ✅ Implement data fetching hook with TanStack Query
3. ✅ Create Zustand store for state management
4. ✅ Build filter bar component
5. ✅ Implement basic table with all columns
6. ✅ Add routing and navigation

### Phase 3: Rich Features (Days 5-6)
1. ✅ Add virtual scrolling to table
2. ✅ Implement badge components (trend, controle, stock)
3. ✅ Create action menu with all options
4. ✅ Build quick view dialog
5. ✅ Add sorting functionality
6. ✅ Implement search with debouncing

### Phase 4: Polish & Performance (Days 7-8)
1. ✅ Responsive design (mobile cards view)
2. ✅ Loading skeletons
3. ✅ Error boundaries
4. ✅ Export to CSV functionality
5. ✅ Performance optimizations
6. ✅ Accessibility improvements

### Phase 5: Testing & Documentation (Days 9-10)
1. ✅ Write unit tests for hooks
2. ✅ Write component tests
3. ✅ Integration tests
4. ✅ E2E tests with Playwright
5. ✅ Update documentation
6. ✅ Code review and refinements

---

## 15. AGENT-SKILLS INTEGRATION (OPTIONAL)

**Note**: The user mentioned using `npx add-skill vercel-labs/agent-skills`, but I could not find it in package.json. This section describes how to integrate if it's available.

### 15.1 What is agent-skills?

Vercel's agent-skills is a library for creating AI-powered task agents that can:
- Execute multi-step workflows
- Handle complex data transformations
- Make autonomous decisions based on user intent

### 15.2 Potential Use Cases

1. **Smart Filters**: AI suggests optimal filter combinations based on user query
   ```tsx
   "Show me products with high price variation and low stock"
   → Auto-applies: variacaoPrecoPercentual > 10%, estoqueTotal < 10
   ```

2. **Anomaly Detection**: AI highlights products with unusual patterns
   ```tsx
   "Find products with suspicious price changes"
   → Identifies products with >50% price swings, shows in badge
   ```

3. **Smart Recommendations**: AI suggests related products or actions
   ```tsx
   "Based on consumption patterns, these 5 products need restock"
   → Shows notification banner with suggested actions
   ```

### 15.3 Implementation (if available)

```tsx
import { useAgent } from '@vercel-labs/agent-skills';

export function SmartFilterAgent() {
  const { execute, isLoading } = useAgent({
    skill: 'smart-filter',
    onResult: (filters) => {
      useProdutosRicosStore.getState().setFilters(filters);
    },
  });

  return (
    <div>
      <Input
        placeholder="Descreva o que você procura..."
        onSubmit={(query) => execute({ query })}
      />
    </div>
  );
}
```

**If agent-skills is not available or not needed, skip this section entirely.**

---

## 16. CRITICAL SUCCESS FACTORS

### 16.1 Performance
- ✅ Page load < 2s
- ✅ Filter response < 500ms
- ✅ Smooth scrolling (60fps)
- ✅ Virtual scrolling for large datasets

### 16.2 Data Accuracy
- ✅ CONTROLE variations clearly indicated
- ✅ Price calculations match backend (weighted average)
- ✅ Stock totals accurate across all locations
- ✅ Date ranges consistent (last 6 months default)

### 16.3 User Experience
- ✅ Intuitive filters with clear labels
- ✅ Action menu accessible and discoverable
- ✅ Smooth navigation to consumption analysis
- ✅ Mobile-friendly design
- ✅ Helpful empty/error states

### 16.4 Maintainability
- ✅ Clear component separation
- ✅ Reusable hooks and utilities
- ✅ Type safety with TypeScript
- ✅ Well-documented code
- ✅ Comprehensive tests

---

## 17. POTENTIAL ISSUES & MITIGATION

### Issue 1: Query Performance with 13K Products
**Risk**: Complex SQL query with multiple JOINs may be slow
**Mitigation**:
- Create database indexes on frequently queried columns
- Consider materialized views for aggregated data
- Implement aggressive caching (5-minute stale time)
- Use pagination with reasonable page sizes (50-100)

### Issue 2: CONTROLE Variations Not Grouped
**Risk**: Products with CONTROLE show multiple rows instead of aggregated view
**Mitigation**:
- Backend returns `controleCount` field
- Frontend shows badge indicating number of variations
- Action menu includes "View All Variations" option
- Quick view dialog lists all variations

### Issue 3: Price Calculation Inconsistencies
**Risk**: Frontend and backend calculate weighted average differently
**Mitigation**:
- Backend is single source of truth for all calculations
- Frontend displays values as-is from API
- Add tooltips explaining calculation methodology
- Include "Last Updated" timestamp on data

### Issue 4: Large Filter Options Lists
**Risk**: 1000+ brands/groups make dropdowns unwieldy
**Mitigation**:
- Use autocomplete/combobox instead of simple select
- Limit initial options to top 20 by product count
- Implement search within dropdown
- Show product count next to each option

### Issue 5: Stale Data in Cache
**Risk**: User sees outdated prices/stock due to aggressive caching
**Mitigation**:
- Show "Last Updated" timestamp
- Add manual refresh button
- Implement optimistic updates for edits
- Use shorter cache time for critical data (1-2 minutes)

---

## 18. FUTURE ENHANCEMENTS

### Phase 2 Features (Post-MVP)
1. **Bulk Actions**: Select multiple products, update prices/stock
2. **Custom Views**: Save filter combinations as named views
3. **Alerts**: Set up alerts for price changes >X%, low stock
4. **Charts**: Inline sparklines showing price/stock trends
5. **Comparison Mode**: Select 2-5 products, compare side-by-side
6. **Advanced Search**: Search by NCM, CEST, supplier
7. **History View**: Show audit trail of changes to product

### Integration Opportunities
1. **Dashboard Widgets**: Top products by consumption, biggest price changes
2. **Reports**: Scheduled PDF reports with trends
3. **Mobile App**: Native iOS/Android app with push notifications
4. **Webhooks**: Notify external systems of price changes
5. **API for Partners**: Allow suppliers to view their products

---

## 19. DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] No console errors/warnings
- [ ] Lighthouse score >90 (Performance, Accessibility, SEO)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS Safari, Chrome Android)
- [ ] Database indexes created
- [ ] Backend endpoint documented in Swagger
- [ ] Environment variables configured

### Deployment
- [ ] Build frontend: `pnpm build`
- [ ] Build backend: `pnpm run build`
- [ ] Run migrations (if any)
- [ ] Deploy backend first
- [ ] Smoke test backend endpoints
- [ ] Deploy frontend
- [ ] Verify routing works
- [ ] Check error tracking (Sentry, etc.)

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify caching behavior
- [ ] User acceptance testing
- [ ] Gather feedback
- [ ] Create support documentation

---

## 20. METRICS & KPIs

### Performance Metrics
- **Page Load Time**: Target <2s (measure with Lighthouse)
- **Filter Response Time**: Target <500ms
- **API Response Time**: Target <1s for 50 products
- **Virtual Scroll FPS**: Target 60fps

### Usage Metrics
- **Daily Active Users**: Track adoption
- **Most Used Filters**: Optimize UI based on usage
- **Actions per Session**: Measure engagement
- **Conversion to Consumption Analysis**: Track click-through rate

### Error Metrics
- **API Error Rate**: Target <1%
- **Frontend Errors**: Track with Sentry
- **Failed Queries**: Monitor retry rate
- **Timeout Rate**: Measure slow network issues

### Business Metrics
- **Time to Find Product**: Compare with old UI
- **Decisions Made**: Track actions taken (edit, reorder, etc.)
- **User Satisfaction**: Collect NPS scores
- **Support Tickets**: Monitor reduction in help requests

---

## APPENDIX A: Technology Reference

### React 19 Features Used
- **use() hook**: For data fetching (if needed)
- **Transitions**: For non-blocking UI updates
- **Server Components**: NOT USED (client-side only per requirement)
- **Form Actions**: For filter submissions

### TanStack Query v5
- Query keys: `['produtos-ricos', filters, pagination]`
- Stale time: 5 minutes
- Cache time: 10 minutes
- Retry logic: 3 attempts with exponential backoff

### Zustand State Management
- Persist filters/preferences to localStorage
- Devtools integration for debugging
- TypeScript strict mode

### Radix UI Components
- DropdownMenu: Action menus
- Dialog: Quick view modals
- Select: Filter dropdowns
- Tooltip: Contextual help
- Badge: Status indicators

### Tailwind CSS
- v4.x with new configuration
- Custom theme colors
- Responsive utilities
- Dark mode support

---

## APPENDIX B: SQL Query Reference

### Main Products Query (Simplified)

```sql
-- Fetch products with rich aggregated data
SELECT
  P.CODPROD,
  P.DESCRPROD,
  P.MARCA,
  G.DESCRGRUPOPROD,
  P.TIPCONTEST,

  -- Stock (from TGFEST)
  (SELECT SUM(E.ESTOQUE)
   FROM TGFEST E WITH(NOLOCK)
   WHERE E.CODPROD = P.CODPROD AND E.ATIVO = 'S') AS ESTOQUE_TOTAL,

  -- Price analysis (from TGFITE + TGFCAB, last 6 months)
  (SELECT SUM(ITE.VLRTOT) / NULLIF(SUM(ITE.QTDNEG), 0)
   FROM TGFITE ITE WITH(NOLOCK)
   JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
   WHERE ITE.CODPROD = P.CODPROD
     AND CAB.TIPMOV = 'C'
     AND CAB.STATUSNOTA = 'L'
     AND ITE.ATUALESTOQUE > 0
     AND CAB.DTNEG >= DATEADD(MONTH, -6, GETDATE())
  ) AS PRECO_MEDIO,

  -- Purchase count
  (SELECT COUNT(DISTINCT ITE.NUNOTA)
   FROM TGFITE ITE WITH(NOLOCK)
   JOIN TGFCAB CAB WITH(NOLOCK) ON CAB.NUNOTA = ITE.NUNOTA
   WHERE ITE.CODPROD = P.CODPROD
     AND CAB.TIPMOV = 'C'
     AND CAB.STATUSNOTA = 'L'
     AND ITE.ATUALESTOQUE > 0
     AND CAB.DTNEG >= DATEADD(MONTH, -6, GETDATE())
  ) AS QTD_COMPRAS

FROM TGFPRO P WITH(NOLOCK)
LEFT JOIN TGFGRU G WITH(NOLOCK) ON G.CODGRUPOPROD = P.CODGRUPOPROD
WHERE P.ATIVO = 'S'
ORDER BY P.DESCRPROD
OFFSET 0 ROWS
FETCH NEXT 50 ROWS ONLY
```

---

## SUMMARY

This ultra plan provides a comprehensive blueprint for implementing a rich products listing section in the Sankhya Products Dashboard. The implementation:

1. **Displays 13,281 products** with 15+ rich data fields including stock, price trends, CONTROLE variations, and consumption patterns

2. **Provides advanced filtering** by marca, grupo, TIPCONTEST, stock status, and active/inactive status

3. **Features action menus** for quick access to consumption analysis, price history, and product details

4. **Uses React 19 (client-side only)** with TanStack Query for data fetching, Zustand for state management, and Radix UI for components

5. **Implements virtual scrolling** for performance with large datasets

6. **Integrates seamlessly** with existing consumption analysis endpoints

7. **Follows best practices** for accessibility, error handling, testing, and responsive design

The plan is structured in phases for incremental delivery, with clear success criteria and risk mitigation strategies.

**Next Steps**:
1. Review and approve plan
2. Begin Phase 1 (Backend Foundation)
3. Iterate based on feedback
