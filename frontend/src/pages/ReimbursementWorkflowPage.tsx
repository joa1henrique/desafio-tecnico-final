import { Link } from "@tanstack/react-router";
import useSWR from "swr";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getApiErrorMessage } from "@/utils/error";
import { useAuth } from "@/hooks/useAuth";
import { listReimbursements } from "@/services/reimbursementsService";
import type { Reimbursement, ReimbursementStatus } from "@/types";

interface ReimbursementWorkflowPageProps {
  title: string;
  description: string;
  status: ReimbursementStatus;
  emptyLabel: string;
}

function WorkflowStateCard({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReimbursementWorkflowPage({ title, description, status, emptyLabel }: ReimbursementWorkflowPageProps) {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useSWR(
    isAuthenticated ? ["workflow-reimbursements", status] : null,
    async () => {
      const response = await listReimbursements(1, 100);
      return response.items.filter((item) => item.status === status);
    },
    { revalidateOnFocus: false }
  );

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <WorkflowStateCard title="Acesso restrito" message="Faça login para visualizar esta fila." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {isLoading && <WorkflowStateCard title="Carregando fila" message="Buscando solicitações..." />}

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">
                {getApiErrorMessage(error, "Não foi possível carregar as solicitações.")}
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && (!data || data.length === 0) && (
          <WorkflowStateCard title="Nenhuma solicitação" message={emptyLabel} />
        )}

        {!isLoading && !error && data && data.length > 0 && (
          <div className="grid gap-4">
            {data.map((reimbursement: Reimbursement) => (
              <Card key={reimbursement.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="space-y-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{reimbursement.descricao}</CardTitle>
                      <CardDescription>
                        {reimbursement.solicitante?.nome || "Desconhecido"} · {reimbursement.categoria?.nome || "-"}
                      </CardDescription>
                    </div>
                    <StatusBadge status={reimbursement.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">R$ {parseFloat(reimbursement.valor).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reimbursement.dataDespesa).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Link to="/reimbursements/$id" params={{ id: reimbursement.id }}>
                    <Button variant="outline">Abrir</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export function PendingReimbursementsPage() {
  return (
    <ReimbursementWorkflowPage
      title="Solicitações enviadas"
      description="Fila de análise do gestor com solicitações aguardando aprovação ou rejeição."
      status="ENVIADO"
      emptyLabel="Não há solicitações enviadas para analisar no momento."
    />
  );
}

export function ApprovedReimbursementsPage() {
  return (
    <ReimbursementWorkflowPage
      title="Solicitações aprovadas"
      description="Fila do financeiro para acompanhar e marcar solicitações como pagas."
      status="APROVADO"
      emptyLabel="Não há solicitações aprovadas para pagamento no momento."
    />
  );
}