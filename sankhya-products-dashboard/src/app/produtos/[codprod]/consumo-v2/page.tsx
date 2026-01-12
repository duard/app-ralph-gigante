'use client';

import { BaseLayout } from '@/components/layouts/base-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useProduct, useProductConsumoV2 } from '@/hooks/use-products-complete';
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
  Info,
  MapPin,
  FileDown,
} from 'lucide-react';
import * as React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

export default function Page() {
  const { codprod } = useParams<{ codprod: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const defaultDataFim = format(new Date(), 'yyyy-MM-dd');
  const defaultDataInicio = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
  
  const dataInicio = searchParams.get('dataInicio') || defaultDataInicio;
  const dataFim = searchParams.get('dataFim') || defaultDataFim;
  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('perPage')) || 50;

  const updateSearchParams = React.useCallback((updates: Record<string, string | number | undefined | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const { data: product, isLoading: isLoadingProduct, refetch: refetchProduct } = useProduct(Number(codprod));
  const { data: consumoData, isLoading: isLoadingConsumo, refetch: refetchConsumo, error: consumoError } = useProductConsumoV2(
    Number(codprod),
    dataInicio,
    dataFim,
    page,
    perPage
  );

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

  const handleDateRangeChange = React.useCallback((range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      updateSearchParams({
        dataInicio: format(range.from, 'yyyy-MM-dd'),
        dataFim: format(range.to, 'yyyy-MM-dd'),
        page: 1,
      });
    }
  }, [updateSearchParams]);

  const handlePageChange = React.useCallback((newPage: number) => {
    updateSearchParams({ page: newPage });
  }, [updateSearchParams]);

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
      <BaseLayout title="Consumo Detalhado (V2)" description="Carregando...">
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
    <BaseLayout
      title="Consumo Detalhado (V2)"
      description="Visão completa com tipo de operação, observações e localizações"
    >
      <div id="printable-consumo-v2" className="container mx-auto px-4 py-6 space-y-4">
        {/* Toolbar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/produtos')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="border-l pl-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold">{consumoData?.produto.descrprod || product.descrprod}</h1>
                    <Badge variant="secondary" className="text-xs">V2 Detalhado</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">#{consumoData?.produto.codprod || product.codprod}</Badge>
                    {consumoData?.produto.complemento && (
                      <Badge variant="secondary" className="text-xs">{consumoData.produto.complemento}</Badge>
                    )}
                    <Badge variant={consumoData?.produto.ativo === 'S' ? 'default' : 'secondary'} className="text-xs">
                      {consumoData?.produto.ativo === 'S' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DateRangePicker
                  date={dateRange}
                  onDateChange={handleDateRangeChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => printPDF('printable-consumo-v2')}
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

            {/* Métricas */}
            {consumoData && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Saldo Anterior</div>
                  <div className="text-2xl font-bold">{consumoData.saldoAnterior.saldoQtd}</div>
                  <div className="text-xs text-muted-foreground">{consumoData.saldoAnterior.saldoValorFormatted}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Saldo Atual</div>
                  <div className="text-2xl font-bold">{consumoData.saldoAtual.saldoQtdFinal}</div>
                  <div className="text-xs text-muted-foreground">{consumoData.saldoAtual.saldoValorFinalFormatted}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    Variação
                    {consumoData.movimentoLiquido > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${consumoData.movimentoLiquido > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {consumoData.movimentoLiquido > 0 && '+'}
                    {consumoData.movimentoLiquido}
                  </div>
                  <div className="text-xs text-muted-foreground">No período</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Movimentações</div>
                  <div className="text-2xl font-bold">{consumoData.totalMovimentacoes}</div>
                  <div className="text-xs text-muted-foreground">{consumoData.periodo.totalDias} dias</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Média/Dia</div>
                  <div className="text-2xl font-bold">{consumoData.metrics.mediaConsumoDia.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Dias cobertura: {consumoData.metrics.diasEstoqueDisponivel.toFixed(0)}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Localizações de Estoque */}
        {consumoData && consumoData.saldoAtual.localizacoes && consumoData.saldoAtual.localizacoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localizações de Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {consumoData.saldoAtual.localizacoes.map((loc) => (
                  <div key={loc.codlocal} className="border rounded-lg p-3">
                    <div className="font-medium text-sm">{loc.descricao}</div>
                    <div className="text-2xl font-bold mt-1">{loc.estoque}</div>
                    {loc.controle && (
                      <Badge variant="outline" className="text-xs mt-2">{loc.controle}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                      <TableHead>Parceiro</TableHead>
                      <TableHead>Controle</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Valor Un.</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumoData.movimentacoes.map((mov, index) => (
                      <TableRow key={index}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(mov.dataReferencia), 'dd/MM/yy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {mov.tipmov}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="text-xs text-muted-foreground max-w-[120px] truncate">
                                    {mov.tipoOperacao.descricao}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{mov.tipoOperacao.descricao}</p>
                                  <p className="text-xs">Código: {mov.tipoOperacao.codtipoper}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">#{mov.nunota}</TableCell>
                        <TableCell className="max-w-[150px] truncate text-sm">{mov.nomeParceiro}</TableCell>
                        <TableCell>
                          {mov.controle ? (
                            <Badge variant="default" className="text-xs font-mono">{mov.controle}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(mov.observacao || mov.observacaoItem) ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  {mov.observacao && <p><strong>Nota:</strong> {mov.observacao}</p>}
                                  {mov.observacaoItem && <p><strong>Item:</strong> {mov.observacaoItem}</p>}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={mov.quantidadeMov > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {mov.quantidadeMov > 0 && '+'}{mov.quantidadeMov}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mov.valorUnitario)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">{mov.saldoQtdFinal}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Paginação */}
                {consumoData.totalMovimentacoes > perPage && (
                  <div className="flex items-center justify-between px-2 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {((page - 1) * perPage) + 1} a {Math.min(page * perPage, consumoData.totalMovimentacoes)} de {consumoData.totalMovimentacoes}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.max(1, page - 1))} disabled={page === 1}>
                        Anterior
                      </Button>
                      <div className="text-sm font-medium">
                        Página {page} de {Math.ceil(consumoData.totalMovimentacoes / perPage)}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page >= Math.ceil(consumoData.totalMovimentacoes / perPage)}>
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
                  Erro ao carregar: {typeof consumoError === 'object' && consumoError && 'message' in consumoError ? (consumoError as { message?: string }).message : 'Erro desconhecido'}
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
