import { Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/contexts/AuthContext";

export function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}