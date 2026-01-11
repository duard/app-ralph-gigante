import { Package, PackageCheck, PackageX, TrendingUp, Calendar } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDashboardMetrics, type PeriodFilter } from "@/hooks/use-dashboard-metrics"

interface DashboardCardsProps {
  period?: PeriodFilter
  onPeriodChange?: (period: PeriodFilter) => void
  showPeriodSelector?: boolean
}

interface LegacyDashboardCardsProps {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  outOfStockProducts: number
  totalStockValue: number
  averagePrice: number
}

// New component with period filtering
export function DashboardCards({
  period = 'all',
  onPeriodChange,
  showPeriodSelector = true,
}: DashboardCardsProps) {
  const metrics = useDashboardMetrics(period)

  const handlePeriodChange = React.useCallback((newPeriod: PeriodFilter) => {
    onPeriodChange?.(newPeriod)
  }, [onPeriodChange])

  const getPeriodText = (periodFilter: PeriodFilter) => {
    switch (periodFilter) {
      case 'today':
        return 'Hoje'
      case 'week':
        return 'Últimos 7 dias'
      case 'month':
        return 'Últimos 30 dias'
      case 'all':
      default:
        return 'Todo período'
    }
  }

  return (
    <>
      {showPeriodSelector && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              Métricas do período: <strong>{getPeriodText(period)}</strong>
            </span>
          </div>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="month">Últimos 30 dias</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <DashboardCardsContent
        totalProducts={metrics.totalProducts}
        activeProducts={metrics.activeProducts}
        inactiveProducts={metrics.inactiveProducts}
        outOfStockProducts={metrics.outOfStockProducts}
        totalStockValue={metrics.totalStockValue}
        averagePrice={metrics.averagePrice}
      />
    </>
  )
}

// Content component for backward compatibility and internal use
function DashboardCardsContent({
  totalProducts,
  activeProducts,
  inactiveProducts,
  outOfStockProducts,
  totalStockValue,
  averagePrice,
}: LegacyDashboardCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Produtos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalProducts.toLocaleString('pt-BR')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Package className="size-3" />
              Cadastrados
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <TrendingUp className="size-4" />
            {activeProducts} ativos
          </div>
          <div className="text-muted-foreground">
            {inactiveProducts} inativos no momento
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Produtos Ativos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeProducts.toLocaleString('pt-BR')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <PackageCheck className="size-3" />
              Disponíveis
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {totalProducts > 0
              ? ((activeProducts / totalProducts) * 100).toFixed(1)
              : 0}% do catálogo
          </div>
          <div className="text-muted-foreground">
            Prontos para venda
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sem Estoque</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {outOfStockProducts.toLocaleString('pt-BR')}
          </CardTitle>
          <CardAction>
            <Badge variant="destructive" className="gap-1">
              <PackageX className="size-3" />
              Zerados
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-destructive">
            Reposição necessária
          </div>
          <div className="text-muted-foreground">
            Produtos com estoque zerado
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Valor em Estoque</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalStockValue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="size-3" />
              Total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Média: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(averagePrice)} / produto
          </div>
          <div className="text-muted-foreground">
            Valor total do inventário
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

// Export the legacy function for backward compatibility
export function DashboardCardsLegacy({
  totalProducts,
  activeProducts,
  inactiveProducts,
  outOfStockProducts,
  totalStockValue,
  averagePrice,
}: LegacyDashboardCardsProps) {
  return (
    <DashboardCardsContent
      totalProducts={totalProducts}
      activeProducts={activeProducts}
      inactiveProducts={inactiveProducts}
      outOfStockProducts={outOfStockProducts}
      totalStockValue={totalStockValue}
      averagePrice={averagePrice}
    />
  )
}