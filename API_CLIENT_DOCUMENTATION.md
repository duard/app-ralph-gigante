# API Client Documentation

## Overview

The Sankhya Products Dashboard uses a comprehensive API client architecture to handle communication with both the external Sankhya API and our backend API. The client is built on Axios with TypeScript support, automatic authentication, error handling, and retry logic.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │────▶│  Backend API     │────▶│ Sankhya API     │
│   (React)       │    │  (localhost:3000)│    │  (External)     │
│                 │    │                  │    │                 │
│ sankhyaClient   │    │  backendClient   │    │                 │
│ backendClient   │    │  (apiClient)     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Clients

### 1. Sankhya Client (`sankhyaClient`)

Direct communication with the external Sankhya API through Vite proxy.

```typescript
import { sankhyaClient } from '@/lib/api/client';

// Uses Vite proxy (/api) to external Sankhya API
const response = await sankhyaClient.get('/tgfpro');
```

**Configuration:**

- Base URL: `/api` (Vite proxy to external Sankhya API)
- Timeout: 30 seconds
- Automatic token injection from Zustand store
- Comprehensive error handling

### 2. Backend Client (`backendClient`)

Communication with our Node.js backend API.

```typescript
import { backendClient } from '@/lib/api/client';

// Direct communication with backend API
const response = await backendClient.get('/auth/me');
```

**Configuration:**

- Base URL: `http://localhost:3000` (configurable via `VITE_BACKEND_API_URL`)
- Timeout: 30 seconds
- JWT token authentication
- Automatic token refresh on 401 errors

## Services

### Authentication Service (`authService`)

Handles all authentication operations.

```typescript
import { authService } from '@/lib/api/auth-service';
```

#### Methods

##### `login(credentials)`

Login with Sankhya credentials.

```typescript
const response = await authService.login({
  username: 'CONVIDADO',
  password: 'guest123',
  rememberMe: true,
});

// Response: { access_token: string, token_type: string, expires_in: number }
```

##### `refreshToken(refreshToken)`

Refresh expired access token.

```typescript
const response = await authService.refreshToken(refreshToken);

// Response: { success: boolean, data: { token: string, refreshToken: string, expiresIn: number } }
```

##### `getMe()`

Get current user information.

```typescript
const user = await authService.getMe();

// Response: User interface with id, name, email, etc.
```

##### `logout()`

Logout user and clear tokens.

```typescript
await authService.logout();
// Automatically clears localStorage/sessionStorage
```

##### `checkAuth()`

Check if user is authenticated.

```typescript
const isAuthenticated = await authService.checkAuth();
// Returns: boolean
```

##### `storeTokens(token, refreshToken, rememberMe)`

Store tokens securely based on remember preference.

```typescript
authService.storeTokens(token, refreshToken, true);
// rememberMe = true → localStorage
// rememberMe = false → sessionStorage (no refresh token)
```

##### `getStoredTokens()`

Retrieve stored tokens.

```typescript
const { token, refreshToken } = authService.getStoredTokens();
// Checks both localStorage and sessionStorage
```

##### `clearTokens()`

Clear all stored tokens.

```typescript
authService.clearTokens();
// Clears both localStorage and sessionStorage
```

### Product Service (`productService`)

Handles all product-related operations.

```typescript
import { productService } from '@/lib/api/product-service';
```

#### Methods

##### `getProducts(params)`

Get products with filters, sorting, and pagination.

```typescript
const products = await productService.getProducts({
  pagination: { page: 1, pageSize: 20 },
  query: 'search term',
  filters: {
    status: 'active',
    category: 123,
    priceMin: 100,
    priceMax: 1000,
  },
  sort: [{ field: 'descrprod', order: 'asc' }],
});

// Response: PaginatedResponse<Product>
```

##### `getProductById(id)`

Get single product by ID.

```typescript
const product = await productService.getProductById(123);

// Response: ApiResponse<Product>
```

##### `createProduct(data)`

Create new product.

```typescript
const newProduct = await productService.createProduct({
  descrprod: 'Product Name',
  vlrvenda: 199.99,
  ativo: 'S',
  codgrupoprod: 456,
});

// Response: ApiResponse<Product>
```

##### `updateProduct(id, data)`

Update existing product.

```typescript
const updatedProduct = await productService.updateProduct(123, {
  descrprod: 'Updated Name',
  vlrvenda: 299.99,
});

// Response: ApiResponse<Product>
```

##### `deleteProduct(id)`

Delete product.

```typescript
await productService.deleteProduct(123);

// Response: ApiResponse<void>
```

##### `searchProducts(query)`

Search products by term.

```typescript
const results = await productService.searchProducts('laptop');

// Response: PaginatedResponse<Product>
```

