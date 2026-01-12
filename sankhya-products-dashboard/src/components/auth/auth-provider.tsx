import { createContext, useContext, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/stores/auth-store';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - provides authentication context to the app
 * Provides auth state from Zustand store, initialization handled by useAuthWithCache
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

export default AuthProvider;
