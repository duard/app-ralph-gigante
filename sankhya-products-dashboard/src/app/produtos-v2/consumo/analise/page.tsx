'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, Users, Building } from 'lucide-react';

export default function ConsumoAnalisePage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise de Consumo por Período</h1>
        <p className="text-muted-foreground mt-2">
          Últimos 30 dias • 01/12/2025 a 13/01/2026
        </p>
      </div>

      {/* Period Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground">+20% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quantidade Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.000</div>
            <p className="text-xs text-muted-foreground">Unidades consumidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 125.000</div>
            <p className="text-xs text-muted-foreground">Custo total do período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 4.166</div>
            <p className="text-xs text-muted-foreground">Por dia útil</p>
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
              {[
                { nome: 'FOLHAS A4', qtd: 5000, perc: 33.33 },
                { nome: 'CANETA AZUL', qtd: 3000, perc: 20.0 },
                { nome: 'PAPEL TOALHA', qtd: 2500, perc: 16.67 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate">{item.nome}</span>
                    <span className="text-muted-foreground">{item.perc}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.perc}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.qtd}</span>
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
              {[
                { nome: 'TI', qtd: 7500, perc: 50.0 },
                { nome: 'Financeiro', qtd: 5000, perc: 33.33 },
                { nome: 'RH', qtd: 2500, perc: 16.67 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.nome}</span>
                    <span className="text-muted-foreground">{item.perc}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.perc}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.qtd}</span>
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
              {[
                { nome: 'CONVIDADE', qtd: 10000, perc: 66.67 },
                { nome: 'ADMIN', qtd: 3000, perc: 20.0 },
                { nome: 'MARIA', qtd: 2000, perc: 13.33 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.nome}</span>
                    <span className="text-muted-foreground">{item.perc}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.perc}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.qtd}</span>
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
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">PRODUTO EXEMPLO {idx + 1}</p>
                  <p className="text-sm text-muted-foreground">Categoria • Marca</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{1000 - idx * 100} un</p>
                  <p className="text-sm text-muted-foreground">
                    R$ {(25000 - idx * 2000).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge variant={idx < 3 ? 'default' : 'secondary'}>
                  {(33.33 - idx * 5).toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
