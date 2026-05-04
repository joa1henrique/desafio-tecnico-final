import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { login as loginRequest, logout as logoutRequest } from "@/services/authService";
import type { AuthSession, LoginInput, User } from "@/types";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "@/utils/storage";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedSession = loadAuthSession();
  const [session, setSession] = useState<AuthSession | null>(storedSession);
  const [isLoading, setIsLoading] = useState(false);

  async function login(input: LoginInput) {
    setIsLoading(true);

    try {
      const nextSession = await loginRequest(input);
      setSession(nextSession);
      saveAuthSession(nextSession);
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
      setIsLoading(false);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      isLoading,
      login,
      logout,
    }),
    [session, isLoading]
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