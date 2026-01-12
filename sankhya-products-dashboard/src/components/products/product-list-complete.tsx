'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  Package,
  PackageX,
  History,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductFiltersToolbar } from './product-filters-toolbar';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { cn } from '@/lib/utils';

// Product interface estendida com dados de última compra
export interface ProductWithHistory {
  codprod: number;
  descrprod: string;
  compldesc?: string;
  referencia?: string;
  marca?: string;
  codvol?: string;
  ativo: 'S' | 'N';
  codgrupoprod?: number;
  descrgrupoprod?: string; // Grupo/Categoria
  tipcontest?: string;
  controleAtual?: string; // Controle específico desta linha
  
  // Estoque
  estoqueTotal?: number;
  estmin?: number;
  estmax?: number;
  
  // Última compra
  ultimaCompraData?: string;
  ultimaCompraValor?: number;
  ultimaCompraQtd?: number;
  
  // Metadados
  codusu?: number;
  nomeusu?: string;
  dtalter?: string;
  
  // Locais
  locais?: Array<{
    codlocal: number;
    descrlocal: string;
    controle?: string;
    estoque: number;
    estmin?: number;
    estmax?: number;
  }>;
  
  // Grupo
  tgfgru?: {
    codgrupoprod: number;
    descgrupoprod: string;
  };
}

interface ProductListCompleteProps {
  data: ProductWithHistory[];
  isLoading?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onViewHistory?: (codprod: number) => void;
  onViewLocations?: (codprod: number) => void;
  onViewDetails?: (product: ProductWithHistory) => void;
  filters?: any;
  onFilterChange?: (filters: any) => void;
  onClearFilters?: () => void;
  locations?: Array<{ codlocal: number; descrlocal: string }>;
  groups?: Array<{ codgrupoprod: number; descrgrupoprod: string }>;
}

