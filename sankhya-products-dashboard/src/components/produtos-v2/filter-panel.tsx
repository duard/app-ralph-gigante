import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { MultiSelectFilter } from './multi-select-filter';
import { PeriodoToggle } from './periodo-toggle';
import { DateRangePicker } from './date-range-picker';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDashboardFiltersStore } from '@/stores/dashboard-filters-store';
import type { Grupo, Local } from '@/types/dashboard';
import { useMemo } from 'react';

interface FilterPanelProps {
  grupos: Grupo[];
  locais: Local[];
  isLoadingGrupos?: boolean;
  isLoadingLocais?: boolean;
}

export function FilterPanel({
  grupos,
  locais,
  isLoadingGrupos = false,
  isLoadingLocais = false,
}: FilterPanelProps) {
  const {
    grupos: selectedGrupos,
    locais: selectedLocais,
    periodoPreset,
    startDate,
    endDate,
    status,
    estoqueStatus,
    search,
    setGrupos,
    setLocais,
    setPeriodoPreset,
    setDateRange,
    setStatus,
    setEstoqueStatus,
    setSearch,
    clearFilters,
    getActiveFiltersCount,
  } = useDashboardFiltersStore();

  const activeFiltersCount = getActiveFiltersCount();

  // Preparar opções para MultiSelect
  const grupoOptions = useMemo(
    () =>
      grupos.map((g) => ({
        value: g.codgrupoprod,
        label: g.descgrupoprod,
      })),
    [grupos]
  );

  const localOptions = useMemo(
    () =>
      locais.map((l) => ({
        value: l.codlocal,
        label: l.descrlocal,
      })),
    [locais]
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
          <SheetDescription>
            Configure os filtros para refinar a visualização dos dados
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Busca Textual */}
          <div className="space-y-2">
            <Label htmlFor="search">Busca</Label>
            <Input
              id="search"
              placeholder="Buscar por nome, código ou referência..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <p className="text-xs text-muted-foreground">
                Buscando em: nome do produto, código e referência
              </p>
            )}
          </div>

          {/* Filtro de Grupos */}
          <MultiSelectFilter
            label="Grupos de Produtos"
            placeholder="Selecionar grupos..."
            options={grupoOptions}
            value={selectedGrupos}
            onChange={setGrupos}
            isLoading={isLoadingGrupos}
          />

          {/* Filtro de Locais */}
          <MultiSelectFilter
            label="Locais de Estoque"
            placeholder="Selecionar locais..."
            options={localOptions}
            value={selectedLocais}
            onChange={setLocais}
            isLoading={isLoadingLocais}
          />

          {/* Período */}
          <div className="space-y-4">
            <PeriodoToggle value={periodoPreset} onChange={setPeriodoPreset} />

            {/* Date Range (apenas se custom) */}
            {periodoPreset === 'custom' && (
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(date) => setDateRange(date, endDate)}
                onEndDateChange={(date) => setDateRange(startDate, date)}
              />
            )}

            {/* Mostrar período selecionado */}
            <p className="text-xs text-muted-foreground">
              Período: {new Date(startDate).toLocaleDateString('pt-BR')} até{' '}
              {new Date(endDate).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Status do Produto */}
          <div className="space-y-2">
            <Label>Status do Produto</Label>
            <RadioGroup value={status} onValueChange={(val) => setStatus(val as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="status-all" />
                <Label htmlFor="status-all" className="font-normal cursor-pointer">
                  Todos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="status-active" />
                <Label htmlFor="status-active" className="font-normal cursor-pointer">
                  Apenas Ativos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="status-inactive" />
                <Label htmlFor="status-inactive" className="font-normal cursor-pointer">
                  Apenas Inativos
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Situação do Estoque */}
          <div className="space-y-2">
            <Label>Situação do Estoque</Label>
            <RadioGroup value={estoqueStatus} onValueChange={(val) => setEstoqueStatus(val as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="estoque-all" />
                <Label htmlFor="estoque-all" className="font-normal cursor-pointer">
                  Todos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="com" id="estoque-com" />
                <Label htmlFor="estoque-com" className="font-normal cursor-pointer">
                  Com Estoque
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sem" id="estoque-sem" />
                <Label htmlFor="estoque-sem" className="font-normal cursor-pointer">
                  Sem Estoque
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="critico" id="estoque-critico" />
                <Label htmlFor="estoque-critico" className="font-normal cursor-pointer">
                  Críticos (abaixo do mínimo)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={clearFilters} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
