import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { type LoginRequest } from '@/lib/api/auth-service';
import { useAuthWithCache } from './use-auth-with-cache';

/**
 * Custom hook for authentication management with React Query caching
 * This is a wrapper around useAuthWithCache for backward compatibility
 */
export function useAuth() {
    const navigate = useNavigate();
    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        isLoggingIn,
        isLoggingOut,
        login: loginWithCache,
        logout: logoutWithCache,
        refreshUser,
        hasPermission,
        hasRole,
    } = useAuthWithCache();

    const {
        clearError,
    } = useAuthStore();

    /**
     * Login with credentials and navigation
     */
    const login = useCallback(
        async (credentials: LoginRequest) => {
            try {
                const response = await loginWithCache(credentials, credentials.rememberMe);
                
                if (response) {
                    toast.success(`Bem-vindo, ${user?.name || 'Usuário'}!`);
                    navigate('/bem-vindo');
                    return { success: true };
                }
                
                const errorMessage = typeof error === 'string' ? error : error?.message || 'Falha no login';
                return { success: false, error: errorMessage };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
                return { success: false, error: errorMessage };
            }
        },
        [loginWithCache, user, navigate, error]
    );

    /**
     * Logout current user and navigate to login
     */
    const logout = useCallback(async () => {
        try {
            await logoutWithCache();
            navigate('/auth/entrar');
        } catch (err) {
            // Still navigate even if logout fails
            navigate('/auth/entrar');
        }
    }, [logoutWithCache, navigate]);

    return {
        user,
        token,
        isAuthenticated,
        isLoading: isLoading || isLoggingIn || isLoggingOut,
        error,
        login,
        logout,
        refreshUser,
        clearError,
        // Additional features from React Query version
        hasPermission,
        hasRole,
    };
}

export default useAuth;
