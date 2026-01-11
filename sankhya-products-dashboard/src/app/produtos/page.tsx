import { BaseLayout } from "@/components/layouts/base-layout"
import { ProductList } from "@/components/products/product-list"
import type { Product } from "@/stores/products-store"

export default function Page() {
  const handleAddProduct = () => {
    console.log("Add product clicked")
  }

  return (
    <BaseLayout title="Produtos" description="Gerencie os produtos do sistema">
      <div className="@container/main px-4 lg:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie e visualize todos os produtos cadastrados no sistema.
            </p>
          </div>
        </div>
        <ProductList
          onAddProduct={handleAddProduct}
        />
      </div>
    </BaseLayout>
  )
}