"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Badge } from "@/components/ui/badge"

import { Skeletons } from "@/components/ui/skeletons"

import { useProducts } from "@/hooks/use-products"
import type { Product } from "@/stores/products-store"
import { formatProductCode, formatProductPrice, formatProductStatus } from "@/lib/utils/product-utils"
import { ProductTableToolbar } from "./product-table-toolbar"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { ErrorState } from "@/components/ui/error-state"
import { Package } from "lucide-react"
import { ProductDetailsModal } from "./product-details-modal"


import { useDebounce } from "@/lib/utils/debounce"
import { ProductFiltersSidebar } from "./product-filters-sidebar"



const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "codprod",
    header: "Código",
    cell: ({ row }) => formatProductCode(row.getValue("codprod")),
    enableSorting: true,
  },
  {
    accessorKey: "descrprod",
    header: "Nome/Descrição",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("descrprod")}>
        {row.getValue("descrprod")}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "vlrvenda",
    header: "Preço",
    cell: ({ row }) => formatProductPrice(row.getValue("vlrvenda")),
    enableSorting: true,
  },
  {
    accessorKey: "estoque",
    header: "Estoque",
    cell: ({ row }) => row.getValue("estoque") || 0,
    enableSorting: true,
  },
  {
    accessorKey: "ativo",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("ativo") === "S" ? "default" : "secondary"}>
        {formatProductStatus(row.getValue("ativo"))}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "descrgrupoprod",
    header: "Categoria",
    cell: ({ row }) => row.getValue("descrgrupoprod") || "-",
    enableSorting: true,
  },
  {
    accessorKey: "codvol",
    header: "Unidade",
    cell: ({ row }) => row.getValue("codvol") || "-",
    enableSorting: true,
  },
]



function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
      <p className="text-muted-foreground max-w-sm">
        Não há produtos disponíveis no momento. Tente ajustar os filtros ou recarregar a página.
      </p>
    </div>
  )
}

interface ProductListProps {
  onAddProduct?: () => void
  onEditProduct?: (product: Product) => void
}

export function ProductList({
  onAddProduct,
  onEditProduct,
}: ProductListProps) {
  const {
    filteredProducts,
    pagination,
    goToPage,
    changePageSize,
    isLoading,
    error,
    isRetrying,
    retry,
    searchProducts
  } = useProducts()

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [searchValue, setSearchValue] = React.useState("")
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false)
  
  // Virtualization setup
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  
  // Debounced search for API calls
  const debouncedSearchProducts = useDebounce((query: unknown) => {
    const searchQuery = query as string
    if (searchQuery.trim()) {
      searchProducts(searchQuery)
    }
  }, 300)

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  })

  // Update table pagination when external pagination changes
  React.useEffect(() => {
    table.setPageIndex(pagination.page - 1)
    table.setPageSize(pagination.pageSize)
  }, [pagination.page, pagination.pageSize, table])

  // Virtualization setup - create after table is initialized
  const virtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 57, // Approximate row height
    overscan: 5,
  })

  const handleEditProduct = (product: Product) => {
    if (onEditProduct) {
      onEditProduct(product)
    }
  }

  const handleModalEdit = (product: Product) => {
    setIsDetailsModalOpen(false)
    handleEditProduct(product)
  }

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedProduct(null)
  }

  if (isLoading) {
    return (
      <Skeletons.Table 
        rows={10}
        columns={7}
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={retry}
        isRetrying={isRetrying}
        title="Erro ao carregar produtos"
        description={`Não foi possível carregar a lista de produtos. ${error}`}
      />
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Sidebar - Mobile accessible */}
      <ProductFiltersSidebar className="w-full lg:w-80 lg:block" />
      
      {/* Main Content */}
      <div className="flex-1 space-y-4">
        <ProductTableToolbar
          table={table}
          onSearch={(value) => {
            setSearchValue(value)
            // Trigger debounced API search
            debouncedSearchProducts(value)
          }}
          onAddProduct={onAddProduct}
          searchValue={searchValue}
        />
        
        <div className="rounded-md border">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div 
              ref={tableContainerRef}
              className="h-[600px] overflow-auto"
            >
              <div className="min-w-full">
                {/* Fixed header */}
                <div className="sticky top-0 z-10 bg-background border-b">
                  <table className="w-full">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b">
                          {headerGroup.headers.map((header) => {
                            return (
                              <th 
                                key={header.id} 
                                colSpan={header.colSpan}
                                className="px-4 py-3 text-left font-medium text-sm text-muted-foreground bg-background"
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </th>
                            )
                          })}
                        </tr>
                      ))}
                    </thead>
                  </table>
                </div>

                {/* Virtualized body */}
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {table.getRowModel().rows?.length ? (
                    virtualizer.getVirtualItems().map((virtualItem) => {
                      const row = table.getRowModel().rows[virtualItem.index]
                      return (
                        <div
                          key={row.id}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <table className="w-full">
                            <tbody>
                              <tr 
                                className="border-b hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                                data-state={row.getIsSelected() && "selected"}
                                onClick={() => {
                                  setSelectedProduct(row.original)
                                  setIsDetailsModalOpen(true)
                                }}
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <td 
                                    key={cell.id}
                                    className="px-4 py-3 align-middle"
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex items-center justify-center h-24">
                      <EmptyState />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:block lg:hidden p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    setSelectedProduct(row.original)
                    setIsDetailsModalOpen(true)
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base leading-tight mb-1 truncate">
                        {row.getValue("descrprod")}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          #{formatProductCode(row.getValue("codprod"))}
                        </Badge>
                        <Badge variant={row.original.ativo === "S" ? "default" : "secondary"} className="text-xs">
                          {row.original.ativo === "S" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg text-green-600">
                        {formatProductPrice(row.getValue("vlrvenda"))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Status</span>
                        <div>
                          <Badge variant={row.original.ativo === "S" ? "default" : "secondary"}>
                            {row.original.ativo === "S" ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Unidade</span>
                      <p className="font-medium">{row.getValue("codvol") || "-"}</p>
                    </div>
                    
                    <div className="space-y-1 col-span-2">
                      <span className="text-xs text-muted-foreground">Categoria</span>
                      <p className="font-medium">{row.getValue("descrgrupoprod") || "-"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
        
        <DataTablePagination 
          table={table}
          pagination={pagination}
          goToPage={goToPage}
          changePageSize={changePageSize}
        />
        
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseModal}
          onEdit={handleModalEdit}
        />
      </div>
    </div>
  )
}