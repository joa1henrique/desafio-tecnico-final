import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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

import { App } from "@/App";

describe("App", () => {
  it("renders the login screen when there is no active session", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: /entre no painel/i })).toBeInTheDocument();
  });
});