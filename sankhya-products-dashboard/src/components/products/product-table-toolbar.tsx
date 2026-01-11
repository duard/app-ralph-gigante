"use client"

import { useEffect } from "react"
import { X, Download } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductTableViewOptions } from "./product-table-view-options"
import { Plus, Search } from "lucide-react"
import { useDebounce } from "@/lib/utils/debounce"
import { downloadCSV, downloadExcel, downloadPDF, type CSVProductRow } from "@/lib/utils/product-utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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

  // Enhanced debounced search with cancellation and performance optimizations
  const { debounced: debouncedOnSearch, cancel } = useDebounce((value: unknown) => {
    onSearch?.(value as string)
  }, 300, {
    leading: false,
    trailing: true,
    maxWait: 900 // Maximum wait to prevent hanging
  })

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

  // Cleanup debounced search on unmount
  useEffect(() => {
    return cancel
  }, [cancel])

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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => handleSearchChange("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpar busca</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {isFiltered && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={() => {
                  table.resetColumnFilters();
                  toast.success("Filtros limpos com sucesso");
                }}
                className="h-8 px-2 lg:px-3"
              >
                Limpar
                <X className="ml-2 h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Limpar todos os filtros</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <ProductTableViewOptions table={table} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const rows = table.getRowModel().rows;
                  const products: CSVProductRow[] = rows.map(row => row.original as CSVProductRow);
                  const date = new Date().toISOString().split('T')[0];
                  toast.loading("Exportando Excel...");
                  await downloadExcel(products, `produtos-${date}.xlsx`);
                  toast.success("Excel exportado com sucesso!");
                } catch (error) {
                  console.error('Erro ao exportar Excel:', error);
                  toast.error("Erro ao exportar Excel. Tente novamente.");
                }
              }}
              className="h-8"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar lista de produtos para Excel</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const rows = table.getRowModel().rows;
                  const products: CSVProductRow[] = rows.map(row => row.original as CSVProductRow);
                  const date = new Date().toISOString().split('T')[0];
                  toast.loading("Exportando PDF...");
                  await downloadPDF(products, `produtos-${date}.pdf`);
                  toast.success("PDF exportado com sucesso!");
                } catch (error) {
                  console.error('Erro ao exportar PDF:', error);
                  toast.error("Erro ao exportar PDF. Tente novamente.");
                }
              }}
              className="h-8"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar lista de produtos para PDF</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  const rows = table.getRowModel().rows;
                  const products: CSVProductRow[] = rows.map(row => row.original as CSVProductRow);
                  const date = new Date().toISOString().split('T')[0];
                  toast.loading("Exportando CSV...");
                  downloadCSV(products, `produtos-${date}.csv`);
                  toast.success("CSV exportado com sucesso!");
                } catch (error) {
                  console.error('Erro ao exportar CSV:', error);
                  toast.error("Erro ao exportar CSV. Tente novamente.");
                }
              }}
              className="h-8"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar lista de produtos para CSV</p>
          </TooltipContent>
        </Tooltip>
        {onAddProduct && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => {
                onAddProduct();
                toast.success("Modo de criação ativado");
              }} className="h-8">
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar novo produto</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}