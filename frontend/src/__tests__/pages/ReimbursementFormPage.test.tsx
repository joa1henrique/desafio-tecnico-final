import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReimbursementNewPage } from "@/pages/ReimbursementFormPage";

// Mock do router
const mockNavigate = jest.fn();
jest.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  useParams: jest.fn().mockReturnValue({ id: "test-id" }),
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
  createReimbursement: jest.fn(),
  updateReimbursement: jest.fn(),
  createReimbursementAttachment: jest.fn(),
  getReimbursement: jest.fn(),
  submitReimbursement: jest.fn(),
}));

jest.mock("@/services/categoriesService", () => ({
  listCategories: jest.fn(),
}));

// Mock do toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

function setupColaborador() {
  useAuth.mockReturnValue({
    user: { id: "1", nome: "Maria", email: "maria@test.com", perfil: "COLABORADOR" },
    token: "mock-token",
    permissions: ["create_reimbursement", "view_own_reimbursements"],
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

function setupGestor() {
  useAuth.mockReturnValue({
    user: { id: "2", nome: "João", email: "joao@test.com", perfil: "GESTOR" },
    token: "mock-token",
    permissions: ["view_sent_reimbursements"],
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

const mockCategories = [
  { id: "cat-1", nome: "Viagem", ativo: true },
  { id: "cat-2", nome: "Alimentação", ativo: true },
];

function setupSWRDefault() {
  useSWR.mockImplementation((key: any) => {
    if (key === "categories-for-reimbursement-form") {
      return { data: mockCategories, isLoading: false, error: null };
    }
    return { data: null, isLoading: false, error: null };
  });
}

describe("ReimbursementFormPage (modo create)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupColaborador();
    setupSWRDefault();
  });

  it('exibe título "Nova Solicitação"', () => {
    render(<ReimbursementNewPage />);
    expect(screen.getByText("Nova Solicitação")).toBeInTheDocument();
  });

  it("renderiza campos do formulário", () => {
    render(<ReimbursementNewPage />);

    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor")).toBeInTheDocument();
    expect(screen.getByLabelText("Data da despesa")).toBeInTheDocument();
  });

  it("exibe categorias no select", () => {
    render(<ReimbursementNewPage />);

    expect(screen.getByText("Viagem")).toBeInTheDocument();
    expect(screen.getByText("Alimentação")).toBeInTheDocument();
  });

  it("mostra erros de validação Zod quando submete sem preencher", async () => {
    const user = userEvent.setup();
    render(<ReimbursementNewPage />);

    // Limpar o campo de data que tem defaultValue
    const dataInput = screen.getByLabelText("Data da despesa");
    await user.clear(dataInput);

    // Clica em "Salvar rascunho" para disparar a validação
    await user.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    await waitFor(() => {
      expect(screen.getAllByText("Selecione uma categoria")[0]).toBeInTheDocument();
    });
    expect(screen.getAllByText("Informe a descrição")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Informe o valor")[0]).toBeInTheDocument();
  });

  it("permite adicionar e remover anexos", async () => {
    const user = userEvent.setup();
    render(<ReimbursementNewPage />);

    expect(screen.getByText("Nenhum anexo adicionado ainda.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Adicionar anexo" }));

    expect(screen.getByText("Anexo 1")).toBeInTheDocument();
    expect(screen.queryByText("Nenhum anexo adicionado ainda.")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remover" }));

    expect(screen.queryByText("Anexo 1")).not.toBeInTheDocument();
    expect(screen.getByText("Nenhum anexo adicionado ainda.")).toBeInTheDocument();
  });

  it('exibe mensagem "Você pode salvar como rascunho..." para COLABORADOR', () => {
    render(<ReimbursementNewPage />);

    expect(
      screen.getByText("Você pode salvar como rascunho ou enviar a solicitação.")
    ).toBeInTheDocument();
  });

  it('exibe "Acesso negado" para outros perfis na criação', () => {
    setupGestor();
    render(<ReimbursementNewPage />);

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
    expect(
      screen.getByText("Apenas colaboradores podem criar novas solicitações de reembolso.")
    ).toBeInTheDocument();
  });

  it("exibe estado de não autenticado", () => {
    useAuth.mockReturnValue({
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<ReimbursementNewPage />);

    expect(screen.getByText("Você não está autenticado.")).toBeInTheDocument();
  });
});
