"use client"

import { X } from "lucide-react"
import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductTableViewOptions } from "./product-table-view-options"
import { Plus, Search } from "lucide-react"
import { useDebounce } from "@/lib/utils/debounce"

interface ProductTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (search: string) => void
  onAddProduct?: () => void
  searchValue?: string
}

export function ProductTableToolbar<TData>({
  table,
  onSearch,
  onAddProduct,
  searchValue = "",
}: ProductTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  // Debounced search with 300ms delay for API calls
  const debouncedOnSearch = useDebounce((value: unknown) => {
    onSearch?.(value as string)
  }, 300)

  // Immediate local filter for UI responsiveness
  const handleSearchChange = (value: string) => {
    // Update local state immediately for responsive UI
    if (onSearch) {
      onSearch(value)
    }
    
    // Update table filter immediately for local filtering
    table.getColumn("descrprod")?.setFilterValue(value || undefined)
    
    // Trigger debounced search for API calls
    debouncedOnSearch(value)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => handleSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Limpar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <ProductTableViewOptions table={table} />
        {onAddProduct && (
          <Button onClick={onAddProduct} className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        )}
      </div>
    </div>
  )
}