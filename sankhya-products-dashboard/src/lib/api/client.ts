import axios, {
    type AxiosInstance,
    type AxiosError,
    type InternalAxiosRequestConfig,
    type AxiosResponse,
} from 'axios';
import { toast } from 'sonner';
import { authService } from './auth-service';

// API base URL - uses proxy in development
const API_BASE_URL = import.meta.env.VITE_SANKHYA_API_URL || '/api';

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 30000;

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Request interceptor - adds authorization token if available
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from stored tokens
        const { token } = authService.getStoredTokens();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handles errors globally
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
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
                        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                        // Retry the original request
                        return apiClient(_originalRequest);
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
            window.location.href = '/auth/sign-in';

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
                await new Promise(resolve => setTimeout(resolve, delay));
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

export async function get<T>(
    url: string,
    config?: ApiRequestConfig
): Promise<T> {
    const response = await apiClient.get<T>(url, config);
    return response.data;
}

export async function post<T, D = unknown>(
    url: string,
    data?: D,
    config?: ApiRequestConfig
): Promise<T> {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
}

export async function put<T, D = unknown>(
    url: string,
    data?: D,
    config?: ApiRequestConfig
): Promise<T> {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
}

export async function patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: ApiRequestConfig
): Promise<T> {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
}

export async function del<T>(
    url: string,
    config?: ApiRequestConfig
): Promise<T> {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
}

export { apiClient };
export default apiClient;
