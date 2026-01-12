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
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, LineChartIcon } from 'lucide-react';

import { useProducts } from '@/hooks/use-products';
import { useProductPriceHistory } from '@/hooks/use-product-price-history';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LoadingState } from '@/components/ui/loading';

// Define CustomTooltip outside component to avoid creation during render
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    };
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{`Data: ${label}`}</p>
        <p className="text-blue-600">{`Preço: ${formatCurrency(data.price)}`}</p>
        <p className="text-gray-600">{`Quantidade: ${data.quantity} un`}</p>
        <p className="text-sm text-gray-500">{`Tipo: ${data.type}`}</p>
      </div>
    );
  }
  return null;
};

interface PriceTrendChartProps {
  className?: string;
  height?: number;
}

interface PriceTrendData {
  product: string;
  codprod: number;
  averagePrice: number;
  priceChange: number;
  trend: 'increase' | 'decrease' | 'stable';
  dataPoints: number;
  lastUpdated: string;
}

export function PriceTrendChart({ className, height = 400 }: PriceTrendChartProps) {
  const { products } = useProducts();
  const { fetchLast30Days, fetchLast90Days, getAveragePrice, getPriceTrend, isLoading, error } =
    useProductPriceHistory();

  const [chartType, setChartType] = React.useState<'line' | 'area'>('area');
  const [period, setPeriod] = React.useState<'30' | '90'>('30');
  const [priceTrends, setPriceTrends] = React.useState<PriceTrendData[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<number | null>(null);
  const [detailedData, setDetailedData] = React.useState<any[]>([]);

  // Load price trends for top products
  const loadPriceTrends = React.useCallback(async () => {
    if (!products.length) return;

    try {
      // Get top 10 products by price for trend analysis
      const topProducts = products
        .filter((p) => p.vlrvenda && p.vlrvenda > 0)
        .sort((a, b) => (b.vlrvenda || 0) - (a.vlrvenda || 0))
        .slice(0, 10);

      const trends: PriceTrendData[] = [];

      for (const product of topProducts) {
        try {
          const history = await (period === '30'
            ? fetchLast30Days(product.codprod)
            : fetchLast90Days(product.codprod));

          if (history && history.movimentacoes.length > 0) {
            const avgPrice = getAveragePrice();
            const trend = getPriceTrend();

            trends.push({
              product: product.descrprod || `Produto ${product.codprod}`,
              codprod: product.codprod,
              averagePrice: avgPrice,
              priceChange: trend.percentage,
              trend: trend.trend as 'increase' | 'decrease' | 'stable',
              dataPoints: history.movimentacoes.length,
              lastUpdated: history.dataFim,
            });
          }
        } catch (_error) {
          // Skip products with no history data
          console.warn(`Could not load price history for product ${product.codprod}`);
        }
      }

      setPriceTrends(trends);
    } catch (error) {
      console.error('Error loading price trends:', error);
      toast.error('Erro ao carregar tendências de preços');
    }
  }, [products, period, fetchLast30Days, fetchLast90Days, getAveragePrice, getPriceTrend]);

  React.useEffect(() => {
    loadPriceTrends();
  }, [loadPriceTrends]);

  // Load detailed chart data when a product is selected
  const loadDetailedData = React.useCallback(async () => {
    if (!selectedProduct) {
      setDetailedData([]);
      return;
    }

    try {
      const history = await (period === '30'
        ? fetchLast30Days(selectedProduct)
        : fetchLast90Days(selectedProduct));

      if (history && history.movimentacoes.length > 0) {
        // Transform data for chart
        const chartData = history.movimentacoes
          .filter((mov) => mov.data_referencia && mov.preco_unitario)
          .sort(
            (a, b) => new Date(a.data_referencia).getTime() - new Date(b.data_referencia).getTime()
          )
          .map((mov) => ({
            date: new Date(mov.data_referencia).toLocaleDateString('pt-BR'),
            price: mov.preco_unitario || 0,
            quantity: Math.abs(mov.quantidade_mov || 0),
            type: mov.tipo_movimentacao || 'Movimentação',
          }));

        setDetailedData(chartData);
      }
    } catch (error) {
      console.error('Error loading detailed price data:', error);
      toast.error('Erro ao carregar dados detalhados do produto');
    }
  }, [selectedProduct, period, fetchLast30Days, fetchLast90Days]);

  React.useEffect(() => {
    loadDetailedData();
  }, [loadDetailedData]);

  const handlePeriodChange = (newPeriod: '30' | '90') => {
    setPeriod(newPeriod);
    setSelectedProduct(null);
    setDetailedData([]);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increase':
        return 'text-green-600 bg-green-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tendência de Preços
          </CardTitle>
          <CardDescription>
            Análise de variação de preços dos produtos mais recentes
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
          >
            {chartType === 'line' ? (
              <LineChartIcon className="h-4 w-4" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-center py-8 text-red-500">
            <p>Erro ao carregar dados: {error}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <LoadingState type="spinner" size="md" message="Carregando tendências de preços..." />
          </div>
        )}

        {!isLoading && !error && priceTrends.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum dado de preço disponível para análise</p>
          </div>
        )}

        {!isLoading && !error && priceTrends.length > 0 && (
          <div className="space-y-6">
            {/* Price Trends Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priceTrends.slice(0, 6).map((trend) => (
                <div
                  key={trend.codprod}
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50',
                    selectedProduct === trend.codprod && 'ring-2 ring-blue-500 bg-blue-50'
                  )}
                  onClick={() =>
                    setSelectedProduct(selectedProduct === trend.codprod ? null : trend.codprod)
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate flex-1 mr-2">{trend.product}</h4>
                    {getTrendIcon(trend.trend)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold">{formatCurrency(trend.averagePrice)}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', getTrendColor(trend.trend))}
                      >
                        {trend.trend === 'increase' && '+'}
                        {trend.priceChange.toFixed(1)}%
                      </Badge>
                      <span className="text-xs text-gray-500">{trend.dataPoints} mov.</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Price Chart */}
            {selectedProduct && detailedData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Histórico Detalhado -{' '}
                  {priceTrends.find((t) => t.codprod === selectedProduct)?.product}
                </h3>
                <ResponsiveContainer width="100%" height={height}>
                  {chartType === 'line' ? (
                    <LineChart data={detailedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Preço Unitário"
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart data={detailedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        fill="#3b82f660"
                        name="Preço Unitário"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            {selectedProduct && detailedData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Carregando dados detalhados...</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
