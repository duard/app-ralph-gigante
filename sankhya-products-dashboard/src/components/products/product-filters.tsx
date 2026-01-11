"use client"

import * as React from "react"
import useProductsStore from "@/stores/products-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ProductFilters() {
  const { filters, setFilters, resetFilters } = useProductsStore()
  const searchValue = filters?.search ?? ""

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Input
        placeholder="Buscar por código ou nome"
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFilters({ search: e.target.value })
        }
      />
      <select
        value={filters?.status ?? 'all'}
        onChange={(e) => setFilters({ status: e.target.value as any })}
        className="border rounded-md px-2 py-1 bg-background"
      >
        <option value="all">Todos</option>
        <option value="active">Ativos</option>
        <option value="inactive">Inativos</option>
      </select>
      <Button variant="outline" size="sm" onClick={() => resetFilters()}>
        Limpar
      </Button>
    </div>
  )
}

export default ProductFilters
