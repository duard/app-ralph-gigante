import axios, {
    type AxiosInstance,
    type AxiosError,
    type InternalAxiosRequestConfig,
    type AxiosResponse,
} from 'axios';
import { toast } from 'sonner';

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
        // Get token from localStorage or auth store
        const token = localStorage.getItem('auth_token');

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
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');

                if (refreshToken) {
                    // Attempt to refresh the token
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { token: newToken, refreshToken: newRefreshToken } = response.data;

                    // Store new tokens
                    localStorage.setItem('auth_token', newToken);
                    localStorage.setItem('refresh_token', newRefreshToken);

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }

                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');

                toast.error('Sessão expirada. Por favor, faça login novamente.');

                // Redirect to login page
                window.location.href = '/auth/sign-in';

                return Promise.reject(refreshError);
            }
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
