import useSWR from "swr";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { listUsers } from "@/services/usersService";
import { getApiErrorMessage } from "@/utils/error";

export function UsersPage() {
  const { isAuthenticated, user, permissions } = useAuth();

  const {
    data: users,
    error,
    isLoading,
  } = useSWR(
    isAuthenticated ? "users-management" : null,
    async () => {
      //busca inicial em 100 registros
      const response = await listUsers(1, 100);
      return response.items;
    },
    { revalidateOnFocus: false }
  );

  const canManageUsers = permissions.includes("manage_users") || user?.perfil === "ADMIN";

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Você não está autenticado.
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!canManageUsers) {
    return (
      <AppLayout>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Acesso negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">Apenas administradores podem gerenciar usuários.</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Visualize os usuários cadastrados no sistema.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && <p className="text-sm text-muted-foreground">Carregando usuários...</p>}

            {error && (
              <p className="text-sm text-destructive">
                {getApiErrorMessage(error, "Não foi possível carregar os usuários.")}
              </p>
            )}

            {!isLoading && !error && users && users.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>
            )}

            {!isLoading && !error && users && users.length > 0 && (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Nome</th>
                      <th className="px-4 py-3 text-left font-medium">E-mail</th>
                      <th className="px-4 py-3 text-left font-medium">Perfil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">{u.nome}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                            {u.perfil}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
