import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, TrendingUp, Package, DollarSign, BarChart3 } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/product-utils"
import { CardLoading } from "@/components/ui/loading"

interface TopSellingProductsProps {
  className?: string
  limit?: number
}

interface ProductSalesData {
  codprod: number
  descricao: string
  codvol?: string
  preco?: number
  totalMovimentacoes: number
  totalQuantidade: number
  totalValor: number
  ultimaMovimentacao: string
  ranking: number
}

export function TopSellingProducts({ className, limit = 10 }: TopSellingProductsProps) {
  const { products, isLoading } = useProducts()
  const [sortBy, setSortBy] = React.useState<'movimentacoes' | 'quantidade' | 'valor'>('valor')
  const [period, setPeriod] = React.useState<'30' | '90' | 'all'>('all')
  const [topProducts, setTopProducts] = React.useState<ProductSalesData[]>([])

  // Simulate sales data - in a real app, this would come from API
  React.useEffect(() => {
    if (!products.length) return

    // Mock sales data based on product prices and some randomization
    const mockSalesData: ProductSalesData[] = products
      .slice(0, Math.min(products.length, limit * 2)) // Get more products to filter
      .map((product) => {
        // Simulate different sales volumes based on product index and price
        const baseMovements = Math.floor(Math.random() * 50) + 10
        const priceMultiplier = (product.vlrvenda || 1) / 100
        const quantityMultiplier = Math.random() * 2 + 0.5

        const totalMovimentacoes = Math.floor(baseMovements * priceMultiplier)
        const totalQuantidade = Math.floor(totalMovimentacoes * quantityMultiplier * (Math.random() * 5 + 1))
        const totalValor = totalQuantidade * (product.vlrvenda || 0)

        // Simulate last movement date within the selected period
        const daysAgo = period === '30' ? Math.floor(Math.random() * 30) :
                       period === '90' ? Math.floor(Math.random() * 90) :
                       Math.floor(Math.random() * 365)
        const ultimaMovimentacao = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        return {
          codprod: product.codprod,
          descricao: product.descrprod || `Produto ${product.codprod}`,
          codvol: product.codvol,
          preco: product.vlrvenda,
          totalMovimentacoes,
          totalQuantidade,
          totalValor,
          ultimaMovimentacao,
          ranking: 0 // Will be set after sorting
        }
      })

    // Sort by selected criteria
    const sortedData = mockSalesData.sort((a, b) => {
      switch (sortBy) {
        case 'movimentacoes':
          return b.totalMovimentacoes - a.totalMovimentacoes
        case 'quantidade':
          return b.totalQuantidade - a.totalQuantidade
        case 'valor':
        default:
          return b.totalValor - a.totalValor
      }
    }).slice(0, limit)

    // Add ranking
    sortedData.forEach((product, index) => {
      product.ranking = index + 1
    })

    setTopProducts(sortedData)
  }, [products, sortBy, period, limit])

  const getRankingIcon = (ranking: number) => {
    if (ranking === 1) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (ranking === 2) return <Trophy className="h-4 w-4 text-gray-400" />
    if (ranking === 3) return <Trophy className="h-4 w-4 text-amber-600" />
    return <span className="text-sm font-bold text-gray-500">#{ranking}</span>
  }

  const getRankingColor = (ranking: number) => {
    if (ranking <= 3) return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
    return ""
  }

  if (isLoading) {
    return (
      <CardLoading 
        isLoading={isLoading} 
        lines={5}
        className={className}
      />
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Produtos Mais Vendidos
          </CardTitle>
          <CardDescription>
            Top {limit} produtos por volume de vendas
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(value: '30' | '90' | 'all') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: 'movimentacoes' | 'quantidade' | 'valor') => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="valor">Por Valor</SelectItem>
              <SelectItem value="quantidade">Por Quantidade</SelectItem>
              <SelectItem value="movimentacoes">Por Movimentações</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado de vendas disponível</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Posição</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Movimentações</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Última Mov.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product) => (
                <TableRow
                  key={product.codprod}
                  className={cn("hover:bg-muted/50", getRankingColor(product.ranking))}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getRankingIcon(product.ranking)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{product.descricao}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{product.codprod}
                        </Badge>
                        {product.codvol && (
                          <Badge variant="secondary" className="text-xs">
                            {product.codvol}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">{product.totalMovimentacoes}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Package className="h-3 w-3 text-green-500" />
                      <span className="font-medium">{product.totalQuantidade.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="font-medium text-green-600">
                        {formatCurrency(product.totalValor)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(product.ultimaMovimentacao).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {topProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Ordenado por: {
                sortBy === 'valor' ? 'Valor Total' :
                sortBy === 'quantidade' ? 'Quantidade Vendida' :
                'Número de Movimentações'
              }</span>
              <span>Período: {
                period === '30' ? 'Últimos 30 dias' :
                period === '90' ? 'Últimos 90 dias' :
                'Todo o período disponível'
              }</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}