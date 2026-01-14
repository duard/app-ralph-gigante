'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileWarning, Download, CheckCircle, Loader2, Eye } from 'lucide-react';
import {
  getProdutosSemNCM,
  calcularPercentual,
  type ProdutoSemNCM,
  type ProdutosSemNCMResponse,
} from '@/lib/api/qualidade-service';

export default function SemNCMPage() {
  const [data, setData] = useState<ProdutosSemNCMResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const result = await getProdutosSemNCM();
      setData(result);
    } catch (err) {
      console.error('Erro ao carregar produtos sem NCM:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function exportarCSV() {
    if (!data) return;

    const headers = ['Código', 'Descrição', 'Status', 'Estoque', 'Criticidade'];
    const rows = data.produtos.map((p) => [
      p.codprod,
      p.descrprod,
      p.ativo === 'S' ? 'Ativo' : 'Inativo',
      p.estoqueTotal,
      p.criticidade,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produtos-sem-ncm-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={loadData}>Tentar Novamente</Button>
      </div>
    );
  }

  if (!data) return null;

  const percentualCriticos = calcularPercentual(data.totalCriticos, data.total);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos Sem NCM</h1>
          <p className="text-muted-foreground mt-2">
            Lista de produtos sem NCM cadastrado - Compliance Fiscal
          </p>
        </div>
        <Button onClick={exportarCSV} disabled={data.produtos.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Rich Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sem NCM</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Produtos que necessitam NCM
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criticidade Alta</CardTitle>
            <FileWarning className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCriticos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ativos com estoque ({percentualCriticos.toFixed(1)}%)
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${percentualCriticos}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAtivos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {calcularPercentual(data.totalAtivos, data.total).toFixed(1)}% do total
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${calcularPercentual(data.totalAtivos, data.total)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Estoque</CardTitle>
            <FileWarning className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalComEstoque}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {calcularPercentual(data.totalComEstoque, data.total).toFixed(1)}% têm estoque
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${calcularPercentual(data.totalComEstoque, data.total)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            Produtos que necessitam cadastro de NCM para compliance fiscal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.produtos.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum produto sem NCM encontrado!</p>
              <p className="text-sm text-muted-foreground">
                Todos os produtos estão em conformidade com o cadastro de NCM.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.produtos.map((produto) => (
                <div
                  key={produto.codprod}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{produto.descrprod}</p>
                      <Badge
                        variant={
                          produto.criticidade === 'ALTA'
                            ? 'destructive'
                            : produto.criticidade === 'MEDIA'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {produto.criticidade}
                      </Badge>
                      <Badge variant={produto.ativo === 'S' ? 'default' : 'secondary'}>
                        {produto.ativo === 'S' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Código: {produto.codprod}</span>
                      <span>•</span>
                      <span>Estoque: {produto.estoqueTotal} un</span>
                      {produto.marca && (
                        <>
                          <span>•</span>
                          <span>Marca: {produto.marca}</span>
                        </>
                      )}
                      {produto.tgfgru && (
                        <>
                          <span>•</span>
                          <span>Grupo: {produto.tgfgru.descrgrupoprod}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/produtos-v2/${produto.codprod}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Por que o NCM é importante?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Compliance Fiscal:</strong> O NCM (Nomenclatura Comum do Mercosul) é
            obrigatório para emissão de notas fiscais eletrônicas (NF-e).
          </p>
          <p>
            <strong>Tributação:</strong> Determina alíquotas de impostos (ICMS, IPI, PIS, COFINS).
          </p>
          <p>
            <strong>Penalidades:</strong> Produtos sem NCM podem gerar rejeição de NF-e e multas
            fiscais.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
