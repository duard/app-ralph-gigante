import { useCallback, useEffect, useRef, useState } from 'react';
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
  // Auth initialization state
  const hasCheckedAuthRef = useRef(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const previousUserIdRef = useRef<string | null>(null);
  const hasTokenRef = useRef(false);

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

  // Track token state with ref to avoid triggering re-renders
  if (token && !hasTokenRef.current) {
    hasTokenRef.current = true;
  } else if (!token && hasTokenRef.current) {
    hasTokenRef.current = false;
  }

  // React Query hooks - only check auth when initialized and we have a token
  // Use ref instead of state to prevent query re-enabling loops
  const shouldEnableQueries = authInitialized && !!token;
  const authCheckQuery = useAuthCheckQuery(shouldEnableQueries);
  const currentUserQuery = useCurrentUserQuery(shouldEnableQueries);
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const refreshTokenMutation = useRefreshTokenMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const requestPasswordResetMutation = useRequestPasswordResetMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const invalidateAuth = useInvalidateAuth();

  // Check authentication status on mount - only run once
  useEffect(() => {
    if (hasCheckedAuthRef.current) return;
    hasCheckedAuthRef.current = true;

    const checkAuth = async () => {
      setLoading(true);

      // Check if we have stored tokens
      const { token: storedToken } = authService.getStoredTokens();

      if (storedToken) {
        try {
          // Set auth header first
          authService.setAuthHeader(storedToken);

          // Verify token validity by checking current user
          const isValid = await authService.checkAuth();
          if (isValid) {
            setTokens(storedToken, '');
            // The currentUserQuery will automatically fetch user data when enabled
          } else {
            // Token invalid, clear it
            authService.clearTokens();
            authService.clearAuthHeader();
            setTokens('', '');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          authService.clearTokens();
          authService.clearAuthHeader();
          setTokens('', '');
          setUser(null);
        }
      }

      setLoading(false);
      setAuthInitialized(true);
    };

    checkAuth();
  }, []); // Empty dependency array - only run once

  // Get user from query result directly (don't sync to store automatically)
  const queryUser = currentUserQuery.data || user;

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
          rememberMe,
        });

        if (response) {
          // Set tokens in store so queries can run
          setTokens(response.access_token, '');

          return response;
        }

        return null;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
        setAuthError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loginMutation, setLoading, setAuthError, setTokens]
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

      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer logout';
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
          newPassword,
        });

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha';
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
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao solicitar recuperação de senha';
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
          newPassword,
        });

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao redefinir senha';
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
      return user.role === role || (role === 'admin' && user.role === 'admin');
    },
    [user]
  );

  // Calculate derived state
  const combinedIsLoading = isLoading || authCheckQuery.isLoading || currentUserQuery.isLoading;
  let combinedError: string | null = null;
  if (authCheckQuery.error) {
    combinedError =
      authCheckQuery.error instanceof Error
        ? authCheckQuery.error.message
        : 'Erro ao verificar autenticação';
  } else if (currentUserQuery.error) {
    combinedError =
      currentUserQuery.error instanceof Error
        ? currentUserQuery.error.message
        : 'Erro ao carregar usuário';
  } else {
    combinedError = error;
  }

  return {
    // State - use query user data when available
    user: queryUser,
    token,
    isAuthenticated,
    isLoading: combinedIsLoading,
    isRefetching: currentUserQuery.isFetching,
    error: combinedError,
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
