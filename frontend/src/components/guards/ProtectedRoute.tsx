import type { UserRole } from "@/types";

// Helper function for TanStack Router beforeLoad hooks
export function createProtectedRouteLoader(allowedRoles?: UserRole[]) {
  return async ({ context }: { context: any }) => {
    const { auth } = context;
    
    if (!auth?.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    if (allowedRoles && auth.user && !allowedRoles.includes(auth.user.perfil)) {
      throw new Error('Insufficient permissions');
    }
  };
}