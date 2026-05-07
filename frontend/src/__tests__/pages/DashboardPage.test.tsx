import { render, screen } from "@testing-library/react";
import { DashboardPage } from "@/pages/DashboardPage";

// Mock do router
jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock do useAuth
jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require("@/hooks/useAuth");

function setupAuth(perfil: string, permissions: string[]) {
  useAuth.mockReturnValue({
    user: { id: "1", nome: "Usuário Teste", email: "test@test.com", perfil },
    token: "mock-token",
    permissions,
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exibe "Bem-vindo, {nome}"', () => {
    setupAuth("COLABORADOR", ["create_reimbursement", "view_own_reimbursements"]);
    render(<DashboardPage />);

    expect(screen.getByText(/Bem-vindo, Usuário Teste/)).toBeInTheDocument();
  });

  it("exibe o perfil do usuário", () => {
    setupAuth("COLABORADOR", ["create_reimbursement", "view_own_reimbursements"]);
    render(<DashboardPage />);

    expect(screen.getAllByText("COLABORADOR")[0]).toBeInTheDocument();
  });

  it('COLABORADOR: mostra "Nova solicitação" e "Minhas solicitações"', () => {
    setupAuth("COLABORADOR", ["create_reimbursement", "view_own_reimbursements"]);
    render(<DashboardPage />);

    expect(screen.getByText("Nova solicitação")).toBeInTheDocument();
    expect(screen.getByText("Minhas solicitações")).toBeInTheDocument();
  });

  it('GESTOR: mostra "Solicitações enviadas"', () => {
    setupAuth("GESTOR", ["view_sent_reimbursements"]);
    render(<DashboardPage />);

    expect(screen.getByText("Solicitações enviadas")).toBeInTheDocument();
    expect(screen.queryByText("Nova solicitação")).not.toBeInTheDocument();
  });

  it("ADMIN: mostra todas as ações administrativas", () => {
    setupAuth("ADMIN", [
      "view_all_reimbursements",
      "view_financial_reports",
      "manage_users",
      "manage_categories",
    ]);
    render(<DashboardPage />);

    expect(screen.getByText("Todas as solicitações")).toBeInTheDocument();
    expect(screen.getByText("Relatório Financeiro")).toBeInTheDocument();
    expect(screen.getByText("Usuários")).toBeInTheDocument();
    expect(screen.getByText("Categorias")).toBeInTheDocument();
  });

  it('FINANCEIRO: mostra "Solicitações aprovadas"', () => {
    setupAuth("FINANCEIRO", ["view_approved_reimbursements"]);
    render(<DashboardPage />);

    expect(screen.getByText("Solicitações aprovadas")).toBeInTheDocument();
    expect(screen.queryByText("Nova solicitação")).not.toBeInTheDocument();
  });
});
