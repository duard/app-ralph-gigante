import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users } from 'lucide-react';

export function ConsumoQuickLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análises Detalhadas</CardTitle>
        <CardDescription>Acesse relatórios e análises específicas de consumo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/produtos-v2/consumo/analise"
            className="group flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent hover:shadow-md transition-all cursor-pointer"
          >
            <BarChart3 className="h-10 w-10 mb-3 text-primary group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-center">Análise por Período</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Gráficos e tendências de consumo
            </p>
          </Link>

          <div className="flex flex-col items-center justify-center p-6 border rounded-lg opacity-50 cursor-not-allowed">
            <Users className="h-10 w-10 mb-3 text-primary" />
            <p className="font-semibold text-center">Análise por Departamento</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Em breve
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 border rounded-lg opacity-50 cursor-not-allowed">
            <Users className="h-10 w-10 mb-3 text-primary" />
            <p className="font-semibold text-center">Análise por Usuário</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Em breve
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
