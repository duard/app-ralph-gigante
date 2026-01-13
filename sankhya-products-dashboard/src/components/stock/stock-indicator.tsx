'use client';

import * as React from 'react';
import { differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface StockIndicatorProps {
  estoque: number;
  estmin?: number;
  estmax?: number;
  ultimaMovimentacao?: string | Date;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

type StockStatus = {
  icon: string;
  color: string;
  bgColor: string;
  status: string;
  text: string;
  priority: number;
};

const stockStatusConfig: Record<string, StockStatus> = {
  NEGATIVO: {
    icon: '🔴',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    status: 'NEGATIVO',
    text: 'Estoque Negativo',
    priority: 1,
  },
  ZERO: {
    icon: '⚪',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    status: 'ZERO',
    text: 'Sem Estoque',
    priority: 5,
  },
  ABAIXO_MINIMO: {
    icon: '🟡',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    status: 'ABAIXO_MINIMO',
    text: 'Abaixo do Mínimo',
    priority: 2,
  },
  ACIMA_MAXIMO: {
    icon: '🔵',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    status: 'ACIMA_MAXIMO',
    text: 'Acima do Máximo',
    priority: 4,
  },
  SEMOVIMENTO: {
    icon: '⚫',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    status: 'SEMOVIMENTO',
    text: 'Sem Movimento',
    priority: 3,
  },
  NORMAL: {
    icon: '🟢',
    color: '#10B981',
    bgColor: '#D1FAE5',
    status: 'NORMAL',
    text: 'Estoque OK',
    priority: 6,
  },
};

function calculateStockStatus(
  estoque: number,
  estmin?: number,
  estmax?: number,
  ultimaMovimentacao?: string | Date
): StockStatus {
  if (estoque < 0) {
    return stockStatusConfig.NEGATIVO;
  }

  if (estoque === 0) {
    return stockStatusConfig.ZERO;
  }

  if (estmin && estoque < estmin) {
    return stockStatusConfig.ABAIXO_MINIMO;
  }

  if (estmax && estoque > estmax) {
    return stockStatusConfig.ACIMA_MAXIMO;
  }

  if (ultimaMovimentacao) {
    const ultimaData =
      typeof ultimaMovimentacao === 'string' ? new Date(ultimaMovimentacao) : ultimaMovimentacao;
    const diasSemMovimento = differenceInDays(new Date(), ultimaData);
    if (diasSemMovimento > 90) {
      return stockStatusConfig.SEMOVIMENTO;
    }
  }

  return stockStatusConfig.NORMAL;
}

export function StockIndicator({
  estoque,
  estmin,
  estmax,
  ultimaMovimentacao,
  className,
  size = 'md',
  showBadge = true,
}: StockIndicatorProps) {
  const status = calculateStockStatus(estoque, estmin, estmax, ultimaMovimentacao);

  const sizeClasses = {
    sm: {
      icon: 'text-sm',
      text: 'text-sm font-medium',
      badge: 'text-xs',
    },
    md: {
      icon: 'text-base',
      text: 'text-base font-medium',
      badge: 'text-xs',
    },
    lg: {
      icon: 'text-lg',
      text: 'text-lg font-semibold',
      badge: 'text-sm',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(currentSize.text, 'flex items-center gap-1')}
        style={{ color: status.color }}
      >
        <span className={currentSize.icon}>{status.icon}</span>
        <span>{estoque}</span>
      </span>

      {showBadge && size !== 'sm' && (
        <Badge
          variant="outline"
          className={cn(currentSize.badge, 'border-current')}
          style={{
            borderColor: status.color,
            color: status.color,
            backgroundColor: status.bgColor,
          }}
        >
          {status.text}
        </Badge>
      )}

      {showBadge && size === 'sm' && (
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: status.color }}
          title={status.text}
        />
      )}
    </div>
  );
}

export function usePriorityStockStatus(
  locais: Array<{
    estoque: number;
    estmin?: number;
    estmax?: number;
    ultimaMovimentacao?: string | Date;
  }>
): StockStatus {
  return React.useMemo(() => {
    if (!locais || locais.length === 0) {
      return stockStatusConfig.ZERO;
    }

    const statusList = locais.map((local) =>
      calculateStockStatus(local.estoque, local.estmin, local.estmax, local.ultimaMovimentacao)
    );

    return statusList.reduce((pior, atual) => (atual.priority < pior.priority ? atual : pior));
  }, [locais]);
}
