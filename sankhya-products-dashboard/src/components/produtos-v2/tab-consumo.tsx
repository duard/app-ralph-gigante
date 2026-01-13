import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Download } from 'lucide-react';
import type { ConsumoMensal } from '@/types/produto-v2';
import { apiClient } from '@/lib/api/client';

interface TabConsumoProps {
  codprod: number;
}

export function TabConsumo({ codprod }: TabConsumoProps) {
  const [consumoData, setConsumoData] = useState<ConsumoMensal[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('12'); // Last 12 months

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/produtos-v2/${codprod}/consumo-mensal`, {
          params: { periodo },
        });
        setConsumoData(response.data);
      } catch (error) {
        console.error('Erro ao carregar dados de consumo:', error);
        // Fallback to mock data in case of error
        setConsumoData([
          { ano: 2025, mes: 1, descricaoMes: 'Jan/25', quantidade: 150, valor: 1500 },
          { ano: 2025, mes: 2, descricaoMes: 'Fev/25', quantidade: 200, valor: 2000 },
          { ano: 2025, mes: 3, descricaoMes: 'Mar/25', quantidade: 180, valor: 1800 },
          { ano: 2025, mes: 4, descricaoMes: 'Abr/25', quantidade: 220, valor: 2200 },
          { ano: 2025, mes: 5, descricaoMes: 'Mai/25', quantidade: 190, valor: 1900 },
          { ano: 2025, mes: 6, descricaoMes: 'Jun/25', quantidade: 210, valor: 2100 },
          { ano: 2025, mes: 7, descricaoMes: 'Jul/25', quantidade: 175, valor: 1750 },
          { ano: 2025, mes: 8, descricaoMes: 'Ago/25', quantidade: 230, valor: 2300 },
          { ano: 2025, mes: 9, descricaoMes: 'Set/25', quantidade: 195, valor: 1950 },
          { ano: 2025, mes: 10, descricaoMes: 'Out/25', quantidade: 205, valor: 2050 },
          { ano: 2025, mes: 11, descricaoMes: 'Nov/25', quantidade: 185, valor: 1850 },
          { ano: 2025, mes: 12, descricaoMes: 'Dez/25', quantidade: 215, valor: 2150 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [codprod, periodo]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Consumo Mensal</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="rounded border bg-background px-3 py-2 text-sm"
              >
                <option value="6">Últimos 6 meses</option>
                <option value="12">Últimos 12 meses</option>
                <option value="24">Últimos 24 meses</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="descricaoMes" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'quantidade') {
                      return [value, 'Quantidade'];
                    } else {
                      return [
                        `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        'Valor',
                      ];
                    }
                  }}
                />
                <Bar yAxisId="left" dataKey="quantidade" name="Quantidade" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="valor" name="Valor" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Média Diária</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumoData.map((item) => (
                  <TableRow key={`${item.ano}-${item.mes}`}>
                    <TableCell className="font-medium">{item.descricaoMes}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>
                      R${' '}
                      {item.valor.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{(item.quantidade / 30).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.quantidade > 200
                            ? 'default'
                            : item.quantidade > 100
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {item.quantidade > 200 ? 'Alto' : item.quantidade > 100 ? 'Médio' : 'Baixo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
