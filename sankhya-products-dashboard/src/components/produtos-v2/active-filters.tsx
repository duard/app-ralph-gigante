import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, XCircle } from 'lucide-react';
import type { ActiveFilter } from '@/types/dashboard';

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilters({ filters, onClearAll, className }: ActiveFiltersProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Filtros ativos:</span>

        {filters.map((filter) => (
          <Badge key={filter.key} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
            <span className="text-xs">
              <span className="font-semibold">{filter.label}:</span>{' '}
              {Array.isArray(filter.value) ? `${filter.value.length} itens` : filter.value}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={filter.onRemove}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remover filtro {filter.label}</span>
            </Button>
          </Badge>
        ))}

        {filters.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <XCircle className="h-3 w-3" />
            Limpar todos
          </Button>
        )}
      </div>
    </div>
  );
}
