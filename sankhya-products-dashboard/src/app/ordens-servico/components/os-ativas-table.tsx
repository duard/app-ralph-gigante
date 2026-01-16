import { useOSAtivas } from '@/hooks/use-ordens-servico'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, MANUTENCAO_LABELS, SITUACAO_LABELS } from '@/types/ordens-servico'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { Eye, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OSAtivasTable() {
  const { data: osAtivas, isLoading } = useOSAtivas()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OS Ativas</CardTitle>
          <CardDescription>Ordens em execução ou aguardando início</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!osAtivas || osAtivas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OS Ativas</CardTitle>
          <CardDescription>Ordens em execução ou aguardando início</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma OS ativa no momento</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSituacaoBadge = (situacao?: string) => {
    switch (situacao) {
      case 'NO_PRAZO':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">No Prazo</Badge>
      case 'ATRASADO':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Atrasado</Badge>
      case 'CRITICO':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Crítico</Badge>
      default:
        return <Badge variant="outline">-</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'E':
        return <Badge className="bg-blue-500">Em Execução</Badge>
      case 'A':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Aberta</Badge>
      default:
        return <Badge variant="outline">{STATUS_LABELS[status] || status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>OS Ativas ({osAtivas.length})</CardTitle>
            <CardDescription>Ordens em execução ou aguardando início</CardDescription>
          </div>
          <Link to="/ordens-servico/listagem?status=E,A">
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {osAtivas.slice(0, 10).map((os) => (
            <div
              key={os.nuos}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">OS #{os.nuos}</span>
                  {getStatusBadge(os.status)}
                  {os.manutencao && (
                    <Badge variant="secondary">
                      {MANUTENCAO_LABELS[os.manutencao]}
                    </Badge>
                  )}
                  {getSituacaoBadge(os.situacao)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium">
                    {os.placa || 'Sem placa'} - {os.veiculo || 'Veículo não informado'}
                  </span>
                  {os.diasEmManutencao !== undefined && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {os.diasEmManutencao} dias em manutenção
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {os.servicosConcluidos || 0} de {os.qtdServicos || 0} serviços concluídos
                  {os.proximoServico && (
                    <span className="ml-2">• Próximo: {os.proximoServico}</span>
                  )}
                </div>
              </div>
              <Link to={`/ordens-servico/${os.nuos}`}>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
