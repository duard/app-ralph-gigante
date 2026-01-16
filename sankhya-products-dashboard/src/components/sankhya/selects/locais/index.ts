/**
 * Componentes de seleção de locais do Sankhya
 *
 * Este módulo fornece componentes reutilizáveis para seleção de locais
 * de estoque (TGFLOC) em diferentes contextos da aplicação.
 *
 * @example
 * ```tsx
 * import { LocalSingleSelect, LocalMultiSelect, LocalCombobox } from '@/components/sankhya/selects/locais'
 *
 * // Select único
 * <LocalSingleSelect value={local} onChange={setLocal} />
 *
 * // Select múltiplo
 * <LocalMultiSelect value={locais} onChange={setLocais} maxSelections={5} />
 *
 * // Combobox com busca
 * <LocalCombobox value={local} onChange={setLocal} placeholder="Buscar local..." />
 * ```
 */

export { LocalSingleSelect } from './local-single-select'
export { LocalMultiSelect } from './local-multi-select'
export { LocalCombobox } from './local-combobox'

export type {
  LocalSelectBaseProps,
  LocalSingleSelectProps,
  LocalMultiSelectProps,
  LocalComboboxProps,
  LocalFilterProps,
} from './types'
