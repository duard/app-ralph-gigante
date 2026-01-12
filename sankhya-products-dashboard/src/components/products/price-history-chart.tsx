'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/product-utils';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading';
import type { PriceHistoryEntry } from '@/hooks/use-product-price-history';

interface PriceHistoryChartProps {
  data: PriceHistoryEntry[];
  isLoading?: boolean;
  onPeriodChange?: (period: '30' | '90') => void;
  averagePrice?: number;
  priceTrend?: { trend: 'increase' | 'decrease' | 'stable'; percentage: number };
}

export function PriceHistoryChart({
  data,
  isLoading = false,
  onPeriodChange,
  averagePrice,
  priceTrend,
}: PriceHistoryChartProps) {
  // Transform data for Recharts
  const chartData = React.useMemo(() => {
    return data
      .filter((item) => item.valor_mov && item.data_referencia)
      .map((item) => ({
        date: new Date(item.data_referencia).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        price: Math.abs(item.valor_mov || 0),
        unitPrice:
          item.quantidade_mov && item.quantidade_mov !== 0
            ? Math.abs((item.valor_mov || 0) / item.quantidade_mov)
            : 0,
        quantity: Math.abs(item.quantidade_mov || 0),
        type: item.tipo_movimentacao || 'Movimentação',
      }))
      .slice(-30); // Show last 30 entries for better visibility
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-sm text-muted-foreground">{data.type}</p>
          <p className="text-sm">
            Valor Total: <span className="font-medium">{formatCurrency(data.price)}</span>
          </p>
          <p className="text-sm">
            Preço Unit: <span className="font-medium">{formatCurrency(data.unitPrice)}</span>
          </p>
          <p className="text-sm">
            Quantidade: <span className="font-medium">{data.quantity}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = () => {
    switch (priceTrend?.trend) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (priceTrend?.trend) {
      case 'increase':
        return 'text-green-600 bg-green-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Preços
          </CardTitle>
          <CardDescription>Análise de variação de preços ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState
            type="spinner"
            size="md"
            message="Carregando histórico de preços..."
            className="h-[300px]"
          />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Preços
          </CardTitle>
          <CardDescription>Análise de variação de preços ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Calendar className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-center">
              Nenhum dado de histórico de preços encontrado para este período.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Preços
            </CardTitle>
            <CardDescription>Análise de variação de preços ao longo do tempo</CardDescription>
          </div>

          {priceTrend && (
            <Badge className={getTrendColor()} variant="secondary">
              {getTrendIcon()}
              <span className="ml-1">
                {priceTrend.trend === 'increase'
                  ? 'Alta'
                  : priceTrend.trend === 'decrease'
                    ? 'Baixa'
                    : 'Estável'}{' '}
                {priceTrend.percentage.toFixed(1)}%
              </span>
            </Badge>
          )}
        </div>

        {averagePrice && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              Preço Médio do Período:{' '}
              <span className="font-medium">{formatCurrency(averagePrice)}</span>
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="unitPrice"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Preço Unitário"
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Valor Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Period Selection */}
          {onPeriodChange && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Exibindo os últimos {chartData.length} registros
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onPeriodChange('30')}>
                  30 dias
                </Button>
                <Button variant="outline" size="sm" onClick={() => onPeriodChange('90')}>
                  90 dias
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PriceHistoryChart;
