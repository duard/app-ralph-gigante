import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users } from 'lucide-react';
import { formatarValor } from '@/lib/api/consumo-service';
import type { ConsumoAnalise } from '@/types/consumo';

interface ConsumoTopRankingsProps {
  analiseData: ConsumoAnalise;
}

export function ConsumoTopRankings({ analiseData }: ConsumoTopRankingsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Top Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top 5 Produtos
          </CardTitle>
          <CardDescription>Mais consumidos no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analiseData.topProdutos.slice(0, 5).map((prod, idx) => (
              <div key={prod.codprod} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/produtos-v2/${prod.codprod}`}
                      className="text-sm font-medium hover:underline line-clamp-2"
                    >
                      #{idx + 1} {prod.descrprod}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {prod.quantidade.toLocaleString('pt-BR')} un • {formatarValor(prod.valor)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {prod.percentual.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${prod.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Departamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top 5 Departamentos
          </CardTitle>
          <CardDescription>Maiores consumidores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analiseData.topDepartamentos.slice(0, 5).map((dep, idx) => (
              <div key={dep.coddep || idx} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">
                    #{idx + 1} {dep.descrDep}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {dep.percentual.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {dep.quantidade.toLocaleString('pt-BR')} un • {formatarValor(dep.valor)}
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${dep.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top 5 Usuários
          </CardTitle>
          <CardDescription>Mais requisições</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analiseData.topUsuarios.slice(0, 5).map((usr, idx) => (
              <div key={usr.codusuinc} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">
                    #{idx + 1} {usr.nomeusu}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {usr.percentual.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {usr.quantidade.toLocaleString('pt-BR')} un • {formatarValor(usr.valor)}
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${usr.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
