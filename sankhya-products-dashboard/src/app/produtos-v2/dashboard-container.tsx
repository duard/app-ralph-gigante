'use client';

import { useProdutosV2Dashboard } from '@/hooks/produtos-v2/use-produtos-v2-dashboard';
import { useGrupos, useLocais } from '@/hooks/produtos-v2/use-grupos-locais';
import { useDashboardFiltersStore } from '@/stores/dashboard-filters-store';
import { KpiCard } from '@/components/produtos-v2/kpi-card';
import { KpiCardSkeleton } from '@/components/produtos-v2/kpi-card-skeleton';
import { FilterPanel } from '@/components/produtos-v2/filter-panel';
import { ActiveFilters } from '@/components/produtos-v2/active-filters';
import { GraficoDistribuicaoGrupos } from '@/components/produtos-v2/grafico-distribuicao-grupos';
import { GraficoTop10Valor } from '@/components/produtos-v2/grafico-top10-valor';
import { TabelaProdutosMovimentados } from '@/components/produtos-v2/tabela-produtos-movimentados';
import {
  Package,
  CheckCircle,
  XCircle,
  PackageCheck,
  DollarSign,
  AlertTriangle,
  PackageX,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import type { ActiveFilter } from '@/types/dashboard';

export function DashboardContainer() {
  // Buscar filtros do store
  const filters = useDashboardFiltersStore();
  const { grupos, locais, clearFilters } = filters;

  // Buscar dados com filtros aplicados
  const { data, isLoading, error } = useProdutosV2Dashboard(filters);

  // Buscar grupos e locais para os filtros
  const { data: gruposData = [], isLoading: isLoadingGrupos } = useGrupos();
  const { data: locaisData = [], isLoading: isLoadingLocais } = useLocais();

  // Montar array de filtros ativos para exibição
  const activeFilters = useMemo((): ActiveFilter[] => {
    const active: ActiveFilter[] = [];

    if (grupos.length > 0) {
      const grupoLabels = gruposData
        .filter((g) => grupos.includes(g.codgrupoprod))
        .map((g) => g.descgrupoprod)
        .join(', ');
      active.push({
        key: 'grupos',
        label: 'Grupos',
        value: grupoLabels,
        onRemove: () => filters.setGrupos([]),
      });
    }

    if (locais.length > 0) {
      const localLabels = locaisData
        .filter((l) => locais.includes(l.codlocal))
        .map((l) => l.descrlocal)
        .join(', ');
      active.push({
        key: 'locais',
        label: 'Locais',
        value: localLabels,
        onRemove: () => filters.setLocais([]),
      });
    }

    if (filters.periodoPreset !== 'mes') {
      const periodoLabels: Record<string, string> = {
        hoje: 'Hoje',
        semana: 'Última Semana',
        mes: 'Último Mês',
        trimestre: 'Trimestre',
        ano: 'Ano',
        custom: 'Personalizado',
      };
      active.push({
        key: 'periodo',
        label: 'Período',
        value: periodoLabels[filters.periodoPreset] || 'Personalizado',
        onRemove: () => filters.setPeriodoPreset('mes'),
      });
    }

    if (filters.status !== 'active') {
      active.push({
        key: 'status',
        label: 'Status',
        value: filters.status === 'all' ? 'Todos' : 'Inativos',
        onRemove: () => filters.setStatus('active'),
      });
    }

    if (filters.estoqueStatus !== 'all') {
      const estoqueLabels = {
        all: 'Todos',
        com: 'Com Estoque',
        sem: 'Sem Estoque',
        critico: 'Críticos',
      };
      active.push({
        key: 'estoque',
        label: 'Estoque',
        value: estoqueLabels[filters.estoqueStatus],
        onRemove: () => filters.setEstoqueStatus('all'),
      });
    }

    if (filters.search) {
      active.push({
        key: 'search',
        label: 'Busca',
        value: filters.search,
        onRemove: () => filters.setSearch(''),
      });
    }

    return active;
  }, [filters, grupos, locais, gruposData, locaisData]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        <h3 className="font-medium">Erro ao carregar dados</h3>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  // Formatar valores
  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatNumber = (value: number) => value.toLocaleString('pt-BR');

  return (
    <div className="space-y-4">
      {/* Header com botão de filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard de Produtos</h2>
          <p className="text-muted-foreground">Visão completa do estoque e movimentações</p>
        </div>
        <FilterPanel
          grupos={gruposData}
          locais={locaisData}
          isLoadingGrupos={isLoadingGrupos}
          isLoadingLocais={isLoadingLocais}
        />
      </div>

      {/* Filtros ativos */}
      {activeFilters.length > 0 && (
        <ActiveFilters filters={activeFilters} onClearAll={clearFilters} />
      )}

      {/* KPI Cards */}
      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* KPI Cards - Linha 1 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total de Produtos"
              value={formatNumber(data.totalProdutos)}
              icon={<Package className="h-6 w-6" />}
              href="/produtos-v2/listagem"
              variant="info"
            />

            <KpiCard
              title="Produtos Ativos"
              value={formatNumber(data.totalAtivos)}
              icon={<CheckCircle className="h-6 w-6" />}
              href="/produtos-v2/listagem?status=active"
              variant="success"
            />

            <KpiCard
              title="Quantidade em Estoque"
              value={formatNumber(data.quantidadeEmEstoque)}
              icon={<PackageCheck className="h-6 w-6" />}
              variant="success"
            />

            <KpiCard
              title="Valor Total em Estoque"
              value={formatCurrency(data.valorTotalEstoque)}
              icon={<DollarSign className="h-6 w-6" />}
              variant="success"
            />
          </div>

          {/* KPI Cards - Linha 2 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Produtos Críticos"
              value={formatNumber(data.produtosCriticos)}
              icon={<AlertTriangle className="h-6 w-6" />}
              href="/produtos-v2/listagem?critico=true"
              variant="warning"
            />

            <KpiCard
              title="Sem Estoque"
              value={formatNumber(data.produtosSemEstoque)}
              icon={<PackageX className="h-6 w-6" />}
              href="/produtos-v2/listagem?estoque=sem"
              variant="danger"
            />

            <KpiCard
              title="Ticket Médio"
              value={formatCurrency(data.ticketMedio)}
              icon={<TrendingUp className="h-6 w-6" />}
              variant="info"
            />

            <KpiCard
              title="Produtos Inativos"
              value={formatNumber(data.totalInativos)}
              icon={<XCircle className="h-6 w-6" />}
              href="/produtos-v2/listagem?status=inactive"
              variant="default"
            />
          </div>

          {/* Gráficos */}
          <div className="grid gap-4 md:grid-cols-2">
            <GraficoDistribuicaoGrupos filters={filters} />
            <GraficoTop10Valor filters={filters} />
          </div>

          {/* Tabela de Produtos Movimentados */}
          <TabelaProdutosMovimentados filters={filters} limit={20} />
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <KpiCardSkeleton key={i + 4} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-80 rounded-lg border bg-muted/20" />
        <div className="h-80 rounded-lg border bg-muted/20" />
      </div>

      <div className="h-64 rounded-lg border bg-muted/20" />
    </div>
  );
}
