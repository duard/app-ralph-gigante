export const PRODUCT_TABLE_COLUMNS = [
  { id: 'codprod', label: 'Código', visible: true },
  { id: 'descrprod', label: 'Descrição', visible: true },
  { id: 'codvol', label: 'Unidade', visible: false },
  { id: 'vlrvenda', label: 'Preço', visible: true },
  { id: 'estoque', label: 'Estoque', visible: true },
  { id: 'ativo', label: 'Status', visible: true },
  { id: 'descrgrupoprod', label: 'Categoria', visible: false },
  { id: 'codgrupoprod', label: 'Cód. Grupo', visible: false },
  { id: 'reffab', label: 'Ref. Fabricante', visible: false },
  { id: 'vlrcusto', label: 'Preço Custo', visible: false },
  { id: 'ncm', label: 'NCM', visible: false },
  { id: 'actions', label: 'Ações', visible: true },
] as const;

export type ProductTableColumn = typeof PRODUCT_TABLE_COLUMNS[number]['id'];

export const DEFAULT_VISIBLE_COLUMNS = PRODUCT_TABLE_COLUMNS
  .filter((col) => col.visible)
  .map((col) => col.id);

export const PRODUCT_SORT_OPTIONS = [
  { label: 'Nome', value: 'name' },
  { label: 'Preço', value: 'price' },
  { label: 'Estoque', value: 'stock' },
  { label: 'Status', value: 'status' },
  { label: 'Categoria', value: 'category' },
  { label: 'Data de Cadastro', value: 'createdAt' },
] as const;

export const PRODUCT_FILTER_OPTIONS = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
] as const;

export const PRODUCT_STATUS_OPTIONS = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
] as const;

export const PRODUCT_UNIT_OPTIONS = [
  { label: 'Unidade', value: 'unit' },
  { label: 'Kg', value: 'kg' },
  { label: 'Litro', value: 'liter' },
  { label: 'Metro', value: 'meter' },
] as const;