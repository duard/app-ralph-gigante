import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProdutoV2 } from '@/hooks/produtos-v2/use-produtos-v2-listagem';
import { cn } from '@/lib/utils';

import { useEffect, useRef } from 'react';

interface ProdutoTableProps {
  data: ProdutoV2[];
  loading: boolean;
  sort: string;
  onSortChange: (column: string, direction: 'asc' | 'desc') => void;
}

export function ProdutoTable({ data, loading, sort, onSortChange }: ProdutoTableProps) {
  const [sortColumn, sortDirection] = sort.split('-');

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newDirection);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <span className="ml-1 text-muted-foreground opacity-50">↕️</span>;
    }
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(7)].map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(7)].map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('codprod')}
            >
              Código {getSortIcon('codprod')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('descrprod')}
            >
              Descrição {getSortIcon('descrprod')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('grupo')}
            >
              Grupo {getSortIcon('grupo')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('estoque')}
            >
              Estoque {getSortIcon('estoque')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('marca')}
            >
              Marca {getSortIcon('marca')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort('ativo')}
            >
              Ativo {getSortIcon('ativo')}
            </TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((produto) => (
              <TableRow key={produto.codprod}>
                <TableCell className="font-medium">
                  <Link
                    to={`/produtos-v2/${produto.codprod}`}
                    className="text-primary hover:underline"
                    onMouseEnter={() => ProductDataPreloader.preloadProductDetail(produto.codprod)}
                  >
                    {produto.codprod}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/produtos-v2/${produto.codprod}`}
                    className="text-primary hover:underline"
                    onMouseEnter={() => ProductDataPreloader.preloadProductDetail(produto.codprod)}
                  >
                    {produto.descrprod}
                  </Link>
                </TableCell>
                <TableCell>
                  {produto.descrgrupoprod ? (
                    <Link
                      to={`/produtos-v2/grupo/${produto.codgrupoprod}`}
                      className="text-primary hover:underline"
                      onMouseEnter={() =>
                        ProductDataPreloader.preloadGroupSummary(produto.codgrupoprod)
                      }
                    >
                      {produto.descrgrupoprod}
                    </Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      'font-medium',
                      produto.estoque === null || produto.estoque === 0
                        ? 'text-red-600'
                        : produto.estmin !== null && produto.estoque < produto.estmin
                          ? 'text-orange-600'
                          : 'text-green-600'
                    )}
                  >
                    {produto.estoque !== null ? produto.estoque : '-'}
                  </div>
                </TableCell>
                <TableCell>{produto.marca || '-'}</TableCell>
                <TableCell>
                  <Badge variant={produto.ativo === 'S' ? 'default' : 'secondary'}>
                    {produto.ativo === 'S' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/produtos-v2/${produto.codprod}`}
                    className="text-primary hover:underline text-sm"
                    onMouseEnter={() => ProductDataPreloader.preloadProductDetail(produto.codprod)}
                  >
                    Ver detalhes
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum produto encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
