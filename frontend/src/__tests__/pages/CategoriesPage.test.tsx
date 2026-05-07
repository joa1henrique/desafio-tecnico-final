import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoriesPage } from "@/pages/CategoriesPage";

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
const mockCreateCategory = jest.fn();
const mockUpdateCategory = jest.fn();
jest.mock("@/services/categoriesService", () => ({
  createCategory: (...args: any[]) => mockCreateCategory(...args),
  updateCategory: (...args: any[]) => mockUpdateCategory(...args),
  listCategories: jest.fn(),
}));

// Mock do toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock do Radix Dialog — renderizar como HTML simples
jest.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, open }: any) => (open ? <div data-testid="dialog-root">{children}</div> : null),
  Portal: ({ children }: any) => <div>{children}</div>,
  Overlay: ({ children }: any) => <div>{children}</div>,
  Content: ({ children }: any) => <div>{children}</div>,
  Header: ({ children }: any) => <div>{children}</div>,
  Title: ({ children }: any) => <h2>{children}</h2>,
  Description: ({ children }: any) => <p>{children}</p>,
  Footer: ({ children }: any) => <div>{children}</div>,
  Close: ({ children }: any) => <button>{children}</button>,
  Trigger: ({ children }: any) => <button>{children}</button>,
}));

const mockCategories = [
  { id: "cat-1", nome: "Viagem", ativo: true, criadoEm: "2025-01-01T00:00:00.000Z", atualizadoEm: "2025-01-15T00:00:00.000Z" },
  { id: "cat-2", nome: "Alimentação", ativo: false, criadoEm: "2025-01-01T00:00:00.000Z", atualizadoEm: "2025-01-20T00:00:00.000Z" },
];

function setupAdmin() {
  useAuth.mockReturnValue({
    user: { id: "1", nome: "Admin", email: "admin@test.com", perfil: "ADMIN" },
    token: "mock-token",
    permissions: ["manage_categories"],
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
    permissions: ["create_reimbursement"],
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

function setupSWRWithCategories() {
  const mutate = jest.fn();
  useSWR.mockReturnValue({
    data: mockCategories,
    isLoading: false,
    error: null,
    mutate,
  });
  return mutate;
}

function setupSWREmpty() {
  useSWR.mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    mutate: jest.fn(),
  });
}

describe("CategoriesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("bloqueia acesso para perfis sem permissão", () => {
    setupColaborador();
    setupSWREmpty();

    render(<CategoriesPage />);

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
    expect(
      screen.getByText("Apenas administradores podem gerenciar categorias.")
    ).toBeInTheDocument();
  });

  it("ADMIN: renderiza o formulário de criação e a lista de categorias", () => {
    setupAdmin();
    setupSWRWithCategories();

    render(<CategoriesPage />);

    expect(screen.getByText("Gestão de Categorias")).toBeInTheDocument();
    expect(screen.getByText("Nova categoria")).toBeInTheDocument();
    expect(screen.getByText("Viagem")).toBeInTheDocument();
    expect(screen.getByText("Alimentação")).toBeInTheDocument();
  });

  it("mostra status Ativa/Inativa para cada categoria", () => {
    setupAdmin();
    setupSWRWithCategories();

    render(<CategoriesPage />);

    expect(screen.getAllByText("Ativa")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Inativa")[0]).toBeInTheDocument();
  });

  it("valida formulário de criação — nome obrigatório", async () => {
    const user = userEvent.setup();
    setupAdmin();
    setupSWRWithCategories();

    render(<CategoriesPage />);

    // Submeter sem preencher o nome
    await user.click(screen.getByRole("button", { name: "Criar categoria" }));

    await waitFor(() => {
      expect(screen.getByText("Informe o nome da categoria")).toBeInTheDocument();
    });
  });

  it("cria categoria com sucesso", async () => {
    const user = userEvent.setup();
    setupAdmin();
    const mutate = setupSWRWithCategories();
    mockCreateCategory.mockResolvedValue({});
    const { toast } = require("react-toastify");

    render(<CategoriesPage />);

    await user.type(screen.getByLabelText("Nome"), "Transporte");
    await user.click(screen.getByRole("button", { name: "Criar categoria" }));

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith({
        nome: "Transporte",
        ativo: true,
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Categoria criada com sucesso");
  });
});
