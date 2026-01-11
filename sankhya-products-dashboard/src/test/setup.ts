import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { http } from 'msw'

// Mock API handlers
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return Response.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }
    })
  }),

  http.post('/api/auth/refresh', () => {
    return Response.json({
      access_token: 'new-mock-access-token',
      refresh_token: 'new-mock-refresh-token'
    })
  }),

  http.get('/api/auth/me', () => {
    return Response.json({
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    })
  }),

  // Products endpoints
  http.get('/api/tgfpro', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const perPage = Number(url.searchParams.get('perPage')) || 10
    
    const mockProducts = Array.from({ length: 50 }, (_, i) => ({
      codprod: i + 1,
      descricao: `Produto ${i + 1}`,
      codvol: 1,
      unidade: 'UN',
      preco: Math.random() * 1000,
      status: 'ATIVO',
      dtcad: new Date().toISOString(),
      dtalter: new Date().toISOString()
    }))

    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedProducts = mockProducts.slice(startIndex, endIndex)

    return Response.json({
      data: paginatedProducts,
      total: mockProducts.length,
      page,
      perPage,
      lastPage: Math.ceil(mockProducts.length / perPage),
      hasMore: endIndex < mockProducts.length
    })
  }),

  http.get('/api/tgfpro/:codprod', ({ params }) => {
    const { codprod } = params
    return Response.json({
      codprod: Number(codprod),
      descricao: `Produto ${codprod}`,
      codvol: 1,
      unidade: 'UN',
      preco: 100.0,
      status: 'ATIVO',
      dtcad: new Date().toISOString(),
      dtalter: new Date().toISOString()
    })
  }),

  http.get('/api/tgfgru', () => {
    return Response.json([
      { codgru: 1, descricao: 'Grupo 1' },
      { codgru: 2, descricao: 'Grupo 2' },
      { codgru: 3, descricao: 'Grupo 3' }
    ])
  }),

  // Price history endpoint
  http.get('/api/tgfpro/:codprod/price-history', ({ params }) => {
    const { codprod } = params
    const days = 30
    
    const mockHistory = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      price: 100 + Math.random() * 50
    }))

    return Response.json({
      codprod: Number(codprod),
      history: mockHistory.reverse()
    })
  })
]

// Setup MSW server
export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen())

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Close server after all tests
afterAll(() => server.close())

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))