import { Link } from "@tanstack/react-router";
import useSWR from "swr";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listReimbursements } from "@/services/reimbursementsService";
import type { Reimbursement } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

export function ReimbursementsListPage() {
  const { user, isAuthenticated } = useAuth();

  // Fetch reimbursements (backend filters by role automatically via requireRole)
  const { data, isLoading, error } = useSWR(
    isAuthenticated ? ["reimbursements", user?.perfil] : null,
    async () => {
      const result = await listReimbursements(1, 100);
      return result.items;
    },
    { revalidateOnFocus: false }
  );

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Você não está autenticado.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Solicitações de Reembolso</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie suas solicitações conforme seu perfil
          </p>
        </div>

        {/* Action Button */}
        {user?.perfil === "COLABORADOR" && (
          <div>
            <Link to="/reimbursements/new">
              <Button>Nova Solicitação</Button>
            </Link>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando solicitações...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">
                {error.message || "Não foi possível carregar as solicitações. Tente novamente."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!data || data.length === 0) && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Nenhuma solicitação encontrada</p>
                {user?.perfil === "COLABORADOR" && (
                  <Link to="/reimbursements/new">
                    <Button variant="outline">Criar primeira solicitação</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {!isLoading && !error && data && data.length > 0 && (
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Solicitante</th>
                    <th className="px-4 py-3 text-left font-medium">Categoria</th>
                    <th className="px-4 py-3 text-left font-medium">Valor</th>
                    <th className="px-4 py-3 text-left font-medium">Data</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.map((reimbursement: Reimbursement) => (
                    <tr key={reimbursement.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {reimbursement.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {reimbursement.solicitante?.nome || "Desconhecido"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {reimbursement.categoria?.nome || "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        R$ {parseFloat(reimbursement.valor).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(reimbursement.dataDespesa).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={reimbursement.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/reimbursements/${reimbursement.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
