import { BaseLayout } from "@/components/layouts/base-layout"
import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { DataTable } from "./components/data-table"
import { DashboardCards } from "./components/dashboard-cards"
import {
  LazyPriceTrendChart,
  LazyTopSellingProducts,
  LazyRecentProducts,
  LazyCategoryDistributionChart,
  LazyLoadingFallback
} from "@/components/lazy-dashboard"

import { useDashboardAutoRefresh } from "@/hooks/use-auto-refresh"
import { Suspense, useState } from "react"
import { type PeriodFilter } from "@/hooks/use-dashboard-metrics"
import { toast } from "sonner"

import data from "./data/data.json"
import pastPerformanceData from "./data/past-performance-data.json"
import keyPersonnelData from "./data/key-personnel-data.json"
import focusDocumentsData from "./data/focus-documents-data.json"

export default function Page() {
  const [cardsPeriod, setCardsPeriod] = useState<PeriodFilter>('all')

  // Auto-refresh dashboard data every 5 minutes
  const { isEnabled, toggleAutoRefresh, refreshNow, timeUntilNextRefresh } = useDashboardAutoRefresh(async () => {
    // Force re-fetch of products and metrics
    toast.loading("Atualizando dados...");
    window.location.reload()
  })

  const formatTimeUntilRefresh = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <BaseLayout title="Dashboard" description="Bem-vindo ao seu dashboard de produtos">
        <div className="@container/main px-4 lg:px-6 space-y-6">
          {/* Auto-refresh controls */}
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Atualização automática:</span>
              <span className={isEnabled ? "text-green-600" : "text-red-600"}>
                {isEnabled ? "Ativada" : "Desativada"}
              </span>
              {isEnabled && (
                <span>Próxima em: {formatTimeUntilRefresh(timeUntilNextRefresh)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toast.loading("Atualizando dados...");
                  refreshNow();
                }}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Atualizar Agora
              </button>
              <button
                onClick={() => {
                  toggleAutoRefresh();
                  toast.success(isEnabled ? "Auto-refresh desativado" : "Auto-refresh ativado");
                }}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  isEnabled
                    ? "bg-red-100 text-red-800 hover:bg-red-200"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                }`}
              >
                {isEnabled ? "Desativar" : "Ativar"} Auto-refresh
              </button>
            </div>
          </div>

           <DashboardCards
             period={cardsPeriod}
             onPeriodChange={setCardsPeriod}
             showPeriodSelector={true}
           />
           <div className="grid gap-6 md:grid-cols-2">
             <ChartAreaInteractive />
             <Suspense fallback={<LazyLoadingFallback />}>
               <LazyCategoryDistributionChart />
             </Suspense>
           </div>
           <Suspense fallback={<LazyLoadingFallback />}>
             <LazyPriceTrendChart />
           </Suspense>
           <Suspense fallback={<LazyLoadingFallback />}>
             <LazyTopSellingProducts />
           </Suspense>
           <Suspense fallback={<LazyLoadingFallback />}>
             <LazyRecentProducts />
           </Suspense>
        </div>
        <div className="@container/main">
           <DataTable
             data={data}
             pastPerformanceData={pastPerformanceData}
             keyPersonnelData={keyPersonnelData}
             focusDocumentsData={focusDocumentsData}
           />
        </div>
    </BaseLayout>
  )
}
