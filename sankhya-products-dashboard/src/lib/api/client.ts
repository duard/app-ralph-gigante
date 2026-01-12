import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { toast } from 'sonner';
import { authService } from './auth-service';

// API base URLs
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000';

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 30000;

// Create axios instance for Sankhya external API (uses Vite proxy /api)
export const sankhyaClient: AxiosInstance = axios.create({
  baseURL: '/api', // Uses Vite proxy to external API
  timeout: DEFAULT_TIMEOUT,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Create axios instance for our backend API
export const backendClient: AxiosInstance = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for Sankhya client - adds Sankhya JWT token
sankhyaClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('[Sankhya API Request]', config.method?.toUpperCase(), config.url, {
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
      params: config.params,
    });

    // Get Sankhya token from Zustand auth store (stored in localStorage as 'auth-storage')
    let token: string | null = null;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        token = authData.state?.token || null;
      }
    } catch (error) {
      console.error('[Sankhya API Request] Error reading auth token from storage:', error);
    }

    // Fallback to old method if Zustand token not found
    if (!token) {
      const { token: fallbackToken } = authService.getStoredTokens();
      token = fallbackToken;
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        '[Sankhya API Request] Sankhya token added to headers:',
        token.substring(0, 50) + '...'
      );
    } else {
      console.log('[Sankhya API Request] No Sankhya token available - user may need to login');
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[Sankhya API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for Sankhya client
sankhyaClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(
      '[Sankhya API Response]',
      response.status,
      response.config.method?.toUpperCase(),
      response.config.url,
      {
        data: response.data,
        headers: response.headers,
      }
    );
    return response;
  },
  (error: AxiosError) => {
    console.error(
      '[Sankhya API Response Error]',
      error.response?.status,
      error.config?.method?.toUpperCase(),
      error.config?.url,
      {
        message: error.message,
        response: error.response?.data,
        headers: error.response?.headers,
      }
    );

    // Handle Sankhya API errors
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as { message?: string })?.message || error.message;

      switch (status) {
        case 401:
          toast.error('Token da API Sankhya expirado. Faça login novamente.');
          // Clear tokens and redirect to login
          authService.clearTokens();
          window.location.href = '/auth/entrar';
          break;
        case 403:
          toast.error('Acesso negado à API Sankhya. Verifique suas permissões.');
          break;
        case 404:
          toast.error('Recurso não encontrado na API Sankhya.');
          break;
        default:
          toast.error(`Erro na API Sankhya: ${message}`);
      }
    } else if (error.request) {
      toast.error('Não foi possível conectar à API Sankhya. Verifique sua conexão.');
    } else {
      toast.error(`Erro: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

// Legacy apiClient - points to backend for backward compatibility
export { backendClient as apiClient };

// Request interceptor - adds authorization token if available
backendClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('[API Request]', config.method?.toUpperCase(), config.url, {
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
      params: config.params,
    });

    // Get token from stored tokens
    const { token } = authService.getStoredTokens();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Request] Token added to headers:', token.substring(0, 50) + '...');
    } else {
      console.log('[API Request] No token available');
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors globally
backendClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(
      '[API Response]',
      response.status,
      response.config.method?.toUpperCase(),
      response.config.url,
      {
        data: response.data,
        headers: response.headers,
      }
    );
    return response;
  },
  async (error: AxiosError) => {
    const _originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - try refresh token first
    if (error.response?.status === 401 && !_originalRequest._retry) {
      _originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken);
          if (response.success) {
            const { token, refreshToken: newRefreshToken } = response.data;

            // Update stored tokens
            localStorage.setItem('auth_token', token);
            localStorage.setItem('refresh_token', newRefreshToken);

            // Update auth header for future requests
            backendClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Retry the original request
            return backendClient(_originalRequest);
          }
        } catch {
          // Refresh failed, continue to logout
        }
      }

      // Clear tokens and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('auth_token');

      toast.error('Sessão expirada. Por favor, faça login novamente.');

      // Redirect to login page
      window.location.href = '/auth/entrar';

      return Promise.reject(error);
    }

    // Handle other error statuses
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as { message?: string })?.message || error.message;

      switch (status) {
        case 400:
          toast.error(`Requisição inválida: ${message}`);
          break;
        case 403:
          toast.error('Acesso negado. Você não tem permissão para realizar esta ação.');
          break;
        case 404:
          toast.error('Recurso não encontrado.');
          break;
        case 422:
          toast.error(`Erro de validação: ${message}`);
          break;
        case 429:
          // Rate limiting - don't show error toast to avoid spam, just log
          console.warn('Rate limit exceeded - too many requests');
          break;
        case 500:
          toast.error('Erro interno do servidor. Por favor, tente novamente mais tarde.');
          break;
        default:
          toast.error(`Erro: ${message}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      toast.error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    } else {
      // Something happened in setting up the request
      toast.error(`Erro: ${error.message}`);
    }

    console.error(
      '[API Response Error]',
      error.response?.status,
      error.config?.method?.toUpperCase(),
      error.config?.url,
      {
        message: error.message,
        response: error.response?.data,
        headers: error.response?.headers,
      }
    );
    return Promise.reject(error);
  }
);

// Retry utility with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// API request helper with proper typing
export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  signal?: AbortSignal;
}

export async function get<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const response = await backendClient.get<T>(url, config);
  return response.data;
}

export async function post<T, D = unknown>(
  url: string,
  data?: D,
  config?: ApiRequestConfig
): Promise<T> {
  const response = await backendClient.post<T>(url, data, config);
  return response.data;
}

export async function put<T, D = unknown>(
  url: string,
  data?: D,
  config?: ApiRequestConfig
): Promise<T> {
  const response = await backendClient.put<T>(url, data, config);
  return response.data;
}

export async function patch<T, D = unknown>(
  url: string,
  data?: D,
  config?: ApiRequestConfig
): Promise<T> {
  const response = await backendClient.patch<T>(url, data, config);
  return response.data;
}

export async function del<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const response = await backendClient.delete<T>(url, config);
  return response.data;
}
