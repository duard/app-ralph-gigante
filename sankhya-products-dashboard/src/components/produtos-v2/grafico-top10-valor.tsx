import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTop10ProdutosPorValor } from '@/hooks/produtos-v2/use-dashboard-charts';
import type { DashboardFilters } from '@/types/dashboard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface GraficoTop10ValorProps {
  filters?: Partial<DashboardFilters>;
}

const COLORS = [
  '#10b981', // 1º - verde mais forte
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e', // 10º - vermelho
];

export function GraficoTop10Valor({ filters }: GraficoTop10ValorProps) {
  const { data, isLoading, error } = useTop10ProdutosPorValor(filters);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produtos Mais Caros</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Erro ao carregar dados</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produtos Mais Caros</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produtos Mais Caros</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  const chartData = data.map((produto) => ({
    name:
      produto.descrprod.length > 30
        ? produto.descrprod.substring(0, 30) + '...'
        : produto.descrprod,
    fullName: produto.descrprod,
    referencia: produto.referencia,
    grupo: produto.grupo,
    precoUnitario: produto.valorUnitario,
    totalVendido: produto.totalVendido,
    ultimaVenda: produto.ultimaVenda,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 max-w-xs">
          <p className="font-semibold text-sm">{data.fullName}</p>
          {data.referencia && (
            <p className="text-xs text-muted-foreground">Ref: {data.referencia}</p>
          )}
          {data.grupo && <p className="text-xs text-muted-foreground mb-1">{data.grupo}</p>}
          <p className="text-sm font-medium text-primary">
            Preço Médio de Venda: R${' '}
            {data.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">
            Total vendido: {data.totalVendido.toLocaleString('pt-BR')} unidades
          </p>
          {data.ultimaVenda && (
            <p className="text-xs text-muted-foreground">
              Última venda: {new Date(data.ultimaVenda).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const precoMedio = data.reduce((sum, p) => sum + p.valorUnitario, 0) / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Produtos Mais Caros</CardTitle>
        <CardDescription>
          Baseado em vendas reais (preço médio: R${' '}
          {precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={(value) =>
                value >= 1000 ? `R$ ${(value / 1000).toFixed(1)}k` : `R$ ${value.toFixed(0)}`
              }
            />
            <YAxis type="category" dataKey="name" width={95} style={{ fontSize: '11px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="precoUnitario" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
