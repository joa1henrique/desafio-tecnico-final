import { render, screen } from "@testing-library/react";
import { UsersPage } from "@/pages/UsersPage";

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

// Mock do SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const useSWR = require("swr").default;

// Mock dos services
jest.mock("@/services/usersService", () => ({
  listUsers: jest.fn(),
}));

function setupAdmin() {
  useAuth.mockReturnValue({
    user: { id: "1", nome: "Admin", email: "admin@test.com", perfil: "ADMIN" },
    token: "mock-token",
    permissions: ["manage_users"],
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

function setupColaborador() {
  useAuth.mockReturnValue({
    user: { id: "2", nome: "Maria", email: "maria@test.com", perfil: "COLABORADOR" },
    token: "mock-token",
    permissions: ["create_reimbursement"],
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

const mockUsers = [
  { id: "1", nome: "Carlos Admin", email: "carlos@test.com", perfil: "ADMIN" },
  { id: "2", nome: "Maria Colab", email: "maria@test.com", perfil: "COLABORADOR" },
  { id: "3", nome: "João Gestor", email: "joao@test.com", perfil: "GESTOR" },
];

function setupSWRWithUsers() {
  useSWR.mockReturnValue({
    data: mockUsers,
    isLoading: false,
    error: null,
  });
}

function setupSWRLoading() {
  useSWR.mockReturnValue({
    data: null,
    isLoading: true,
    error: null,
  });
}

function setupSWRError() {
  useSWR.mockReturnValue({
    data: null,
    isLoading: false,
    error: new Error("Erro ao carregar"),
  });
}

describe("UsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bloqueia acesso com "Acesso negado" para não-admin', () => {
    setupColaborador();
    useSWR.mockReturnValue({ data: null, isLoading: false, error: null });

    render(<UsersPage />);

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
    expect(
      screen.getByText("Apenas administradores podem gerenciar usuários.")
    ).toBeInTheDocument();
  });

  it("ADMIN: renderiza a lista de usuários com nome, e-mail e perfil", () => {
    setupAdmin();
    setupSWRWithUsers();

    render(<UsersPage />);

    expect(screen.getAllByText("Carlos Admin")[0]).toBeInTheDocument();
    expect(screen.getAllByText("carlos@test.com")[0]).toBeInTheDocument();
    expect(screen.getAllByText("ADMIN")[0]).toBeInTheDocument();

    expect(screen.getAllByText("Maria Colab")[0]).toBeInTheDocument();
    expect(screen.getAllByText("maria@test.com")[0]).toBeInTheDocument();

    expect(screen.getAllByText("João Gestor")[0]).toBeInTheDocument();
    expect(screen.getAllByText("GESTOR")[0]).toBeInTheDocument();
  });

  it("mostra estado de carregamento", () => {
    setupAdmin();
    setupSWRLoading();

    render(<UsersPage />);

    expect(screen.getByText("Carregando usuários...")).toBeInTheDocument();
  });

  it("mostra mensagem de erro ao falhar o carregamento", () => {
    setupAdmin();
    setupSWRError();

    render(<UsersPage />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
  });

  it('mostra "Nenhum usuário cadastrado" quando a lista está vazia', () => {
    setupAdmin();
    useSWR.mockReturnValue({ data: [], isLoading: false, error: null });

    render(<UsersPage />);

    expect(screen.getByText("Nenhum usuário cadastrado.")).toBeInTheDocument();
  });

  it("exibe título da página", () => {
    setupAdmin();
    setupSWRWithUsers();

    render(<UsersPage />);

    expect(screen.getByText("Gestão de Usuários")).toBeInTheDocument();
  });
});
