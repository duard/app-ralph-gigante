import { useGrupoResumo } from '@/hooks/produtos-v2/use-grupo-resumo';
import { useProdutosV2Listagem } from '@/hooks/produtos-v2/use-produtos-v2-listagem';
import { ProdutoTable } from '@/components/produtos-v2/produto-table';
import { Pagination } from '@/components/produtos-v2/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb } from '@/components/produtos-v2/breadcrumb';
import { useSearchParams } from 'react-router-dom';

interface GrupoContainerProps {
  codgrupoprod: number;
}

export function GrupoContainer({ codgrupoprod }: GrupoContainerProps) {
  const [searchParams] = useSearchParams();
  const {
    data: grupoResumo,
    isLoading: isLoadingResumo,
    error: resumoError,
  } = useGrupoResumo(codgrupoprod);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '20', 10);
  const sort = searchParams.get('sort') || 'codprod-desc';

  const {
    data: produtosData,
    isLoading: isLoadingProdutos,
    error: produtosError,
  } = useProdutosV2Listagem({
    page,
    perPage,
    sort,
    grupos: [codgrupoprod],
  });

  const handlePageChange = (newPage: number) => {
    window.location.href = `?page=${newPage}`;
  };

  const handlePerPageChange = (newPerPage: number) => {
    window.location.href = `?perPage=${newPerPage}&page=1`;
  };

  const handleSortChange = (column: string, direction: 'asc' | 'desc') => {
    window.location.href = `?sort=${column}-${direction}&page=1`;
  };

  if (resumoError || produtosError) {
    const error = resumoError || produtosError;
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        <h3 className="font-medium">Erro ao carregar dados</h3>
        <p className="text-sm">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Produtos V2', href: '/produtos-v2' },
          {
            label: grupoResumo?.descrgrupoprod || `Grupo ${codgrupoprod}`,
            href: `/produtos-v2/grupo/${codgrupoprod}`,
          },
        ]}
      />

      {isLoadingResumo || !grupoResumo ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-64" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{grupoResumo.descrgrupoprod}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">Total Produtos</p>
                <p className="text-2xl font-bold">{grupoResumo.totalProdutos}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">Produtos Ativos</p>
                <p className="text-2xl font-bold">{grupoResumo.produtosAtivos}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold">{grupoResumo.produtosCriticos}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">Valor Estoque</p>
                <p className="text-2xl font-bold">
                  R${' '}
                  {grupoResumo.valorEstoque.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ProdutoTable
        data={produtosData?.data || []}
        loading={isLoadingProdutos}
        sort={sort}
        onSortChange={handleSortChange}
      />

      {produtosData && (
        <Pagination
          page={page}
          perPage={perPage}
          total={produtosData.total}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      )}
    </div>
  );
}
