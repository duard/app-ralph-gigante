'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Users, Package } from 'lucide-react';

export default function ConsumoPage() {
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
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground">+20% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Consumidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground">Produtos distintos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Ativos no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 125.000</div>
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
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">FOLHAS A4 SULFITE</p>
                  <p className="text-sm text-muted-foreground">TI • CONVIDADE</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">10 un</p>
                  <p className="text-sm text-muted-foreground">R$ 255,00</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">CANETA ESFEROGRÁFICA</p>
                  <p className="text-sm text-muted-foreground">Financeiro • ADMIN</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">50 un</p>
                  <p className="text-sm text-muted-foreground">R$ 75,00</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">PAPEL TOALHA</p>
                  <p className="text-sm text-muted-foreground">RH • MARIA</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">5 un</p>
                  <p className="text-sm text-muted-foreground">R$ 125,00</p>
                </div>
              </div>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">TI</span>
                  <span className="text-muted-foreground">50%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '50%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Financeiro</span>
                  <span className="text-muted-foreground">33%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '33%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">RH</span>
                  <span className="text-muted-foreground">17%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '17%' }} />
                </div>
              </div>
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
            <a
              href="/produtos-v2/consumo/analise"
              className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Análise por Período</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Top produtos e tendências
              </p>
            </a>

            <a
              href="/produtos-v2/consumo/departamentos"
              className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <Users className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Por Departamento</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Consumo por área
              </p>
            </a>

            <a
              href="/produtos-v2/consumo/usuarios"
              className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <Users className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Por Usuário</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Requisições por pessoa
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
