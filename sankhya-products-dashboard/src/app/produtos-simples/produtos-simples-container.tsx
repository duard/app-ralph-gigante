'use client';

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown, MapPin, MapPinOff } from 'lucide-react';
import { backendClient as client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortColumn = 'codprod' | 'descrprod' | 'localizacao' | 'valor_medio' | 'valor_ultima_compra';
type SortDir = 'asc' | 'desc';

export function ProdutosSimplesContainer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = React.useState(searchParams.get('search') || '');

  // URL state
  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('perPage')) || 30;
  const search = searchParams.get('search') || '';
  const tab = (searchParams.get('tab') || 'com-local') as 'com-local' | 'sem-local' | 'todos';
  const sortCol = (searchParams.get('sortCol') || 'codprod') as SortColumn;
  const sortDir = (searchParams.get('sortDir') || 'desc') as SortDir;

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['produtos-simples-v2', search, page, perPage, sortCol, sortDir],
    queryFn: async () => {
      const response = await client.get('/produtos-simples-v2', {
        params: { search, page, perPage, sort: `${sortCol} ${sortDir}` },
      });
      return response.data;
    },
  });

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') newParams.delete('page');
    setSearchParams(newParams, { replace: true });
  };

  const handleSort = (col: SortColumn) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortCol === col) {
      newParams.set('sortDir', sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      newParams.set('sortCol', col);
      newParams.set('sortDir', 'desc');
    }
    newParams.delete('page');
    setSearchParams(newParams, { replace: true });
  };

  const SortIcon = ({ col }: { col: SortColumn }) => {
    if (sortCol !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams({ tab }), { replace: true });
  };

  const hasFilters = search;
  const totalPages = data?.lastPage || 1;
  const total = data?.total || 0;

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Erro ao carregar produtos: {error.message}
      </div>
    );
  }

  const renderTable = () => (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-20 cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('codprod')}
            >
              <div className="flex items-center">
                Código
                <SortIcon col="codprod" />
              </div>
            </TableHead>
            <TableHead
              className="min-w-[200px] cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('descrprod')}
            >
              <div className="flex items-center">
                Descrição
                <SortIcon col="descrprod" />
              </div>
            </TableHead>
            <TableHead
              className="w-32 cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('localizacao')}
            >
              <div className="flex items-center">
                Localização
                <SortIcon col="localizacao" />
              </div>
            </TableHead>
            <TableHead
              className="w-28 cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('valor_medio')}
            >
              <div className="flex items-center">
                Valor Médio
                <SortIcon col="valor_medio" />
              </div>
            </TableHead>
            <TableHead
              className="w-32 cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('valor_ultima_compra')}
            >
              <div className="flex items-center">
                Última Compra
                <SortIcon col="valor_ultima_compra" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-14" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
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
            data?.data?.map((product, idx) => (
              <TableRow
                key={`${product.codprod}-${idx}`}
                className={cn(product.ativo !== 'S' && 'text-muted-foreground')}
              >
                <TableCell className="font-mono text-xs">{product.codprod}</TableCell>
                <TableCell className="max-w-[300px] truncate text-sm" title={product.descrprod}>
                  {product.descrprod}
                </TableCell>
                <TableCell className="text-xs font-mono">{product.localizacao || '-'}</TableCell>
                <TableCell className="text-xs font-mono">
                  R$ {product.valor_medio?.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  R$ {product.valor_ultima_compra?.toFixed(2) || '0.00'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        {total > 0 && (
          <>
            Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, total)} de {total}
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Por página</span>
          <Select value={String(perPage)} onValueChange={(v) => updateParam('perPage', v)}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateParam('page', '1')}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateParam('page', String(page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[80px] text-center">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateParam('page', String(page + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateParam('page', String(totalPages))}
            disabled={page >= totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

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
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" /> Limpar
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => updateParam('tab', v)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="com-local" className="gap-2">
            <MapPin className="h-4 w-4" /> Com Local
          </TabsTrigger>
          <TabsTrigger value="sem-local" className="gap-2">
            <MapPinOff className="h-4 w-4" /> Sem Local
          </TabsTrigger>
          <TabsTrigger value="todos">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="com-local" className="space-y-4">
          {renderTable()}
          {renderPagination()}
        </TabsContent>

        <TabsContent value="sem-local" className="space-y-4">
          {renderTable()}
          {renderPagination()}
        </TabsContent>

        <TabsContent value="todos" className="space-y-4">
          {renderTable()}
          {renderPagination()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
