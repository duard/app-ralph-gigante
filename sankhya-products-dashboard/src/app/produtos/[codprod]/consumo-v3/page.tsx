'use client';

import { BaseLayout } from '@/components/layouts/base-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProduct, useProduct360V3 } from '@/hooks/use-products-complete';
import { usePrintPDF } from '@/hooks/use-print-pdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  ArrowLeft,
  Package,
  RefreshCw,
  TrendingUp,
  Calendar,
  ShoppingCart,
  Users,
  Warehouse,
  Clock,
  DollarSign,
  FileDown,
} from 'lucide-react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Page() {
  const { codprod } = useParams<{ codprod: string }>();
  const navigate = useNavigate();

  const {
    data: product,
    isLoading: isLoadingProduct,
    refetch: refetchProduct,
  } = useProduct(Number(codprod));
  const {
    data: data360,
    isLoading: isLoading360,
    refetch: refetch360,
    error: error360,
  } = useProduct360V3(Number(codprod));

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { printPDF } = usePrintPDF();

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchProduct(), refetch360()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchProduct, refetch360]);

  if (isLoadingProduct) {
    return (
      <BaseLayout title="Visão 360° (V3)" description="Carregando...">
        <div className="container mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </BaseLayout>
    );
  }

  if (!product) {
    return (
      <BaseLayout title="Produto não encontrado" description="">
        <div className="container mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Produto não encontrado</AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/produtos')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para produtos
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Visão 360° (V3)" description="Dashboard executivo do produto">
      <div id="printable-consumo-v3" className="container mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/produtos')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="border-l pl-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold">
                      {data360?.produto.descrprod || product.descrprod}
                    </h1>
                    <Badge variant="secondary" className="text-xs">
                      V3 Dashboard
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      #{data360?.produto.codprod || product.codprod}
                    </Badge>
                    {data360?.produto.complemento && (
                      <Badge variant="secondary" className="text-xs">
                        {data360.produto.complemento}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => printPDF('printable-consumo-v3')}
                  disabled={isLoading360 || !data360}
                  className="no-print"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isLoading360}
                  className="no-print"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading360 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : error360 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar:{' '}
              {typeof error360 === 'object' && error360 && 'message' in error360
                ? (error360 as { message?: string }).message
                : 'Erro desconhecido'}
            </AlertDescription>
            <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
              Tentar novamente
            </Button>
          </Alert>
        ) : data360 ? (
          <>
            {/* Cards de Estoque Atual */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    Estoque Físico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data360.estoque_atual.fisico}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {data360.produto.unidade}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Disponível
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data360.estoque_atual.disponivel}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Reservado: {data360.estoque_atual.reservado}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data360.estoque_atual.valor_total_formatted}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Estoque valorizado</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Cobertura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data360.metricas.cobertura_estoque_meses.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Meses (média {data360.metricas.media_consumo_mensal_formatted}/mês)
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Histórico Mensal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Histórico Mensal (6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead className="text-right">Saldo Qtd</TableHead>
                        <TableHead className="text-right">Saldo Valor</TableHead>
                        <TableHead className="text-right">Entradas</TableHead>
                        <TableHead className="text-right">Consumo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data360.historico_mensal.map((hist, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{hist.mes_ano}</TableCell>
                          <TableCell className="text-right font-mono">{hist.saldo_qtd}</TableCell>
                          <TableCell className="text-right">{hist.saldo_valor_formatted}</TableCell>
                          <TableCell className="text-right text-green-600 font-semibold">
                            {hist.entradas_qtd}
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-semibold">
                            {hist.consumo_qtd}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Pedidos Pendentes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pedidos de Compra */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Pedidos de Compra ({data360.pedidos_pendentes.compras.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data360.pedidos_pendentes.compras.length > 0 ? (
                    <div className="space-y-2">
                      {data360.pedidos_pendentes.compras.slice(0, 5).map((ped) => (
                        <div key={ped.NUNOTA} className="border-b pb-2">
                          <div className="flex justify-between items-start">
                            <div className="text-sm font-medium">#{ped.NUNOTA}</div>
                            <Badge variant="default" className="text-xs">
                              {ped.qtd_pendente}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">{ped.nome_parceiro}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(ped.DTNEG), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nenhum pedido pendente</div>
                  )}
                </CardContent>
              </Card>

              {/* Pedidos de Venda */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Pedidos de Venda ({data360.pedidos_pendentes.vendas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data360.pedidos_pendentes.vendas.length > 0 ? (
                    <div className="space-y-2">
                      {data360.pedidos_pendentes.vendas.slice(0, 5).map((ped) => (
                        <div key={ped.NUNOTA} className="border-b pb-2">
                          <div className="flex justify-between items-start">
                            <div className="text-sm font-medium">#{ped.NUNOTA}</div>
                            <Badge variant="destructive" className="text-xs">
                              {ped.qtd_pendente}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">{ped.nome_parceiro}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(ped.DTNEG), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nenhum pedido pendente</div>
                  )}
                </CardContent>
              </Card>

              {/* Transferências */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Transferências ({data360.pedidos_pendentes.transferencias.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data360.pedidos_pendentes.transferencias.length > 0 ? (
                    <div className="space-y-2">
                      {data360.pedidos_pendentes.transferencias.slice(0, 5).map((ped) => (
                        <div key={ped.NUNOTA} className="border-b pb-2">
                          <div className="flex justify-between items-start">
                            <div className="text-sm font-medium">#{ped.NUNOTA}</div>
                            <Badge variant="secondary" className="text-xs">
                              {ped.qtd_pendente}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">{ped.nome_parceiro}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(ped.DTNEG), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Nenhuma transferência pendente
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Última Compra e Maiores Consumidores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Última Compra */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Última Compra
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data360.ultima_compra ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Fornecedor</div>
                        <div className="text-sm font-medium">
                          {data360.ultima_compra.nome_fornecedor}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Data</div>
                          <div className="text-sm font-medium">
                            {format(new Date(data360.ultima_compra.data_entrada), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Quantidade</div>
                          <div className="text-sm font-medium">
                            {data360.ultima_compra.quantidade}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Valor Unit.</div>
                          <div className="text-sm font-medium">
                            {data360.ultima_compra.valor_unitario_formatted}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Nota: #{data360.ultima_compra.NUNOTA}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nenhuma compra registrada</div>
                  )}
                </CardContent>
              </Card>

              {/* Maiores Consumidores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Maiores Consumidores (6 meses)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data360.maiores_consumidores.length > 0 ? (
                    <div className="space-y-2">
                      {data360.maiores_consumidores.map((cons, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">{cons.nome_parceiro}</div>
                            <div className="text-xs text-muted-foreground">
                              {cons.total_valor_formatted}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {cons.total_qtd}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Sem dados de consumo</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </BaseLayout>
  );
}
