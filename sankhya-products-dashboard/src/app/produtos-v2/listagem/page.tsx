import { Suspense } from 'react';
import { BaseLayout } from '@/components/layouts/base-layout';
import { ListagemContainer } from './listagem-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProdutosV2ListagemPage() {
  return (
    <BaseLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Listagem de Produtos</h2>
            <p className="text-muted-foreground">
              Lista completa de produtos com filtros avançados e navegação contextual
            </p>
          </div>
        </div>
        <Suspense fallback={<ListagemSkeleton />}>
          <ListagemContainer />
        </Suspense>
      </div>
    </BaseLayout>
  );
}

function ListagemSkeleton() {
  return (
    <div className="space-y-4">
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
