'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Calendar, Download, RefreshCcw, Filter, FileText } from 'lucide-react';
import { getMovimentacoesConsumo, getConsumoAnalise } from '@/lib/api/consumo-service';
import type { ConsumoAnalise, MovimentacaoConsumo, PaginatedResponse } from '@/types/consumo';
import { ConsumoKpiCards } from './components/consumo-kpi-cards';
import { ConsumoTopRankings } from './components/consumo-top-rankings';
import { ConsumoFilters } from './components/consumo-filters';
import { ConsumoTable } from './components/consumo-table';
import { ConsumoPagination } from './components/consumo-pagination';
import { ConsumoQuickLinks } from './components/consumo-quick-links';

export default function ConsumoPage() {
  const [searchParams] = useSearchParams();

  // Estados
  const [analiseData, setAnaliseData] = useState<ConsumoAnalise | null>(null);
  const [movimentacoesData, setMovimentacoesData] = useState<PaginatedResponse<MovimentacaoConsumo> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [dataInicio, setDataInicio] = useState<string>(
    searchParams.get('dataInicio') || getDefaultDateInicio()
  );
  const [dataFim, setDataFim] = useState<string>(
    searchParams.get('dataFim') || getDefaultDateFim()
  );
  const [atualizaEstoque, setAtualizaEstoque] = useState<string>(
    searchParams.get('atualizaEstoque') || 'all'
  );
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [perPage] = useState<number>(20);
  const [showFilters, setShowFilters] = useState(false);

  // Funções auxiliares
  function getDefaultDateInicio(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  function getDefaultDateFim(): string {
    return new Date().toISOString().split('T')[0];
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Carregar dados
  useEffect(() => {
    loadAnaliseData();
  }, []);

  useEffect(() => {
    loadMovimentacoes();
  }, [dataInicio, dataFim, atualizaEstoque, searchTerm, page]);

  async function loadAnaliseData() {
    try {
      setLoading(true);
      setError(null);
      const analise = await getConsumoAnalise(dataInicio, dataFim, 5);
      setAnaliseData(analise);
    } catch (err) {
      console.error('Erro ao carregar análise de consumo:', err);
      setError('Erro ao carregar análise. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMovimentacoes() {
    try {
      setLoadingTable(true);
      const filtros: any = {
        dataInicio,
        dataFim,
        page,
        perPage,
      };

      if (atualizaEstoque !== 'all') {
        filtros.atualizaEstoque = atualizaEstoque;
      }

      if (searchTerm) {
        filtros.search = searchTerm;
      }

      const movimentacoes = await getMovimentacoesConsumo(filtros);
      setMovimentacoesData(movimentacoes);
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
    } finally {
      setLoadingTable(false);
    }
  }

  function handleApplyFilters() {
    setPage(1);
    loadAnaliseData();
    loadMovimentacoes();
  }

  function handleResetFilters() {
    setDataInicio(getDefaultDateInicio());
    setDataFim(getDefaultDateFim());
    setAtualizaEstoque('all');
    setSearchTerm('');
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Loading inicial
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados de consumo...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={loadAnaliseData}>Tentar Novamente</Button>
      </div>
    );
  }

  if (!analiseData) return null;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Consumo de Produtos</h1>
            <p className="text-muted-foreground">
              Análise completa de movimentações e consumo interno de produtos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={handleApplyFilters}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Período Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Período: {formatDate(analiseData.periodo.inicio)} até {formatDate(analiseData.periodo.fim)}
          </span>
          <span className="text-xs">({analiseData.periodo.dias} dias)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <ConsumoKpiCards analiseData={analiseData} />

      {/* Top Rankings */}
      <ConsumoTopRankings analiseData={analiseData} />

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Movimentações Detalhadas
              </CardTitle>
              <CardDescription>
                {movimentacoesData?.total.toLocaleString('pt-BR')} movimentações encontradas
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </CardHeader>

        {/* Filtros */}
        {showFilters && (
          <div className="px-6 pb-4">
            <ConsumoFilters
              dataInicio={dataInicio}
              dataFim={dataFim}
              atualizaEstoque={atualizaEstoque}
              searchTerm={searchTerm}
              onDataInicioChange={setDataInicio}
              onDataFimChange={setDataFim}
              onAtualizaEstoqueChange={setAtualizaEstoque}
              onSearchTermChange={setSearchTerm}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}

        <CardContent>
          <ConsumoTable
            movimentacoes={movimentacoesData?.data || []}
            loading={loadingTable}
          />

          {movimentacoesData && (
            <ConsumoPagination
              page={page}
              perPage={perPage}
              total={movimentacoesData.total}
              lastPage={movimentacoesData.lastPage}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Links Rápidos */}
      <ConsumoQuickLinks />
    </div>
  );
}