export function ProductListComplete({
  data,
  isLoading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  onViewHistory,
  onViewLocations,
  onViewDetails,
  filters,
  onFilterChange,
  onClearFilters,
  locations,
  groups,
}: ProductListCompleteProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const columns: ColumnDef<ProductWithHistory>[] = [
    {
      accessorKey: 'codprod',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Código
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">
          {row.getValue('codprod')}
        </div>
      ),
    },
    {
      accessorKey: 'descrprod',
      header: 'Produto',
      cell: ({ row }) => {
        const produto = row.original;
        return (
          <div className="max-w-[300px]">
            <div className="font-medium truncate">{produto.descrprod}</div>
            {produto.referencia && (
              <div className="text-xs text-muted-foreground">
                Ref: {produto.referencia}
              </div>
            )}
            {produto.marca && (
              <Badge variant="outline" className="mt-1 text-xs">
                {produto.marca}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'descrgrupoprod',
      header: 'Grupo',
      cell: ({ row }) => {
        const produto = row.original;
        const grupo = produto.tgfgru?.descgrupoprod || produto.descrgrupoprod;
        return grupo ? (
          <div className="space-y-1">
            <Badge variant="secondary" className="max-w-[150px] truncate">
              {grupo}
            </Badge>
            {produto.tgfgru?.codgrupoprod && (
              <div className="text-xs text-muted-foreground">
                #{produto.tgfgru.codgrupoprod}
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'tipcontest',
      header: 'Controle',
      cell: ({ row }) => {
        const produto = row.original;
        const controle = produto.controleAtual || produto.tipcontest;
        return controle ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="default" className="text-xs font-mono">
                  {controle}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Produto com controle de {controle}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        );
      },
    },
    {
      id: 'locaisEstoque',
      header: 'Estoque',
      cell: ({ row }) => {
        const produto = row.original;
        const locais = produto.locais || [];
        const estoqueTotal = produto.estoque?.estoqueTotal || 
                             locais.reduce((sum, loc) => sum + loc.estoque, 0);
        const locaisCount = produto.estoque?.locais || locais.length;

        // Se não tem estoque
        if (!estoqueTotal || estoqueTotal === 0) {
          return (
            <div className="text-muted-foreground text-sm">
              <PackageX className="h-4 w-4 inline mr-1" />
              Sem estoque
            </div>
          );
        }
        
        // Se tem estoque mas não tem detalhes de locais
        if (locais.length === 0 && estoqueTotal > 0) {
          return (
            <div className="space-y-1">
              <div className="font-medium text-sm">
                {estoqueTotal} unidades
              </div>
              {locaisCount > 0 && (
                <div className="text-xs text-muted-foreground">
                  {locaisCount} local(is)
                </div>
              )}
            </div>
          );
        }

        // Exibir hierarquicamente: primeiro local principal, depois hierarquia
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="cursor-pointer space-y-1 min-w-[160px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewLocations?.(produto.codprod);
                  }}
                >
                  {/* Primeiro local (principal) */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm truncate">
                        {locais[0].descrlocal}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {locais[0].estoque} un
                        {locais[0].controle && (
                          <span className="ml-1 font-mono">({locais[0].controle})</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Outros locais resumidos */}
                  {locais.length > 1 && (
                    <div className="pl-6 text-xs text-muted-foreground">
                      + {locais.length - 1} local(is) | Total: {estoqueTotal} un
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm" side="left">
                <div className="space-y-2">
                  <div className="font-semibold text-sm mb-2">Hierarquia de Locais</div>
                  {locais.map((loc, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "flex items-start justify-between gap-4 text-xs py-1",
                        idx === 0 && "border-b pb-2"
                      )}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{loc.descrlocal}</div>
                        {loc.controle && (
                          <div className="text-muted-foreground font-mono text-[10px]">
                            {loc.controle}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{loc.estoque} un</div>
                        {(loc.estmin || loc.estmax) && (
                          <div className="text-muted-foreground text-[10px]">
                            Min: {loc.estmin || 0} | Max: {loc.estmax || 0}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Geral:</span>
                    <span>{estoqueTotal} un</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: 'ultimaCompra',
      header: 'Última Compra',
      cell: ({ row }) => {
        const produto = row.original;
        const hasCompra = produto.ultimaCompraData || produto.ultimaCompraValor;

        if (!hasCompra) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }

        return (
          <div className="space-y-1 min-w-[140px]">
            {produto.ultimaCompraData && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(produto.ultimaCompraData).toLocaleDateString('pt-BR')}
              </div>
            )}
            {produto.ultimaCompraValor && (
              <div className="flex items-center gap-1 text-sm font-medium">
                <TrendingUp className="h-3 w-3 text-green-600" />
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(produto.ultimaCompraValor)}
              </div>
            )}
            {produto.ultimaCompraQtd && (
              <div className="text-xs text-muted-foreground">
                Qtd: {produto.ultimaCompraQtd}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'metadados',
      header: 'Alterado Por',
      cell: ({ row }) => {
        const produto = row.original;
        
        return (
          <div className="space-y-1 text-xs">
            {produto.nomeusu && (
              <div className="font-medium truncate max-w-[120px]">
                {produto.nomeusu}
              </div>
            )}
            {produto.dtalter && (
              <div className="text-muted-foreground">
                {new Date(produto.dtalter).toLocaleDateString('pt-BR')}
              </div>
            )}
            {!produto.nomeusu && !produto.dtalter && (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ row }) => {
        const ativo = row.getValue('ativo') as 'S' | 'N';
        return (
          <Badge variant={ativo === 'S' ? 'default' : 'secondary'}>
            {ativo === 'S' ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const produto = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails?.(produto)}>
                <Package className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Histórico de Consumo</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewHistory?.(produto.codprod);
                }}
              >
                <History className="mr-2 h-4 w-4" />
                Consumo Simples (V1)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/produtos/${produto.codprod}/consumo-v2`;
                }}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Consumo Detalhado (V2)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/produtos/${produto.codprod}/consumo-v3`;
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Visão 360° (V3)
              </DropdownMenuItem>
              {produto.locais && produto.locais.length > 0 && (
                <DropdownMenuItem onClick={() => onViewLocations?.(produto.codprod)}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Ver Locais ({produto.locais.length})
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(produto.codprod.toString());
                }}
              >
                Copiar Código
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
    manualPagination: true,
    pageCount: pagination?.totalPages,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar de Filtros */}
      {filters && onFilterChange && onClearFilters && (
        <ProductFiltersToolbar
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          locations={locations}
          groups={groups}
        />
      )}

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewDetails?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {pagination && onPageChange && onPageSizeChange && (
        <DataTablePagination
          table={table}
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
