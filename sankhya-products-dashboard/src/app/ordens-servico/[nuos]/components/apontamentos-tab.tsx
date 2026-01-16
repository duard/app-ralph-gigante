import { useApontamentosOS } from '@/hooks/use-ordens-servico'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock } from 'lucide-react'

interface ApontamentosTabProps {
  nuos: number
}

export function ApontamentosTab({ nuos }: ApontamentosTabProps) {
  const { data: apontamentos, isLoading } = useApontamentosOS(nuos)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!apontamentos || apontamentos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            Nenhum apontamento de tempo registrado
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatMinutosParaHoras = (minutos: number) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${horas}h ${mins}m`
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seq.</TableHead>
                <TableHead>Executor</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Intervalo</TableHead>
                <TableHead>Horas Trab.</TableHead>
                <TableHead>Horas Líq.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apontamentos.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium">{apt.sequencia}</TableCell>
                  <TableCell>
                    <div className="font-medium">{apt.executor?.nomeusu || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {apt.servicoDescricao || '-'}
                  </TableCell>
                  <TableCell>
                    {apt.dhini
                      ? format(new Date(apt.dhini), 'dd/MM/yy HH:mm', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {apt.dhfin
                      ? format(new Date(apt.dhfin), 'dd/MM/yy HH:mm', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {apt.intervaloMinutos ? formatMinutosParaHoras(apt.intervaloMinutos) : '-'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {apt.minutosTrabalhados
                      ? formatMinutosParaHoras(apt.minutosTrabalhados)
                      : '-'}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {apt.minutosLiquidos ? formatMinutosParaHoras(apt.minutosLiquidos) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totais */}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              Total de Apontamentos
            </div>
            <div className="text-2xl font-bold">{apontamentos.length}</div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              Horas Trabalhadas
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatMinutosParaHoras(
                apontamentos.reduce((sum, a) => sum + (a.minutosTrabalhados || 0), 0)
              )}
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              Horas Líquidas
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatMinutosParaHoras(
                apontamentos.reduce((sum, a) => sum + (a.minutosLiquidos || 0), 0)
              )}
            </div>
          </div>
        </div>

        {/* Executores únicos */}
        <div className="mt-4 p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Executores:</span>{' '}
            {Array.from(new Set(apontamentos.map((a) => a.executor?.nomeusu).filter(Boolean))).join(
              ', '
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
