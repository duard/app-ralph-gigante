import { useServicosOS } from '@/hooks/use-ordens-servico'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { STATUS_LABELS } from '@/types/ordens-servico'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ServicosTabProps {
  nuos: number
}

export function ServicosTab({ nuos }: ServicosTabProps) {
  const { data: servicos, isLoading } = useServicosOS(nuos)

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

  if (!servicos || servicos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            Nenhum serviço cadastrado nesta OS
          </p>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      F: 'bg-green-100 text-green-800',
      E: 'bg-blue-100 text-blue-800',
      A: 'bg-yellow-100 text-yellow-800',
      R: 'bg-orange-100 text-orange-800',
    }
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {STATUS_LABELS[status]}
      </Badge>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seq.</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Vlr. Unit.</TableHead>
                <TableHead>Vlr. Total</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicos.map((servico) => (
                <TableRow key={servico.sequencia}>
                  <TableCell className="font-medium">{servico.sequencia}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{servico.produto?.descrprod || 'N/A'}</div>
                      {servico.produto?.referencia && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {servico.produto.referencia}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(servico.status)}</TableCell>
                  <TableCell>{servico.qtd || '-'}</TableCell>
                  <TableCell>
                    {servico.vlrunit
                      ? `R$ ${servico.vlrunit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '-'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {servico.vlrtot
                      ? `R$ ${servico.vlrtot.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {servico.dataini
                      ? format(new Date(servico.dataini), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {servico.datafin
                      ? format(new Date(servico.datafin), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {servico.observacao || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totais */}
        <div className="mt-4 flex justify-end">
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between gap-8">
              <span className="text-sm text-muted-foreground">Total de Serviços:</span>
              <span className="font-semibold">{servicos.length}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-sm text-muted-foreground">Valor Total:</span>
              <span className="font-semibold text-lg">
                R${' '}
                {servicos
                  .reduce((sum, s) => sum + (s.vlrtot || 0), 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
