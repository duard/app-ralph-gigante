'use client';

import { useProdutosV2Dashboard } from '@/hooks/produtos-v2/use-produtos-v2-dashboard';
import { KpiCard } from '@/components/produtos-v2/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Tags, Warehouse, AlertTriangle, DollarSign } from 'lucide-react';

export function DashboardContainer() {
  const { data, isLoading, error } = useProdutosV2Dashboard();

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        <h3 className="font-medium">Erro ao carregar dados</h3>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Produtos"
          value={data.totalProdutos}
          icon={<Package className="h-6 w-6" />}
          href="/produtos-v2/listagem"
        />

        <KpiCard
          title="Grupos"
          value={data.totalGrupos}
          icon={<Tags className="h-6 w-6" />}
          href="/produtos-v2/listagem?view=grupos"
        />

        <KpiCard
          title="Locais"
          value={data.totalLocais}
          icon={<Warehouse className="h-6 w-6" />}
          href="/produtos-v2/listagem?view=locais"
        />

        <KpiCard
          title="Críticos"
          value={data.produtosCriticos}
          icon={<AlertTriangle className="h-6 w-6" />}
          href="/produtos-v2/listagem?critico=true"
        />

        <KpiCard
          title="Valor Total"
          value={`R$ ${data.valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-6 w-6" />}
        />
      </div>

      {/* Placeholder for charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Grupo</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Gráfico de distribuição por grupo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 por Valor</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Gráfico de top 10 produtos por valor</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for top products table */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Movimentados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Tabela de produtos mais movimentados</p>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>

      <Skeleton className="h-64 w-full" />
    </div>
  );
}
