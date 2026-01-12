import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '@/test/setup';
import { http } from 'msw';
import { mockAuthResponse } from '@/test/mocks';

// Simple auth service for testing API integration
class AuthService {
  async login(token: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getProfile() {
    const response = await fetch('/api/auth/me');

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
}

describe('Auth Service Integration Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    localStorage.clear();
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });

  it('should handle successful login', async () => {
    const result = await authService.login(mockAuthResponse.access_token);

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('user');
    expect(result.user).toEqual(mockAuthResponse.user);
  });

  it('should handle successful profile fetch', async () => {
    const result = await authService.getProfile();

    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('name', 'Test User');
    expect(result).toHaveProperty('email', 'test@example.com');
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    server.use(
      http.post('/api/auth/login', () => {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );

    await expect(authService.login('invalid-token')).rejects.toThrow('API Error: 401');
  });
});
