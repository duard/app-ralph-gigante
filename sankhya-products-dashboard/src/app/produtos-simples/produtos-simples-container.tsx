'use client';

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
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
  const [locInput, setLocInput] = React.useState(searchParams.get('localizacao') || '');
  const [tipInput, setTipInput] = React.useState(searchParams.get('tipcontest') || '');

  // URL state
  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('perPage')) || 20;
  const search = searchParams.get('search') || '';
  const codgrupoprod = searchParams.get('codgrupoprod') ? Number(searchParams.get('codgrupoprod')) : undefined;
  const localizacao = searchParams.get('localizacao') || '';
  const tipcontest = searchParams.get('tipcontest') || '';

  // Debounced search update
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

  // Debounced localizacao update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (locInput) {
        newParams.set('localizacao', locInput);
      } else {
        newParams.delete('localizacao');
      }
      newParams.delete('page');
      setSearchParams(newParams, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [locInput]);

  // Debounced tipcontest update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (tipInput) {
        newParams.set('tipcontest', tipInput);
      } else {
        newParams.delete('tipcontest');
      }
      newParams.delete('page');
      setSearchParams(newParams, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [tipInput]);

  const { data, isLoading, error } = useProductsSimplified({
    search,
    page,
    perPage,
    codgrupoprod,
    localizacao,
    tipcontest,
  });

  const clearFilters = () => {
    setSearchInput('');
    setLocInput('');
    setTipInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const hasFilters = search || localizacao || tipcontest || codgrupoprod;

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
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar descrição, referência..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="min-w-[150px]">
          <Input
            placeholder="Local (ex: A1)"
            value={locInput}
            onChange={(e) => setLocInput(e.target.value)}
          />
        </div>
        <div className="min-w-[120px]">
          <Input
            placeholder="Controle"
            value={tipInput}
            onChange={(e) => setTipInput(e.target.value)}
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" /> Limpar
          </Button>
        )}
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Código</TableHead>
              <TableHead className="min-w-[200px]">Descrição</TableHead>
              <TableHead className="w-28">Grupo</TableHead>
              <TableHead className="w-24">Local</TableHead>
              <TableHead className="w-24">Controle</TableHead>
              <TableHead className="w-16 text-center">Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((product) => (
                <TableRow key={product.codprod}>
                  <TableCell className="font-mono text-xs">{product.codprod}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={product.descrprod}>{product.descrprod}</TableCell>
                  <TableCell className="text-xs text-muted-foreground" title={product.descrgrupoprod || ''}>
                    {product.descrgrupoprod || '-'}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{product.localizacao || '-'}</TableCell>
                  <TableCell className="text-xs">
                    {product.tipcontest ? (
                      <Badge variant="outline" className="text-xs">{product.tipcontest}</Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.ativo === 'S' ? 'default' : 'secondary'} className="text-xs">
                      {product.ativo === 'S' ? 'S' : 'N'}
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
