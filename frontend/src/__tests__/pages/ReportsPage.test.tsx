import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportsPage } from "@/pages/ReportsPage";

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
jest.mock("@/services/reportsService", () => ({
  getFinancialReport: jest.fn(),
}));

jest.mock("@/services/categoriesService", () => ({
  listCategories: jest.fn(),
}));

function setupAdmin() {
  useAuth.mockReturnValue({
    user: { id: "1", nome: "Admin", email: "admin@test.com", perfil: "ADMIN" },
    token: "mock-token",
    permissions: ["view_financial_reports"],
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

function setupColaborador() {
  useAuth.mockReturnValue({
    user: { id: "1", nome: "Maria", email: "maria@test.com", perfil: "COLABORADOR" },
    token: "mock-token",
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

const mockReport = {
  pagos: { total: "5250.00", count: 10 },
  aPagar: { total: "1500.00", count: 3 },
};

function setupSWRWithReport() {
  useSWR.mockImplementation((key: any) => {
    if (!key) return { data: null, isLoading: false, error: null };
    if (key === "report-categories") {
      return { data: [{ id: "cat-1", nome: "Viagem" }], isLoading: false, error: null };
    }
    // financial report
    return { data: mockReport, isLoading: false, error: null };
  });
}

function setupSWRNoReport() {
  useSWR.mockReturnValue({ data: null, isLoading: false, error: null });
}

describe("ReportsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bloqueia acesso com "Acesso negado" para COLABORADOR', () => {
    setupColaborador();
    setupSWRNoReport();

    render(<ReportsPage />);

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
    expect(
      screen.getByText("Apenas administradores podem acessar os relatórios financeiros.")
    ).toBeInTheDocument();
  });

  it("ADMIN: renderiza o título do relatório", () => {
    setupAdmin();
    setupSWRWithReport();

    render(<ReportsPage />);

    expect(screen.getByText("Relatório Financeiro")).toBeInTheDocument();
  });

  it("ADMIN: exibe cards de Total Pago e Total a Pagar", () => {
    setupAdmin();
    setupSWRWithReport();

    render(<ReportsPage />);

    expect(screen.getByText("Total Pago")).toBeInTheDocument();
    expect(screen.getByText("Total a Pagar")).toBeInTheDocument();
    // Verify counts are displayed
    expect(screen.getByText("10 solicitação(ões) paga(s)")).toBeInTheDocument();
    expect(screen.getByText("3 solicitação(ões) aprovada(s)")).toBeInTheDocument();
  });

  it("ADMIN: exibe erro de validação quando data início > data fim", async () => {
    const user = userEvent.setup();
    setupAdmin();
    setupSWRWithReport();

    render(<ReportsPage />);

    const dataInicioInput = screen.getByLabelText("Data Início");
    const dataFimInput = screen.getByLabelText("Data Fim");

    await user.type(dataInicioInput, "2025-12-31");
    await user.type(dataFimInput, "2025-01-01");
    await user.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(
      screen.getByText("A data inicial não pode ser posterior à data final.")
    ).toBeInTheDocument();
  });

  it("ADMIN: renderiza os gráficos quando há dados", () => {
    setupAdmin();
    setupSWRWithReport();

    render(<ReportsPage />);

    expect(screen.getByText("Comparativo de Valores (R$)")).toBeInTheDocument();
    expect(screen.getByText("Quantidade de Solicitações")).toBeInTheDocument();
  });
});
