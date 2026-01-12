import { BaseLayout } from '@/components/layouts/base-layout';
import { ChartAreaInteractive } from './components/chart-area-interactive';
import { DataTable } from './components/data-table';
import { DashboardCards } from './components/dashboard-cards';
import {
  LazyPriceTrendChart,
  LazyTopSellingProducts,
  LazyRecentProducts,
  LazyCategoryDistributionChart,
  LazyLoadingFallback,
} from '@/components/lazy-dashboard';
import { DataBoundaryWrapper } from '@/components/ui/data-error-boundary';
import { ErrorBoundary } from '@/components/ui/error-boundary';

import { useDashboardAutoRefresh } from '@/hooks/use-auto-refresh';
import { Suspense, useState } from 'react';
import { type PeriodFilter } from '@/hooks/use-dashboard-metrics';
import { toast } from 'sonner';

import data from './data/data.json';
import pastPerformanceData from './data/past-performance-data.json';
import keyPersonnelData from './data/key-personnel-data.json';
import focusDocumentsData from './data/focus-documents-data.json';

export default function Page() {
  const [cardsPeriod, setCardsPeriod] = useState<PeriodFilter>('all');

  // Auto-refresh dashboard data every 5 minutes
  const { isEnabled, toggleAutoRefresh, refreshNow, timeUntilNextRefresh } =
    useDashboardAutoRefresh(async () => {
      // Force re-fetch of products and metrics
      toast.loading('Atualizando dados...');
      window.location.reload();
    });

  const formatTimeUntilRefresh = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <BaseLayout title="Dashboard" description="Bem-vindo ao seu dashboard de produtos">
      <div className="@container/main px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
        {/* Auto-refresh controls - Mobile-first responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-muted/20 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Atualização automática:</span>
            <span className={isEnabled ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {isEnabled ? 'Ativada' : 'Desativada'}
            </span>
            {isEnabled && (
              <span className="text-xs sm:text-sm">
                Próxima em: {formatTimeUntilRefresh(timeUntilNextRefresh)}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                toast.loading('Atualizando dados...');
                refreshNow();
              }}
              className="w-full sm:w-auto px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Atualizar Agora
            </button>
            <button
              onClick={() => {
                toggleAutoRefresh();
                toast.success(isEnabled ? 'Auto-refresh desativado' : 'Auto-refresh ativado');
              }}
              className={`w-full sm:w-auto px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
                isEnabled
                  ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300'
                  : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300'
              }`}
            >
              {isEnabled ? 'Desativar' : 'Ativar'} Auto-refresh
            </button>
          </div>
        </div>

        {/* Dashboard Cards - Responsive grid */}
        <ErrorBoundary title="Erro no Dashboard Cards">
          <DataBoundaryWrapper title="Erro ao carregar métricas">
            <DashboardCards
              period={cardsPeriod}
              onPeriodChange={setCardsPeriod}
              showPeriodSelector={true}
            />
          </DataBoundaryWrapper>
        </ErrorBoundary>

        {/* Charts section - Responsive grid layout */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="col-span-1 lg:col-span-1">
            <ErrorBoundary title="Erro no Gráfico Interativo">
              <DataBoundaryWrapper title="Erro ao carregar gráfico">
                <ChartAreaInteractive />
              </DataBoundaryWrapper>
            </ErrorBoundary>
          </div>
          <div className="col-span-1 lg:col-span-1">
            <ErrorBoundary title="Erro no Gráfico de Categorias">
              <Suspense fallback={<LazyLoadingFallback />}>
                <LazyCategoryDistributionChart />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        {/* Price trend chart - Full width with responsive padding */}
        <div className="w-full">
          <ErrorBoundary title="Erro no Gráfico de Tendências">
            <Suspense fallback={<LazyLoadingFallback />}>
              <LazyPriceTrendChart />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Tables section - Responsive stacking */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
          <div className="col-span-1 xl:col-span-1">
            <ErrorBoundary title="Erro em Produtos Mais Vendidos">
              <Suspense fallback={<LazyLoadingFallback />}>
                <LazyTopSellingProducts />
              </Suspense>
            </ErrorBoundary>
          </div>
          <div className="col-span-1 xl:col-span-1">
            <ErrorBoundary title="Erro em Produtos Recentes">
              <Suspense fallback={<LazyLoadingFallback />}>
                <LazyRecentProducts />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* DataTable section - Responsive container */}
      <div className="@container/main px-3 sm:px-4 lg:px-6 mt-4 sm:mt-6">
        <DataTable
          data={data}
          pastPerformanceData={pastPerformanceData}
          keyPersonnelData={keyPersonnelData}
          focusDocumentsData={focusDocumentsData}
        />
      </div>
    </BaseLayout>
  );
}