##### `getProductsByCategory(categoryId)`

Get products by category.

```typescript
const categoryProducts = await productService.getProductsByCategory(456);

// Response: PaginatedResponse<Product>
```

##### `toggleProductStatus(id)`

Toggle product active/inactive status.

```typescript
const updatedProduct = await productService.toggleProductStatus(123);

// Response: ApiResponse<Product>
```

##### `updateStock(id, quantity)`

Update product stock.

```typescript
const updatedProduct = await productService.updateStock(123, 50);

// Response: ApiResponse<Product>
```

##### `getCategories()`

Get product categories.

```typescript
const categories = await productService.getCategories();

// Response: ApiResponse<{ id: number; name: string }[]>
```

##### `getProductStats()`

Get product statistics.

```typescript
const stats = await productService.getProductStats();

// Response: ApiResponse<{
//   total: number;
//   active: number;
//   inactive: number;
//   lowStock: number;
//   totalValue: number;
// }>
```

##### `exportToCSV(filters)`

Export products to CSV.

```typescript
const csvBlob = await productService.exportToCSV({
  status: 'active',
  category: 456,
});

// Download file
const url = window.URL.createObjectURL(csvBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'products.csv';
a.click();
```

## HTTP Helpers

### Basic HTTP Methods

```typescript
import { get, post, put, patch, del } from '@/lib/api/client';

// GET request
const data = await get<ResponseType>('/endpoint');

// POST request
const result = await post<ResponseType, RequestDataType>(
  '/endpoint',
  requestData
);

// PUT request
const updated = await put<ResponseType, RequestDataType>(
  '/endpoint/123',
  updateData
);

// PATCH request
const patched = await patch<ResponseType, RequestDataType>(
  '/endpoint/123',
  patchData
);

// DELETE request
await del<void>('/endpoint/123');
```

### Request Configuration

```typescript
import { get, type ApiRequestConfig } from '@/lib/api/client';

const config: ApiRequestConfig = {
  headers: { 'Custom-Header': 'value' },
  params: { filter: 'value' },
  timeout: 10000,
  signal: abortController.signal,
};

const data = await get<ResponseType>('/endpoint', config);
```

## Error Handling

The API client includes comprehensive error handling:

### Automatic Error Handling

- **401 Unauthorized**: Automatic token refresh and retry
- **403 Forbidden**: Access denied notification
- **404 Not Found**: Resource not found notification
- **422 Validation**: Validation error notification
- **429 Rate Limit**: Silent rate limit handling
- **500 Server Error**: Server error notification
- **Network Errors**: Connection error notification

### Manual Error Handling

```typescript
try {
  const data = await productService.getProducts();
} catch (error) {
  if (error.response?.status === 401) {
    // Handle authentication error
  } else if (error.response?.status === 422) {
    // Handle validation error
  } else {
    // Handle other errors
  }
}
```

## Retry Logic

### With Retry Utility

```typescript
import { withRetry } from '@/lib/api/client';

const data = await withRetry(
  () => productService.getProducts(),
  3, // max retries
  1000 // base delay in ms
);
```

### Automatic Retry Configuration

- **Exponential Backoff**: Delay increases with each retry
- **Max Retries**: 3 attempts by default
- **Base Delay**: 1 second by default

## Authentication Flow

### 1. External Token Acquisition

```typescript
// Get token from external Sankhya API
const externalResponse = await fetch(
  'https://api-nestjs-sankhya-read-producao.gigantao.net/auth/login',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'CONVIDADO', password: 'guest123' }),
  }
);

const { access_token } = await externalResponse.json();
```

### 2. Backend Token Validation

```typescript
// Send external token to our backend
const backendResponse = await authService.login({ token: access_token });
```

### 3. Token Storage

```typescript
// Store tokens based on remember preference
authService.storeTokens(access_token, refreshToken, rememberMe);
```

### 4. Automatic Token Injection

Tokens are automatically added to all API requests:

```typescript
// Token automatically added to Authorization header
const products = await productService.getProducts();
```

## Type Definitions

### Core Types

```typescript
interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  signal?: AbortSignal;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasMore: boolean;
}
```

### Authentication Types

```typescript
interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}
```

### Product Types

```typescript
interface ProductPayload {
  descrprod: string;
  reffab?: string;
  codvol?: string;
  vlrvenda?: number;
  vlrcusto?: number;
  estoque?: number;
  estmin?: number;
  ativo?: 'S' | 'N';
  codgrupoprod?: number;
  descrgrupoprod?: string;
  codmarca?: number;
  ncm?: string;
  cest?: string;
  pesoliq?: number;
  pesobruto?: number;
  observacao?: string;
  imagem?: string;
}

interface ProductSearchParams {
  query?: string;
  filters?: ProductFilters;
  sort?: SortParams[];
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}
```

