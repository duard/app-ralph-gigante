import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRoles?: string[];
}

/**
 * Protected route wrapper - redirects to login if not authenticated
 */
export function ProtectedRoute({
  children,
  redirectTo = '/auth/entrar',
  requiredRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, token } = useAuthStore();
  const location = useLocation();

  // Not authenticated and no token - redirect to login
  if (!isAuthenticated && !token) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check for required roles if specified
  if (requiredRoles && requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      return <Navigate to="/errors/forbidden" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
