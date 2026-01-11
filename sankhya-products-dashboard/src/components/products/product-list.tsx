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
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts } from "@/hooks/use-products"
import type { Product } from "@/stores/products-store"
import { formatProductCode, formatProductPrice, formatProductStatus } from "@/lib/utils/product-utils"
import { ProductTableToolbar } from "./product-table-toolbar"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { ErrorState } from "@/components/ui/error-state"
import { ProductDetailsModal } from "./product-details-modal"
import { Package } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDebounce } from "@/lib/utils/debounce"

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
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedProduct(product)
                setIsDetailsModalOpen(true)
              }}
            >
              Ver
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEditProduct?.(product)}
            >
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive">
            Excluir
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: "codvol",
    header: "Unidade",
    cell: ({ row }) => row.getValue("codvol") || "-",
    enableSorting: true,
    enableHiding: true,
  },
]

function ProductListSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

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
    return <ProductListSkeleton />
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
    <div className="space-y-4">
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
                            className="border-b hover:bg-muted/50 data-[state=selected]:bg-muted"
                            data-state={row.getIsSelected() && "selected"}
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
  )
}