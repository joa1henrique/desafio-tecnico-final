import { render, screen } from "@testing-library/react";
import { ReimbursementDetailPage } from "@/pages/ReimbursementDetailPage";

// Mock do router
jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: "test-reimbursement-id" }),
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
  getReimbursement: jest.fn(),
  listReimbursementHistory: jest.fn(),
  approveReimbursement: jest.fn(),
  rejectReimbursement: jest.fn(),
  payReimbursement: jest.fn(),
  cancelReimbursement: jest.fn(),
}));

// Mock do toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

function setupAuth(perfil: string) {
  useAuth.mockReturnValue({
    user: { id: "user-1", nome: "Teste", email: "teste@test.com", perfil },
    token: "mock-token",
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

function setupUnauthenticated() {
  useAuth.mockReturnValue({
    user: null,
    token: null,
    permissions: [],
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

const baseReimbursement = {
  id: "test-reimbursement-id",
  solicitanteId: "user-1",
  categoriaId: "cat-1",
  descricao: "Despesa de viagem",
  valor: "150.00",
  dataDespesa: "2025-01-15T00:00:00.000Z",
  criadoEm: "2025-01-10T00:00:00.000Z",
  atualizadoEm: "2025-01-10T00:00:00.000Z",
  solicitante: { id: "user-1", nome: "Maria", email: "maria@test.com", perfil: "COLABORADOR" },
  categoria: { id: "cat-1", nome: "Viagem", ativo: true, criadoEm: "", atualizadoEm: "" },
  anexos: [],
  historicos: [],
};

function setupSWR(reimbursement: any, history: any[] = []) {
  useSWR.mockImplementation((key: any) => {
    if (!key) return { data: null, isLoading: false, error: null };
    if (Array.isArray(key) && key[0] === "reimbursement") {
      return { data: reimbursement, isLoading: false, error: null };
    }
    if (Array.isArray(key) && key[0] === "reimbursement-history") {
      return { data: history, isLoading: false, error: null };
    }
    return { data: null, isLoading: false, error: null };
  });
}

function setupSWRLoading() {
  useSWR.mockReturnValue({ data: null, isLoading: true, error: null });
}

function setupSWRError() {
  useSWR.mockReturnValue({ data: null, isLoading: false, error: new Error("Erro de rede") });
}

describe("ReimbursementDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exibe dados da solicitação", () => {
    setupAuth("COLABORADOR");
    setupSWR({ ...baseReimbursement, status: "RASCUNHO" });

    render(<ReimbursementDetailPage />);

    expect(screen.getByText("Despesa de viagem")).toBeInTheDocument();
    expect(screen.getByText("R$ 150.00")).toBeInTheDocument();
    expect(screen.getByText("Viagem")).toBeInTheDocument();
  });

  it("exibe mensagem de não autenticado", () => {
    setupUnauthenticated();
    setupSWR(null);

    render(<ReimbursementDetailPage />);

    expect(screen.getByText("Você não está autenticado.")).toBeInTheDocument();
  });

  it("mostra loading spinner enquanto carrega", () => {
    setupAuth("COLABORADOR");
    setupSWRLoading();

    render(<ReimbursementDetailPage />);

    expect(screen.getByText("Carregando detalhes...")).toBeInTheDocument();
  });

  it("mostra card de erro", () => {
    setupAuth("COLABORADOR");
    setupSWRError();

    render(<ReimbursementDetailPage />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
  });

  it('COLABORADOR + RASCUNHO: mostra "Editar" e "Cancelar"', () => {
    setupAuth("COLABORADOR");
    setupSWR({ ...baseReimbursement, status: "RASCUNHO" });

    render(<ReimbursementDetailPage />);

    expect(screen.getByText("Editar solicitação")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("COLABORADOR + ENVIADO: NÃO mostra botões de ação", () => {
    setupAuth("COLABORADOR");
    setupSWR({ ...baseReimbursement, status: "ENVIADO" });

    render(<ReimbursementDetailPage />);

    expect(screen.queryByText("Editar solicitação")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
  });

  it('GESTOR + ENVIADO: mostra "Aprovar" e "Rejeitar"', () => {
    setupAuth("GESTOR");
    setupSWR({ ...baseReimbursement, status: "ENVIADO" });

    render(<ReimbursementDetailPage />);

    expect(screen.getByRole("button", { name: "Aprovar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rejeitar" })).toBeInTheDocument();
  });

  it("GESTOR + RASCUNHO: NÃO mostra botões de ação", () => {
    setupAuth("GESTOR");
    setupSWR({ ...baseReimbursement, status: "RASCUNHO" });

    render(<ReimbursementDetailPage />);

    expect(screen.queryByRole("button", { name: "Aprovar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Rejeitar" })).not.toBeInTheDocument();
  });

  it('FINANCEIRO + APROVADO: mostra "Marcar como pago"', () => {
    setupAuth("FINANCEIRO");
    setupSWR({ ...baseReimbursement, status: "APROVADO" });

    render(<ReimbursementDetailPage />);

    expect(screen.getByRole("button", { name: "Marcar como pago" })).toBeInTheDocument();
  });

  it("FINANCEIRO + ENVIADO: NÃO mostra botão de pagamento", () => {
    setupAuth("FINANCEIRO");
    setupSWR({ ...baseReimbursement, status: "ENVIADO" });

    render(<ReimbursementDetailPage />);

    expect(screen.queryByRole("button", { name: "Marcar como pago" })).not.toBeInTheDocument();
  });

  it("exibe justificativa de rejeição quando presente", () => {
    setupAuth("COLABORADOR");
    setupSWR({
      ...baseReimbursement,
      status: "REJEITADO",
      justificativaRejeicao: "Comprovante ilegível",
    });

    render(<ReimbursementDetailPage />);

    expect(screen.getByText("Motivo da Rejeição:")).toBeInTheDocument();
    expect(screen.getByText("Comprovante ilegível")).toBeInTheDocument();
  });
});
