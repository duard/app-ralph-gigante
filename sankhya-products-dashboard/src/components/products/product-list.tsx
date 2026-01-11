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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts } from "@/hooks/use-products"
import type { Product } from "@/stores/products-store"
import { formatProductCode, formatProductPrice, formatProductStatus } from "@/lib/utils/product-utils"
import { ProductTableToolbar } from "./product-table-toolbar"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { Package } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
    cell: ({ row: _row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          Ver
        </Button>
        <Button variant="ghost" size="sm">
          Editar
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive">
          Excluir
        </Button>
      </div>
    ),
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
}

export function ProductList({
  onAddProduct,
}: ProductListProps) {
  const {
    filteredProducts,
    pagination,
    goToPage,
    changePageSize,
    isLoading,
    error
  } = useProducts()

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [searchValue, setSearchValue] = React.useState("")

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

  if (isLoading) {
    return <ProductListSkeleton />
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-destructive">Erro ao carregar produtos: {error}</div>
  }

  return (
    <div className="space-y-4">
      <ProductTableToolbar
        table={table}
        onSearch={setSearchValue}
        onAddProduct={onAddProduct}
        searchValue={searchValue}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination 
        table={table}
        pagination={pagination}
        goToPage={goToPage}
        changePageSize={changePageSize}
      />
    </div>
  )
}