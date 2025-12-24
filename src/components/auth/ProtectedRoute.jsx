import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks';

export function ProtectedRoute({ children, requireProfile = false }) {
  const { userInfo, isAuthenticated } = useAuth();
  const location = useLocation();

  // Not authenticated - redirect to auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authenticated but incomplete profile (if required)
  if (requireProfile && (!userInfo.name || !userInfo.email)) {
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  return children;
}
