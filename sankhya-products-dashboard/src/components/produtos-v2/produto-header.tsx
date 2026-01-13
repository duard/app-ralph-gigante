import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProdutoV2Completo } from '@/types/produto-v2';
import { Link } from 'react-router-dom';
import { Package, Scale, Weight, Tag, Warehouse } from 'lucide-react';

interface ProdutoHeaderProps {
  produto: ProdutoV2Completo | undefined;
  loading: boolean;
}

export function ProdutoHeader({ produto, loading }: ProdutoHeaderProps) {
  if (loading || !produto) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-96" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Cód:</span>
              <span className="text-2xl font-bold">{produto.codprod}</span>
            </div>
            <h1 className="text-2xl font-bold mt-1">{produto.descrprod}</h1>
          </div>
          <Badge variant={produto.ativo === 'S' ? 'default' : 'secondary'}>
            {produto.ativo === 'S' ? 'Ativo' : 'Inativo'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Grupo</span>
            </div>
            <Link
              to={`/produtos-v2/grupo/${produto.codgrupoprod}`}
              className="text-base font-medium hover:underline"
            >
              {produto.descrgrupoprod || '-'}
            </Link>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Warehouse className="h-4 w-4" />
              <span>Estoque</span>
            </div>
            <p className="text-base font-medium">
              {produto.estoque !== null ? produto.estoque : '-'}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Scale className="h-4 w-4" />
              <span>Valor</span>
            </div>
            <p className="text-base font-medium">
              {produto.valorEstoque
                ? `R$ ${produto.valorEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '-'}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Marca</span>
            </div>
            <p className="text-base font-medium">{produto.marca || '-'}</p>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Weight className="h-4 w-4" />
              <span>Peso Bruto</span>
            </div>
            <p className="text-base font-medium">
              {produto.pesobruto ? `${produto.pesobruto} kg` : '-'}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Weight className="h-4 w-4" />
              <span>Peso Líq.</span>
            </div>
            <p className="text-base font-medium">
              {produto.pesoliq ? `${produto.pesoliq} kg` : '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
