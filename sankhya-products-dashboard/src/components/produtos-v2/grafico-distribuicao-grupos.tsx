import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDistribuicaoPorGrupo } from '@/hooks/produtos-v2/use-dashboard-charts';
import type { DashboardFilters } from '@/types/dashboard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface GraficoDistribuicaoGruposProps {
  filters?: Partial<DashboardFilters>;
}

const COLORS = [
  '#10b981', // green-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#a855f7', // purple-500
];

export function GraficoDistribuicaoGrupos({ filters }: GraficoDistribuicaoGruposProps) {
  const { data, isLoading, error } = useDistribuicaoPorGrupo(filters);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Grupo</CardTitle>
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
          <CardTitle>Distribuição por Grupo</CardTitle>
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
          <CardTitle>Distribuição por Grupo</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  const chartData = data.map((grupo) => ({
    name: grupo.descgrupoprod,
    value: grupo.totalProdutos,
    percentual: grupo.percentual,
  }));

  const totalProdutos = data.reduce((sum, g) => sum + g.totalProdutos, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString('pt-BR')} produtos ({data.percentual.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Grupo</CardTitle>
        <CardDescription>
          Top 10 grupos por quantidade de produtos ({totalProdutos.toLocaleString('pt-BR')} total)
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentual }) => `${percentual.toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => {
                const data = entry.payload;
                return `${value} (${data.value})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
