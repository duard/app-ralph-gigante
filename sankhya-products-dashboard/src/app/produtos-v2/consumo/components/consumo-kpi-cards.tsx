import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Users, Package } from 'lucide-react';
import { formatarValor } from '@/lib/api/consumo-service';
import type { ConsumoAnalise } from '@/types/consumo';

interface ConsumoKpiCardsProps {
  analiseData: ConsumoAnalise;
}

export function ConsumoKpiCards({ analiseData }: ConsumoKpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Movimentações</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analiseData.totais.movimentacoes.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analiseData.totais.quantidadeTotal.toLocaleString('pt-BR')} unidades consumidas
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Produtos Consumidos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analiseData.totais.produtos.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Produtos distintos</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Departamentos Ativos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analiseData.totais.departamentos.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analiseData.totais.usuarios} usuários
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarValor(analiseData.totais.valorTotal)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
        </CardContent>
      </Card>
    </div>
  );
}
