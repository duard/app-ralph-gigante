'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, Users, Building, Loader2, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getConsumoAnalise,
  getPeriodoPadrao,
  formatarValor,
  formatarPercentual,
} from '@/lib/api/consumo-service';
import type { ConsumoAnalise } from '@/types/consumo';

export default function ConsumoAnalisePage() {
  const [data, setData] = useState<ConsumoAnalise | null>(null);
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
      const result = await getConsumoAnalise(dataInicio, dataFim, 10);
      setData(result);
    } catch (err) {
      console.error('Erro ao carregar análise de consumo:', err);
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

  if (!data) return null;

  const mediaDiaria = data.periodo.dias > 0 ? data.totais.valorTotal / data.periodo.dias : 0;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise de Consumo por Período</h1>
        <p className="text-muted-foreground mt-2">
          {data.periodo.dias} dias • {new Date(data.periodo.inicio).toLocaleDateString('pt-BR')} a{' '}
          {new Date(data.periodo.fim).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Period Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totais.movimentacoes.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              {data.totais.produtos} produtos distintos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quantidade Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totais.quantidadeTotal.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Unidades consumidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarValor(data.totais.valorTotal)}</div>
            <p className="text-xs text-muted-foreground">Custo total do período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarValor(mediaDiaria)}</div>
            <p className="text-xs text-muted-foreground">Por dia</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Charts */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top 10 Produtos
            </CardTitle>
            <CardDescription>Mais consumidos no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProdutos.slice(0, 10).map((item, idx) => (
                <div key={item.codprod} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Link
                      to={`/produtos-v2/${item.codprod}`}
                      className="font-medium truncate hover:underline"
                    >
                      {item.descrprod}
                    </Link>
                    <span className="text-muted-foreground ml-2">
                      {item.percentual.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.percentual}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.quantidade.toLocaleString('pt-BR')} un
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Departamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Top Departamentos
            </CardTitle>
            <CardDescription>Maiores consumidores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topDepartamentos.slice(0, 10).map((item, idx) => (
                <div key={item.coddep || idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.descrDep}</span>
                    <span className="text-muted-foreground">{item.percentual.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.percentual}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatarValor(item.valor)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Usuários
            </CardTitle>
            <CardDescription>Mais requisições</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topUsuarios.slice(0, 10).map((item, idx) => (
                <div key={item.codusuinc || idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.nomeusu}</span>
                    <span className="text-muted-foreground">{item.percentual.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.percentual}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.quantidade.toLocaleString('pt-BR')} un
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Completo de Produtos</CardTitle>
          <CardDescription>Top 20 produtos mais consumidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.topProdutos.slice(0, 20).map((produto, idx) => (
              <div
                key={produto.codprod}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{produto.descrprod}</p>
                  <p className="text-sm text-muted-foreground">
                    Código: {produto.codprod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{produto.quantidade.toLocaleString('pt-BR')} un</p>
                  <p className="text-sm text-muted-foreground">
                    {formatarValor(produto.valor)}
                  </p>
                </div>
                <Badge variant={idx < 3 ? 'default' : 'secondary'}>
                  {produto.percentual.toFixed(1)}%
                </Badge>
                <Link to={`/produtos-v2/${produto.codprod}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
