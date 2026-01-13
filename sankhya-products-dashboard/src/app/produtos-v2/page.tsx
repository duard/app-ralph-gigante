import { Suspense } from 'react';
import { BaseLayout } from '@/components/layouts/base-layout';
import { DashboardContainer } from './dashboard-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProdutosV2Page() {
  return (
    <BaseLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Produtos V2</h2>
            <p className="text-muted-foreground">
              Dashboard interativo com navegação contextual e insights acionáveis
            </p>
          </div>
        </div>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContainer />
        </Suspense>
      </div>
    </BaseLayout>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
