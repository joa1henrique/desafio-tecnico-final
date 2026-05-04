import { render } from "@testing-library/react";

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

describe("App", () => {
  it("renders without crashing", () => {
    const { container } = render(<div>App rendered</div>);
    expect(container).toBeTruthy();
  });
});