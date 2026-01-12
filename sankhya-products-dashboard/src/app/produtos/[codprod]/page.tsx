'use client';

import { BaseLayout } from '@/components/layouts/base-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProduct, useProductLocations } from '@/hooks/use-products-complete';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  ArrowLeft,
  Package,
  MapPin,
  Warehouse,
  TrendingUp,
  Calendar,
  ShoppingCart,
  FileText,
  BarChart3,
  History,
  Info,
  RefreshCw,
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
    error: errorProduct,
  } = useProduct(Number(codprod));
  const {
    data: locations,
    isLoading: isLoadingLocations,
    refetch: refetchLocations,
  } = useProductLocations(Number(codprod));

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchProduct(), refetchLocations()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchProduct, refetchLocations]);

  if (isLoadingProduct) {
    return (
      <BaseLayout title="Detalhes do Produto" description="Carregando...">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (errorProduct || !product) {
    return (
      <BaseLayout title="Produto não encontrado" description="">
        <div className="container mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorProduct ? 'Erro ao carregar produto' : 'Produto não encontrado'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/produtos')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para produtos
          </Button>
        </div>
      </BaseLayout>
    );
  }

  const totalEstoque = locations?.reduce((acc, loc) => acc + (loc.estoque || 0), 0) || 0;
  const isAtivo = product.ativo === 'S';

  return (
    <BaseLayout title={`${product.descrprod}`} description={`Código: ${product.codprod}`}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/produtos')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>

                <div className="border-l pl-4 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold mb-2">{product.descrprod}</h1>
                      {product.compldesc && (
                        <p className="text-muted-foreground mb-3">{product.compldesc}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          #{product.codprod}
                        </Badge>
                        {product.referencia && (
                          <Badge variant="secondary">Ref: {product.referencia}</Badge>
                        )}
                        {product.marca && <Badge variant="secondary">{product.marca}</Badge>}
                        <Badge variant={isAtivo ? 'default' : 'secondary'}>
                          {isAtivo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Estoque */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-blue-600" />
                Estoque Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalEstoque}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {locations?.length || 0} {locations?.length === 1 ? 'local' : 'locais'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                Localizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{locations?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Pontos de estoque</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-purple-600" />
                Última Compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.ultimaCompraData ? (
                <>
                  <div className="text-lg font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      product.ultimaCompraValor || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(product.ultimaCompraData), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium text-muted-foreground">-</div>
                  <p className="text-xs text-muted-foreground mt-1">Sem registro</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-orange-600" />
                Controle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {product.tipcontest === 'L'
                  ? 'Lote'
                  : product.tipcontest === 'S'
                    ? 'Série'
                    : 'Sem controle'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tipo: {product.tipcontest || 'N'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Informações e Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Código</div>
                  <div className="font-mono font-semibold">{product.codprod}</div>
                </div>
                {product.referencia && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Referência</div>
                    <div className="font-medium">{product.referencia}</div>
                  </div>
                )}
                {product.codvol && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Unidade</div>
                    <div className="font-medium">{product.codvol}</div>
                  </div>
                )}
                {product.codgrupoprod && (
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Grupo</div>
                    <div className="font-medium">
                      {product.descrgrupoprod || `#${product.codgrupoprod}`}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Histórico de Consumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate(`/produtos/${codprod}/consumo`)}
              >
                <History className="mr-2 h-4 w-4" />
                Consumo Simples (V1)
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate(`/produtos/${codprod}/consumo-v2`)}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Consumo Detalhado (V2)
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate(`/produtos/${codprod}/consumo-v3`)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Visão 360° (V3)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Localizações */}
        {locations && locations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localizações de Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Local</TableHead>
                      <TableHead>Controle</TableHead>
                      <TableHead className="text-right">Estoque</TableHead>
                      <TableHead className="text-right">Mín.</TableHead>
                      <TableHead className="text-right">Máx.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((loc) => (
                      <TableRow key={loc.codlocal}>
                        <TableCell>
                          <div className="font-medium">{loc.descrlocal}</div>
                          <div className="text-xs text-muted-foreground">#{loc.codlocal}</div>
                        </TableCell>
                        <TableCell>
                          {loc.controle ? (
                            <Badge variant="outline" className="font-mono text-xs">
                              {loc.controle}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono">
                          {loc.estoque}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground font-mono">
                          {loc.estmin || '-'}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground font-mono">
                          {loc.estmax || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseLayout>
  );
}
