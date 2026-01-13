import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { type FiltroOpcao } from '@/hooks/produtos-v2/use-produtos-v2-filtros';
import { FilterX } from 'lucide-react';

interface FilterPanelProps {
  search: string;
  setSearch: (value: string) => void;
  grupos: string[];
  setGrupos: (value: string[]) => void;
  locais: string[];
  setLocais: (value: string[]) => void;
  controles: string[];
  setControles: (value: string[]) => void;
  marcas: string[];
  setMarcas: (value: string[]) => void;
  ativo: string;
  setAtivo: (value: string) => void;
  comEstoque: boolean;
  setComEstoque: (value: boolean) => void;
  semEstoque: boolean;
  setSemEstoque: (value: boolean) => void;
  critico: boolean;
  setCritico: (value: boolean) => void;
  estoqueMin: string;
  setEstoqueMin: (value: string) => void;
  estoqueMax: string;
  setEstoqueMax: (value: string) => void;
  gruposOptions: FiltroOpcao[];
  locaisOptions: FiltroOpcao[];
  controlesOptions: FiltroOpcao[];
  marcasOptions: FiltroOpcao[];
  isLoading: boolean;
  onClearFilters: () => void;
}

export function FilterPanel({
  search,
  setSearch,
  grupos,
  setGrupos,
  locais,
  setLocais,
  controles,
  setControles,
  marcas,
  setMarcas,
  ativo,
  setAtivo,
  comEstoque,
  setComEstoque,
  semEstoque,
  setSemEstoque,
  critico,
  setCritico,
  estoqueMin,
  setEstoqueMin,
  estoqueMax,
  setEstoqueMax,
  gruposOptions,
  locaisOptions,
  controlesOptions,
  marcasOptions,
  isLoading,
  onClearFilters,
}: FilterPanelProps) {
  const activeFiltersCount =
    [search, ...grupos, ...locais, ...controles, ...marcas, ativo, estoqueMin, estoqueMax].filter(
      Boolean
    ).length +
    (comEstoque ? 1 : 0) +
    (semEstoque ? 1 : 0) +
    (critico ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filtros</h3>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'} ativo
              {activeFiltersCount === 1 ? '' : 's'}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClearFilters} disabled={isLoading}>
              <FilterX className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">Busca</Label>
          <Input
            id="search"
            placeholder="Buscar por descrição, referência, marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grupos">Grupos</Label>
          <MultiSelect
            options={gruposOptions.map((opt) => ({
              value: opt.codigo.toString(),
              label: `${opt.descricao} (${opt.contagem})`,
            }))}
            value={grupos}
            onChange={setGrupos}
            placeholder="Selecione grupos..."
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="locais">Locais</Label>
          <MultiSelect
            options={locaisOptions.map((opt) => ({
              value: opt.codigo.toString(),
              label: `${opt.descricao} (${opt.contagem})`,
            }))}
            value={locais}
            onChange={setLocais}
            placeholder="Selecione locais..."
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="controles">Tipos de Controle</Label>
          <MultiSelect
            options={controlesOptions.map((opt) => ({
              value: opt.codigo.toString(),
              label: `${opt.descricao} (${opt.contagem})`,
            }))}
            value={controles}
            onChange={setControles}
            placeholder="Selecione controles..."
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marcas">Marcas</Label>
          <MultiSelect
            options={marcasOptions.map((opt) => ({
              value: opt.codigo.toString(),
              label: `${opt.descricao} (${opt.contagem})`,
            }))}
            value={marcas}
            onChange={setMarcas}
            placeholder="Selecione marcas..."
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ativo">Status</Label>
          <Select value={ativo} onValueChange={setAtivo} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="S">Ativo</SelectItem>
              <SelectItem value="N">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estoqueMin">Estoque Mínimo</Label>
          <Input
            id="estoqueMin"
            type="number"
            placeholder="Mínimo"
            value={estoqueMin}
            onChange={(e) => setEstoqueMin(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estoqueMax">Estoque Máximo</Label>
          <Input
            id="estoqueMax"
            type="number"
            placeholder="Máximo"
            value={estoqueMax}
            onChange={(e) => setEstoqueMax(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="comEstoque"
            checked={comEstoque}
            onCheckedChange={(checked) => setComEstoque(!!checked)}
            disabled={isLoading}
          />
          <Label htmlFor="comEstoque">Com estoque</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="semEstoque"
            checked={semEstoque}
            onCheckedChange={(checked) => setSemEstoque(!!checked)}
            disabled={isLoading}
          />
          <Label htmlFor="semEstoque">Sem estoque</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="critico"
            checked={critico}
            onCheckedChange={(checked) => setCritico(!!checked)}
            disabled={isLoading}
          />
          <Label htmlFor="critico">Estoque crítico</Label>
        </div>
      </div>
    </div>
  );
}
