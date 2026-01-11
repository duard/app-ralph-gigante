"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { useProducts } from "@/hooks/use-products"
import { Product } from "@/stores/products-store"
import { formatProductCode, formatProductPrice, formatProductStatus } from "@/lib/utils/product-utils"

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
  const { filteredProducts, isLoading, error } = useProducts()

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Carregando produtos...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-destructive">Erro ao carregar produtos: {error}</div>
  }

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={filteredProducts} />
    </div>
  )
}