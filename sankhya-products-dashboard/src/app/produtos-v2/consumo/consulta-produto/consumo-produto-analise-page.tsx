'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  AlertTriangle,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  RefreshCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProdutoConsumoAnalise {
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
    mediaDiariaConsumo: number;
    mediaPorMovimentacao: number;
    saldoInicialQuantidade?: number;
    saldoInicialValor?: number;
    saldoFinalQuantidade?: number;
    saldoFinalValor?: number;
  };
  agrupamento?: any;
  movimentacoes: {
    data: any[];
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
}

function getDefaultDateInicio(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

function getDefaultDateFim(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
  return `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
}

export default function ConsumoProdutoAnalisePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [codprod, setCodprod] = useState<string>(searchParams.get('codprod') || '');
  const [dataInicio, setDataInicio] = useState<string>(
    searchParams.get('dataInicio') || getDefaultDateInicio()
  );
  const [dataFim, setDataFim] = useState<string>(
    searchParams.get('dataFim') || getDefaultDateFim()
  );

  const [data, setData] = useState<ProdutoConsumoAnalise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  async function handleConsultar() {
    if (!codprod) {
      setError('Informe o código do produto');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100'}/tgfpro2/produtos/${codprod}/consumo/analise?dataInicio=${dataInicio}&dataFim=${dataFim}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao consultar dados');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao consultar dados');
    } finally {
      setLoading(false);
    }
  }

  async function handleGerarPDF() {
    if (!data) return;

    try {
      setGeneratingPdf(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100'}/relatorios/consumo/produto/${codprod}/pdf?dataInicio=${dataInicio}&dataFim=${dataFim}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consumo-produto-${codprod}-${dataInicio}-${dataFim}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Análise de Consumo por Produto</h1>
        <p className="text-muted-foreground">
          Consulte o consumo detalhado de um produto específico com saldos inicial e final
        </p>
      </div>

      {/* Formulário de Consulta */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros de Consulta</CardTitle>
          <CardDescription>
            Informe o código do produto e o período para análise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="codprod">Código do Produto</Label>
              <Input
                id="codprod"
                type="number"
                placeholder="Ex: 3680"
                value={codprod}
                onChange={(e) => setCodprod(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConsultar()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex items-end">
              <Button
                onClick={handleConsultar}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Consultar
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {data && (
        <>
          {/* Informações do Produto */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {data.produto.descrprod}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-3 mt-2">
                    <span>Código: {data.produto.codprod}</span>
                    <Badge variant={data.produto.ativo === 'S' ? 'default' : 'secondary'}>
                      {data.produto.ativo === 'S' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </CardDescription>
                </div>
                <Button
                  onClick={handleGerarPDF}
                  disabled={generatingPdf}
                  variant="outline"
                >
                  {generatingPdf ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Gerar PDF (A4)
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Período: {formatDate(data.periodo.inicio)} até {formatDate(data.periodo.fim)}
                </span>
                <span className="text-xs">({data.periodo.dias} dias)</span>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Saldo */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Saldo Inicial */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Inicial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatNumber(data.resumo.saldoInicialQuantidade || 0)}
                    </span>
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Valor: {formatCurrency(data.resumo.saldoInicialValor || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Em {formatDate(data.periodo.inicio)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saldo Final */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatNumber(data.resumo.saldoFinalQuantidade || 0)}
                    </span>
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Valor: {formatCurrency(data.resumo.saldoFinalValor || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Em {formatDate(data.periodo.fim)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cards de Movimentação */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Entradas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Entradas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{formatNumber(data.resumo.quantidadeEntrada)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(data.resumo.valorEntrada)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consumo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Consumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{formatNumber(data.resumo.quantidadeConsumo)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(data.resumo.valorConsumo)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Média Diária */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {formatNumber(data.resumo.mediaDiariaConsumo)}
                  </div>
                  <div className="text-xs text-muted-foreground">unidades/dia</div>
                </div>
              </CardContent>
            </Card>

            {/* Movimentações */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{data.resumo.totalMovimentacoes}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatNumber(data.resumo.mediaPorMovimentacao)} un/mov
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Variação de Estoque (Quantidade):</span>
                  <span className={`font-bold ${
                    ((data.resumo.saldoFinalQuantidade || 0) - (data.resumo.saldoInicialQuantidade || 0)) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {((data.resumo.saldoFinalQuantidade || 0) - (data.resumo.saldoInicialQuantidade || 0)) >= 0 ? '+' : ''}
                    {formatNumber((data.resumo.saldoFinalQuantidade || 0) - (data.resumo.saldoInicialQuantidade || 0))}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Variação de Estoque (Valor):</span>
                  <span className={`font-bold ${
                    ((data.resumo.saldoFinalValor || 0) - (data.resumo.saldoInicialValor || 0)) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formatCurrency((data.resumo.saldoFinalValor || 0) - (data.resumo.saldoInicialValor || 0))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
