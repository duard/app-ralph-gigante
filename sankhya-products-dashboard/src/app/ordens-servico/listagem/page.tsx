import { useState } from 'react'
import { BaseLayout } from '@/components/layouts/base-layout'
import { useOrdensServico } from '@/hooks/use-ordens-servico'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Filter, Eye, Download, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { OrdemServicoFindAllParams } from '@/types/ordens-servico'
import { STATUS_LABELS, MANUTENCAO_LABELS, TIPO_LABELS } from '@/types/ordens-servico'

export default function OrdensServicoListagemPage() {
  const [filters, setFilters] = useState<OrdemServicoFindAllParams>({
    page: 1,
    perPage: 50,
  })

  const { data, isLoading, refetch } = useOrdensServico(filters)

  const handleFilterChange = (key: keyof OrdemServicoFindAllParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      F: 'bg-green-100 text-green-800 border-green-200',
      E: 'bg-blue-100 text-blue-800 border-blue-200',
      A: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      R: 'bg-orange-100 text-orange-800 border-orange-200',
    }
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {STATUS_LABELS[status]}
      </Badge>
    )
  }

  const getSituacaoBadge = (situacao?: string) => {
    switch (situacao) {
      case 'NO_PRAZO':
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">No Prazo</Badge>
      case 'CONCLUIDA_NO_PRAZO':
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">Concluída</Badge>
      case 'ATRASADA':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400">Atrasada</Badge>
      case 'CONCLUIDA_ATRASADA':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400">Conc. Atrasada</Badge>
      default:
        return null
    }
  }

  return (
    <BaseLayout
      title="Listagem de Ordens de Serviço"
      description="Consulte e filtre todas as ordens de serviço"
    >
      <div className="@container/main px-3 sm:px-4 lg:px-6 space-y-4">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por placa, veículo..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status */}
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="F">Finalizada</SelectItem>
                  <SelectItem value="E">Em Execução</SelectItem>
                  <SelectItem value="A">Aberta</SelectItem>
                  <SelectItem value="R">Reaberta</SelectItem>
                </SelectContent>
              </Select>

              {/* Manutenção */}
              <Select
                value={filters.manutencao || 'all'}
                onValueChange={(value) => handleFilterChange('manutencao', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Manutenção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="C">Corretiva</SelectItem>
                  <SelectItem value="P">Preventiva</SelectItem>
                  <SelectItem value="O">Outros</SelectItem>
                </SelectContent>
              </Select>

              {/* Tipo */}
              <Select
                value={filters.tipo || 'all'}
                onValueChange={(value) => handleFilterChange('tipo', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="I">Interna</SelectItem>
                  <SelectItem value="E">Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ page: 1, perPage: 50 })}
              >
                Limpar Filtros
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Ordens de Serviço {data && `(${data.total})`}
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted/20 animate-pulse rounded" />
                ))}
              </div>
            ) : data && data.data.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>OS</TableHead>
                        <TableHead>Veículo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Manutenção</TableHead>
                        <TableHead>Abertura</TableHead>
                        <TableHead>Previsão</TableHead>
                        <TableHead>Situação</TableHead>
                        <TableHead>Serviços</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((os) => (
                        <TableRow key={os.nuos} className="hover:bg-muted/50">
                          <TableCell className="font-medium">#{os.nuos}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{os.veiculo?.placa || 'Sem placa'}</div>
                              <div className="text-xs text-muted-foreground">
                                {os.veiculo?.marcamodelo || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(os.status)}</TableCell>
                          <TableCell>
                            {os.manutencao && (
                              <Badge variant="secondary">
                                {MANUTENCAO_LABELS[os.manutencao]}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {os.dtabertura
                              ? format(new Date(os.dtabertura), 'dd/MM/yyyy', { locale: ptBR })
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {os.previsao
                              ? format(new Date(os.previsao), 'dd/MM/yyyy', { locale: ptBR })
                              : '-'}
                          </TableCell>
                          <TableCell>{getSituacaoBadge(os.situacaoPrazo)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {os.qtdServicosFinalizados || 0} / {os.qtdServicos || 0}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/ordens-servico/${os.nuos}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(data.page - 1) * data.perPage + 1} a{' '}
                    {Math.min(data.page * data.perPage, data.total)} de {data.total} resultados
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.page === 1}
                      onClick={() => handlePageChange(data.page - 1)}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, data.lastPage) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={data.page === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.page === data.lastPage}
                      onClick={() => handlePageChange(data.page + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma OS encontrada com os filtros selecionados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
