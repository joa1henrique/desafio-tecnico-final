import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.perfil)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}