import { useProdutosMaisUtilizados } from '@/hooks/use-ordens-servico'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function ProdutosMaisUtilizadosChart() {
  const { data: produtos, isLoading } = useProdutosMaisUtilizados()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Utilizados</CardTitle>
          <CardDescription>Top 10 produtos/peças em OS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted/20 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!produtos || produtos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Utilizados</CardTitle>
          <CardDescription>Top 10 produtos/peças em OS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Sem dados de produtos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados para o gráfico - Top 10
  const chartData = produtos.slice(0, 10).map((item) => ({
    produto: item.descrprod.length > 20
      ? item.descrprod.substring(0, 20) + '...'
      : item.descrprod,
    produtoCompleto: item.descrprod,
    quantidade: item.qtdTotal,
    valor: Number((item.valorTotal / 1000).toFixed(1)), // Em milhares
    os: item.qtdOS,
    referencia: item.referencia,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Mais Utilizados</CardTitle>
        <CardDescription>Top 10 produtos/peças em OS (últimos 180 dias)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="produto"
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis yAxisId="left" className="text-xs" />
            <YAxis yAxisId="right" orientation="right" className="text-xs" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold mb-1">{data.produtoCompleto}</p>
                      {data.referencia && (
                        <p className="text-xs text-muted-foreground mb-1">Ref: {data.referencia}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Qtd: {data.quantidade}</p>
                      <p className="text-sm text-muted-foreground">Valor: R$ {(data.valor * 1000).toLocaleString('pt-BR')}</p>
                      <p className="text-sm text-muted-foreground">Usado em {data.os} OS</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="quantidade" fill="hsl(var(--primary))" name="Quantidade" radius={[8, 8, 0, 0]} />
            <Bar yAxisId="right" dataKey="valor" fill="hsl(var(--chart-2))" name="Valor (mil R$)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
