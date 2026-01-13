import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { BaseLayout } from '@/components/layouts/base-layout';
import { LocalContainer } from './local-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProdutosV2LocalPage() {
  const { codlocal } = useParams<{ codlocal: string }>();

  if (!codlocal) {
    return (
      <BaseLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="text-red-500">Local não encontrado</div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Local de Produtos</h2>
            <p className="text-muted-foreground">Visualização detalhada do local {codlocal}</p>
          </div>
        </div>
        <Suspense fallback={<LocalSkeleton />}>
          <LocalContainer codlocal={Number(codlocal)} />
        </Suspense>
      </div>
    </BaseLayout>
  );
}

function LocalSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
      <div className="flex justify-center">
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  );
}
