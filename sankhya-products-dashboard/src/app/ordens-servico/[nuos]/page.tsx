import { useParams, Link } from 'react-router-dom'
import { BaseLayout } from '@/components/layouts/base-layout'
import { useOrdemServico, useServicosOS, useApontamentosOS, useProdutosOS } from '@/hooks/use-ordens-servico'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorDisplay } from '@/components/error-display'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Printer, Clock, Package, Wrench, Truck, Timer, AlertCircle } from 'lucide-react'
import { STATUS_LABELS, MANUTENCAO_LABELS } from '@/types/ordens-servico'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Helper function to format minutes to hours
function formatMinutosParaHoras(minutos: number | undefined | null): string {
  if (!minutos) return '0h 0m'
  const horas = Math.floor(minutos / 60)
  const mins = Math.abs(minutos % 60)
  return `${horas}h ${mins}m`
}

// Helper to get status badge color
function getStatusBadgeClass(status: string) {
  const colors: Record<string, string> = {
    F: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    E: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    A: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    R: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export default function OrdemServicoDetalhesPage() {
  const { nuos } = useParams<{ nuos: string }>()
  const nuosNum = Number(nuos)

  // Fetch de cada bloco separadamente
  const { data: os, isLoading: loadingOS, error: errorOS, refetch: refetchOS } = useOrdemServico(nuosNum)
  const { data: servicos = [], isLoading: loadingServicos, error: errorServicos } = useServicosOS(nuosNum)
  const { data: apontamentos = [], isLoading: loadingApontamentos, error: errorApontamentos } = useApontamentosOS(nuosNum)
  const { data: produtos = [], isLoading: loadingProdutos, error: errorProdutos } = useProdutosOS(nuosNum)

  if (loadingOS) {
    return (
      <BaseLayout title="Carregando..." description="Aguarde">
        <div className="@container/main px-3 sm:px-4 lg:px-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </BaseLayout>
    )
  }

  if (errorOS) {
    return (
      <BaseLayout title={`Erro ao carregar OS #${nuos}`} description="Ocorreu um erro">
        <div className="@container/main px-3 sm:px-4 lg:px-6 space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/ordens-servico/listagem">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <ErrorDisplay
            error={errorOS}
            title={`Erro ao carregar OS #${nuos}`}
            onRetry={() => refetchOS()}
          />
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

  // Calculate totals from apontamentos
  const totalMinutosTrabalhados = apontamentos.reduce((sum, a) => sum + (a.minutosTrabalhados || 0), 0)
  const totalMinutosLiquidos = apontamentos.reduce((sum, a) => sum + (a.minutosLiquidos || 0), 0)
  const totalIntervaloMinutos = apontamentos.reduce((sum, a) => sum + (a.intervaloMinutos || 0), 0)
  const executoresUnicos = new Set(apontamentos.map(a => a.executor?.nomeusu).filter(Boolean))

  // Calculate product totals
  const totalProdutosValor = produtos.reduce((sum, p) => sum + (p.vlrtot || 0), 0)

  return (
    <BaseLayout>
      <div className="@container/main px-3 sm:px-4 lg:px-6 space-y-4">
        {/* Header compacto - única fonte de informação da OS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/ordens-servico/listagem">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">OS #{os.nuos}</h1>
                <Badge className={getStatusBadgeClass(os.status)}>
                  {STATUS_LABELS[os.status]}
                </Badge>
                {os.manutencao && (
                  <Badge variant="outline">
                    {MANUTENCAO_LABELS[os.manutencao]}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-3 w-3" />
                <span className="font-medium">{os.veiculo?.placa || '-'}</span>
                <span className="text-xs">·</span>
                <span className="text-xs">{os.veiculo?.marcamodelo || 'N/A'}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">

          {/* Serviços */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Wrench className="h-3 w-3" />
                Serviços
              </div>
              {loadingServicos ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <>
                  <div className="font-bold text-2xl">{servicos.length}</div>
                  <div className="text-xs text-muted-foreground">
                    {servicos.filter(s => s.status === 'F').length} finalizados
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Horas Trabalhadas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Clock className="h-3 w-3" />
                Horas Brutas
              </div>
              {loadingApontamentos ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="font-bold text-2xl text-blue-600">
                    {formatMinutosParaHoras(totalMinutosTrabalhados)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Intervalo: {formatMinutosParaHoras(totalIntervaloMinutos)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Horas Líquidas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Timer className="h-3 w-3" />
                Horas Líquidas
              </div>
              {loadingApontamentos ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="font-bold text-2xl text-green-600">
                    {formatMinutosParaHoras(totalMinutosLiquidos)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {apontamentos.length} apontamentos
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Produtos/Peças */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Package className="h-3 w-3" />
                Peças/Produtos
              </div>
              {loadingProdutos ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <>
                  <div className="font-bold text-2xl">{produtos.length}</div>
                  <div className="text-xs text-muted-foreground">
                    R$ {totalProdutosValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info adicional compacta */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 text-sm">
              <div>
                <span className="text-muted-foreground">Abertura:</span>{' '}
                <span className="font-medium">
                  {os.dtabertura ? format(new Date(os.dtabertura), 'dd/MM/yy HH:mm', { locale: ptBR }) : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Início:</span>{' '}
                <span className="font-medium">
                  {os.dataini ? format(new Date(os.dataini), 'dd/MM/yy HH:mm', { locale: ptBR }) : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Previsão:</span>{' '}
                <span className="font-medium">
                  {os.previsao ? format(new Date(os.previsao), 'dd/MM/yy HH:mm', { locale: ptBR }) : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Finalização:</span>{' '}
                <span className="font-medium">
                  {os.datafin ? format(new Date(os.datafin), 'dd/MM/yy HH:mm', { locale: ptBR }) : '-'}
                </span>
              </div>
              {os.km && (
                <div>
                  <span className="text-muted-foreground">KM:</span>{' '}
                  <span className="font-medium">{os.km.toLocaleString()}</span>
                </div>
              )}
              {os.usuarioInclusao && (
                <div>
                  <span className="text-muted-foreground">Aberto por:</span>{' '}
                  <span className="font-medium">{os.usuarioInclusao.nomeusu}</span>
                </div>
              )}
              {executoresUnicos.size > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Executores:</span>{' '}
                  <span className="font-medium">{Array.from(executoresUnicos).join(', ')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs com dados */}
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
            <ServicosTab
              servicos={servicos}
              isLoading={loadingServicos}
              error={errorServicos}
            />
          </TabsContent>

          <TabsContent value="apontamentos" className="mt-4">
            <ApontamentosTab
              apontamentos={apontamentos}
              isLoading={loadingApontamentos}
              error={errorApontamentos}
            />
          </TabsContent>

          <TabsContent value="produtos" className="mt-4">
            <ProdutosTab
              produtos={produtos}
              isLoading={loadingProdutos}
              error={errorProdutos}
            />
          </TabsContent>
        </Tabs>
      </div>
    </BaseLayout>
  )
}

// ====================================
// TABS COM FETCHES SEPARADOS
// ====================================

import type { ServicoOS, ApontamentoOS, ProdutoOS } from '@/types/ordens-servico'

interface ServicosTabProps {
  servicos: ServicoOS[]
  isLoading: boolean
  error: unknown
}

function ServicosTab({ servicos, isLoading, error }: ServicosTabProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Erro ao carregar serviços</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (servicos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Nenhum serviço cadastrado nesta OS
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-16 text-right">Qtd</TableHead>
              <TableHead className="w-24 text-right">Vlr. Total</TableHead>
              <TableHead className="w-28">Início</TableHead>
              <TableHead className="w-28">Fim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicos.map((servico) => (
              <TableRow key={servico.sequencia}>
                <TableCell className="font-mono text-xs">{servico.sequencia}</TableCell>
                <TableCell>
                  <div className="font-medium">{servico.produto?.descrprod || 'N/A'}</div>
                  {servico.observacao && (
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                      {servico.observacao}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeClass(servico.status)} variant="secondary">
                    {STATUS_LABELS[servico.status] || servico.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{servico.qtd || '-'}</TableCell>
                <TableCell className="text-right font-medium">
                  {servico.vlrtot ? `R$ ${servico.vlrtot.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                </TableCell>
                <TableCell className="text-xs">
                  {servico.dataini ? format(new Date(servico.dataini), 'dd/MM/yy HH:mm') : '-'}
                </TableCell>
                <TableCell className="text-xs">
                  {servico.datafin ? format(new Date(servico.datafin), 'dd/MM/yy HH:mm') : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

interface ApontamentosTabProps {
  apontamentos: ApontamentoOS[]
  isLoading: boolean
  error: unknown
}

function ApontamentosTab({ apontamentos, isLoading, error }: ApontamentosTabProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Erro ao carregar apontamentos</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (apontamentos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Nenhum apontamento de tempo registrado
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalMinutosTrabalhados = apontamentos.reduce((sum, a) => sum + (a.minutosTrabalhados || 0), 0)
  const totalMinutosLiquidos = apontamentos.reduce((sum, a) => sum + (a.minutosLiquidos || 0), 0)

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Executor</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="w-32">Início</TableHead>
              <TableHead className="w-32">Fim</TableHead>
              <TableHead className="w-20 text-right">Intervalo</TableHead>
              <TableHead className="w-24 text-right">H. Brutas</TableHead>
              <TableHead className="w-24 text-right">H. Líquidas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apontamentos.map((apt, index) => (
              <TableRow key={`${apt.id}-${apt.sequencia}-${index}`}>
                <TableCell className="font-mono text-xs">{apt.sequencia}</TableCell>
                <TableCell className="font-medium">{apt.executor?.nomeusu || 'N/A'}</TableCell>
                <TableCell className="text-sm truncate max-w-[200px]">
                  {apt.servicoDescricao || '-'}
                </TableCell>
                <TableCell className="text-xs">
                  {apt.dhini ? format(new Date(apt.dhini), 'dd/MM/yy HH:mm') : '-'}
                </TableCell>
                <TableCell className="text-xs">
                  {apt.dhfin ? format(new Date(apt.dhfin), 'dd/MM/yy HH:mm') : '-'}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {formatMinutosParaHoras(apt.intervaloMinutos)}
                </TableCell>
                <TableCell className="text-right font-medium text-blue-600">
                  {formatMinutosParaHoras(apt.minutosTrabalhados)}
                </TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {formatMinutosParaHoras(apt.minutosLiquidos)}
                </TableCell>
              </TableRow>
            ))}
            {/* Linha de totais */}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell colSpan={6} className="text-right">TOTAIS:</TableCell>
              <TableCell className="text-right text-blue-600">
                {formatMinutosParaHoras(totalMinutosTrabalhados)}
              </TableCell>
              <TableCell className="text-right text-green-600">
                {formatMinutosParaHoras(totalMinutosLiquidos)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

interface ProdutosTabProps {
  produtos: ProdutoOS[]
  isLoading: boolean
  error: unknown
}

function ProdutosTab({ produtos, isLoading, error }: ProdutosTabProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Erro ao carregar produtos</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (produtos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Nenhum produto/peça utilizado nesta OS
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalQtd = produtos.reduce((sum, p) => sum + (p.qtdneg || 0), 0)
  const totalValor = produtos.reduce((sum, p) => sum + (p.vlrtot || 0), 0)

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="w-32">Referência</TableHead>
              <TableHead className="w-16">Unid.</TableHead>
              <TableHead className="w-16 text-right">Qtd</TableHead>
              <TableHead className="w-24 text-right">Vlr. Unit.</TableHead>
              <TableHead className="w-24 text-right">Vlr. Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow key={produto.sequencia}>
                <TableCell className="font-mono text-xs">{produto.sequencia}</TableCell>
                <TableCell>
                  <div className="font-medium">{produto.produto?.descrprod || 'N/A'}</div>
                  {produto.produto?.marca && (
                    <div className="text-xs text-muted-foreground">{produto.produto.marca}</div>
                  )}
                </TableCell>
                <TableCell className="text-xs">{produto.produto?.referencia || '-'}</TableCell>
                <TableCell className="text-xs">{produto.codvol || '-'}</TableCell>
                <TableCell className="text-right font-medium">{produto.qtdneg || 0}</TableCell>
                <TableCell className="text-right text-xs">
                  {produto.vlrunit ? `R$ ${produto.vlrunit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {produto.vlrtot ? `R$ ${produto.vlrtot.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                </TableCell>
              </TableRow>
            ))}
            {/* Linha de totais */}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell colSpan={4} className="text-right">TOTAIS:</TableCell>
              <TableCell className="text-right">{totalQtd}</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right text-green-600">
                R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
