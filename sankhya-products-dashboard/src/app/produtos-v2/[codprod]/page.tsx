import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { BaseLayout } from '@/components/layouts/base-layout';
import { DetalheContainer } from './detalhe-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProdutosV2DetalhePage() {
  const { codprod } = useParams<{ codprod: string }>();

  if (!codprod) {
    return (
      <BaseLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="text-red-500">Produto não encontrado</div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Detalhe do Produto</h2>
            <p className="text-muted-foreground">Visualização detalhada do produto {codprod}</p>
          </div>
        </div>
        <Suspense fallback={<DetalheSkeleton />}>
          <DetalheContainer codprod={Number(codprod)} />
        </Suspense>
      </div>
    </BaseLayout>
  );
}

function DetalheSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
