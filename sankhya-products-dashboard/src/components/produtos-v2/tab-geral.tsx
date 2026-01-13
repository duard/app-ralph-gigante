import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProdutoV2Completo } from '@/types/produto-v2';

interface TabGeralProps {
  produto: ProdutoV2Completo | undefined;
  loading: boolean;
}

export function TabGeral({ produto, loading }: TabGeralProps) {
  if (loading || !produto) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Código</h3>
              <p className="text-lg font-medium">{produto.codprod}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
              <p className="text-lg font-medium">{produto.descrprod}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Referência</h3>
              <p className="text-lg font-medium">{produto.referencia || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Marca</h3>
              <p className="text-lg font-medium">{produto.marca || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Código de Volume</h3>
              <p className="text-lg font-medium">{produto.codvol || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Unidade de Medida</h3>
              <p className="text-lg font-medium">{produto.codvol || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classificação Fiscal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">NCM</h3>
              <p className="text-lg font-medium">{produto.ncm || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Origem</h3>
              <p className="text-lg font-medium">{produto.origprod || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Características Físicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Peso Bruto</h3>
              <p className="text-lg font-medium">
                {produto.pesobruto ? `${produto.pesobruto} kg` : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Peso Líquido</h3>
              <p className="text-lg font-medium">
                {produto.pesoliq ? `${produto.pesoliq} kg` : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Tipo de Controle</h3>
              <p className="text-lg font-medium">{produto.tipcontest || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(produto.compldesc || produto.caracteristicas || produto.usoprod) && (
        <Card>
          <CardHeader>
            <CardTitle>Descrições Complementares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {produto.compldesc && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Descrição Complementar
                </h3>
                <p className="mt-1">{produto.compldesc}</p>
              </div>
            )}
            {produto.caracteristicas && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Características</h3>
                <p className="mt-1">{produto.caracteristicas}</p>
              </div>
            )}
            {produto.usoprod && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Uso/Produto</h3>
                <p className="mt-1">{produto.usoprod}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
