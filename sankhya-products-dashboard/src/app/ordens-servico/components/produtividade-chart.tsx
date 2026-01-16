import { useProdutividade } from '@/hooks/use-ordens-servico'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function ProdutividadeChart() {
  const { data: produtividade, isLoading } = useProdutividade()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtividade dos Executores</CardTitle>
          <CardDescription>Top 10 colaboradores por horas trabalhadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted/20 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!produtividade || produtividade.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtividade dos Executores</CardTitle>
          <CardDescription>Top 10 colaboradores por horas trabalhadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Sem dados de produtividade</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados para o gráfico - Top 10
  const chartData = produtividade.slice(0, 10).map((item) => ({
    nome: item.nomeExecutor.length > 15
      ? item.nomeExecutor.substring(0, 15) + '...'
      : item.nomeExecutor,
    nomeCompleto: item.nomeExecutor,
    horas: Number(item.totalHoras.toFixed(1)),
    os: item.totalOS,
    apontamentos: item.totalApontamentos,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtividade dos Executores</CardTitle>
        <CardDescription>Top 10 colaboradores por horas trabalhadas (últimos 30 dias)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="nome"
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis className="text-xs" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold mb-1">{data.nomeCompleto}</p>
                      <p className="text-sm text-muted-foreground">Horas: {data.horas}h</p>
                      <p className="text-sm text-muted-foreground">OS: {data.os}</p>
                      <p className="text-sm text-muted-foreground">Apontamentos: {data.apontamentos}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Bar dataKey="horas" fill="hsl(var(--primary))" name="Horas Trabalhadas" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
