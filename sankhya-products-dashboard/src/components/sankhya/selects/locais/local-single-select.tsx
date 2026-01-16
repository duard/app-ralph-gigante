import { useMemo } from 'react'
import { Loader2, MapPin, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useLocais } from '@/hooks/produtos-v2/use-grupos-locais'
import { cn } from '@/lib/utils'
import type { LocalSingleSelectProps } from './types'

/**
 * Componente de seleção única de local
 *
 * @example
 * ```tsx
 * <LocalSingleSelect
 *   value={selectedLocal}
 *   onChange={setSelectedLocal}
 *   placeholder="Selecione um local"
 *   clearable
 * />
 * ```
 */
export function LocalSingleSelect({
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecione um local',
  className,
  clearable = true,
  showLoadingIcon = true,
  filterLocais,
}: LocalSingleSelectProps) {
  const { data: locais = [], isLoading, error } = useLocais()

  // Filtra os locais se houver filtro customizado
  const filteredLocais = useMemo(() => {
    if (!filterLocais) return locais
    return locais.filter(filterLocais)
  }, [locais, filterLocais])

  // Encontra o local selecionado
  const selectedLocal = useMemo(() => {
    if (!value) return null
    return filteredLocais.find((local) => local.codlocal === value)
  }, [value, filteredLocais])

  // Handle change
  const handleValueChange = (newValue: string) => {
    if (newValue === '__clear__') {
      onChange?.(null)
      return
    }
    const codlocal = parseInt(newValue)
    onChange?.(isNaN(codlocal) ? null : codlocal)
  }

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <MapPin className="h-4 w-4" />
        <span>Erro ao carregar locais</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <Select
        value={value?.toString() ?? ''}
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className={cn('w-full', className)}>
          <div className="flex items-center gap-2 flex-1">
            {isLoading && showLoadingIcon ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
            <SelectValue placeholder={placeholder}>
              {selectedLocal ? (
                <span>
                  {selectedLocal.descrlocal || `Local ${selectedLocal.codlocal}`}
                </span>
              ) : (
                placeholder
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {filteredLocais.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {isLoading ? 'Carregando...' : 'Nenhum local encontrado'}
            </div>
          ) : (
            <>
              {clearable && value && (
                <SelectItem value="__clear__" className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span>Limpar seleção</span>
                  </div>
                </SelectItem>
              )}
              {filteredLocais.map((local) => {
                if (!local?.codlocal) return null
                return (
                  <SelectItem key={local.codlocal} value={local.codlocal.toString()}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {local.descrlocal || `Local ${local.codlocal}`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        #{local.codlocal}
                      </span>
                    </div>
                  </SelectItem>
                )
              })}
            </>
          )}
        </SelectContent>
      </Select>

      {/* Clear button (alternative to dropdown option) */}
      {clearable && value && !disabled && !isLoading && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </Button>
      )}
    </div>
  )
}
