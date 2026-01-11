import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Package, DollarSign, Calendar, ArrowUpDown } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/product-utils"

interface RecentProductsProps {
  className?: string
  limit?: number
  period?: 'all' | '7' | '14' | '30'
  showPeriodSelector?: boolean
}

interface RecentProductData {
  codprod: number
  descricao: string
  codvol?: string
  preco?: number
  status?: string
  dataCadastro?: string
  dataUltimaModificacao?: string
  categoria?: string
  fornecedor?: string
  // Mock data for demonstration
  diasDesdeCadastro: number
  isNovo: boolean
}

export function RecentProducts({ 
  className, 
  limit = 10, 
  period = 'all',
  showPeriodSelector = false
}: RecentProductsProps) {
  const { products, isLoading } = useProducts()
  const [sortBy, setSortBy] = React.useState<'cadastro' | 'modificacao'>('cadastro')
  const [selectedPeriod, setSelectedPeriod] = React.useState(period)
  const [recentProducts, setRecentProducts] = React.useState<RecentProductData[]>([])

  const handlePeriodChange = React.useCallback((newPeriod: typeof selectedPeriod) => {
    setSelectedPeriod(newPeriod)
  }, [])

  React.useEffect(() => {
    if (!products.length) return

    // Mock recent products data - in a real app, this would come from API with actual timestamps
    const productData = products
      .slice(0, Math.min(products.length, limit * 2)) // Get more products to filter
      .map((product) => {
        // Simulate different registration dates (from 1 to 90 days ago)
        const diasDesdeCadastro = Math.floor(Math.random() * 90) + 1
        const dataCadastro = new Date(Date.now() - diasDesdeCadastro * 24 * 60 * 60 * 1000).toISOString()

        // Simulate last modification (between registration date and now)
        const diasDesdeModificacao = Math.floor(Math.random() * diasDesdeCadastro)
        const dataUltimaModificacao = new Date(Date.now() - diasDesdeModificacao * 24 * 60 * 60 * 1000).toISOString()

        // Mock category and supplier
        const categorias = ['Eletrônicos', 'Roupas', 'Alimentos', 'Ferramentas', 'Livros', 'Esportes']
        const fornecedores = ['Fornecedor A', 'Fornecedor B', 'Fornecedor C', 'Distribuidora X', 'Importadora Y']

        // Filter by selected period
        let includeProduct = true
        if (selectedPeriod !== 'all') {
          const maxDays = parseInt(selectedPeriod)
          includeProduct = diasDesdeCadastro <= maxDays
        }

        if (!includeProduct) return null

        return {
          codprod: product.codprod,
          descricao: product.descrprod || `Produto ${product.codprod}`,
          codvol: product.codvol,
          preco: product.vlrvenda,
          status: product.ativo === 'S' ? 'A' : 'I', // Map ativo field to status
          dataCadastro,
          dataUltimaModificacao,
          categoria: categorias[Math.floor(Math.random() * categorias.length)],
          fornecedor: fornecedores[Math.floor(Math.random() * fornecedores.length)],
          diasDesdeCadastro,
          isNovo: diasDesdeCadastro <= 7 // Consider "new" if added within last 7 days
        } as RecentProductData
      })

    // Filter out null values
    const mockRecentData: RecentProductData[] = productData.filter(
      (item): item is RecentProductData => item !== null
    )

    // Sort by selected criteria
    const sortedData = mockRecentData.sort((a, b) => {
      if (sortBy === 'cadastro') {
        return new Date(a.dataCadastro!).getTime() - new Date(b.dataCadastro!).getTime()
      } else {
        return new Date(a.dataUltimaModificacao!).getTime() - new Date(b.dataUltimaModificacao!).getTime()
      }
    }).slice(0, limit)

    setRecentProducts(sortedData)
  }, [products, sortBy, limit, selectedPeriod])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status?: string) => {
    if (status === 'A') {
      return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    } else if (status === 'I') {
      return <Badge variant="secondary">Inativo</Badge>
    }
    return <Badge variant="outline">Indefinido</Badge>
  }

  const getDaysAgoText = (days: number) => {
    if (days === 0) return 'Hoje'
    if (days === 1) return 'Ontem'
    if (days < 7) return `${days} dias atrás`
    if (days < 30) return `${Math.floor(days / 7)} semanas atrás`
    return `${Math.floor(days / 30)} meses atrás`
  }

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Produtos Recentes
          </CardTitle>
          <CardDescription>Carregando produtos recentes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Produtos Recentes
          </CardTitle>
          <CardDescription>
            Últimos {limit} produtos adicionados ou modificados
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {showPeriodSelector && (
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo período</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="14">14 dias</SelectItem>
                <SelectItem value="7">7 dias</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            variant={sortBy === 'cadastro' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('cadastro')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Cadastro
          </Button>
          <Button
            variant={sortBy === 'modificacao' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('modificacao')}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            Modificação
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum produto recente encontrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  {sortBy === 'cadastro' ? 'Data Cadastro' : 'Última Modificação'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProducts.map((product) => (
                <TableRow
                  key={product.codprod}
                  className={cn(
                    "hover:bg-muted/50",
                    product.isNovo && "bg-blue-50/50 border-l-4 border-l-blue-500"
                  )}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{product.descricao}</p>
                        {product.isNovo && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Novo
                          </Badge>
                        )}
                      </div>
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
                      <p className="text-xs text-muted-foreground">
                        {product.fornecedor}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {product.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="font-medium text-green-600">
                        {product.preco ? formatCurrency(product.preco) : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(product.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {formatDate(sortBy === 'cadastro' ? product.dataCadastro! : product.dataUltimaModificacao!)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getDaysAgoText(
                          sortBy === 'cadastro' ? product.diasDesdeCadastro :
                          Math.floor((Date.now() - new Date(product.dataUltimaModificacao!).getTime()) / (1000 * 60 * 60 * 24))
                        )}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {recentProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Ordenado por: {sortBy === 'cadastro' ? 'Data de Cadastro' : 'Data de Última Modificação'}
              </span>
              <span>
                {recentProducts.filter(p => p.isNovo).length} produtos marcados como "Novo" (≤7 dias)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}