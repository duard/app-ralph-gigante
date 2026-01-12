import { BaseLayout } from '@/components/layouts/base-layout';
import { ProdutosPageContainer } from './produtos-page-container';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DataBoundaryWrapper } from '@/components/ui/data-error-boundary';

export default function Page() {
  return (
    <BaseLayout title="Produtos" description="Gerencie e visualize todos os produtos do sistema">
      <div className="@container/main space-y-4 px-4 py-6 lg:px-6">
        <ErrorBoundary title="Erro na Lista de Produtos">
          <DataBoundaryWrapper title="Erro ao carregar produtos">
            <ProdutosPageContainer />
          </DataBoundaryWrapper>
        </ErrorBoundary>
      </div>
    </BaseLayout>
  );
}
