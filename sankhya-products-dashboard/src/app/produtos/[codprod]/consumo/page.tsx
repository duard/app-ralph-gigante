'use client';

import { BaseLayout } from '@/components/layouts/base-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProduct, useProductConsumo } from '@/hooks/use-products-complete';
import { usePrintPDF } from '@/hooks/use-print-pdf';
import { format, parse, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  ArrowLeft,
  Package,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  FileDown,
} from 'lucide-react';
import * as React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

// Tipo de DateRange
type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

export default function Page() {
  const { codprod } = useParams<{ codprod: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ===== LER ESTADO DA URL =====
  // Período padrão: últimos 3 meses
  const defaultDataFim = format(new Date(), 'yyyy-MM-dd');
  const defaultDataInicio = format(subMonths(new Date(), 3), 'yyyy-MM-dd');

  const dataInicio = searchParams.get('dataInicio') || defaultDataInicio;
  const dataFim = searchParams.get('dataFim') || defaultDataFim;
  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('perPage')) || 50;

  // ===== HELPER PARA ATUALIZAR URL =====
  const updateSearchParams = React.useCallback(
    (updates: Record<string, string | number | undefined | null>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // ===== QUERIES =====
  const {
    data: product,
    isLoading: isLoadingProduct,
    refetch: refetchProduct,
  } = useProduct(Number(codprod));
  const {
    data: consumoData,
    isLoading: isLoadingConsumo,
    refetch: refetchConsumo,
    error: consumoError,
  } = useProductConsumo(Number(codprod), dataInicio, dataFim, page, perPage);

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { printPDF } = usePrintPDF();

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchProduct(), refetchConsumo()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchProduct, refetchConsumo]);

  // Debug logs
  // Debug log removed to comply with no-console rule

  // ===== HANDLERS =====
  const handleDateRangeChange = React.useCallback(
    (range: DateRange | undefined) => {
      if (range?.from && range?.to) {
        updateSearchParams({
          dataInicio: format(range.from, 'yyyy-MM-dd'),
          dataFim: format(range.to, 'yyyy-MM-dd'),
          page: 1, // Reset para página 1 ao mudar período
        });
      }
    },
    [updateSearchParams]
  );

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      updateSearchParams({ page: newPage });
    },
    [updateSearchParams]
  );

  // Preparar DateRange para o picker
  const dateRange: DateRange | undefined = React.useMemo(() => {
    try {
      return {
        from: parse(dataInicio, 'yyyy-MM-dd', new Date()),
        to: parse(dataFim, 'yyyy-MM-dd', new Date()),
      };
    } catch {
      return undefined;
    }
  }, [dataInicio, dataFim]);

  if (isLoadingProduct) {
    return (
      <BaseLayout title="Histórico de Consumo" description="Carregando...">
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
    <BaseLayout title="Histórico de Consumo" description="">
      <div id="printable-consumo-v1" className="container mx-auto px-4 py-6 space-y-4">
        {/* Toolbar compacta no topo */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Informações do produto */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/produtos')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="border-l pl-4">
                  <h1 className="text-lg font-bold">{product.descrprod}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      #{product.codprod}
                    </Badge>
                    {product.referencia && (
                      <Badge variant="secondary" className="text-xs">
                        Ref: {product.referencia}
                      </Badge>
                    )}
                    <Badge
                      variant={product.ativo === 'S' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {product.ativo === 'S' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Seletor de período e ações */}
              <div className="flex items-center gap-2">
                <DateRangePicker date={dateRange} onDateChange={handleDateRangeChange} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => printPDF('printable-consumo-v1')}
                  disabled={isLoadingConsumo || !consumoData}
                  className="no-print"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isLoadingConsumo}
                  className="no-print"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Métricas compactas em linha */}
            {consumoData && consumoData.saldoAnterior && consumoData.saldoAtual && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Saldo Anterior</div>
                  <div className="text-2xl font-bold">
                    {consumoData.saldoAnterior.saldo_qtd || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(consumoData.saldoAnterior.saldo_valor || 0)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Saldo Atual</div>
                  <div className="text-2xl font-bold">
                    {consumoData.saldoAtual.saldo_qtd_final || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(consumoData.saldoAtual.saldo_valor_final || 0)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    Variação
                    {(consumoData.saldoAtual.saldo_qtd_final || 0) >
                    (consumoData.saldoAnterior.saldo_qtd || 0) ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <div
                    className={`text-2xl font-bold ${(consumoData.saldoAtual.saldo_qtd_final || 0) - (consumoData.saldoAnterior.saldo_qtd || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {(consumoData.saldoAtual.saldo_qtd_final || 0) -
                      (consumoData.saldoAnterior.saldo_qtd || 0) >
                      0 && '+'}
                    {(consumoData.saldoAtual.saldo_qtd_final || 0) -
                      (consumoData.saldoAnterior.saldo_qtd || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">No período</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Movimentações</div>
                  <div className="text-2xl font-bold">{consumoData.totalMovimentacoes || 0}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de movimentações */}
        <Card>
          <CardContent className="pt-6">
            {isLoadingConsumo ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : consumoData && consumoData.movimentacoes && consumoData.movimentacoes.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Operação</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Parceiro / Usuário</TableHead>
                      <TableHead>Controle</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumoData.movimentacoes.map((mov, index) => {
                      // Traduzir tipo de movimento
                      const tipoMovMap: Record<string, string> = {
                        C: 'Compra',
                        P: 'Pedido Venda',
                        Q: 'Requisição',
                        O: 'Ordem Compra',
                        J: 'Transferência',
                        D: 'Devolução',
                        V: 'Venda',
                      };
                      const tipoDesc = mov.tipmov ? tipoMovMap[mov.tipmov] || mov.tipmov : 'Mov.';

                      // Determinar o nome a exibir
                      const nomeExibir =
                        mov.nome_parceiro ||
                        mov.usuario_alteracao ||
                        mov.usuario_inclusao ||
                        'Sistema';

                      const isParceiro = !!mov.nome_parceiro;

                      return (
                        <TableRow key={index}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(mov.data_referencia), 'dd/MM/yyyy HH:mm', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">
                                {tipoDesc}
                              </Badge>
                              {mov.descricao_operacao && (
                                <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                                  {mov.descricao_operacao}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {mov.nunota ? `#${mov.nunota}` : '-'}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="space-y-1">
                              <div className="font-medium truncate">{nomeExibir}</div>
                              {!isParceiro && (mov.usuario_inclusao || mov.usuario_alteracao) && (
                                <Badge variant="secondary" className="text-xs">
                                  Usuário
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {mov.controle ? (
                              <Badge variant="default" className="text-xs font-mono">
                                {mov.controle}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span
                              className={
                                mov.quantidade_mov > 0
                                  ? 'text-green-600 font-semibold'
                                  : 'text-red-600 font-semibold'
                              }
                            >
                              {mov.quantidade_mov > 0 && '+'}
                              {mov.quantidade_mov}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(
                              mov.valor_unitario || mov.valor_mov / Math.abs(mov.quantidade_mov)
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {mov.saldo_qtd_final}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Paginação */}
                {consumoData.totalMovimentacoes > perPage && (
                  <div className="flex items-center justify-between px-2 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {(page - 1) * perPage + 1} a{' '}
                      {Math.min(page * perPage, consumoData.totalMovimentacoes)} de{' '}
                      {consumoData.totalMovimentacoes} movimentações
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>
                      <div className="text-sm font-medium">
                        Página {page} de {Math.ceil(consumoData.totalMovimentacoes / perPage)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= Math.ceil(consumoData.totalMovimentacoes / perPage)}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : consumoError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar movimentações:{' '}
                  {typeof consumoError === 'object' && consumoError && 'message' in consumoError
                    ? (consumoError as { message?: string }).message
                    : 'Erro desconhecido'}
                </AlertDescription>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
                  Tentar novamente
                </Button>
              </Alert>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma movimentação encontrada</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Não há movimentações para este produto no período selecionado.
                </p>
                {consumoData && (
                  <div className="mt-4 p-4 bg-muted rounded-md text-xs font-mono text-left">
                    <div>Debug Info:</div>
                    <div>- Total Movimentações: {consumoData.totalMovimentacoes || 0}</div>
                    <div>- Array length: {consumoData.movimentacoes?.length || 0}</div>
                    <div>
                      - Data recebida: {JSON.stringify(consumoData, null, 2).substring(0, 200)}...
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
