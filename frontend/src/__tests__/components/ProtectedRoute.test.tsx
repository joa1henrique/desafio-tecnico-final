import { createProtectedRouteLoader } from "@/components/guards/ProtectedRoute";

describe("createProtectedRouteLoader", () => {
  it('lança erro "Not authenticated" se isAuthenticated for false', async () => {
    const loader = createProtectedRouteLoader();
    const context = { auth: { isAuthenticated: false, user: null } };

    await expect(loader({ context } as any)).rejects.toThrow("Not authenticated");
  });

  it('lança erro "Insufficient permissions" se o perfil não estiver na lista', async () => {
    const loader = createProtectedRouteLoader(["ADMIN"]);
    const context = {
      auth: {
        isAuthenticated: true,
        user: { id: "1", nome: "Test", email: "test@test.com", perfil: "COLABORADOR" },
      },
    };

    await expect(loader({ context } as any)).rejects.toThrow("Insufficient permissions");
  });

  it("não lança erro se o usuário estiver autenticado e tiver o perfil correto", async () => {
    const loader = createProtectedRouteLoader(["ADMIN"]);
    const context = {
      auth: {
        isAuthenticated: true,
        user: { id: "1", nome: "Admin", email: "admin@test.com", perfil: "ADMIN" },
      },
    };

    await expect(loader({ context } as any)).resolves.toBeUndefined();
  });

  it("não lança erro se allowedRoles não for informado e o usuário estiver autenticado", async () => {
    const loader = createProtectedRouteLoader();
    const context = {
      auth: {
        isAuthenticated: true,
        user: { id: "1", nome: "Qualquer", email: "q@test.com", perfil: "COLABORADOR" },
      },
    };

    await expect(loader({ context } as any)).resolves.toBeUndefined();
  });
});
