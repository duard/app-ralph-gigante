import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Criar instância do axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    // Pegar token do localStorage (buscar em auth-storage e sankhya-token)
    let token = null;

    // Tentar auth-storage (Zustand)
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        token = parsed.state?.token || parsed.token;
      } catch (error) {
        console.error('[Axios] Erro ao parsear auth-storage:', error);
      }
    }

    // Fallback: tentar sankhya-token direto
    if (!token) {
      token = localStorage.getItem('sankhya-token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios] Token adicionado:', token.substring(0, 20) + '...');
    } else {
      console.warn('[Axios] Nenhum token encontrado no localStorage!');
      console.log('[Axios] auth-storage:', localStorage.getItem('auth-storage'));
      console.log('[Axios] sankhya-token:', localStorage.getItem('sankhya-token'));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401: Token inválido ou expirado
    if (error.response?.status === 401) {
      console.error('[Axios] 401 Unauthorized - Token inválido ou expirado');

      // Limpar storage
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('sankhya-token');

      // Redirecionar para login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // 403: Sem permissão ou token expirado (dependendo da implementação do backend)
    if (error.response?.status === 403) {
      console.error('[Axios] 403 Forbidden - Acesso negado');
      console.error('[Axios] URL:', error.config?.url);
      console.error('[Axios] Método:', error.config?.method);
      console.error('[Axios] Response:', error.response?.data);

      // Se a mensagem indicar problema de autenticação, tratar como 401
      const message = error.response?.data?.message || '';
      const isAuthError =
        message.toLowerCase().includes('token') ||
        message.toLowerCase().includes('expired') ||
        message.toLowerCase().includes('unauthorized') ||
        message.toLowerCase().includes('authentication');

      if (isAuthError) {
        console.error('[Axios] 403 tratado como erro de autenticação');
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('sankhya-token');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }

    // Outros erros
    if (error.response) {
      console.error(`[Axios] Erro ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('[Axios] Sem resposta do servidor:', error.request);
    } else {
      console.error('[Axios] Erro na configuração da requisição:', error.message);
    }

    return Promise.reject(error);
  }
);
