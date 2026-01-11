import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/stores/authStore';

export default function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}