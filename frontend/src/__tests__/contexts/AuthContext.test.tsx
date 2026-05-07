import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";

// Mock dos services
const mockLoginRequest = jest.fn();
const mockLogoutRequest = jest.fn();
const mockGetPermissions = jest.fn();

jest.mock("@/services/authService", () => ({
  login: (...args: any[]) => mockLoginRequest(...args),
  logout: (...args: any[]) => mockLogoutRequest(...args),
  getPermissions: (...args: any[]) => mockGetPermissions(...args),
}));

// Mock do storage
const mockLoadAuthSession = jest.fn();
const mockSaveAuthSession = jest.fn();
const mockClearAuthSession = jest.fn();

jest.mock("@/utils/storage", () => ({
  loadAuthSession: () => mockLoadAuthSession(),
  saveAuthSession: (...args: any[]) => mockSaveAuthSession(...args),
  clearAuthSession: () => mockClearAuthSession(),
}));

// Componente helper para acessar o contexto nos testes
function AuthConsumer({ onRender }: { onRender: (ctx: any) => void }) {
  const ctx = useAuthContext();
  onRender(ctx);
  return (
    <div>
      <span data-testid="user-name">{ctx.user?.nome ?? "sem-user"}</span>
      <span data-testid="is-authenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="permissions">{ctx.permissions.join(",")}</span>
      <button data-testid="login-btn" onClick={() => ctx.login({ email: "test@test.com", senha: "123" })}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => ctx.logout()}>
        Logout
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  let capturedCtx: any;
  const onRender = (ctx: any) => {
    capturedCtx = ctx;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAuthSession.mockReturnValue(null);
    mockGetPermissions.mockResolvedValue({ permissions: [] });
  });

  it("renderiza sem erro com children", () => {
    render(
      <AuthProvider>
        <div data-testid="child">Teste</div>
      </AuthProvider>
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Teste");
  });

  it("inicia sem autenticação quando não há sessão no localStorage", () => {
    mockLoadAuthSession.mockReturnValue(null);

    render(
      <AuthProvider>
        <AuthConsumer onRender={onRender} />
      </AuthProvider>
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user-name")).toHaveTextContent("sem-user");
  });

  it("carrega sessão do localStorage na inicialização", async () => {
    const savedSession = {
      token: "stored-token",
      user: { id: "1", nome: "João", email: "joao@test.com", perfil: "COLABORADOR" as const },
    };
    mockLoadAuthSession.mockReturnValue(savedSession);
    mockGetPermissions.mockResolvedValue({ permissions: ["create_reimbursement"] });

    render(
      <AuthProvider>
        <AuthConsumer onRender={onRender} />
      </AuthProvider>
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user-name")).toHaveTextContent("João");

    await waitFor(() => {
      expect(screen.getByTestId("permissions")).toHaveTextContent("create_reimbursement");
    });
  });

  it("realiza login com sucesso, salva sessão e busca permissões", async () => {
    const user = userEvent.setup();
    const newSession = {
      token: "new-token",
      user: { id: "2", nome: "Maria", email: "maria@test.com", perfil: "COLABORADOR" as const },
    };
    mockLoginRequest.mockResolvedValue(newSession);
    mockGetPermissions.mockResolvedValue({ permissions: ["create_reimbursement", "view_own_reimbursements"] });

    render(
      <AuthProvider>
        <AuthConsumer onRender={onRender} />
      </AuthProvider>
    );

    await user.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Maria");
    });

    expect(mockSaveAuthSession).toHaveBeenCalledWith(newSession);
    expect(mockGetPermissions).toHaveBeenCalled();
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it("realiza logout e limpa sessão mesmo que a API falhe", async () => {
    const user = userEvent.setup();
    const savedSession = {
      token: "stored-token",
      user: { id: "1", nome: "João", email: "joao@test.com", perfil: "COLABORADOR" as const },
    };
    mockLoadAuthSession.mockReturnValue(savedSession);
    mockLogoutRequest.mockRejectedValue(new Error("Network error"));

    render(
      <AuthProvider>
        <AuthConsumer onRender={onRender} />
      </AuthProvider>
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");

    await user.click(screen.getByTestId("logout-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    });

    expect(mockClearAuthSession).toHaveBeenCalled();
    expect(screen.getByTestId("user-name")).toHaveTextContent("sem-user");
  });

  it("define permissões como vazio quando getPermissions falha na inicialização", async () => {
    const savedSession = {
      token: "stored-token",
      user: { id: "1", nome: "João", email: "joao@test.com", perfil: "COLABORADOR" as const },
    };
    mockLoadAuthSession.mockReturnValue(savedSession);
    mockGetPermissions.mockRejectedValue(new Error("API error"));

    render(
      <AuthProvider>
        <AuthConsumer onRender={onRender} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockGetPermissions).toHaveBeenCalled();
    });

    expect(screen.getByTestId("permissions")).toHaveTextContent("");
  });

  it("lança erro ao usar useAuthContext fora do AuthProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    function BadConsumer() {
      useAuthContext();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow("useAuthContext must be used within AuthProvider");

    consoleError.mockRestore();
  });
});
