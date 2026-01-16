import type { Local } from '@/types/dashboard'

/**
 * Props base para todos os componentes de seleção de local
 */
export interface LocalSelectBaseProps {
  /**
   * Callback quando o valor é alterado
   */
  onChange?: (value: number | number[] | null) => void

  /**
   * Se o select está desabilitado
   */
  disabled?: boolean

  /**
   * Texto de placeholder
   */
  placeholder?: string

  /**
   * Classe CSS adicional
   */
  className?: string

  /**
   * Se deve mostrar ícone de loading customizado
   */
  showLoadingIcon?: boolean

  /**
   * Filtro customizado para os locais
   * Permite filtrar quais locais aparecem na lista
   */
  filterLocais?: (local: Local) => boolean
}

/**
 * Props para LocalSingleSelect
 */
export interface LocalSingleSelectProps extends LocalSelectBaseProps {
  /**
   * Valor selecionado (código do local)
   */
  value?: number | null

  /**
   * Callback quando o valor é alterado
   */
  onChange?: (value: number | null) => void

  /**
   * Se deve permitir limpar a seleção
   */
  clearable?: boolean
}

/**
 * Props para LocalMultiSelect
 */
export interface LocalMultiSelectProps extends LocalSelectBaseProps {
  /**
   * Valores selecionados (códigos dos locais)
   */
  value?: number[]

  /**
   * Callback quando os valores são alterados
   */
  onChange?: (value: number[]) => void

  /**
   * Limite máximo de seleções
   */
  maxSelections?: number

  /**
   * Se deve mostrar badge com contador de selecionados
   */
  showCount?: boolean
}

/**
 * Props para LocalCombobox
 */
export interface LocalComboboxProps extends LocalSelectBaseProps {
  /**
   * Valor selecionado (código do local)
   */
  value?: number | null

  /**
   * Callback quando o valor é alterado
   */
  onChange?: (value: number | null) => void

  /**
   * Se deve permitir limpar a seleção
   */
  clearable?: boolean

  /**
   * Texto quando nenhum resultado é encontrado
   */
  emptyMessage?: string

  /**
   * Se deve fazer busca case-sensitive
   */
  caseSensitive?: boolean
}

/**
 * Props para LocalFilter (componente avançado de filtro)
 */
export interface LocalFilterProps extends LocalSelectBaseProps {
  /**
   * Valores selecionados (códigos dos locais)
   */
  value?: number[]

  /**
   * Callback quando os valores são alterados
   */
  onChange?: (value: number[]) => void

  /**
   * Modo do filtro
   */
  mode?: 'single' | 'multiple'

  /**
   * Se deve mostrar opção "Todos"
   */
  showAllOption?: boolean

  /**
   * Texto da opção "Todos"
   */
  allOptionText?: string

  /**
   * Se deve agrupar por critério
   */
  groupBy?: 'none' | 'tipo' | 'status'
}
