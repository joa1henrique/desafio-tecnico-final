import { render } from "@testing-library/react";
import { AuthProvider } from "@/contexts/AuthContext";

jest.mock("@/services/authService", () => ({
  login: jest.fn().mockResolvedValue({
    token: "test-token",
    user: {
      id: "1",
      nome: "Usuário Teste",
      email: "teste@exemplo.com",
      perfil: "COLABORADOR",
    },
  }),
  logout: jest.fn().mockResolvedValue(undefined),
}));

describe("AuthProvider", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <AuthProvider>
        <div data-testid="test-content">Test Content</div>
      </AuthProvider>
    );

    expect(container).toBeTruthy();
  });
});
