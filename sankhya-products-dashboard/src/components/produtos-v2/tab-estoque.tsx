import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { EstoquePorLocalAPI } from '@/hooks/produtos-v2/use-produto-v2-estoque';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TabEstoqueProps {
  estoquePorLocal: EstoquePorLocalAPI[] | undefined;
  loading: boolean;
}

export function TabEstoque({ estoquePorLocal, loading }: TabEstoqueProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!estoquePorLocal || estoquePorLocal.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estoque por Local</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum estoque encontrado para este produto.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estoque por Local</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Local</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Máximo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estoquePorLocal.map((item) => (
                <TableRow key={item.codlocal}>
                  <TableCell>
                    <Link
                      to={`/produtos-v2/local/${item.codlocal}`}
                      className="text-primary hover:underline"
                    >
                      {item.descrlocal}
                    </Link>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'font-medium',
                      item.estoque === null || item.estoque === 0
                        ? 'text-red-600'
                        : item.estmin !== null && item.estoque < item.estmin
                          ? 'text-orange-600'
                          : 'text-green-600'
                    )}
                  >
                    {item.estoque !== null ? item.estoque : '-'}
                  </TableCell>
                  <TableCell>{item.estmin !== null ? item.estmin : '-'}</TableCell>
                  <TableCell>{item.estmax !== null ? item.estmax : '-'}</TableCell>
                  <TableCell>
                    {item.valorEstoque
                      ? `R$ ${item.valorEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {item.estoque !== null && item.estmin !== null ? (
                      item.estoque < item.estmin ? (
                        <Badge variant="destructive">Crítico</Badge>
                      ) : item.estoque > item.estmax ? (
                        <Badge variant="secondary">Excesso</Badge>
                      ) : (
                        <Badge variant="default">OK</Badge>
                      )
                    ) : (
                      <Badge variant="outline">-</Badge>
                    )}
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
