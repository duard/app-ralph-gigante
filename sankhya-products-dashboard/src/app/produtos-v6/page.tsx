'use client';

import * as React from 'react';
import { BaseLayout } from '@/components/layouts/base-layout';
import { ProdutosAvancadosTable } from './components/produtos-avancados-table';

export default function ProdutosV6Page() {
  return (
    <BaseLayout
      title="Pesquisa Avançada de Produtos"
      description="Tabela rica com análise detalhada de estoque, preços e consumo"
    >
      <div className="px-4 lg:px-6">
        <ProdutosAvancadosTable />
      </div>
    </BaseLayout>
  );
}
