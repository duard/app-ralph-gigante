import { useState } from 'react'
import { BaseLayout } from '@/components/layouts/base-layout'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { DataBoundaryWrapper } from '@/components/ui/data-error-boundary'
import { ProdutosToolbar } from './components/produtos-toolbar'
import { ProdutosMetricsCards } from './components/produtos-metrics-cards'
import { ProdutosTable } from './components/produtos-table'
import { DEFAULT_FILTERS, type ProdutosV7Filters } from '@/types/produtos-v7'

export default function ProdutosV7Page() {
  const [filters, setFilters] = useState<ProdutosV7Filters>(DEFAULT_FILTERS)

  const handleFiltersChange = (newFilters: Partial<ProdutosV7Filters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset page quando filtros mudam
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }))
  }

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <BaseLayout
      title="Produtos - Gestão Completa"
      description="Gerencie todo o catálogo de produtos com filtros avançados"
    >
      <div className="@container/main px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
        {/* Toolbar de Filtros */}
        <ErrorBoundary title="Erro na Toolbar">
          <ProdutosToolbar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </ErrorBoundary>

        {/* Cards de Métricas */}
        <ErrorBoundary title="Erro nas Métricas">
          <DataBoundaryWrapper title="Erro ao carregar métricas">
            <ProdutosMetricsCards filters={filters} />
          </DataBoundaryWrapper>
        </ErrorBoundary>

        {/* Tabela de Produtos */}
        <ErrorBoundary title="Erro na Tabela">
          <DataBoundaryWrapper title="Erro ao carregar produtos">
            <ProdutosTable
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </DataBoundaryWrapper>
        </ErrorBoundary>
      </div>
    </BaseLayout>
  )
}