## Environment Variables

```bash
# Backend API URL
VITE_BACKEND_API_URL=http://localhost:3000

# External Sankhya API URL
VITE_SANKHYA_API_URL=https://api-nestjs-sankhya-read-producao.gigantao.net
```

## Best Practices

### 1. Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
  const products = await productService.getProducts(params);
  // Handle success
} catch (error) {
  // Handle error
  console.error('Failed to fetch products:', error);
}
```

### 2. Type Safety

Use proper TypeScript types for all API calls:

```typescript
const products: PaginatedResponse<Product> = await productService.getProducts();
```

### 3. Token Management

Let the service handle token storage automatically:

```typescript
// Use rememberMe option during login
await authService.login(credentials, rememberMe);
```

### 4. Pagination

Always use pagination for large datasets:

```typescript
const products = await productService.getProducts({
  pagination: { page: 1, pageSize: 20 },
});
```

### 5. Filtering

Use the filter interface for consistent filtering:

```typescript
const products = await productService.getProducts({
  filters: {
    status: 'active',
    category: 123,
    priceMin: 100,
    priceMax: 1000,
  },
});
```

## Debugging

### Console Logging

The API client includes comprehensive console logging:

```bash
# Request logging
[API Request] GET /tgfpro { headers: {...}, params: {...} }

# Response logging
[API Response] 200 GET /tgfpro { data: [...], headers: {...} }

# Error logging
[API Response Error] 404 GET /tgfpro/999 { message: "Not found" }
```

### Network Tab

Use browser dev tools to inspect:

- Request headers (Authorization tokens)
- Request payloads
- Response data
- Error responses

## Testing

### Mock API Responses

For testing, mock the API services:

```typescript
// Mock productService
jest.mock('@/lib/api/product-service', () => ({
  productService: {
    getProducts: jest.fn().mockResolvedValue(mockProducts),
    getProductById: jest.fn().mockResolvedValue(mockProduct),
  },
}));
```

### Test Authentication

Test authentication flows with mock tokens:

```typescript
// Mock authService
jest.mock('@/lib/api/auth-service', () => ({
  authService: {
    login: jest.fn().mockResolvedValue({ access_token: 'mock-token' }),
    getMe: jest.fn().mockResolvedValue(mockUser),
  },
}));
```

## Performance Optimization

### 1. Request Debouncing

Use debounced search for real-time filtering:

```typescript
const debouncedSearch = useMemo(
  () =>
    debounce((query: string) => {
      productService.searchProducts(query);
    }, 300),
  []
);
```

### 2. Request Caching

Implement caching for frequently accessed data:

```typescript
// Use React Query for caching
const { data: products } = useQuery({
  queryKey: ['products', params],
  queryFn: () => productService.getProducts(params),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 3. Request Cancellation

Cancel requests on component unmount:

```typescript
useEffect(() => {
  const controller = new AbortController();

  productService.getProducts(params, { signal: controller.signal });

  return () => controller.abort();
}, [params]);
```

## Security Considerations

### 1. Token Storage

- Use `localStorage` for persistent sessions (remember me)
- Use `sessionStorage` for temporary sessions
- Never store tokens in plain text in production

### 2. HTTPS

Always use HTTPS in production:

```typescript
const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.example.com'
    : 'http://localhost:3000';
```

### 3. Request Validation

Validate all request data:

```typescript
const validatedData = productSchema.parse(requestData);
await productService.createProduct(validatedData);
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors

Ensure backend API includes proper CORS headers:

```typescript
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
```

#### 2. Token Not Found

Check token storage:

```typescript
const { token } = authService.getStoredTokens();
console.log('Stored token:', token);
```

#### 3. Network Timeout

Increase timeout for slow connections:

```typescript
const config: ApiRequestConfig = { timeout: 60000 };
```

#### 4. Rate Limiting

Implement rate limiting in backend:

```typescript
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests
  })
);
```

### Debug Steps

1. Check browser console for API logs
2. Inspect Network tab for request/response details
3. Verify environment variables
4. Test API endpoints directly (curl/Postman)
5. Check backend server logs
6. Verify token storage and format

## Migration Guide

### From Direct Axios

```typescript
// Before
import axios from 'axios';
const response = await axios.get('/api/products');

// After
import { productService } from '@/lib/api/product-service';
const response = await productService.getProducts();
```

### From Fetch API

```typescript
// Before
const response = await fetch('/api/products');
const data = await response.json();

// After
import { productService } from '@/lib/api/product-service';
const data = await productService.getProducts();
```

This documentation provides comprehensive guidance for using the API client in the Sankhya Products Dashboard.
