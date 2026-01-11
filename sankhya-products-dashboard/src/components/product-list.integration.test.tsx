import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/test/utils'
import { server } from '@/test/setup'
import { http } from 'msw'

// Simple component for testing API integration
function ProductList() {
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/tgfpro?page=1&perPage=10')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data.data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) return <div data-testid="loading">Loading...</div>
  if (error) return <div data-testid="error">Error: {error}</div>
  if (products.length === 0) return <div data-testid="empty">No products found</div>

  return (
    <div data-testid="product-list">
      {products.map((product: any) => (
        <div key={product.codprod} data-testid={`product-${product.codprod}`}>
          {product.descricao}
        </div>
      ))}
      <button onClick={fetchProducts} data-testid="refresh-button">
        Refresh
      </button>
    </div>
  )
}

describe('ProductList Component Integration', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  it('renders products list successfully', async () => {
    render(<ProductList />)

    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument()

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByTestId('product-list')).toBeInTheDocument()
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-2')).toBeInTheDocument()
      expect(screen.getByTestId('product-3')).toBeInTheDocument()
    })

    // Check product names
    expect(screen.getByText('Produto 1')).toBeInTheDocument()
    expect(screen.getByText('Produto 2')).toBeInTheDocument()
    expect(screen.getByText('Produto 3')).toBeInTheDocument()
  })

  it('handles API errors', async () => {
    // Mock API error
    server.use(
      http.get('/api/tgfpro', () => {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      })
    )

    render(<ProductList />)

    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument()

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
    })
  })

  it('handles empty response', async () => {
    // Mock empty products response
    server.use(
      http.get('/api/tgfpro', () => {
        return Response.json({
          data: [],
          total: 0,
          page: 1,
          perPage: 10,
          lastPage: 0,
          hasMore: false
        })
      })
    )

    render(<ProductList />)

    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument()

    // Wait for empty state
    await waitFor(() => {
      expect(screen.getByTestId('empty')).toBeInTheDocument()
      expect(screen.getByText('No products found')).toBeInTheDocument()
    })
  })

  it('can refresh data', async () => {
    render(<ProductList />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('product-list')).toBeInTheDocument()
    })

    // Click refresh button
    fireEvent.click(screen.getByTestId('refresh-button'))

    // Should show loading again
    expect(screen.getByTestId('loading')).toBeInTheDocument()

    // Wait for data to reload
    await waitFor(() => {
      expect(screen.getByTestId('product-list')).toBeInTheDocument()
    })
  })
})