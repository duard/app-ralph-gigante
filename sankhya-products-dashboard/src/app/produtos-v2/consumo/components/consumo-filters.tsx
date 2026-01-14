import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, RefreshCcw, Search } from 'lucide-react';

interface ConsumoFiltersProps {
  dataInicio: string;
  dataFim: string;
  atualizaEstoque: string;
  searchTerm: string;
  onDataInicioChange: (value: string) => void;
  onDataFimChange: (value: string) => void;
  onAtualizaEstoqueChange: (value: string) => void;
  onSearchTermChange: (value: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export function ConsumoFilters({
  dataInicio,
  dataFim,
  atualizaEstoque,
  searchTerm,
  onDataInicioChange,
  onDataFimChange,
  onAtualizaEstoqueChange,
  onSearchTermChange,
  onApplyFilters,
  onResetFilters,
}: ConsumoFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 bg-muted/50 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="dataInicio">Data Início</Label>
        <Input
          id="dataInicio"
          type="date"
          value={dataInicio}
          onChange={(e) => onDataInicioChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dataFim">Data Fim</Label>
        <Input
          id="dataFim"
          type="date"
          value={dataFim}
          onChange={(e) => onDataFimChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="atualizaEstoque">Tipo de Movimentação</Label>
        <Select value={atualizaEstoque} onValueChange={onAtualizaEstoqueChange}>
          <SelectTrigger id="atualizaEstoque">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="B">Baixar estoque</SelectItem>
            <SelectItem value="E">Entrar no estoque</SelectItem>
            <SelectItem value="N">Não movimenta</SelectItem>
            <SelectItem value="R">Reservar estoque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="search">Buscar Produto</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Nome do produto..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="lg:col-span-4 flex gap-2">
        <Button onClick={onApplyFilters} className="flex-1">
          <Filter className="h-4 w-4 mr-2" />
          Aplicar Filtros
        </Button>
        <Button variant="outline" onClick={onResetFilters}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </div>
    </div>
  );
}
