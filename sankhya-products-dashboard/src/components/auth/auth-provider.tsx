import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/lib/api/auth-service';
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
 * Handles initial auth check and token restoration
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const { user, isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();

    useEffect(() => {
        const initializeAuth = async () => {
            const { token } = authService.getStoredTokens();

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                authService.setAuthHeader(token);

                const userData = await authService.getMe();

                if (userData) {
                    setUser(userData);
                }
            } catch (error) {
                console.warn('Auth initialization failed:', error);
                authService.clearTokens();
                authService.clearAuthHeader();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [setUser, setLoading]);

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
