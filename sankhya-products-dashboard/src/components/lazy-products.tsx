import * as React from "react"
import { LoadingState } from "@/components/ui/loading"
import { Skeletons } from "@/components/ui/skeletons"
import type { Table } from "@tanstack/react-table"
import type { Product } from "@/stores/products-store"

// Lazy load heavy product components
export const LazyProductDetailsModal = React.lazy(() =>
  import("@/components/products/product-details-modal").then(module => ({
    default: module.ProductDetailsModal
  }))
)

export const LazyProductFiltersSidebar = React.lazy(() =>
  import("@/components/products/product-filters-sidebar").then(module => ({
    default: module.ProductFiltersSidebar
  }))
)

export const LazyProductTableToolbar = React.lazy(() =>
  import("@/components/products/product-table-toolbar").then(module => ({
    default: module.ProductTableToolbar
  }))
) as React.ComponentType<{
  table: Table<Product>
  onSearch?: (search: string) => void
  onAddProduct?: () => void
  searchValue?: string
}>

// Loading component
export function LazyProductLoadingFallback() {
  return (
    <LoadingState 
      type="skeleton" 
      size="md"
      message="Carregando componente..."
      className="h-32"
    >
      <Skeletons.Table rows={3} columns={7} />
    </LoadingState>
  )
}