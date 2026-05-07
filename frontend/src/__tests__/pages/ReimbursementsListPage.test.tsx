import { render, screen } from "@testing-library/react";
import { ReimbursementsListPage } from "@/pages/ReimbursementsListPage";

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
jest.mock("@/services/reimbursementsService", () => ({
  listReimbursements: jest.fn(),
}));

jest.mock("@/services/categoriesService", () => ({
  listCategories: jest.fn(),
}));

function setupAuth(perfil: string) {
  useAuth.mockReturnValue({
    user: { id: "1", nome: "Teste", email: "teste@test.com", perfil },
    token: "mock-token",
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

const mockReimbursements = [
  {
    id: "r-1",
    descricao: "Almoço reunião",
    valor: "75.50",
    dataDespesa: "2025-01-15T00:00:00.000Z",
    status: "ENVIADO",
    solicitante: { id: "1", nome: "Maria", email: "maria@test.com", perfil: "COLABORADOR" },
    categoria: { id: "cat-1", nome: "Alimentação", ativo: true, criadoEm: "", atualizadoEm: "" },
  },
];

function setupSWRWithData(data: any[] = mockReimbursements) {
  useSWR.mockImplementation((key: any) => {
    if (!key) return { data: null, isLoading: false, error: null };
    if (key === "categories-filter") {
      return { data: [{ id: "cat-1", nome: "Alimentação" }], isLoading: false, error: null };
    }
    // reimbursements list
    return {
      data: { items: data, page: 1, pageSize: 10, total: data.length },
      isLoading: false,
      error: null,
    };
  });
}

function setupSWREmpty() {
  useSWR.mockImplementation((key: any) => {
    if (!key) return { data: null, isLoading: false, error: null };
    if (key === "categories-filter") {
      return { data: [], isLoading: false, error: null };
    }
    return {
      data: { items: [], page: 1, pageSize: 10, total: 0 },
      isLoading: false,
      error: null,
    };
  });
}

describe("ReimbursementsListPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('COLABORADOR: mostra botão "Nova Solicitação"', () => {
    setupAuth("COLABORADOR");
    setupSWRWithData();

    render(<ReimbursementsListPage />);

    expect(screen.getByRole("button", { name: "Nova Solicitação" })).toBeInTheDocument();
  });

  it('GESTOR: NÃO mostra botão "Nova Solicitação"', () => {
    setupAuth("GESTOR");
    setupSWRWithData();

    render(<ReimbursementsListPage />);

    expect(screen.queryByRole("button", { name: "Nova Solicitação" })).not.toBeInTheDocument();
  });

  it("ADMIN: mostra filtro de status", () => {
    setupAuth("ADMIN");
    setupSWRWithData();

    render(<ReimbursementsListPage />);

    expect(screen.getAllByText("Status")[0]).toBeInTheDocument();
  });

  it("COLABORADOR: NÃO mostra filtro de status", () => {
    setupAuth("COLABORADOR");
    setupSWRWithData();

    render(<ReimbursementsListPage />);

    // O filtro de status não aparece para COLABORADOR, apenas o cabeçalho da tabela
    const statusLabels = screen.queryAllByText("Status");
    expect(statusLabels.length).toBe(1);
  });

  it("exibe dados na tabela quando há solicitações", () => {
    setupAuth("COLABORADOR");
    setupSWRWithData();

    render(<ReimbursementsListPage />);

    expect(screen.getAllByText("Maria")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Alimentação")[0]).toBeInTheDocument();
    expect(screen.getAllByText("R$ 75.50")[0]).toBeInTheDocument();
  });

  it('mostra "Nenhuma solicitação encontrada" quando vazio', () => {
    setupAuth("COLABORADOR");
    setupSWREmpty();

    render(<ReimbursementsListPage />);

    expect(screen.getByText("Nenhuma solicitação encontrada")).toBeInTheDocument();
  });

  it("mostra mensagem de não autenticado", () => {
    useAuth.mockReturnValue({
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
    setupSWREmpty();

    render(<ReimbursementsListPage />);

    expect(screen.getByText("Você não está autenticado.")).toBeInTheDocument();
  });
});
