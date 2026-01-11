"use client"

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import type { Table } from "@tanstack/react-table"
import { Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PRODUCT_TABLE_COLUMNS } from "@/lib/constants/product-constants"

interface ProductTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function ProductTableViewOptions<TData>({
  table,
}: ProductTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto hidden h-8 lg:flex cursor-pointer mr-2"
            >
              <Settings2 />
              Colunas
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Personalizar colunas visíveis</p>
          </TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Alternar colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PRODUCT_TABLE_COLUMNS
          .filter(
            (column) =>
              column.id !== 'actions' && // Don't allow hiding actions column
              table.getColumn(column.id)?.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize cursor-pointer"
                checked={table.getColumn(column.id)?.getIsVisible()}
                onCheckedChange={(value) =>
                  table.getColumn(column.id)?.toggleVisibility(!!value)
                }
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}