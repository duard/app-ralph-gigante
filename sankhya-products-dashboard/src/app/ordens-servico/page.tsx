import { BaseLayout } from '@/components/layouts/base-layout'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { DataBoundaryWrapper } from '@/components/ui/data-error-boundary'
import { Suspense } from 'react'
import { EstatisticasCards } from './components/estatisticas-cards'
import { OSAtivasTable } from './components/os-ativas-table'
import { ProdutividadeChart } from './components/produtividade-chart'
import { ProdutosMaisUtilizadosChart } from './components/produtos-mais-utilizados-chart'
import { Button } from '@/components/ui/button'
import { RefreshCw, Plus, FileText } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { osQueryKeys } from '@/hooks/use-ordens-servico'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

export default function OrdensServicoPage() {
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    toast.loading('Atualizando dados...')
    queryClient.invalidateQueries({ queryKey: osQueryKeys.all })
    setTimeout(() => {
      toast.success('Dados atualizados!')
    }, 500)
  }

  return (
    <BaseLayout>
      <div className="@container/main px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
        {/* Header com ações */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard de Manutenção</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe as ordens de serviço e produtividade
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Link to="/ordens-servico/listagem">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Ver Todas
              </Button>
            </Link>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova OS
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <ErrorBoundary title="Erro nas Estatísticas">
          <DataBoundaryWrapper title="Erro ao carregar estatísticas">
            <Suspense
              fallback={<div className="h-32 bg-muted/20 animate-pulse rounded-lg"></div>}
            >
              <EstatisticasCards />
            </Suspense>
          </DataBoundaryWrapper>
        </ErrorBoundary>

        {/* OS Ativas */}
        <ErrorBoundary title="Erro em OS Ativas">
          <DataBoundaryWrapper title="Erro ao carregar OS ativas">
            <Suspense
              fallback={<div className="h-96 bg-muted/20 animate-pulse rounded-lg"></div>}
            >
              <OSAtivasTable />
            </Suspense>
          </DataBoundaryWrapper>
        </ErrorBoundary>

        {/* Charts */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <ErrorBoundary title="Erro no Gráfico de Produtividade">
            <DataBoundaryWrapper title="Erro ao carregar produtividade">
              <Suspense
                fallback={<div className="h-96 bg-muted/20 animate-pulse rounded-lg"></div>}
              >
                <ProdutividadeChart />
              </Suspense>
            </DataBoundaryWrapper>
          </ErrorBoundary>

          <ErrorBoundary title="Erro no Gráfico de Produtos">
            <DataBoundaryWrapper title="Erro ao carregar produtos">
              <Suspense
                fallback={<div className="h-96 bg-muted/20 animate-pulse rounded-lg"></div>}
              >
                <ProdutosMaisUtilizadosChart />
              </Suspense>
            </DataBoundaryWrapper>
          </ErrorBoundary>
        </div>
      </div>
    </BaseLayout>
  )
}
