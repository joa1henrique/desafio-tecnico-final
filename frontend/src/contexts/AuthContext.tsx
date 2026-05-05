import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getPermissions, login as loginRequest, logout as logoutRequest } from "@/services/authService";
import type { AuthSession, LoginInput, User } from "@/types";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "@/utils/storage";
import type { ActionKey } from "@/constants/rolePermissions";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  permissions: ActionKey[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialSession = useMemo(() => loadAuthSession(), []);
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [permissions, setPermissions] = useState<ActionKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!initialSession) {
      return;
    }

    let isActive = true;

    async function loadPermissions() {
      try {
        const response = await getPermissions();
        if (isActive) {
          setPermissions(response.permissions);
        }
      } catch {
        if (isActive) {
          setPermissions([]);
        }
      }
    }

    void loadPermissions();

    return () => {
      isActive = false;
    };
  }, [initialSession]);

  async function login(input: LoginInput) {
    setIsLoading(true);

    try {
      const nextSession = await loginRequest(input);
      setSession(nextSession);
      saveAuthSession(nextSession);
      const response = await getPermissions();
      setPermissions(response.permissions);
      return nextSession.user;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    setIsLoading(true);

    try {
      await logoutRequest();
    } finally {
      clearAuthSession();
      setSession(null);
      setPermissions([]);
      setIsLoading(false);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      permissions,
      isAuthenticated: Boolean(session?.token),
      isLoading,
      login,
      logout,
    }),
    [session, permissions, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}