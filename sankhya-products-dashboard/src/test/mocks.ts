export interface MockProduct {
  codprod: number
  descricao: string
  codvol?: number
  unidade?: string
  preco?: number
  status?: string
  dtcad?: string
  dtalter?: string
}

export interface MockUser {
  id: number
  name: string
  email: string
}

export const mockUser: MockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
}

export const mockProducts: MockProduct[] = [
  {
    codprod: 1,
    descricao: 'Produto Teste 1',
    codvol: 1,
    unidade: 'UN',
    preco: 100.50,
    status: 'ATIVO',
    dtcad: '2024-01-01T00:00:00Z',
    dtalter: '2024-01-01T00:00:00Z'
  },
  {
    codprod: 2,
    descricao: 'Produto Teste 2',
    codvol: 2,
    unidade: 'KG',
    preco: 250.75,
    status: 'ATIVO',
    dtcad: '2024-01-02T00:00:00Z',
    dtalter: '2024-01-02T00:00:00Z'
  },
  {
    codprod: 3,
    descricao: 'Produto Teste 3',
    codvol: 1,
    unidade: 'LT',
    preco: 50.25,
    status: 'INATIVO',
    dtcad: '2024-01-03T00:00:00Z',
    dtalter: '2024-01-03T00:00:00Z'
  }
]

export const mockGroups = [
  { codgru: 1, descricao: 'Grupo 1' },
  { codgru: 2, descricao: 'Grupo 2' },
  { codgru: 3, descricao: 'Grupo 3' }
]

export const mockPriceHistory = [
  { date: '2024-01-01T00:00:00Z', price: 100.0 },
  { date: '2024-01-02T00:00:00Z', price: 105.0 },
  { date: '2024-01-03T00:00:00Z', price: 102.5 },
  { date: '2024-01-04T00:00:00Z', price: 110.0 },
  { date: '2024-01-05T00:00:00Z', price: 108.75 }
]

export const mockAuthResponse = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  user: mockUser
}

export const mockProductsResponse = {
  data: mockProducts,
  total: mockProducts.length,
  page: 1,
  perPage: 10,
  lastPage: 1,
  hasMore: false
}