import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, type LoginRequest } from '../api/auth-service';

import { toast } from 'sonner';

// Query key factory
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  check: () => [...authKeys.all, 'check'] as const,
};

/**
 * Hook for checking current authentication status
 */
export function useAuthCheckQuery(enabled = true) {
  return useQuery({
    queryKey: authKeys.check(),
    queryFn: () => authService.checkAuth(),
    enabled, // Only run when explicitly enabled
    staleTime: 0, // Always check auth status
    gcTime: 0, // Don't cache auth status
    retry: false, // Don't retry auth failures
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching current user data
 */
export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authService.getMe(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false, // Don't refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    refetchInterval: false, // Don't poll
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      return failureCount < 1;
    },
  });
}

/**
 * Hook for user login
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      credentials,
      rememberMe,
    }: {
      credentials: LoginRequest;
      rememberMe?: boolean;
    }) =>
      authService.login(credentials).then((response) => ({
        ...response,
        rememberMe: rememberMe || false,
      })),
    onSuccess: (data) => {
      // Store tokens
      authService.storeTokens(
        data.access_token,
        '', // Refresh token not returned by Sankhya API
        data.rememberMe
      );

      // Set auth header
      authService.setAuthHeader(data.access_token);

      // Don't invalidate here - the query will refetch automatically when enabled
      toast.success('Login realizado com sucesso');

      return data;
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error(message);
    },
  });
}

/**
 * Hook for user logout
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all query cache
      queryClient.clear();

      // Clear auth header
      authService.clearAuthHeader();

      toast.success('Logout realizado com sucesso');
    },
    onError: (error) => {
      // Still clear cache even if logout request fails
      queryClient.clear();
      authService.clearAuthHeader();

      const message = error instanceof Error ? error.message : 'Erro ao fazer logout';
      toast.error(message);
    },
  });
}

/**
 * Hook for refreshing token
 */
export function useRefreshTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refreshToken: string) => authService.refreshToken(refreshToken),
    onSuccess: (response) => {
      // Store new tokens
      authService.storeTokens(
        response.data.token,
        response.data.refreshToken,
        true // Remember me on refresh
      );

      // Set new auth header
      authService.setAuthHeader(response.data.token);

      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      return response;
    },
    onError: () => {
      // Clear tokens on refresh failure
      authService.clearTokens();
      authService.clearAuthHeader();

      // Clear all queries since we're no longer authenticated
      queryClient.clear();

      toast.error('Sessão expirada. Por favor, faça login novamente.');
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao alterar senha';
      toast.error(message);
    },
  });
}

/**
 * Hook for requesting password reset
 */
export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
    onSuccess: (response) => {
      toast.success(response.message || 'Email de recuperação enviado com sucesso');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Erro ao solicitar recuperação de senha';
      toast.error(message);
    },
  });
}

/**
 * Hook for resetting password
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
    onSuccess: (response) => {
      toast.success(response.message || 'Senha redefinida com sucesso');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao redefinir senha';
      toast.error(message);
    },
  });
}

/**
 * Hook for prefetching current user data
 */
export function usePrefetchCurrentUser() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: authKeys.user(),
      queryFn: () => authService.getMe(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}

/**
 * Hook for invalidating auth-related queries
 */
export function useInvalidateAuth() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: authKeys.all });
  };
}
