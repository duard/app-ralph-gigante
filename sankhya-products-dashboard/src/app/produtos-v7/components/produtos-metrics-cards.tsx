import { Package, PackageCheck, PackageX, TrendingUp, DollarSign, Warehouse } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProdutosV7Filters } from '@/types/produtos-v7'
import { useProdutosV7Metrics } from '@/hooks/produtos-v7/use-produtos-v7'

interface ProdutosMetricsCardsProps {
  filters: ProdutosV7Filters
}

export function ProdutosMetricsCards({ filters }: ProdutosMetricsCardsProps) {
  const { data: metrics, isLoading } = useProdutosV7Metrics(filters)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  const cards = [
    {
      title: 'Total de Produtos',
      value: metrics.total.toLocaleString('pt-BR'),
      description: 'Produtos cadastrados no sistema',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Produtos Ativos',
      value: metrics.ativos.toLocaleString('pt-BR'),
      description: `${metrics.total > 0 ? ((metrics.ativos / metrics.total) * 100).toFixed(1) : 0}% do total`,
      icon: PackageCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Produtos Inativos',
      value: metrics.inativos.toLocaleString('pt-BR'),
      description: `${metrics.total > 0 ? ((metrics.inativos / metrics.total) * 100).toFixed(1) : 0}% do total`,
      icon: PackageX,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      title: 'Com Estoque',
      value: metrics.comEstoque.toLocaleString('pt-BR'),
      description: 'Produtos disponíveis para venda',
      icon: Warehouse,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
    },
    {
      title: 'Sem Estoque',
      value: metrics.semEstoque.toLocaleString('pt-BR'),
      description: 'Produtos zerados',
      icon: PackageX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Valor Total em Estoque',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(metrics.valorTotalEstoque),
      description: 'Valor de custo total',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
