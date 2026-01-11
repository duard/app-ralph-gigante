import { Package, PackageCheck, PackageX, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardCardsProps {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  outOfStockProducts: number
  totalStockValue: number
  averagePrice: number
}

export function DashboardCards({
  totalProducts,
  activeProducts,
  inactiveProducts,
  outOfStockProducts,
  totalStockValue,
  averagePrice,
}: DashboardCardsProps) {
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
