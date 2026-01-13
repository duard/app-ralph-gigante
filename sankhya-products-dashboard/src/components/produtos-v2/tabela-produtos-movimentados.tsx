import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useProdutosMaisMovimentados } from '@/hooks/produtos-v2/use-dashboard-charts';
import type { DashboardFilters } from '@/types/dashboard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface TabelaProdutosMovimentadosProps {
  filters?: Partial<DashboardFilters>;
  limit?: number;
}

export function TabelaProdutosMovimentados({
  filters,
  limit = 20,
}: TabelaProdutosMovimentadosProps) {
  const { data, isLoading, error } = useProdutosMaisMovimentados(filters, limit);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Movimentados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar dados</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Movimentados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Movimentados</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Nenhum produto movimentado encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Mais Movimentados</CardTitle>
        <CardDescription>
          Top {data.length} produtos com maior atividade de estoque no período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ArrowUpDown className="h-4 w-4" />
                    <span>Movim.</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Entradas</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span>Saídas</span>
                  </div>
                </TableHead>
                <TableHead className="text-right">Estoque Atual</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Última Mov.</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((produto, index) => (
                <TableRow key={produto.codprod}>
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{produto.descrprod}</span>
                      {produto.referencia && (
                        <span className="text-xs text-muted-foreground">
                          Ref: {produto.referencia}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {produto.grupo ? (
                      <Badge variant="outline" className="text-xs">
                        {produto.grupo}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{produto.qtdMovimentacoes}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-green-600 font-medium">{produto.qtdEntradas}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-red-600 font-medium">{produto.qtdSaidas}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {produto.estoqueAtual.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    R${' '}
                    {produto.valorEstoque.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {formatDate(produto.ultimaMovimentacao)}
                  </TableCell>
                  <TableCell>
                    <Link to={`/produtos-v2/${produto.codprod}`}>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
