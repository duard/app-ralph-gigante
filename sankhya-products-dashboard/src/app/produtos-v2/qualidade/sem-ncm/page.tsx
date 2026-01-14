'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileWarning, Download, CheckCircle } from 'lucide-react';

// Mock data - substituir por dados reais da API
const produtosSemNCM = [
  {
    codprod: 1234,
    descrprod: 'PRODUTO TESTE A',
    ativo: 'S',
    estoqueTotal: 100,
    criticidade: 'ALTA',
  },
  {
    codprod: 5678,
    descrprod: 'PRODUTO TESTE B',
    ativo: 'S',
    estoqueTotal: 0,
    criticidade: 'MEDIA',
  },
  {
    codprod: 9012,
    descrprod: 'PRODUTO TESTE C',
    ativo: 'N',
    estoqueTotal: 50,
    criticidade: 'BAIXA',
  },
];

export default function SemNCMPage() {
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
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sem NCM</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">12.5% do acervo total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criticidade Alta</CardTitle>
            <FileWarning className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Ativos com estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corrigir Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Meta diária</p>
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
          <div className="space-y-4">
            {produtosSemNCM.map((produto) => (
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
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Visualizar
                  </Button>
                  <Button size="sm">Cadastrar NCM</Button>
                </div>
              </div>
            ))}
          </div>
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
