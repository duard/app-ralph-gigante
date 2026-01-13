'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StockMetrics {
  negativos: number;
  abaixoMinimo: number;
  acimaMaximo: number;
  semMovimento: number;
  normais: number;
  total: number;
  valorTotalEstoque: number;
  trendNegativos?: number;
  trendAbaixoMinimo?: number;
  trendAcimaMaximo?: number;
  trendSemMovimento?: number;
  trendNormais?: number;
}

const metricConfig = [
  {
    key: 'negativos',
    icon: '🔴',
    label: 'Estoque Negativo',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    priority: 'critical',
  },
  {
    key: 'abaixoMinimo',
    icon: '🟡',
    label: 'Abaixo do Mínimo',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    priority: 'high',
  },
  {
    key: 'acimaMaximo',
    icon: '🔵',
    label: 'Acima do Máximo',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    priority: 'medium',
  },
  {
    key: 'semMovimento',
    icon: '⚫',
    label: 'Sem Movimento',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    priority: 'low',
  },
  {
    key: 'normais',
    icon: '🟢',
    label: 'Estoque OK',
    color: '#10B981',
    bgColor: '#D1FAE5',
    priority: 'normal',
  },
  {
    key: 'total',
    icon: '📊',
    label: 'Total Produtos',
    color: '#6366F1',
    bgColor: '#E0E7FF',
    priority: 'info',
  },
];

interface MetricCardProps {
  metric: (typeof metricConfig)[0];
  value: number;
  trend?: number;
  formatValue?: boolean;
}

function MetricCard({ metric, value, trend, formatValue = true }: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return 'text-muted-foreground';
    if (metric.priority === 'critical' && trend > 0) return 'text-red-600';
    if (metric.priority === 'high' && trend > 0) return 'text-amber-600';
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
        <div className="text-2xl font-bold leading-none" style={{ color: metric.color }}>
          {metric.icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue ? value.toLocaleString('pt-BR') : value}
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center text-xs', getTrendColor())}>
            {getTrendIcon()}
            <span className="ml-1">
              {trend > 0 ? '+' : ''}
              {trend}% vs. mês anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StockSummaryCardsProps {
  metrics: StockMetrics;
  className?: string;
}

export function StockSummaryCards({ metrics, className }: StockSummaryCardsProps) {
  const criticalTotal = metrics.negativos + metrics.abaixoMinimo;
  const healthScore = Math.round(((metrics.normais + metrics.acimaMaximo) / metrics.total) * 100);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Resumo de Estoque</h2>
        <Badge
          variant={healthScore >= 80 ? 'default' : healthScore >= 60 ? 'secondary' : 'destructive'}
          className="text-sm"
        >
          Saúde: {healthScore}%
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricConfig.map((metric) => {
          const value = metrics[metric.key as keyof StockMetrics] as number;
          const trend = metrics[
            `trend${metric.key.charAt(0).toUpperCase() + metric.key.slice(1)}` as keyof StockMetrics
          ] as number;

          return <MetricCard key={metric.key} metric={metric} value={value} trend={trend} />;
        })}
      </div>

      {metrics.valorTotalEstoque > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
            <div className="text-2xl">💰</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(metrics.valorTotalEstoque)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor baseado no custo de aquisição
            </p>
          </CardContent>
        </Card>
      )}

      {criticalTotal > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <span>⚠️</span>
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-red-600">{metrics.negativos}</div>
                <p className="text-sm text-red-700">Estoque Negativo</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{metrics.abaixoMinimo}</div>
                <p className="text-sm text-amber-700">Abaixo do Mínimo</p>
              </div>
            </div>
            <p className="text-sm text-red-600 mt-3">
              Ação recomendada: Verificar produtos críticos imediatamente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
