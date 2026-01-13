import { useState } from 'react';
import { useProdutoV2Detalhe } from '@/hooks/produtos-v2/use-produto-v2-detalhe';
import { useProdutoV2Estoque } from '@/hooks/produtos-v2/use-produto-v2-estoque';
import { ProdutoHeader } from '@/components/produtos-v2/produto-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabGeral } from '@/components/produtos-v2/tab-geral';
import { TabEstoque } from '@/components/produtos-v2/tab-estoque';
import { TabConsumo } from '@/components/produtos-v2/tab-consumo';
import { Breadcrumb } from '@/components/produtos-v2/breadcrumb';
import { Card } from '@/components/ui/card';

interface DetalheContainerProps {
  codprod: number;
}

export function DetalheContainer({ codprod }: DetalheContainerProps) {
  const [activeTab, setActiveTab] = useState('geral');
  const {
    data: produto,
    isLoading: isLoadingProduto,
    error: produtoError,
  } = useProdutoV2Detalhe(codprod);
  const { data: estoquePorLocal, isLoading: isLoadingEstoque } = useProdutoV2Estoque(codprod);

  if (produtoError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        <h3 className="font-medium">Erro ao carregar dados do produto</h3>
        <p className="text-sm">{produtoError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Produtos V2', href: '/produtos-v2' },
          { label: produto?.descrprod || `Produto ${codprod}`, href: `/produtos-v2/${codprod}` },
        ]}
      />

      <ProdutoHeader produto={produto} loading={isLoadingProduto} />

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="consumo">Consumo</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="mt-4">
            <TabGeral produto={produto} loading={isLoadingProduto} />
          </TabsContent>

          <TabsContent value="estoque" className="mt-4">
            <TabEstoque
              estoquePorLocal={estoquePorLocal}
              loading={isLoadingEstoque || isLoadingProduto}
            />
          </TabsContent>

          <TabsContent value="consumo" className="mt-4">
            <TabConsumo codprod={codprod} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
