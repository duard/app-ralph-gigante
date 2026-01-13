'use client';

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductListComplete } from '@/components/products/product-list-complete';
import { StockSummaryCards } from '@/components/stock/stock-summary-cards';
import { StockFilters } from '@/components/stock/stock-filters';
import { useLocations, useGroups } from '@/hooks/use-products-complete';
import { useStockMetrics } from '@/hooks/use-stock-metrics';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-instance';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Package, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ProdutosPageContainer() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ===== LER ESTADO DA URL =====
  const activeTab = (searchParams.get('aba') || 'com-estoque') as 'com-estoque' | 'sem-estoque';
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('perPage')) || 20;

  const filters = {
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') || 'active') as 'all' | 'active' | 'inactive',
    codlocal: searchParams.get('codlocal') ? Number(searchParams.get('codlocal')) : undefined,
    codgrupoprod: searchParams.get('codgrupoprod')
      ? Number(searchParams.get('codgrupoprod'))
      : undefined,
    marca: searchParams.get('marca') || '',
    comControle: searchParams.get('comControle') === 'true',
    semControle: searchParams.get('semControle') === 'true',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
    stockMin: searchParams.get('stockMin') ? Number(searchParams.get('stockMin')) : undefined,
    stockMax: searchParams.get('stockMax') ? Number(searchParams.get('stockMax')) : undefined,
    statusEstoque: searchParams.get('statusEstoque') as any,
    comMovimento: searchParams.get('comMovimento') === 'true',
    semMovimento: searchParams.get('semMovimento') === 'true',
  };

  // ===== HELPERS PARA ATUALIZAR URL =====
  const updateSearchParams = React.useCallback(
    (updates: Record<string, any>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === false) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Query ÚNICA que busca todos produtos e filtra no cliente
  // IMPORTANTE: Ambos os hooks devem ser chamados sempre (regras do React)
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ['products', 'ultra-search', activeTab, filters, page, pageSize],
    queryFn: async ({ signal }) => {
      console.log('[ProductsQuery] Fetching with tab:', activeTab, 'page:', page);

      const response = await apiClient.get('/tgfpro/ultra-search', {
        signal,
        params: {
          page: 1, // Sempre buscar da página 1 para ter dados suficientes
          perPage: 1000, // Buscar muitos para compensar filtro client-side
          ...(filters.search && { search: filters.search }),
          ...(filters.status === 'active' && { ativo: 'S' }),
          ...(filters.status === 'inactive' && { ativo: 'N' }),
          ...(filters.codgrupoprod && { codgrupoprod: filters.codgrupoprod }),
          ...(filters.marca && { marca: filters.marca }),
          ...(filters.comControle && { comControle: true }),
          ...(filters.semControle && { semControle: true }),
          includeEstoque: 'S',
        },
      });

      console.log('[ProductsQuery] Response total:', response.data.data?.length);

      // Filtrar baseado na aba ativa
      let data = response.data.data || [];

      // Debug: mostrar estrutura de estoque
      if (data.length > 0) {
        console.log('[ProductsQuery] Sample product:', {
          codprod: data[0]?.codprod,
          descrprod: data[0]?.descrprod,
          estoque: data[0]?.estoque,
        });
      }

      const beforeFilter = data.length;
      if (activeTab === 'com-estoque') {
        data = data.filter((p: any) => {
          const hasStock = p.estoque && p.estoque.estoqueTotal > 0;
          return hasStock;
        });
      } else {
        data = data.filter((p: any) => {
          const noStock =
            !p.estoque || p.estoque.estoqueTotal === 0 || p.estoque.estoqueTotal === null;
          return noStock;
        });
      }

      console.log(
        '[ProductsQuery] After filter:',
        data.length,
        'from',
        beforeFilter,
        'for tab:',
        activeTab
      );

      // Implementar paginação client-side
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = data.slice(startIndex, endIndex);

      console.log(
        '[ProductsQuery] Paginated:',
        paginatedData.length,
        'items (page',
        page,
        'of',
        Math.ceil(data.length / pageSize),
        ')'
      );

      return {
        data: paginatedData,
        total: data.length,
        page,
        perPage: pageSize,
        lastPage: Math.ceil(data.length / pageSize),
        hasMore: endIndex < data.length,
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: page >= 1 && pageSize > 0,
  });

  const { data: locations = [] } = useLocations();
  const { data: groups = [] } = useGroups();
  const { data: stockMetrics } = useStockMetrics(filters);

  // ===== HANDLERS QUE ATUALIZAM URL =====
  const handleFilterChange = React.useCallback(
    (newFilters: Partial<typeof filters>) => {
      updateSearchParams({
        ...newFilters,
        page: 1, // Reseta página ao mudar filtro
      });
    },
    [updateSearchParams]
  );

  const handleClearFilters = React.useCallback(() => {
    setSearchParams(
      new URLSearchParams({
        aba: activeTab,
        status: 'active',
        page: '1',
        perPage: String(pageSize),
      })
    );
  }, [activeTab, pageSize, setSearchParams]);

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      updateSearchParams({ page: newPage });
    },
    [updateSearchParams]
  );

  const handlePageSizeChange = React.useCallback(
    (newPageSize: number) => {
      updateSearchParams({
        perPage: newPageSize,
        page: 1, // Reseta para página 1
      });
    },
    [updateSearchParams]
  );

  const handleTabChange = React.useCallback(
    (newTab: string) => {
      updateSearchParams({
        aba: newTab,
        page: 1, // Reseta página ao trocar aba
      });
    },
    [updateSearchParams]
  );

  const handleViewHistory = React.useCallback((codprod: number) => {
    // Navegar para tela de consumo
    window.location.href = `/produtos/${codprod}/consumo`;
  }, []);

  const handleViewLocations = React.useCallback((codprod: number) => {
    console.log('Ver locais de estoque:', codprod);
    // TODO: Abrir modal de locais
  }, []);

  const handleViewDetails = React.useCallback((product: any) => {
    console.log('Ver detalhes do produto:', product);
    // TODO: Abrir modal de detalhes
  }, []);

  // Log para debug - DEVE VIR ANTES DOS EARLY RETURNS!
  React.useEffect(() => {
    console.log('[ProdutosPage] URL State:', {
      aba: activeTab,
      page,
      pageSize,
      filters,
    });
  }, [activeTab, page, pageSize, filters]);

  // Preparar pagination
  const pagination = productsData
    ? {
        pageIndex: page - 1, // TanStack Table usa index baseado em 0
        pageSize,
        totalPages: productsData.lastPage,
        totalItems: productsData.total,
      }
    : undefined;

  // Loading state
  if (isLoadingProducts && page === 1) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  // Error state
  if (productsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar produtos</AlertTitle>
        <AlertDescription>
          {(productsError as any)?.message || 'Ocorreu um erro desconhecido'}
        </AlertDescription>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {stockMetrics && <StockSummaryCards metrics={stockMetrics} />}
      <StockFilters
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="com-estoque" className="gap-2">
            <Package className="h-4 w-4" />
            Com Estoque
          </TabsTrigger>
          <TabsTrigger value="sem-estoque" className="gap-2">
            <PackageX className="h-4 w-4" />
            Sem Estoque
          </TabsTrigger>
        </TabsList>

        <TabsContent value="com-estoque" className="space-y-4">
          <ProductListComplete
            data={productsData?.data || []}
            isLoading={isLoadingProducts}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onViewHistory={handleViewHistory}
            onViewLocations={handleViewLocations}
            onViewDetails={handleViewDetails}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            locations={locations}
            groups={groups}
          />
        </TabsContent>

        <TabsContent value="sem-estoque" className="space-y-4">
          <ProductListComplete
            data={productsData?.data || []}
            isLoading={isLoadingProducts}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onViewHistory={handleViewHistory}
            onViewLocations={handleViewLocations}
            onViewDetails={handleViewDetails}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            locations={locations}
            groups={groups}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
