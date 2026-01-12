import { BaseLayout } from '@/components/layouts/base-layout';
import { ProdutosSimplesContainer } from './produtos-simples-container';

export default function Page() {
  return (
    <BaseLayout title="Produtos (Simples)" description="Lista simplificada de produtos">
      <div className="@container/main space-y-4 px-4 py-6 lg:px-6">
        <ProdutosSimplesContainer />
      </div>
    </BaseLayout>
  );
}
