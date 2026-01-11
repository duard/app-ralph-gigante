import { BaseLayout } from "@/components/layouts/base-layout"

export default function Page() {
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
        {/* TODO: Implementar listagem de produtos */}
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">Página de produtos em desenvolvimento</p>
        </div>
      </div>
    </BaseLayout>
  )
}