"use client"

import type { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pagination?: Pagination
  goToPage?: (page: number) => void
  changePageSize?: (size: number) => void
}

export function DataTablePagination<TData>({
  table,
  pagination,
  goToPage,
  changePageSize,
}: DataTablePaginationProps<TData>) {
  const isManualPagination = pagination && goToPage && changePageSize

  const currentPage = isManualPagination ? pagination.page : table.getState().pagination.pageIndex + 1
  const pageSize = isManualPagination ? pagination.pageSize : table.getState().pagination.pageSize
  const totalPages = isManualPagination ? pagination.totalPages : table.getPageCount()
  const canPreviousPage = isManualPagination ? currentPage > 1 : table.getCanPreviousPage()
  const canNextPage = isManualPagination ? currentPage < totalPages : table.getCanNextPage()

  const handleFirstPage = () => {
    if (isManualPagination) {
      goToPage(1)
    } else {
      table.setPageIndex(0)
    }
  }

  const handlePreviousPage = () => {
    if (isManualPagination) {
      goToPage(currentPage - 1)
    } else {
      table.previousPage()
    }
  }

  const handleNextPage = () => {
    if (isManualPagination) {
      goToPage(currentPage + 1)
    } else {
      table.nextPage()
    }
  }

  const handleLastPage = () => {
    if (isManualPagination) {
      goToPage(totalPages)
    } else {
      table.setPageIndex(table.getPageCount() - 1)
    }
  }

  const handlePageSizeChange = (newSize: string) => {
    const size = Number(newSize)
    if (isManualPagination) {
      changePageSize(size)
    } else {
      table.setPageSize(size)
    }
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {isManualPagination ? (
          pagination.total > 0 && (
            <>Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, pagination.total)} de {pagination.total} produtos</>
          )
        ) : (
          <>{table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).</>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Itens por página</p>
          <Select
            value={`${pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px] cursor-pointer">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSizeOption) => (
                <SelectItem key={pageSizeOption} value={`${pageSizeOption}`} className="cursor-pointer">
                  {pageSizeOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex cursor-pointer disabled:cursor-not-allowed"
                onClick={handleFirstPage}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Primeira página</span>
                <ChevronsLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Primeira página</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
                onClick={handlePreviousPage}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Página anterior</span>
                <ChevronLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Página anterior</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {currentPage} de {totalPages}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
                onClick={handleNextPage}
                disabled={!canNextPage}
              >
                <span className="sr-only">Próxima página</span>
                <ChevronRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Próxima página</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex cursor-pointer disabled:cursor-not-allowed"
                onClick={handleLastPage}
                disabled={!canNextPage}
              >
                <span className="sr-only">Última página</span>
                <ChevronsRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Última página</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}