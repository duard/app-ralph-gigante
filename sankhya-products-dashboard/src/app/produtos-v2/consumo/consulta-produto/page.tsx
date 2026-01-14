import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Calendar, Package, TrendingUp, DollarSign, Activity, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuthStore } from '@/stores/auth-store';

interface MovimentacaoDetalhada {
  data: string;
  nunota: number;
  numnota?: number;
  codtipoper: number;
  atualestoque: number;
  tipmov?: string;
  atualest?: string;
  tipoMovimento: string;
  tipoMovimentoDescricao?: string;
  codusuinc?: number;
  nomeusuinc?: string;
  codparc?: number;
  nomeparc?: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface ConsumoResponse {
  produto: {
    codprod: number;
    descrprod: string;
    ativo: string;
  };
  periodo: {
    inicio: string;
    fim: string;
    dias: number;
  };
  resumo: {
    totalMovimentacoes: number;
    totalLinhas: number;
    quantidadeConsumo: number;
    valorConsumo: number;
    quantidadeEntrada: number;
    valorEntrada: number;
    mediaDiariaConsumo?: number;
    mediaPorMovimentacao?: number;
  };
  movimentacoes: {
    data: MovimentacaoDetalhada[];
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

interface ProdutoOption {
  codprod: number;
  descrprod: string;
  referencia?: string;
  marca?: string;
  codgrupoprod?: number;
  ativo?: string;
  localizacao?: string;
  tgfgru?: {
    codgrupoprod: number;
    descrgrupoprod: string;
  };
}

// Helper function to get badge variant and color based on movement type
function getBadgeStyle(tipmov?: string, tipoMovimento?: string): { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string } {
  if (!tipmov) {
    return { variant: 'outline', className: 'bg-gray-100 text-gray-700' };
  }

  const styles: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
    'V': { variant: 'destructive', className: 'bg-red-100 text-red-700 border-red-300' }, // Venda - consumo
    'D': { variant: 'outline', className: 'bg-orange-100 text-orange-700 border-orange-300' }, // Devolução
    'Q': { variant: 'destructive', className: 'bg-rose-100 text-rose-700 border-rose-300' }, // Requisição
    'J': { variant: 'secondary', className: 'bg-amber-100 text-amber-700 border-amber-300' }, // Requisição Interna
    'C': { variant: 'default', className: 'bg-green-100 text-green-700 border-green-300' }, // Compra - entrada
    'O': { variant: 'default', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' }, // Ordem - entrada
    'P': { variant: 'default', className: 'bg-teal-100 text-teal-700 border-teal-300' }, // Pedido - entrada
    'T': { variant: 'secondary', className: 'bg-blue-100 text-blue-700 border-blue-300' }, // Transferência
    'L': { variant: 'outline', className: 'bg-slate-100 text-slate-700 border-slate-300' }, // Lançamento
  };

  return styles[tipmov] || { variant: 'outline', className: 'bg-gray-100 text-gray-700' };
}

export default function ConsultaProdutoConsumo() {
  const { token } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados derivados da URL
  const urlCodProd = searchParams.get('codprod') || '';
  const urlStartDate = searchParams.get('dataInicio') || '';
  const urlEndDate = searchParams.get('dataFim') || '';

  const [codProd, setCodProd] = useState(urlCodProd);
  const [selectedProduct, setSelectedProduct] = useState<ProdutoOption | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productOptions, setProductOptions] = useState<ProdutoOption[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(urlStartDate);
  const [endDate, setEndDate] = useState(urlEndDate);
  const [consumoResponse, setConsumoResponse] = useState<ConsumoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default dates (last 90 days) only if not in URL
  useEffect(() => {
    if (!urlStartDate && !urlEndDate) {
      const today = new Date();
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);

      const endDateStr = today.toISOString().split('T')[0];
      const startDateStr = ninetyDaysAgo.toISOString().split('T')[0];

      setEndDate(endDateStr);
      setStartDate(startDateStr);

      // Update URL
      const params = new URLSearchParams(searchParams);
      params.set('dataInicio', startDateStr);
      params.set('dataFim', endDateStr);
      setSearchParams(params, { replace: true });
    }
  }, []);

  // Search products with debounce
  const searchProducts = useCallback(async (search: string) => {
    if (!search || search.trim().length < 2) {
      setProductOptions([]);
      return;
    }

    if (!token) {
      console.error('Token não disponível');
      setError('Erro de autenticação. Por favor, faça login novamente.');
      return;
    }

    setSearchingProducts(true);
    setError(null);

    try {

      // Build query parameters
      const params = new URLSearchParams({
        search: search.trim(),
        page: '1',
        perPage: '50',
        ativo: 'S',
        sort: 'DESCRPROD ASC',
      });

      console.log('Buscando produtos:', `http://localhost:3100/tgfpro2/produtos?${params}`);

      const response = await fetch(`http://localhost:3100/tgfpro2/produtos?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Erro na resposta:', response.status, response.statusText);
        throw new Error(`Erro ao buscar produtos: ${response.status}`);
      }

      const data = await response.json();
      console.log('Produtos encontrados:', data);

      // A resposta pode estar em data.data (paginada) ou direto em data
      const produtos = data.data || data || [];
      setProductOptions(produtos);

      if (produtos.length === 0) {
        console.log('Nenhum produto encontrado para:', search);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setProductOptions([]);
    } finally {
      setSearchingProducts(false);
    }
  }, [token]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && searchTerm.trim().length >= 2) {
        searchProducts(searchTerm);
      } else if (!searchTerm) {
        setProductOptions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, searchProducts]);

  const handleSelectProduct = (product: ProdutoOption) => {
    setSelectedProduct(product);
    setCodProd(product.codprod.toString());
    setSearchTerm('');
    setOpen(false);

    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('codprod', product.codprod.toString());
    setSearchParams(params);
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setCodProd('');
    setSearchTerm('');
    setProductOptions([]);

    // Update URL
    const params = new URLSearchParams(searchParams);
    params.delete('codprod');
    setSearchParams(params);
  };

  const handleSearch = async () => {
    const productCode = selectedProduct?.codprod || codProd;

    if (!productCode) {
      setError('Por favor, selecione ou informe o código do produto');
      return;
    }

    if (!startDate || !endDate) {
      setError('Por favor, informe o período de busca');
      return;
    }

    if (!token) {
      setError('Erro de autenticação. Por favor, faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const params = new URLSearchParams({
        dataInicio: startDate,
        dataFim: endDate,
        groupBy: 'none',
        perPage: '100',
      });

      const response = await fetch(
        `http://localhost:3100/tgfpro2/produtos/${productCode}/consumo/analise?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Produto não encontrado');
        }
        throw new Error('Erro ao buscar dados de consumo');
      }

      const data: ConsumoResponse = await response.json();
      setConsumoResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setConsumoResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Consulta de Consumo por Produto</h2>
          <p className="text-muted-foreground">
            Selecione um produto e período para visualizar o histórico de consumo
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
          <CardDescription>Informe o código do produto e o período desejado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Buscar Produto</Label>
              <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="flex-1 justify-between font-normal"
                    >
                      {selectedProduct ? (
                        <span className="truncate text-left">
                          <span className="font-semibold">{selectedProduct.codprod}</span> -{' '}
                          {selectedProduct.descrprod}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Clique para buscar um produto...
                        </span>
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Digite código, nome, referência ou marca..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList className="max-h-[300px]">
                      {searchingProducts && (
                        <div className="flex flex-col items-center justify-center p-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="mt-2 text-sm text-muted-foreground">Buscando produtos...</p>
                        </div>
                      )}
                      {!searchingProducts && searchTerm.length > 0 && searchTerm.length < 2 && (
                        <CommandEmpty>Digite pelo menos 2 caracteres para buscar...</CommandEmpty>
                      )}
                      {!searchingProducts && searchTerm.length >= 2 && productOptions.length === 0 && (
                        <CommandEmpty>
                          <div className="flex flex-col items-center p-4">
                            <Package className="h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-2 font-medium">Nenhum produto encontrado</p>
                            <p className="text-sm text-muted-foreground">
                              Tente outro termo de busca
                            </p>
                          </div>
                        </CommandEmpty>
                      )}
                      {!searchingProducts && searchTerm.length === 0 && (
                        <CommandEmpty>
                          <div className="flex flex-col items-center p-4 text-muted-foreground">
                            <Search className="h-12 w-12 opacity-50" />
                            <p className="mt-2">Digite para buscar produtos</p>
                          </div>
                        </CommandEmpty>
                      )}
                      {!searchingProducts && productOptions.length > 0 && (
                        <CommandGroup heading={`${productOptions.length} produto(s) encontrado(s)`}>
                          {productOptions.map((product) => (
                            <CommandItem
                              key={product.codprod}
                              value={`${product.codprod} ${product.descrprod}`}
                              onSelect={() => handleSelectProduct(product)}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-primary">
                                    {product.codprod}
                                  </span>
                                  <span className="font-medium">{product.descrprod}</span>
                                </div>
                                {(product.referencia || product.marca) && (
                                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                    {product.referencia && (
                                      <span>
                                        <span className="font-medium">Ref:</span>{' '}
                                        {product.referencia}
                                      </span>
                                    )}
                                    {product.marca && (
                                      <span>
                                        <span className="font-medium">Marca:</span> {product.marca}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedProduct && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClearProduct}
                  title="Limpar seleção"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedProduct
                  ? 'Produto selecionado - clique no X para limpar'
                  : 'Ou digite o código manualmente no campo abaixo'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="codProd">Código (manual)</Label>
              <Input
                id="codProd"
                type="number"
                placeholder="Ex: 3680"
                value={codProd}
                onChange={(e) => {
                  const value = e.target.value;
                  setCodProd(value);
                  setSelectedProduct(null);

                  // Update URL
                  const params = new URLSearchParams(searchParams);
                  if (value) {
                    params.set('codprod', value);
                  } else {
                    params.delete('codprod');
                  }
                  setSearchParams(params);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setStartDate(value);

                  // Update URL
                  const params = new URLSearchParams(searchParams);
                  params.set('dataInicio', value);
                  setSearchParams(params);
                }}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setEndDate(value);

                  // Update URL
                  const params = new URLSearchParams(searchParams);
                  params.set('dataFim', value);
                  setSearchParams(params);
                }}
              />
            </div>
            <div className="flex items-end md:col-span-4">
              <Button onClick={handleSearch} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Buscando consumo...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Consumo
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {consumoResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produto Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex gap-2">
                <span className="font-semibold">Código:</span>
                <span>{consumoResponse.produto.codprod}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Descrição:</span>
                <span>{consumoResponse.produto.descrprod}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Período:</span>
                <span>
                  {formatDate(consumoResponse.periodo.inicio)} a{' '}
                  {formatDate(consumoResponse.periodo.fim)} ({consumoResponse.periodo.dias} dias)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {consumoResponse && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Movimentações</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {consumoResponse.resumo.totalMovimentacoes}
                </div>
                <p className="text-xs text-muted-foreground">registros encontrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quantidade Consumo</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {consumoResponse.resumo.quantidadeConsumo.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">unidades consumidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Consumo</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(consumoResponse.resumo.valorConsumo)}
                </div>
                <p className="text-xs text-muted-foreground">consumido no período</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(consumoResponse.resumo.mediaDiariaConsumo || 0).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">unidades/dia</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Detalhamento completo das movimentações do produto ({' '}
                {consumoResponse.movimentacoes.total} registros)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nota</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo Mov.</TableHead>
                      <TableHead>Parceiro</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Vlr. Unit.</TableHead>
                      <TableHead className="text-right">Vlr. Total</TableHead>
                      <TableHead>Usuário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumoResponse.movimentacoes.data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.nunota}
                          {item.numnota && ` (${item.numnota})`}
                        </TableCell>
                        <TableCell>{formatDateTime(item.data)}</TableCell>
                        <TableCell>
                          {(() => {
                            const badgeStyle = getBadgeStyle(item.tipmov, item.tipoMovimento);
                            return (
                              <Badge variant={badgeStyle.variant} className={badgeStyle.className}>
                                {item.tipoMovimentoDescricao || item.tipoMovimento}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {item.codparc && item.nomeparc ? (
                            <div className="max-w-[200px] truncate" title={item.nomeparc}>
                              {item.codparc} - {item.nomeparc}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.valorUnitario)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.valorTotal)}
                        </TableCell>
                        <TableCell>
                          {item.nomeusuinc ? (
                            <div className="max-w-[120px] truncate" title={item.nomeusuinc}>
                              {item.nomeusuinc}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!loading && !consumoResponse && codProd && (
        <Alert>
          <AlertDescription>
            Nenhum consumo encontrado para este produto no período selecionado.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
