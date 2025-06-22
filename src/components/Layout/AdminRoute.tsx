import React from "react";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * AdminRoute component that handles admin-only route protection
 *
 * @param children - The component to render if conditions are met
 * @param redirectTo - Where to redirect if not admin (default: '/profile')
 */
const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  redirectTo = '/profile' // Default redirect path
}) => {
  const { user, isAdmin } = useAuth(); 
  const location = useLocation();

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) { 
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render children if user is admin
  return <>{children}</>;
};

export default AdminRoute;
