import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingState } from '@/components/ui/loading';

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
  const { isAuthenticated, token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only redirect once to prevent infinite loops
    if (hasRedirectedRef.current) return;

    // If not authenticated and no token, redirect to login
    if (!isAuthenticated && !token) {
      hasRedirectedRef.current = true;
      navigate('/auth/entrar', {
        state: { from: location },
        replace: true,
      });
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, token, navigate, location]);

  // If we're authenticated or have a token, show children
  if (isAuthenticated || token) {
    return <>{children}</>;
  }

  // If we're still checking, show loading
  if (isChecking) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <LoadingState type="spinner" size="md" message="Verificando autenticação..." />
        </div>
      )
    );
  }

  // This shouldn't be reached, but fallback to children if something goes wrong
  return <>{children}</>;
}

export default AuthGuard;
