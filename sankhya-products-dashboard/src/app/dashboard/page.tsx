import { BaseLayout } from "@/components/layouts/base-layout"
import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { DataTable } from "./components/data-table"
import { DashboardCards } from "./components/dashboard-cards"
import { CategoryDistributionChart } from "./components/category-distribution-chart"

import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics"

import data from "./data/data.json"
import pastPerformanceData from "./data/past-performance-data.json"
import keyPersonnelData from "./data/key-personnel-data.json"
import focusDocumentsData from "./data/focus-documents-data.json"

export default function Page() {
  const metrics = useDashboardMetrics()

  return (
    <BaseLayout title="Dashboard" description="Bem-vindo ao seu dashboard de produtos">
        <div className="@container/main px-4 lg:px-6 space-y-6">
          <DashboardCards
            totalProducts={metrics.totalProducts}
            activeProducts={metrics.activeProducts}
            inactiveProducts={metrics.inactiveProducts}
            outOfStockProducts={metrics.outOfStockProducts}
            totalStockValue={metrics.totalStockValue}
            averagePrice={metrics.averagePrice}
          />
          <div className="grid gap-6 md:grid-cols-2">
            <ChartAreaInteractive />
            <CategoryDistributionChart />
          </div>
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
