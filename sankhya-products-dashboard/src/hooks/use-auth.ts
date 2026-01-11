import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { authService, type LoginRequest } from '@/lib/api/auth-service';

/**
 * Custom hook for authentication management
 */
export function useAuth() {
    const navigate = useNavigate();
    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login: storeLogin,
        logout: storeLogout,
        setLoading,
        setError,
        clearError,
    } = useAuthStore();

    /**
     * Login with credentials
     */
    const login = useCallback(
        async (credentials: LoginRequest) => {
            try {
                setLoading(true);
                clearError();

                const response = await authService.login(credentials);

                if (response.success) {
                    const { user, token, refreshToken } = response.data;

                    // Store tokens securely based on rememberMe
                    authService.storeTokens(token, refreshToken, credentials.rememberMe);
                    authService.setAuthHeader(token);

                    // Update store
                    storeLogin(user, token, refreshToken);

                    toast.success(`Bem-vindo, ${user.name}!`);
                    navigate('/dashboard');

                    return { success: true };
                } else {
                    const errorMessage = response.message || 'Falha no login';
                    setError(errorMessage);
                    toast.error(errorMessage);
                    return { success: false, error: errorMessage };
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        },
        [navigate, storeLogin, setLoading, setError, clearError]
    );

    /**
     * Logout current user
     */
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } finally {
            authService.clearAuthHeader();
            storeLogout();
            toast.success('Logout realizado com sucesso');
            navigate('/auth/sign-in');
        }
    }, [navigate, storeLogout]);

    /**
     * Check if user is still authenticated
     */
    const checkAuth = useCallback(async () => {
        const { token } = authService.getStoredTokens();

        if (!token) {
            return false;
        }

        try {
            authService.setAuthHeader(token);
            const isValid = await authService.checkAuth();

            if (!isValid) {
                storeLogout();
                authService.clearTokens();
                authService.clearAuthHeader();
            }

            return isValid;
        } catch {
            storeLogout();
            authService.clearTokens();
            authService.clearAuthHeader();
            return false;
        }
    }, [storeLogout]);

    /**
     * Refresh user data from server
     */
    const refreshUser = useCallback(async () => {
        try {
            const user = await authService.getMe();
            useAuthStore.getState().setUser(user);
            return user;
        } catch {
            return null;
        }
    }, []);

    // Check auth on mount
    useEffect(() => {
        const initAuth = async () => {
            const { token } = authService.getStoredTokens();

            if (token) {
                authService.setAuthHeader(token);
                await checkAuth();
            }
        };

        initAuth();
    }, [checkAuth]);

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        checkAuth,
        refreshUser,
        clearError,
    };
}

export default useAuth;
