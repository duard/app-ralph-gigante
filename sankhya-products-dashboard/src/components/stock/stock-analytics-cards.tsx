'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  Activity,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StockAnalytics {
  coberturaMedia: number;
  giroEstoque: number;
  obsolescencia: number;
  eficienciaLocal: Array<{
    codlocal: number;
    descrlocal: string;
    eficiencia: number;
    utilizacao: number;
  }>;
  previsaoRuptura: Array<{
    codprod: number;
    descrprod: string;
    dataPrevisao: string;
    diasParaRuptura: number;
  }>;
  categoriasCriticas: Array<{
    categoria: string;
    produtosCriticos: number;
    valorEmRisco: number;
  }>;
  tendenciaMensal: {
    estoqueAtual: number;
    estoqueAnterior: number;
    variacaoPercentual: number;
  };
}

interface StockAnalyticsCardProps {
  analytics: StockAnalytics;
  className?: string;
}

function MetricCard({
  title,
  value,
  unit,
  trend,
  icon: Icon,
  color,
  description,
}: {
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  icon: React.ElementType;
  color: string;
  description?: string;
}) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === undefined) return 'text-muted-foreground';
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4" style={{ color }} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center text-xs', getTrendColor())}>
            {getTrendIcon()}
            <span className="ml-1">
              {trend > 0 ? '+' : ''}{trend}% vs. mês anterior
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function StockAnalyticsCards({ analytics, className }: StockAnalyticsCardProps) {
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'bg-green-500';
    if (value >= thresholds.warning) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Análise de Estoque</h2>
        <Badge variant="outline" className="text-xs">
          📊 Insights Avançados
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Cobertura Média"
          value={analytics.coberturaMedia}
          unit="dias"
          trend={3.2}
          icon={Target}
          color="#3B82F6"
          description="Tempo médio de estoque disponível"
        />
        
        <MetricCard
          title="Giro de Estoque"
          value={analytics.giroEstoque}
          unit="vezes/mês"
          trend={-1.5}
          icon={Activity}
          color="#8B5CF6"
          description="Quantas vezes o estoque é renovado"
        />
        
        <MetricCard
          title="Obsolescência"
          value={analytics.obsolescencia}
          unit="%"
          trend={2.1}
          icon={AlertTriangle}
          color="#EF4444"
          description="Percentual de estoque parado"
        />
        
        <MetricCard
          title="Eficiência Geral"
          value="85"
          unit="%"
          trend={5.3}
          icon={BarChart3}
          color="#10B981"
          description="Taxa de utilização do espaço"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Eficiência por Local
            </CardTitle>
            <CardDescription>
              Análise de utilização do espaço por armazém
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.eficienciaLocal.map((local, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{local.descrlocal}</span>
                  <span className="text-sm">{local.utilizacao}%</span>
                </div>
                <Progress 
                  value={local.utilizacao} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Capacidade: {100 - local.utilizacao}% livre</span>
                  <span>Eficiência: {local.eficiencia}%</span>
                </div>
                {idx < analytics.eficienciaLocal.length - 1 && <div className="border-t pt-2" />}
              </div>
            ))}
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Previsão de Ruptura
            </CardTitle>
            <CardDescription>
              Produtos com risco de esgotamento em 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.previsaoRuptura.slice(0, 5).map((produto, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{produto.descrprod}</p>
                    <p className="text-xs text-muted-foreground">
                      Ruptura em {produto.diasParaRuptura} dias
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={produto.diasParaRuptura <= 7 ? 'destructive' : 
                               produto.diasParaRuptura <= 15 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {new Date(produto.dataPrevisao).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                </div>
              ))}
              {analytics.previsaoRuptura.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">Nenhum produto com risco de ruptura</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Categorias Críticas
          </CardTitle>
          <CardDescription>
            Análise de risco por categoria de produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoriasCriticas.map((categoria, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded border">
                <div className="flex-1">
                  <p className="font-medium">{categoria.categoria}</p>
                  <p className="text-sm text-muted-foreground">
                    {categoria.produtosCriticos} produtos críticos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(categoria.valorEmRisco)}
                  </p>
                  <p className="text-xs text-muted-foreground">em risco</p>
                </div>
              </div>
            ))}
            
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
              {analytics.categoriasCriticas.slice(0, 4).map((cat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {cat.produtosCriticos}
                  </div>
                  <div className="text-xs text-muted-foreground">{cat.categoria}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Análise de Tendência
          </CardTitle>
          <CardDescription>
            Comparação com o mês anterior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Estoque Atual</p>
              <p className="text-xl font-bold">
                {analytics.tendenciaMensal.estoqueAtual.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Mês Anterior</p>
              <p className="text-xl font-bold text-muted-foreground">
                {analytics.tendenciaMensal.estoqueAnterior.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Variação</p>
              <p className={cn(
                'text-xl font-bold',
                analytics.tendenciaMensal.variacaoPercentual >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {analytics.tendenciaMensal.variacaoPercentual >= 0 ? '+' : ''}
                {analytics.tendenciaMensal.variacaoPercentual}%
              </p>
            </div>
          </div>
          
          <div className="pt-4">
            <Progress 
              value={Math.abs(analytics.tendenciaMensal.variacaoPercentual)} 
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {analytics.tendenciaMensal.variacaoPercentual >= 0 
                ? 'Aumento no volume de estoque' 
                : 'Redução no volume de estoque'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}