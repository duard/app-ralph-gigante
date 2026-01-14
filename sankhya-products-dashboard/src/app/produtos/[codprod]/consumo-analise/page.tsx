'use client';

import { BaseLayout } from '@/components/layouts/base-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProduct } from '@/hooks/use-products-complete';
import { useProductConsumoAnalise } from '@/hooks/use-product-consumo-analise';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
} from 'lucide-react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Page() {
  const { codprod } = useParams<{ codprod: string }>();
  const navigate = useNavigate();

  // Estados para filtros
  const [periodo1Inicio, setPeriodo1Inicio] = React.useState(
    format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')
  );
  const [periodo1Fim, setPeriodo1Fim] = React.useState(
    format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')
  );
  const [periodo2Inicio, setPeriodo2Inicio] = React.useState(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [periodo2Fim, setPeriodo2Fim] = React.useState(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [groupBy, setGroupBy] = React.useState<'usuario' | 'grupo' | 'parceiro' | 'mes' | 'tipooper' | 'none'>('usuario');

  // Buscar dados do produto
  const { data: product, isLoading: isLoadingProduct } = useProduct(Number(codprod));

  // Buscar dados de consumo - Período 1
  const {
    data: consumoPeriodo1,
    isLoading: isLoadingPeriodo1,
    refetch: refetchPeriodo1,
  } = useProductConsumoAnalise({
    codprod: Number(codprod),
    dataInicio: periodo1Inicio,
    dataFim: periodo1Fim,
    groupBy,
    perPage: 10,
  });

  // Buscar dados de consumo - Período 2
  const {
    data: consumoPeriodo2,
    isLoading: isLoadingPeriodo2,
    refetch: refetchPeriodo2,
  } = useProductConsumoAnalise({
    codprod: Number(codprod),
    dataInicio: periodo2Inicio,
    dataFim: periodo2Fim,
    groupBy,
    perPage: 10,
  });

  const isLoading = isLoadingProduct || isLoadingPeriodo1 || isLoadingPeriodo2;

  // Função para calcular variação percentual
  const calcularVariacao = (atual: number, anterior: number) => {
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return ((atual - anterior) / anterior) * 100;
  };

  const variacaoQuantidade = consumoPeriodo1 && consumoPeriodo2
    ? calcularVariacao(
        consumoPeriodo2.resumo.quantidadeConsumo,
        consumoPeriodo1.resumo.quantidadeConsumo
      )
    : 0;

  const variacaoValor = consumoPeriodo1 && consumoPeriodo2
    ? calcularVariacao(
        consumoPeriodo2.resumo.valorConsumo,
        consumoPeriodo1.resumo.valorConsumo
      )
    : 0;

  const handleAtualizar = () => {
    refetchPeriodo1();
    refetchPeriodo2();
  };

  const handlePresetPeriodo = (preset: 'mes-anterior' | 'mes-atual' | 'trimestre') => {
    const hoje = new Date();

    if (preset === 'mes-anterior') {
      setPeriodo1Inicio(format(startOfMonth(subMonths(hoje, 2)), 'yyyy-MM-dd'));
      setPeriodo1Fim(format(endOfMonth(subMonths(hoje, 2)), 'yyyy-MM-dd'));
      setPeriodo2Inicio(format(startOfMonth(subMonths(hoje, 1)), 'yyyy-MM-dd'));
      setPeriodo2Fim(format(endOfMonth(subMonths(hoje, 1)), 'yyyy-MM-dd'));
    } else if (preset === 'mes-atual') {
      setPeriodo1Inicio(format(startOfMonth(subMonths(hoje, 1)), 'yyyy-MM-dd'));
      setPeriodo1Fim(format(endOfMonth(subMonths(hoje, 1)), 'yyyy-MM-dd'));
      setPeriodo2Inicio(format(startOfMonth(hoje), 'yyyy-MM-dd'));
      setPeriodo2Fim(format(endOfMonth(hoje), 'yyyy-MM-dd'));
    } else if (preset === 'trimestre') {
      setPeriodo1Inicio(format(startOfMonth(subMonths(hoje, 6)), 'yyyy-MM-dd'));
      setPeriodo1Fim(format(endOfMonth(subMonths(hoje, 4)), 'yyyy-MM-dd'));
      setPeriodo2Inicio(format(startOfMonth(subMonths(hoje, 3)), 'yyyy-MM-dd'));
      setPeriodo2Fim(format(endOfMonth(subMonths(hoje, 1)), 'yyyy-MM-dd'));
    }
  };

  return (
    <BaseLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/produtos/${codprod}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Análise de Consumo</h1>
              {product && (
                <p className="text-muted-foreground">
                  {product.descrprod} (Cód: {product.codprod})
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAtualizar}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Filtros de Período */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Períodos para Comparação
            </CardTitle>
            <CardDescription>
              Selecione dois períodos para comparar o consumo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Presets rápidos */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetPeriodo('mes-anterior')}
              >
                2 Meses Atrás vs Mês Passado
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetPeriodo('mes-atual')}
              >
                Mês Passado vs Mês Atual
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetPeriodo('trimestre')}
              >
                Comparar Trimestres
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Período 1 */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold text-lg">Período 1</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="periodo1-inicio">Data Início</Label>
                    <Input
                      id="periodo1-inicio"
                      type="date"
                      value={periodo1Inicio}
                      onChange={(e) => setPeriodo1Inicio(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodo1-fim">Data Fim</Label>
                    <Input
                      id="periodo1-fim"
                      type="date"
                      value={periodo1Fim}
                      onChange={(e) => setPeriodo1Fim(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Período 2 */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold text-lg">Período 2</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="periodo2-inicio">Data Início</Label>
                    <Input
                      id="periodo2-inicio"
                      type="date"
                      value={periodo2Inicio}
                      onChange={(e) => setPeriodo2Inicio(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodo2-fim">Data Fim</Label>
                    <Input
                      id="periodo2-fim"
                      type="date"
                      value={periodo2Fim}
                      onChange={(e) => setPeriodo2Fim(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tipo de Agrupamento */}
            <div className="pt-4 border-t">
              <Label htmlFor="group-by">Agrupar Por</Label>
              <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                <SelectTrigger id="group-by" className="w-full md:w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuário (Quem Consumiu)</SelectItem>
                  <SelectItem value="grupo">Grupo de Usuário</SelectItem>
                  <SelectItem value="parceiro">Parceiro</SelectItem>
                  <SelectItem value="mes">Mês</SelectItem>
                  <SelectItem value="tipooper">Tipo de Operação</SelectItem>
                  <SelectItem value="none">Sem Agrupamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : consumoPeriodo1 && consumoPeriodo2 ? (
          <>
            {/* Cards Comparativos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Quantidade Consumida */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Quantidade Consumida
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold">
                        {consumoPeriodo2.resumo.quantidadeConsumo.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Período 2 ({consumoPeriodo2.periodo.dias} dias)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {variacaoQuantidade >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={variacaoQuantidade >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {variacaoQuantidade.toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        vs {consumoPeriodo1.resumo.quantidadeConsumo.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Valor Consumido */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Valor Consumido
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold">
                        R$ {consumoPeriodo2.resumo.valorConsumo.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Período 2 ({consumoPeriodo2.periodo.dias} dias)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {variacaoValor >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={variacaoValor >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {variacaoValor.toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        vs R$ {consumoPeriodo1.resumo.valorConsumo.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Média Diária */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Média Diária
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold">
                        {consumoPeriodo2.resumo.mediaDiariaConsumo.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unidades/dia (Período 2)
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Período 1: {consumoPeriodo1.resumo.mediaDiariaConsumo.toFixed(2)}/dia
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total de Movimentações */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Movimentações
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold">
                        {consumoPeriodo2.resumo.totalMovimentacoes}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Notas (Período 2)
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Período 1: {consumoPeriodo1.resumo.totalMovimentacoes} notas
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs com Agrupamentos */}
            <Tabs defaultValue="periodo1" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="periodo1">
                  Período 1: {format(new Date(periodo1Inicio), 'dd/MM', { locale: ptBR })} - {format(new Date(periodo1Fim), 'dd/MM/yyyy', { locale: ptBR })}
                </TabsTrigger>
                <TabsTrigger value="periodo2">
                  Período 2: {format(new Date(periodo2Inicio), 'dd/MM', { locale: ptBR })} - {format(new Date(periodo2Fim), 'dd/MM/yyyy', { locale: ptBR })}
                </TabsTrigger>
              </TabsList>

              {/* Período 1 */}
              <TabsContent value="periodo1" className="space-y-4">
                {consumoPeriodo1.agrupamento && consumoPeriodo1.agrupamento.dados.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Consumo por {consumoPeriodo1.agrupamento.tipo.charAt(0).toUpperCase() + consumoPeriodo1.agrupamento.tipo.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{consumoPeriodo1.agrupamento.tipo === 'usuario' ? 'Usuário' : consumoPeriodo1.agrupamento.tipo === 'grupo' ? 'Grupo' : 'Item'}</TableHead>
                            <TableHead className="text-right">Movimentações</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-right">%</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {consumoPeriodo1.agrupamento.dados.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">
                                {item.nome || item.nomeGrupo || item.mes || item.tipoOperacao || '-'}
                                {item.codigoGrupo && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (Grupo {item.codigoGrupo})
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">{item.movimentacoes}</TableCell>
                              <TableCell className="text-right">{item.quantidadeConsumo.toFixed(2)}</TableCell>
                              <TableCell className="text-right">R$ {item.valorConsumo.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={item.percentual > 0 ? 'default' : 'secondary'}>
                                  {item.percentual.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum dado de agrupamento disponível para este período
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Período 2 */}
              <TabsContent value="periodo2" className="space-y-4">
                {consumoPeriodo2.agrupamento && consumoPeriodo2.agrupamento.dados.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Consumo por {consumoPeriodo2.agrupamento.tipo.charAt(0).toUpperCase() + consumoPeriodo2.agrupamento.tipo.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{consumoPeriodo2.agrupamento.tipo === 'usuario' ? 'Usuário' : consumoPeriodo2.agrupamento.tipo === 'grupo' ? 'Grupo' : 'Item'}</TableHead>
                            <TableHead className="text-right">Movimentações</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-right">%</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {consumoPeriodo2.agrupamento.dados.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">
                                {item.nome || item.nomeGrupo || item.mes || item.tipoOperacao || '-'}
                                {item.codigoGrupo && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (Grupo {item.codigoGrupo})
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">{item.movimentacoes}</TableCell>
                              <TableCell className="text-right">{item.quantidadeConsumo.toFixed(2)}</TableCell>
                              <TableCell className="text-right">R$ {item.valorConsumo.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={item.percentual > 0 ? 'default' : 'secondary'}>
                                  {item.percentual.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum dado de agrupamento disponível para este período
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum dado disponível. Verifique os períodos selecionados.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </BaseLayout>
  );
}
