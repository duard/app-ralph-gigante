import { z } from 'zod';

/**
 * Product schema for validation
 */
export const productSchema = z.object({
  id: z.number().optional(),
  codprod: z.number().int().positive('Código do produto deve ser positivo'),
  descrprod: z
    .string()
    .min(3, 'Descrição deve ter ao menos 3 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  reffab: z.string().max(50, 'Referência deve ter no máximo 50 caracteres').optional(),
  codvol: z.string().max(10, 'Unidade deve ter no máximo 10 caracteres').optional(),
  vlrvenda: z.number().nonnegative('Preço de venda deve ser não-negativo').optional(),
  vlrcusto: z.number().nonnegative('Preço de custo deve ser não-negativo').optional(),
  estoque: z.number().nonnegative('Estoque deve ser não-negativo').optional(),
  estmin: z.number().nonnegative('Estoque mínimo deve ser não-negativo').optional(),
  ativo: z.enum(['S', 'N']).default('S'),
  codgrupoprod: z.number().int().positive().optional(),
  descrgrupoprod: z.string().optional(),
  codmarca: z.number().int().positive().optional(),
  ncm: z
    .string()
    .regex(/^\d{8}$/, 'NCM deve ter 8 dígitos')
    .optional()
    .or(z.literal('')),
  cest: z
    .string()
    .regex(/^\d{7}$/, 'CEST deve ter 7 dígitos')
    .optional()
    .or(z.literal('')),
  pesoliq: z.number().nonnegative('Peso líquido deve ser não-negativo').optional(),
  pesobruto: z.number().nonnegative('Peso bruto deve ser não-negativo').optional(),
  observacao: z.string().max(2000, 'Observação deve ter no máximo 2000 caracteres').optional(),
  imagem: z.string().url('URL de imagem inválida').optional().or(z.literal('')),
  dtcad: z.string().datetime().optional(),
  dtalter: z.string().datetime().optional(),
});

export type ProductSchemaType = z.infer<typeof productSchema>;

/**
 * Product form schema (subset for create/update)
 */
export const productFormSchema = z.object({
  descrprod: z
    .string()
    .min(3, 'Descrição deve ter ao menos 3 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  reffab: z.string().max(50).optional().or(z.literal('')),
  codvol: z.string().max(10).default('UN'),
  vlrvenda: z.number().nonnegative('Preço de venda deve ser não-negativo').optional(),
  vlrcusto: z.number().nonnegative('Preço de custo deve ser não-negativo').optional(),
  estoque: z.number().nonnegative('Estoque deve ser não-negativo').optional(),
  estmin: z.number().nonnegative('Estoque mínimo deve ser não-negativo').optional(),
  ativo: z.enum(['S', 'N']).default('S'),
  codgrupoprod: z.number().int().positive().optional(),
  codmarca: z.number().int().positive().optional(),
  ncm: z.string().optional().or(z.literal('')),
  cest: z.string().optional().or(z.literal('')),
  pesoliq: z.number().nonnegative().optional(),
  pesobruto: z.number().nonnegative().optional(),
  observacao: z.string().max(2000).optional().or(z.literal('')),
  imagem: z.string().optional().or(z.literal('')),
});

export type ProductFormSchemaType = z.infer<typeof productFormSchema>;

/**
 * Product filters schema
 */
export const productFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  category: z.string().optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  stockMin: z.number().nonnegative().optional(),
  stockMax: z.number().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ProductFiltersSchemaType = z.infer<typeof productFiltersSchema>;

/**
 * Product search params schema
 */
export const productSearchParamsSchema = z.object({
  query: z.string().optional(),
  filters: productFiltersSchema.optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
});

export type ProductSearchParamsSchemaType = z.infer<typeof productSearchParamsSchema>;

/**
 * Validation error messages in Portuguese
 */
export const productValidationMessages = {
  required: 'Este campo é obrigatório',
  invalidType: 'Valor inválido',
  minLength: (min: number) => `Mínimo de ${min} caracteres`,
  maxLength: (max: number) => `Máximo de ${max} caracteres`,
  positive: 'Deve ser um valor positivo',
  nonNegative: 'Não pode ser negativo',
  invalidFormat: 'Formato inválido',
};
