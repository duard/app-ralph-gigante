"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { useProducts } from "@/hooks/use-products"
import { Product } from "@/stores/products-store"
import { formatProductCode, formatProductPrice, formatProductStatus } from "@/lib/utils/product-utils"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "codprod",
    header: "Código",
    cell: ({ row }) => formatProductCode(row.getValue("codprod")),
  },
  {
    accessorKey: "descrprod",
    header: "Nome/Descrição",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("descrprod")}>
        {row.getValue("descrprod")}
      </div>
    ),
  },
  {
    accessorKey: "vlrvenda",
    header: "Preço",
    cell: ({ row }) => formatProductPrice(row.getValue("vlrvenda")),
  },
  {
    accessorKey: "estoque",
    header: "Estoque",
    cell: ({ row }) => row.getValue("estoque") || 0,
  },
  {
    accessorKey: "ativo",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("ativo") === "S" ? "default" : "secondary"}>
        {formatProductStatus(row.getValue("ativo"))}
      </Badge>
    ),
  },
  {
    accessorKey: "descrgrupoprod",
    header: "Categoria",
    cell: ({ row }) => row.getValue("descrgrupoprod") || "-",
  },
  {
    accessorKey: "codvol",
    header: "Unidade",
    cell: ({ row }) => row.getValue("codvol") || "-",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
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
]

export function ProductList() {
  const {
    filteredProducts,
    pagination,
    goToPage,
    changePageSize,
    isLoading,
    error
  } = useProducts()

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Carregando produtos...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-destructive">Erro ao carregar produtos: {error}</div>
  }

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={filteredProducts} />
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {pagination.total > 0 && (
            <>Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} produtos</>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Produtos por página</p>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => changePageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => goToPage(1)}
              disabled={pagination.page <= 1}
            >
              <span className="sr-only">Primeira página</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <span className="sr-only">Página anterior</span>
              <ChevronLeft />
            </Button>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <span className="sr-only">Próxima página</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => goToPage(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <span className="sr-only">Última página</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}