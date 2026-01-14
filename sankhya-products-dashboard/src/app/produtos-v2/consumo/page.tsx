'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Users, Package, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getMovimentacoesConsumo,
  getConsumoAnalise,
  getPeriodoPadrao,
  formatarValor,
} from '@/lib/api/consumo-service';
import type { ConsumoAnalise, MovimentacaoConsumo, PaginatedResponse } from '@/types/consumo';

export default function ConsumoPage() {
  const [analiseData, setAnaliseData] = useState<ConsumoAnalise | null>(null);
  const [movimentacoesData, setMovimentacoesData] = useState<PaginatedResponse<MovimentacaoConsumo> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const { dataInicio, dataFim } = getPeriodoPadrao(30);

      const [analise, movimentacoes] = await Promise.all([
        getConsumoAnalise(dataInicio, dataFim, 3),
        getMovimentacoesConsumo({ dataInicio, dataFim, page: 1, perPage: 5, atualizaEstoque: 'B' }),
      ]);

      setAnaliseData(analise);
      setMovimentacoesData(movimentacoes);
    } catch (err) {
      console.error('Erro ao carregar dados de consumo:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={loadData}>Tentar Novamente</Button>
      </div>
    );
  }

  if (!analiseData || !movimentacoesData) return null;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consumo de Produtos</h1>
          <p className="text-muted-foreground mt-2">
            Análise completa de movimentações e consumo interno de produtos
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Movimentações</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analiseData.totais.movimentacoes.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Consumidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analiseData.totais.produtos}</div>
            <p className="text-xs text-muted-foreground">Produtos distintos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analiseData.totais.departamentos}</div>
            <p className="text-xs text-muted-foreground">Ativos no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarValor(analiseData.totais.valorTotal)}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Movimentações Recentes</CardTitle>
            <CardDescription>Últimas requisições de produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movimentacoesData.data.map((mov) => (
                <div key={`${mov.nunota}-${mov.sequencia}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Link
                      to={`/produtos-v2/${mov.codprod}`}
                      className="font-medium hover:underline"
                    >
                      {mov.descrprod}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {mov.descrDep || 'Sem depto'} • {mov.nomeusu}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{mov.qtdneg?.toLocaleString('pt-BR')} un</p>
                    <p className="text-sm text-muted-foreground">{formatarValor(mov.vlrtot || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Departamentos</CardTitle>
            <CardDescription>Maiores consumidores do período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analiseData.topDepartamentos.slice(0, 5).map((dep, idx) => (
                <div key={dep.coddep || idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dep.descrDep}</span>
                    <span className="text-muted-foreground">{dep.percentual.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${dep.percentual}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Análises Detalhadas</CardTitle>
          <CardDescription>Acesse relatórios e análises específicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              to="/produtos-v2/consumo/analise"
              className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Análise por Período</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Top produtos e tendências
              </p>
            </Link>

            <div className="flex flex-col items-center justify-center p-6 border rounded-lg opacity-50">
              <Users className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Por Departamento</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Em breve
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border rounded-lg opacity-50">
              <Users className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Por Usuário</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Em breve
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
