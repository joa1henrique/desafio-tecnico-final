import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "@/pages/LoginPage";

// Mock do router
const mockNavigate = jest.fn();
jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock do useAuth
const mockLogin = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require("@/hooks/useAuth");

function setupAuth(overrides: any = {}) {
  useAuth.mockReturnValue({
    login: mockLogin,
    isLoading: false,
    ...overrides,
  });
}

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth();
  });

  it("renderiza campos de e-mail e senha", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
  });

  it('renderiza botão "Entrar"', () => {
    render(<LoginPage />);

    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("chama login ao submeter formulário válido", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      id: "1",
      nome: "Teste",
      email: "teste@email.com",
      perfil: "COLABORADOR",
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "teste@email.com");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "teste@email.com",
        senha: "senha123",
      });
    });
  });

  it('mostra "Entrando..." durante loading', () => {
    setupAuth({ isLoading: true });
    render(<LoginPage />);

    const button = screen.getByRole("button", { name: "Entrando..." });
    expect(button).toBeDisabled();
  });

  it("exibe mensagem de erro da API ao falhar login", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error("Credenciais inválidas"));

    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "errado@email.com");
    await user.type(screen.getByLabelText("Senha"), "errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
    });
  });

  it("navega para /dashboard após login bem-sucedido", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      id: "1",
      nome: "Teste",
      email: "teste@email.com",
      perfil: "COLABORADOR",
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "teste@email.com");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
    });
  });
});
