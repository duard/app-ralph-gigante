import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '@/test/setup';
import { http } from 'msw';

// Simple API client for testing
class ApiClient {
  private baseURL: string;

  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const result = (await response.json()) as unknown as T;
    return result;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const result = (await response.json()) as unknown as T;
    return result;
  }

  async setAuthToken(token: string) {
    // Mock token setting - in real app this would set headers
    localStorage.setItem('access_token', token);
  }
}

describe('API Client', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient();
    localStorage.clear();
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });

  it('should fetch products successfully', async () => {
    const response = (await apiClient.get('/tgfpro?page=1&perPage=10')) as any;

    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('page');
    expect(response).toHaveProperty('perPage');
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data).toHaveLength(10);
  });

  it('should fetch a single product', async () => {
    const response = await apiClient.get('/tgfpro/1');

    expect(response).toHaveProperty('codprod', 1);
    expect(response).toHaveProperty('descricao');
    expect(response).toHaveProperty('preco');
  });

  it('should handle authentication', async () => {
    // Test login
    const loginResponse = (await apiClient.post('/auth/login', {
      username: 'test',
      password: 'test',
    })) as any;

    expect(loginResponse).toHaveProperty('access_token');
    expect(loginResponse).toHaveProperty('user');

    // Set token
    await apiClient.setAuthToken(loginResponse.access_token);

    // Test protected route
    const userResponse = (await apiClient.get('/auth/me')) as any;
    expect(userResponse).toHaveProperty('id');
    expect(userResponse).toHaveProperty('name');
    expect(userResponse).toHaveProperty('email');
  });

  it('should handle API errors', async () => {
    // Mock error response
    server.use(
      http.get('/api/tgfpro', () => {
        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );

    await expect(apiClient.get('/tgfpro')).rejects.toThrow('API Error: 404');
  });

  it('should handle network errors', async () => {
    // Mock network error
    server.use(
      http.get('/api/tgfpro', () => {
        return Response.error();
      })
    );

    await expect(apiClient.get('/tgfpro')).rejects.toThrow();
  });
});
