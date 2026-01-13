'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface StockFilterOptions {
  statusEstoque?: 'NEGATIVO' | 'ABAIXO_MINIMO' | 'ACIMA_MAXIMO' | 'SEMOVIMENTO' | 'ZERO' | 'NORMAL';
  comMovimento?: boolean;
  semMovimento?: boolean;
}

interface StockFiltersProps {
  activeFilters: StockFilterOptions;
  onFilterChange: (filters: Partial<StockFilterOptions>) => void;
  onClearFilters: () => void;
  className?: string;
}

const stockStatusFilters = [
  {
    key: 'statusEstoque',
    value: 'NEGATIVO' as const,
    icon: '🔴',
    label: 'Estoque Negativo',
    color: '#DC2626',
    bgColor: '#FEE2E2',
  },
  {
    key: 'statusEstoque',
    value: 'ABAIXO_MINIMO' as const,
    icon: '🟡',
    label: 'Abaixo do Mínimo',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    key: 'statusEstoque',
    value: 'ACIMA_MAXIMO' as const,
    icon: '🔵',
    label: 'Acima do Máximo',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
  },
  {
    key: 'statusEstoque',
    value: 'SEMOVIMENTO' as const,
    icon: '⚫',
    label: 'Sem Movimento',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
  {
    key: 'statusEstoque',
    value: 'ZERO' as const,
    icon: '⚪',
    label: 'Sem Estoque',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
  {
    key: 'statusEstoque',
    value: 'NORMAL' as const,
    icon: '🟢',
    label: 'Estoque OK',
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
];

const movementFilters = [
  {
    key: 'comMovimento',
    value: true as const,
    icon: '🔄',
    label: 'Com Movimento',
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
  {
    key: 'semMovimento',
    value: true as const,
    icon: '🛑',
    label: 'Sem Movimento',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
];

interface FilterButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  color: string;
  bgColor: string;
  onClick: () => void;
}

function FilterButton({ icon, label, isActive, color, bgColor, onClick }: FilterButtonProps) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={cn('flex items-center gap-2 transition-all duration-200', isActive && 'shadow-sm')}
      style={{
        backgroundColor: isActive ? color : 'transparent',
        borderColor: isActive ? color : undefined,
        color: isActive ? 'white' : color,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {isActive && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'white' }} />}
    </Button>
  );
}

export function StockFilters({
  activeFilters,
  onFilterChange,
  onClearFilters,
  className,
}: StockFiltersProps) {
  const hasActiveFilters = React.useMemo(() => {
    return Object.values(activeFilters).some((value) => value !== undefined);
  }, [activeFilters]);

  const handleStatusFilter = (status: string) => {
    if (activeFilters.statusEstoque === status) {
      onFilterChange({ statusEstoque: undefined });
    } else {
      onFilterChange({ statusEstoque: status as any });
    }
  };

  const handleMovementFilter = (key: 'comMovimento' | 'semMovimento', value: boolean) => {
    if (key === 'comMovimento') {
      onFilterChange({
        comMovimento: activeFilters.comMovimento ? undefined : value,
        semMovimento: undefined,
      });
    } else {
      onFilterChange({
        semMovimento: activeFilters.semMovimento ? undefined : value,
        comMovimento: undefined,
      });
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Filtros de Estoque</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
            Limpar todos
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Status do Estoque</p>
          <div className="flex flex-wrap gap-2">
            {stockStatusFilters.map((filter) => (
              <FilterButton
                key={filter.value}
                icon={filter.icon}
                label={filter.label}
                isActive={activeFilters.statusEstoque === filter.value}
                color={filter.color}
                bgColor={filter.bgColor}
                onClick={() => handleStatusFilter(filter.value)}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Movimentação</p>
          <div className="flex gap-2">
            {movementFilters.map((filter) => (
              <FilterButton
                key={filter.key}
                icon={filter.icon}
                label={filter.label}
                isActive={activeFilters[filter.key as keyof StockFilterOptions] === filter.value}
                color={filter.color}
                bgColor={filter.bgColor}
                onClick={() =>
                  handleMovementFilter(filter.key as 'comMovimento' | 'semMovimento', filter.value)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-xs text-muted-foreground">Filtros ativos:</span>
          {activeFilters.statusEstoque && (
            <Badge variant="secondary" className="text-xs">
              {stockStatusFilters.find((f) => f.value === activeFilters.statusEstoque)?.icon}{' '}
              {stockStatusFilters.find((f) => f.value === activeFilters.statusEstoque)?.label}
            </Badge>
          )}
          {activeFilters.comMovimento && (
            <Badge variant="secondary" className="text-xs">
              🔄 Com Movimento
            </Badge>
          )}
          {activeFilters.semMovimento && (
            <Badge variant="secondary" className="text-xs">
              🛑 Sem Movimento
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
