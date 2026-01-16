import { useState, useEffect } from 'react'
import { Search, Filter, X, Download, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useGrupos } from '@/hooks/produtos-v2/use-grupos-locais'
import { LocalSingleSelect } from '@/components/sankhya/selects/locais'
import { type ProdutosV7Filters, STATUS_LABELS } from '@/types/produtos-v7'
import { useDebouncedCallback } from 'use-debounce'

interface ProdutosToolbarProps {
  filters: ProdutosV7Filters
  onFiltersChange: (filters: Partial<ProdutosV7Filters>) => void
  onClearFilters: () => void
}

export function ProdutosToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
}: ProdutosToolbarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const { data: grupos, isLoading: loadingGrupos } = useGrupos()

  // Debounce search para não fazer requisição a cada tecla
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onFiltersChange({ search: value || undefined })
  }, 500)

  useEffect(() => {
    debouncedSearch(localSearch)
  }, [localSearch, debouncedSearch])

  const hasActiveFilters =
    filters.search ||
    filters.codgrupoprod ||
    filters.codlocal ||
    filters.ativo !== 'all' ||
    filters.marca ||
    filters.comEstoque ||
    filters.semEstoque ||
    filters.comControle ||
    filters.semControle

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Linha 1: Filtros principais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Busca */}
            <div className="lg:col-span-2">
              <Label htmlFor="search">Buscar Produto</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Código, descrição, referência..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-9"
                />
                {localSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setLocalSearch('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Grupo */}
            <div>
              <Label htmlFor="grupo">Grupo</Label>
              <Select
                value={filters.codgrupoprod?.toString() || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    codgrupoprod: value === 'all' ? undefined : Number(value),
                  })
                }
              >
                <SelectTrigger id="grupo" className="mt-1.5">
                  <SelectValue placeholder="Todos os grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os grupos</SelectItem>
                  {grupos?.map((grupo) => (
                    <SelectItem
                      key={grupo.codgrupoprod}
                      value={grupo.codgrupoprod.toString()}
                    >
                      {grupo.descgrupoprod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Local */}
            <div>
              <Label htmlFor="local">Local</Label>
              <LocalSingleSelect
                value={filters.codlocal ?? null}
                onChange={(value) =>
                  onFiltersChange({ codlocal: value ?? undefined })
                }
                placeholder="Todos os locais"
                clearable
                className="mt-1.5"
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.ativo || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({ ativo: value as 'S' | 'N' | 'all' })
                }
              >
                <SelectTrigger id="status" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="S">Ativos</SelectItem>
                  <SelectItem value="N">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 2: Marca e Toggles */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {/* Marca */}
            <div className="lg:col-span-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                placeholder="Filtrar por marca..."
                value={filters.marca || ''}
                onChange={(e) =>
                  onFiltersChange({ marca: e.target.value || undefined })
                }
                className="mt-1.5"
              />
            </div>

            {/* Toggles */}
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="com-estoque"
                  checked={filters.comEstoque || false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ comEstoque: checked })
                  }
                />
                <Label htmlFor="com-estoque" className="cursor-pointer">
                  Com Estoque
                </Label>
              </div>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sem-estoque"
                  checked={filters.semEstoque || false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ semEstoque: checked })
                  }
                />
                <Label htmlFor="sem-estoque" className="cursor-pointer">
                  Sem Estoque
                </Label>
              </div>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="com-controle"
                  checked={filters.comControle || false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ comControle: checked })
                  }
                />
                <Label htmlFor="com-controle" className="cursor-pointer">
                  Com Controle
                </Label>
              </div>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sem-controle"
                  checked={filters.semControle || false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ semControle: checked })
                  }
                />
                <Label htmlFor="sem-controle" className="cursor-pointer">
                  Sem Controle
                </Label>
              </div>
            </div>
          </div>

          {/* Linha 3: Ações */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              {hasActiveFilters ? (
                <span>Filtros ativos</span>
              ) : (
                <span>Nenhum filtro aplicado</span>
              )}
            </div>

            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
