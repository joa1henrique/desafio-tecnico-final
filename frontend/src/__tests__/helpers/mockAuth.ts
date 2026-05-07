import type { ActionKey } from "@/constants/rolePermissions";
import type { UserRole } from "@/types";

export const mockLogin = jest.fn();
export const mockLogout = jest.fn();

export type MockAuthOverrides = {
  user?: { id: string; nome: string; email: string; perfil: UserRole } | null;
  token?: string | null;
  permissions?: ActionKey[];
  isAuthenticated?: boolean;
  isLoading?: boolean;
};

function createBaseUser(role: UserRole) {
  const names: Record<UserRole, string> = {
    COLABORADOR: "Maria Silva",
    GESTOR: "João Gestor",
    FINANCEIRO: "Ana Financeiro",
    ADMIN: "Carlos Admin",
  };

  return {
    id: `user-${role.toLowerCase()}`,
    nome: names[role],
    email: `${role.toLowerCase()}@teste.com`,
    perfil: role,
  };
}

const defaultPermissions: Record<UserRole, ActionKey[]> = {
  COLABORADOR: ["create_reimbursement", "view_own_reimbursements"],
  GESTOR: ["view_sent_reimbursements"],
  FINANCEIRO: ["view_approved_reimbursements"],
  ADMIN: [
    "view_all_reimbursements",
    "view_financial_reports",
    "manage_users",
    "manage_categories",
  ],
};

export function mockAuthAs(role: UserRole, overrides?: MockAuthOverrides) {
  const user = overrides?.user !== undefined ? overrides.user : createBaseUser(role);
  const token = overrides?.token !== undefined ? overrides.token : "mock-token";
  const permissions = overrides?.permissions ?? defaultPermissions[role];
  const isAuthenticated = overrides?.isAuthenticated ?? true;
  const isLoading = overrides?.isLoading ?? false;

  const authValue = {
    user,
    token,
    permissions,
    isAuthenticated,
    isLoading,
    login: mockLogin,
    logout: mockLogout,
  };

  jest.spyOn(require("@/hooks/useAuth"), "useAuth").mockReturnValue(authValue);

  return authValue;
}

export function mockUnauthenticated() {
  return mockAuthAs("COLABORADOR", {
    user: null,
    token: null,
    permissions: [],
    isAuthenticated: false,
  });
}

export function resetAuthMocks() {
  mockLogin.mockReset();
  mockLogout.mockReset();
}
