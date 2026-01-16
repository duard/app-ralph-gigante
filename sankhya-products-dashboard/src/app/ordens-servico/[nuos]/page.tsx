import { useParams, Link } from 'react-router-dom'
import { BaseLayout } from '@/components/layouts/base-layout'
import { useOrdemServico } from '@/hooks/use-ordens-servico'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Printer, Edit, Clock, Package, Wrench } from 'lucide-react'
import { STATUS_LABELS, MANUTENCAO_LABELS, TIPO_LABELS } from '@/types/ordens-servico'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ServicosTab } from './components/servicos-tab'
import { ApontamentosTab } from './components/apontamentos-tab'
import { ProdutosTab } from './components/produtos-tab'

export default function OrdemServicoDetalhesPage() {
  const { nuos } = useParams<{ nuos: string }>()
  const { data: os, isLoading } = useOrdemServico(Number(nuos))

  if (isLoading) {
    return (
      <BaseLayout title="Carregando..." description="Aguarde">
        <div className="@container/main px-3 sm:px-4 lg:px-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </BaseLayout>
    )
  }

  if (!os) {
    return (
      <BaseLayout title="OS não encontrada" description="Verifique o número da OS">
        <div className="@container/main px-3 sm:px-4 lg:px-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Ordem de serviço não encontrada
              </p>
              <div className="flex justify-center mt-4">
                <Link to="/ordens-servico/listagem">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para listagem
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </BaseLayout>
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
    <BaseLayout
      title={`OS #${os.nuos}`}
      description={`${os.veiculo?.placa || 'Sem placa'} - ${os.veiculo?.marcamodelo || 'N/A'}`}
    >
      <div className="@container/main px-3 sm:px-4 lg:px-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/ordens-servico/listagem">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Cabeçalho da OS */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-3xl">OS #{os.nuos}</CardTitle>
                  {getStatusBadge(os.status)}
                  {os.manutencao && (
                    <Badge variant="secondary">
                      {MANUTENCAO_LABELS[os.manutencao]}
                    </Badge>
                  )}
                  {os.tipo && (
                    <Badge variant="outline">
                      {TIPO_LABELS[os.tipo]}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Aberta em {os.dtabertura && format(new Date(os.dtabertura), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Veículo */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Veículo</h3>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">{os.veiculo?.placa || 'Sem placa'}</p>
                  <p className="text-sm text-muted-foreground">{os.veiculo?.marcamodelo}</p>
                  {os.veiculo?.ad_tipoeqpto && (
                    <p className="text-xs text-muted-foreground">{os.veiculo.ad_tipoeqpto}</p>
                  )}
                  {os.veiculo?.chassis && (
                    <p className="text-xs text-muted-foreground">Chassis: {os.veiculo.chassis}</p>
                  )}
                </div>
              </div>

              {/* Datas */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Datas</h3>
                <div className="space-y-1 text-sm">
                  {os.dtabertura && (
                    <p><span className="text-muted-foreground">Abertura:</span> {format(new Date(os.dtabertura), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  )}
                  {os.dataini && (
                    <p><span className="text-muted-foreground">Início:</span> {format(new Date(os.dataini), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  )}
                  {os.previsao && (
                    <p><span className="text-muted-foreground">Previsão:</span> {format(new Date(os.previsao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  )}
                  {os.datafin && (
                    <p><span className="text-muted-foreground">Finalização:</span> {format(new Date(os.datafin), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  )}
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Informações</h3>
                <div className="space-y-1 text-sm">
                  {os.km !== undefined && (
                    <p><span className="text-muted-foreground">KM:</span> {os.km.toLocaleString()}</p>
                  )}
                  {os.horimetro !== undefined && (
                    <p><span className="text-muted-foreground">Horímetro:</span> {os.horimetro}</p>
                  )}
                  {os.usuarioInclusao && (
                    <p><span className="text-muted-foreground">Aberto por:</span> {os.usuarioInclusao.nomeusu}</p>
                  )}
                  {os.usuarioResponsavel && (
                    <p><span className="text-muted-foreground">Responsável:</span> {os.usuarioResponsavel.nomeusu}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="grid gap-4 md:grid-cols-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{os.totalServicos || 0}</div>
                <p className="text-xs text-muted-foreground">Serviços</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{os.totalHorasHomem?.toFixed(1) || 0}h</div>
                <p className="text-xs text-muted-foreground">Horas Totais</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{os.totalProdutos || 0}</div>
                <p className="text-xs text-muted-foreground">Produtos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {os.totalCusto ? `R$ ${os.totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                </div>
                <p className="text-xs text-muted-foreground">Custo Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="servicos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="servicos" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="apontamentos" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Apontamentos
            </TabsTrigger>
            <TabsTrigger value="produtos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="servicos" className="mt-4">
            <ServicosTab nuos={Number(nuos)} />
          </TabsContent>

          <TabsContent value="apontamentos" className="mt-4">
            <ApontamentosTab nuos={Number(nuos)} />
          </TabsContent>

          <TabsContent value="produtos" className="mt-4">
            <ProdutosTab nuos={Number(nuos)} />
          </TabsContent>
        </Tabs>
      </div>
    </BaseLayout>
  )
}
