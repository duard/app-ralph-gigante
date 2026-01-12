'use client';

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useProductsSimplified } from '@/hooks/use-products-simplified';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export function ProdutosSimplesContainer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = React.useState(searchParams.get('search') || '');

  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('perPage')) || 20;
  const search = searchParams.get('search') || '';

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchInput) {
        newParams.set('search', searchInput);
      } else {
        newParams.delete('search');
      }
      newParams.delete('page');
      setSearchParams(newParams, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error } = useProductsSimplified({
    search,
    page,
    perPage,
  });

  const updatePage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', String(newPage));
    }
    setSearchParams(newParams, { replace: true });
  };

  const updatePerPage = (newPerPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('perPage', String(newPerPage));
    newParams.delete('page');
    setSearchParams(newParams, { replace: true });
  };

  const totalPages = data?.lastPage || 1;
  const total = data?.total || 0;

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Erro ao carregar produtos: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, descrição ou referência..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-32">Referência</TableHead>
              <TableHead className="w-32">Marca</TableHead>
              <TableHead className="w-20 text-center">Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-12 mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((product) => (
                <TableRow key={product.codprod}>
                  <TableCell className="font-mono">{product.codprod}</TableCell>
                  <TableCell className="max-w-md truncate">{product.descrprod}</TableCell>
                  <TableCell className="text-muted-foreground">{product.referencia || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{product.marca || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.ativo === 'S' ? 'default' : 'secondary'}>
                      {product.ativo === 'S' ? 'Sim' : 'Não'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {total > 0 && (
            <>
              Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, total)} de {total}{' '}
              produtos
            </>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm">Itens por página</span>
            <Select value={String(perPage)} onValueChange={(v) => updatePerPage(Number(v))}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updatePage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updatePage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[100px] text-center">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updatePage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updatePage(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
