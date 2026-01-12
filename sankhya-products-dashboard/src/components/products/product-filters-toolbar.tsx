'use client';

import * as React from 'react';
import { Search, SlidersHorizontal, X, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface ProductFiltersToolbarProps {
  filters: {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    codlocal?: number;
    codgrupoprod?: number;
    marca?: string;
    comControle?: boolean;
    semControle?: boolean;
    priceMin?: number;
    priceMax?: number;
    stockMin?: number;
    stockMax?: number;
  };
  onFilterChange: (filters: Partial<ProductFiltersToolbarProps['filters']>) => void;
  onClearFilters: () => void;
  locations?: Array<{ codlocal: number; descrlocal: string }>;
  groups?: Array<{ codgrupoprod: number; descrgrupoprod: string }>;
  className?: string;
}

export function ProductFiltersToolbar({
  filters,
  onFilterChange,
  onClearFilters,
  locations = [],
  groups = [],
  className,
}: ProductFiltersToolbarProps) {
  const [searchValue, setSearchValue] = React.useState(filters.search || '');
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);

  // Sincronizar searchValue com prop filters.search (quando vier da URL)
  React.useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  // Debounce search - AUMENTADO para 500ms (melhor performance)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        console.log('[Toolbar] Aplicando busca:', searchValue);
        onFilterChange({ search: searchValue });
      }
    }, 500); // 500ms de debounce
    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onFilterChange]);

  // Count active filters
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.codlocal) count++;
    if (filters.codgrupoprod) count++;
    if (filters.marca) count++;
    if (filters.comControle) count++;
    if (filters.semControle) count++;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.stockMin) count++;
    if (filters.stockMax) count++;
    return count;
  }, [filters]);

  return (
    <div className={cn('flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm', className)}>
      {/* Main toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código, referência..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => {
                setSearchValue('');
                onFilterChange({ search: '' });
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFilterChange({ status: value as 'all' | 'active' | 'inactive' })
          }
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        {/* Location Filter */}
        {locations.length > 0 && (
          <Select
            value={filters.codlocal?.toString() || 'all'}
            onValueChange={(value) =>
              onFilterChange({
                codlocal: value === 'all' ? undefined : Number(value),
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <MapPin className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Local" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os locais</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.codlocal} value={loc.codlocal.toString()}>
                  {loc.descrlocal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Group Filter */}
        {groups.length > 0 && (
          <Select
            value={filters.codgrupoprod?.toString() || 'all'}
            onValueChange={(value) =>
              onFilterChange({
                codgrupoprod: value === 'all' ? undefined : Number(value),
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Tag className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os grupos</SelectItem>
              {groups.map((grp) => (
                <SelectItem key={grp.codgrupoprod} value={grp.codgrupoprod.toString()}>
                  {grp.descrgrupoprod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Advanced Filters Popover */}
        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros Avançados
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 min-w-[20px] rounded-full px-1 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="mb-3 font-medium">Filtros Avançados</h4>
              </div>

              <Separator />

              {/* Marca */}
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  placeholder="Ex: GENERICO"
                  value={filters.marca || ''}
                  onChange={(e) => onFilterChange({ marca: e.target.value })}
                />
              </div>

              {/* Controle */}
              <div className="space-y-2">
                <Label>Controle de Produto</Label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.comControle ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      onFilterChange({
                        comControle: !filters.comControle,
                        semControle: false,
                      })
                    }
                  >
                    Com Controle
                  </Button>
                  <Button
                    variant={filters.semControle ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      onFilterChange({
                        semControle: !filters.semControle,
                        comControle: false,
                      })
                    }
                  >
                    Sem Controle
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Price Range */}
              <div className="space-y-2">
                <Label>Faixa de Preço</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.priceMin || ''}
                    onChange={(e) =>
                      onFilterChange({
                        priceMin: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.priceMax || ''}
                    onChange={(e) =>
                      onFilterChange({
                        priceMax: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              {/* Stock Range */}
              <div className="space-y-2">
                <Label>Faixa de Estoque</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.stockMin || ''}
                    onChange={(e) =>
                      onFilterChange({
                        stockMin: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.stockMax || ''}
                    onChange={(e) =>
                      onFilterChange({
                        stockMax: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="whitespace-nowrap">
            <X className="mr-2 h-4 w-4" />
            Limpar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters Pills */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Busca: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSearchValue('');
                  onFilterChange({ search: '' });
                }}
              />
            </Badge>
          )}
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.status === 'active' ? 'Ativos' : 'Inativos'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ status: 'all' })}
              />
            </Badge>
          )}
          {filters.codlocal && (
            <Badge variant="secondary" className="gap-1">
              Local: {locations.find((l) => l.codlocal === filters.codlocal)?.descrlocal}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ codlocal: undefined })}
              />
            </Badge>
          )}
          {filters.codgrupoprod && (
            <Badge variant="secondary" className="gap-1">
              Grupo: {groups.find((g) => g.codgrupoprod === filters.codgrupoprod)?.descrgrupoprod}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ codgrupoprod: undefined })}
              />
            </Badge>
          )}
          {filters.marca && (
            <Badge variant="secondary" className="gap-1">
              Marca: {filters.marca}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onFilterChange({ marca: '' })} />
            </Badge>
          )}
          {filters.comControle && (
            <Badge variant="secondary" className="gap-1">
              Com Controle
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ comControle: false })}
              />
            </Badge>
          )}
          {filters.semControle && (
            <Badge variant="secondary" className="gap-1">
              Sem Controle
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ semControle: false })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
