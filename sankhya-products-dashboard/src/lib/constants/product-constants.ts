export const PRODUCT_TABLE_COLUMNS = [
  'code',
  'name',
  'price',
  'stock',
  'status',
  'category',
  'unit',
  'actions',
] as const;

export type ProductTableColumn = typeof PRODUCT_TABLE_COLUMNS[number];

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