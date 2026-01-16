'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingState } from '@/components/ui/loading';
import {
  Search,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  DollarSign,
  Calendar,
  ArrowUpDown
} from 'lucide-react';
import { sankhyaClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface ProdutoDetalhado {
  codprod: number;
  descrprod: string;
  marca: string | null;
  codgrupoprod: number | null;
  descrgrupoprod: string | null;
  ativo: 'S' | 'N';
  tipcontest: 'N' | 'S' | 'E' | 'L' | 'P';
  liscontest: string | null;
  hasControle: boolean;
  controleCount: number;
  estoqueTotal: number;
  temEstoque: boolean;
  precoMedioPonderado: number | null;
  precoUltimaCompra: number | null;
  precoMinimo: number | null;
  precoMaximo: number | null;
  variacaoPrecoPercentual: number | null;
  tendenciaPreco: 'AUMENTO' | 'QUEDA' | 'ESTAVEL' | null;
  qtdComprasUltimos6Meses: number;
  totalGastoUltimos6Meses: number;
  dtalter: string | null;
  nomeusualt: string | null;
}

interface ProdutosDetalhadosResponse {
  data: ProdutoDetalhado[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  stats: {
    totalProdutos: number;
    produtosAtivos: number;
    produtosInativos: number;
    produtosComEstoque: number;
    produtosSemEstoque: number;
    produtosComControle: number;
    produtosSemControle: number;
  };
}

type SortField = 'descrprod' | 'codprod' | 'estoqueTotal' | 'precoMedioPonderado' | 'qtdComprasUltimos6Meses';
type SortOrder = 'asc' | 'desc';

export function ProdutosAvancadosTable() {
  const [produtos, setProdutos] = React.useState<ProdutoDetalhado[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [ativoFilter, setAtivoFilter] = React.useState<string>('all');
  const [estoqueFilter, setEstoqueFilter] = React.useState<string>('all');
  const [sortField, setSortField] = React.useState<SortField>('descrprod');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState<ProdutosDetalhadosResponse['meta'] | null>(null);
  const [stats, setStats] = React.useState<ProdutosDetalhadosResponse['stats'] | null>(null);

  const fetchProdutos = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        pageSize: '50',
        sortBy: sortField,
        sortOrder,
      };

      if (search) params.search = search;
      if (ativoFilter !== 'all') params.ativo = ativoFilter;
      if (estoqueFilter === 'com') params.temEstoque = 'true';
      if (estoqueFilter === 'sem') params.temEstoque = 'false';

      const response = await sankhyaClient.get<ProdutosDetalhadosResponse>(
        '/tgfpro2/produtos/detalhados',
        { params }
      );

      setProdutos(response.data.data);
      setMeta(response.data.meta);
      setStats(response.data.stats);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching produtos detalhados:', error);
      }
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [page, search, ativoFilter, estoqueFilter, sortField, sortOrder]);

  React.useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getTendenciaIcon = (tendencia: string | null) => {
    if (!tendencia) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (tendencia === 'AUMENTO') return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (tendencia === 'QUEDA') return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTipcontestBadge = (tipcontest: string) => {
    const labels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      N: { label: 'Normal', variant: 'secondary' },
      S: { label: 'Série', variant: 'default' },
      E: { label: 'Específico', variant: 'default' },
      L: { label: 'Lote', variant: 'default' },
      P: { label: 'Perecível', variant: 'destructive' },
    };
    const config = labels[tipcontest] || { label: tipcontest, variant: 'outline' };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 font-semibold"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortOrder === 'asc' ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Total Produtos</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatNumber(stats.totalProdutos)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.produtosAtivos} ativos • {stats.produtosInativos} inativos
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-muted-foreground">Com Estoque</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatNumber(stats.produtosComEstoque)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {((stats.produtosComEstoque / stats.totalProdutos) * 100).toFixed(1)}% do total
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-600" />
              <p className="text-sm font-medium text-muted-foreground">Sem Estoque</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-orange-600">
              {formatNumber(stats.produtosSemEstoque)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {((stats.produtosSemEstoque / stats.totalProdutos) * 100).toFixed(1)}% do total
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-muted-foreground">Com Controle</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatNumber(stats.produtosComControle)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {((stats.produtosComControle / stats.totalProdutos) * 100).toFixed(1)}% do total
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={ativoFilter} onValueChange={(value) => { setAtivoFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="S">Ativos</SelectItem>
              <SelectItem value="N">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={estoqueFilter} onValueChange={(value) => { setEstoqueFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estoque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="com">Com Estoque</SelectItem>
              <SelectItem value="sem">Sem Estoque</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState message="Carregando produtos detalhados..." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="codprod">Código</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="descrprod">Produto</SortButton>
                </TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Controle</TableHead>
                <TableHead className="text-right">
                  <SortButton field="estoqueTotal">Estoque</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="precoMedioPonderado">Preço Médio</SortButton>
                </TableHead>
                <TableHead className="text-right">Variação</TableHead>
                <TableHead className="text-right">
                  <SortButton field="qtdComprasUltimos6Meses">Compras 6M</SortButton>
                </TableHead>
                <TableHead className="text-right">Gasto 6M</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                produtos.map((produto) => (
                  <TableRow key={produto.codprod} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{produto.codprod}</TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <p className="font-medium truncate">{produto.descrprod}</p>
                        {produto.marca && (
                          <p className="text-xs text-muted-foreground">{produto.marca}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {produto.descrgrupoprod || '-'}
                      </span>
                    </TableCell>
                    <TableCell>{getTipcontestBadge(produto.tipcontest)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {produto.temEstoque ? (
                        <span className="text-green-600 font-semibold">
                          {formatNumber(produto.estoqueTotal)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(produto.precoMedioPonderado)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getTendenciaIcon(produto.tendenciaPreco)}
                        {produto.variacaoPrecoPercentual !== null && (
                          <span
                            className={`text-xs font-medium ${
                              produto.variacaoPrecoPercentual > 0
                                ? 'text-red-500'
                                : produto.variacaoPrecoPercentual < 0
                                ? 'text-green-500'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {produto.variacaoPrecoPercentual > 0 ? '+' : ''}
                            {produto.variacaoPrecoPercentual.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(produto.qtdComprasUltimos6Meses)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(produto.totalGastoUltimos6Meses)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={produto.ativo === 'S' ? 'default' : 'secondary'}>
                        {produto.ativo === 'S' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * meta.pageSize) + 1} a{' '}
            {Math.min(page * meta.pageSize, meta.totalItems)} de {meta.totalItems} produtos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= meta.totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
