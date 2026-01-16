import { Eye, Edit, MapPin, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProdutosV7Filters } from '@/types/produtos-v7'
import { Link } from 'react-router-dom'
import { useProdutosV7 } from '@/hooks/produtos-v7/use-produtos-v7'

interface ProdutosTableProps {
  filters: ProdutosV7Filters
  onFiltersChange: (filters: Partial<ProdutosV7Filters>) => void
}

export function ProdutosTable({ filters, onFiltersChange }: ProdutosTableProps) {
  const { data, isLoading } = useProdutosV7(filters)

  const produtos = data?.data || []
  const total = data?.total || 0

  const handlePageChange = (newPage: number) => {
    onFiltersChange({ page: newPage })
  }

  const getStatusBadge = (ativo: string) => {
    if (ativo === 'S') {
      return <Badge className="bg-green-500">Ativo</Badge>
    }
    return <Badge variant="secondary">Inativo</Badge>
  }

  const getEstoqueBadge = (estoque: number) => {
    if (estoque === 0) {
      return <Badge variant="destructive">Sem estoque</Badge>
    }
    if (estoque < 10) {
      return <Badge className="bg-orange-500">{estoque}</Badge>
    }
    return <Badge className="bg-emerald-500">{estoque}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>
              Mostrando{' '}
              {(filters.page - 1) * filters.perPage + 1} a{' '}
              {Math.min(filters.page * filters.perPage, total)} de{' '}
              {total.toLocaleString('pt-BR')} produtos
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Colunas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 animate-pulse rounded" />
            ))}
          </div>
        ) : produtos.length > 0 ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-center">Locais</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto: any) => {
                    const estoqueTotal = produto.estoque?.estoqueTotal || 0
                    const qtdLocais = produto.estoque?.locais?.length || 0

                    return (
                      <TableRow key={produto.codprod} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {produto.codprod}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <div className="font-medium truncate">
                              {produto.descrprod}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {produto.descrgrupoprod || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {produto.referencia || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {produto.marca || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {getEstoqueBadge(estoqueTotal)}
                        </TableCell>
                        <TableCell className="text-center">
                          {qtdLocais > 0 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1"
                            >
                              <MapPin className="h-3 w-3" />
                              <span className="text-xs">{qtdLocais}</span>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {produto.vlrunit
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(produto.vlrunit)
                            : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(produto.ativo)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/produtos/${produto.codprod}`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Página {filters.page} de {Math.ceil(total / filters.perPage)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= Math.ceil(total / filters.perPage)}
                  onClick={() => handlePageChange(filters.page + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm">Tente ajustar os filtros</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
