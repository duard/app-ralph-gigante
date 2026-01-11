import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import {
  useAuthCheckQuery,
  useCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useInvalidateAuth,
} from '@/lib/react-query';
import type { LoginRequest } from '@/lib/api/auth-service';
import { authService } from '@/lib/api/auth-service';

/**
 * Enhanced auth hook with React Query caching and state management
 */
export function useAuthWithCache() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setTokens,
    setLoading,
    setError: setAuthError,
    logout: storeLogout,
  } = useAuthStore();

  // React Query hooks
  const authCheckQuery = useAuthCheckQuery();
  const currentUserQuery = useCurrentUserQuery(isAuthenticated);
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const refreshTokenMutation = useRefreshTokenMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const requestPasswordResetMutation = useRequestPasswordResetMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const invalidateAuth = useInvalidateAuth();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      // Check if we have stored tokens
      const { token: storedToken } = authService.getStoredTokens();
      
      if (storedToken) {
        try {
          // Verify token validity by checking current user
          const isValid = await authService.checkAuth();
          if (isValid) {
            setTokens(storedToken, '');
            // The currentUserQuery will automatically fetch user data
          } else {
            // Token invalid, clear it
            authService.clearTokens();
            setTokens('', '');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          authService.clearTokens();
          setTokens('', '');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [setLoading, setTokens, setUser]);

  // Update user from React Query
  useEffect(() => {
    if (currentUserQuery.data) {
      setUser(currentUserQuery.data);
    }
  }, [currentUserQuery.data, setUser]);

  // Update loading state
  useEffect(() => {
    setLoading(
      authCheckQuery.isLoading || 
      currentUserQuery.isLoading || 
      currentUserQuery.isFetching
    );
  }, [
    authCheckQuery.isLoading,
    currentUserQuery.isLoading,
    currentUserQuery.isFetching,
    setLoading,
  ]);

  // Update error state
  useEffect(() => {
    if (authCheckQuery.error) {
      const errorMessage = authCheckQuery.error instanceof Error 
        ? authCheckQuery.error.message 
        : 'Erro ao verificar autenticação';
      setAuthError(errorMessage);
    } else if (currentUserQuery.error) {
      const errorMessage = currentUserQuery.error instanceof Error 
        ? currentUserQuery.error.message 
        : 'Erro ao carregar usuário';
      setAuthError(errorMessage);
    } else {
      setAuthError(null);
    }
  }, [authCheckQuery.error, currentUserQuery.error, setAuthError]);

  /**
   * Login with credentials
   */
  const login = useCallback(
    async (credentials: LoginRequest, rememberMe = false) => {
      try {
        setLoading(true);
        setAuthError(null);

        const response = await loginMutation.mutateAsync({
          credentials,
          rememberMe
        });

        if (response) {
          // The mutation handles token storage and user update
          return response;
        }

        return null;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Erro ao fazer login';
        setAuthError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loginMutation, setLoading, setAuthError]
  );

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      await logoutMutation.mutateAsync();
      
      // Clear local state
      storeLogout();
      authService.clearTokens();
      authService.clearAuthHeader();
      
      // Invalidate all auth queries
      invalidateAuth();
    } catch (error) {
      // Still logout even if request fails
      storeLogout();
      authService.clearTokens();
      authService.clearAuthHeader();
      invalidateAuth();
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao fazer logout';
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [logoutMutation, storeLogout, invalidateAuth, setLoading, setAuthError]);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(
    async (refreshTokenValue: string) => {
      try {
        const response = await refreshTokenMutation.mutateAsync(refreshTokenValue);
        return response;
      } catch (error) {
        // The mutation handles token cleanup on failure
        return null;
      }
    },
    [refreshTokenMutation]
  );

  /**
   * Change current user password
   */
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        setLoading(true);
        
        const response = await changePasswordMutation.mutateAsync({
          currentPassword,
          newPassword
        });
        
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Erro ao alterar senha';
        setAuthError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [changePasswordMutation, setLoading, setAuthError]
  );

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        
        const response = await requestPasswordResetMutation.mutateAsync(email);
        
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Erro ao solicitar recuperação de senha';
        setAuthError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [requestPasswordResetMutation, setLoading, setAuthError]
  );

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        setLoading(true);
        
        const response = await resetPasswordMutation.mutateAsync({
          token,
          newPassword
        });
        
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Erro ao redefinir senha';
        setAuthError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [resetPasswordMutation, setLoading, setAuthError]
  );

  /**
   * Refetch current user data
   */
  const refreshUser = useCallback(() => {
    if (isAuthenticated) {
      currentUserQuery.refetch();
    }
  }, [isAuthenticated, currentUserQuery]);

  /**
   * Check if user has specific role/permission
   */
    const hasPermission = useCallback(
    (permission: string) => {
      if (!user || !user.permissions) return false;
      return user.permissions.includes(permission) || user.role === 'admin';
    },
    [user]
  );

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback(
    (role: string) => {
      if (!user) return false;
      return user.role === role || role === 'admin' && user.role === 'admin';
    },
    [user]
  );

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || authCheckQuery.isLoading || currentUserQuery.isLoading,
    isRefetching: currentUserQuery.isFetching,
    error: error || authCheckQuery.error || currentUserQuery.error,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,

    // Actions
    login,
    logout,
    refreshToken,
    changePassword,
    requestPasswordReset,
    resetPassword,
    refreshUser,

    // Permission helpers
    hasPermission,
    hasRole,

    // React Query specific
    invalidateCache: invalidateAuth,
  };
}

export default useAuthWithCache;