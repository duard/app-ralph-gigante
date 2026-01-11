import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/lib/api/auth-service';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * AuthGuard - verifies authentication status on mount
 * Shows loading state while checking, redirects if not authenticated
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, setUser, logout } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const { token } = authService.getStoredTokens();

                if (!token) {
                    // No token, redirect to login
                    logout();
                    navigate('/auth/entrar', {
                        state: { from: location },
                        replace: true,
                    });
                    return;
                }

                // Set auth header and verify token
                authService.setAuthHeader(token);
                const user = await authService.getMe();

                if (user) {
                    setUser(user);
                } else {
                    throw new Error('Invalid session');
                }
            } catch {
                // Auth failed, clear and redirect
                authService.clearTokens();
                authService.clearAuthHeader();
                logout();
                navigate('/auth/sign-in', {
                    state: { from: location },
                    replace: true,
                });
            } finally {
                setIsChecking(false);
            }
        };

        if (!isAuthenticated) {
            verifyAuth();
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, navigate, location, setUser, logout]);

    if (isChecking) {
        return (
            fallback || (
                <div className="flex min-h-screen items-center justify-center">
                    <LoadingSpinner className="h-8 w-8" />
                </div>
            )
        );
    }

    return <>{children}</>;
}

export default AuthGuard;
