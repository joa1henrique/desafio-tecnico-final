import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import useSWR from "swr";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  approveReimbursement,
  getReimbursement,
  listReimbursementHistory,
  payReimbursement,
  rejectReimbursement,
  cancelReimbursement,
} from "@/services/reimbursementsService";
import { StatusBadge } from "@/components/ui/status-badge";
import { HistoryTimeline } from "@/components/ui/history-timeline";
import { toast } from "react-toastify";

function RejectionDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (justificativaRejeicao: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [justificativaRejeicao, setJustificativaRejeicao] = useState("");

  useEffect(() => {
    if (!open) {
      setJustificativaRejeicao("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeitar solicitação</DialogTitle>
          <DialogDescription>Informe o motivo da rejeição para registrar no histórico.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="justificativaRejeicao">Justificativa</Label>
          <Textarea
            id="justificativaRejeicao"
            rows={4}
            value={justificativaRejeicao}
            onChange={(event) => setJustificativaRejeicao(event.target.value)}
            placeholder="Explique por que a solicitação foi rejeitada"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting || justificativaRejeicao.trim().length === 0}
            onClick={() => onConfirm(justificativaRejeicao)}
          >
            {isSubmitting ? "Rejeitando..." : "Rejeitar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReimbursementDetailPage() {
  const { id } = useParams({ from: "/reimbursements/$id" });
  const { user, isAuthenticated } = useAuth();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const { data: reimbursement, isLoading: isLoadingDetail, error: errorDetail } = useSWR(
    isAuthenticated && id ? ["reimbursement", id, refreshIndex] : null,
    async () => getReimbursement(id!),
    { revalidateOnFocus: false }
  );

  const { data: history, isLoading: isLoadingHistory, error: errorHistory } = useSWR(
    isAuthenticated && id ? ["reimbursement-history", id, refreshIndex] : null,
    async () => listReimbursementHistory(id!),
    { revalidateOnFocus: false }
  );

  const isLoading = isLoadingDetail || isLoadingHistory;
  const error = errorDetail || errorHistory;

  async function refreshData() {
    setRefreshIndex((current) => current + 1);
  }

  async function handleApprove() {
    if (!id) {
      return;
    }

    setIsActionLoading(true);

    try {
      await approveReimbursement(id);
      toast.success("Solicitação aprovada com sucesso");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível aprovar a solicitação.");
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleReject(justificativaRejeicao: string) {
    if (!id) {
      return;
    }

    setIsActionLoading(true);

    try {
      await rejectReimbursement(id, { justificativaRejeicao });
      toast.success("Solicitação rejeitada com sucesso");
      setIsRejectDialogOpen(false);
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível rejeitar a solicitação.");
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!id) {
      return;
    }

    if (!window.confirm("Tem certeza que deseja cancelar esta solicitação?")) {
      return;
    }

    setIsActionLoading(true);

    try {
      await cancelReimbursement(id);
      toast.success("Solicitação cancelada com sucesso");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível cancelar a solicitação.");
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handlePay() {
    if (!id) {
      return;
    }

    setIsActionLoading(true);

    try {
      await payReimbursement(id);
      toast.success("Solicitação marcada como paga");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível marcar como paga.");
    } finally {
      setIsActionLoading(false);
    }
  }

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
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Detalhes da Solicitação</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando detalhes...</p>
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
                {error.message || "Não foi possível carregar os detalhes. Tente novamente."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Detail Content */}
        {!isLoading && !error && reimbursement && (
          <>
            {/* Main Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{reimbursement.descricao}</CardTitle>
                    <CardDescription>
                      Solicitante: {reimbursement.solicitante?.nome || "Desconhecido"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={reimbursement.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {user?.perfil === "COLABORADOR" && reimbursement.status === "RASCUNHO" && (
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button variant="destructive" onClick={handleCancel} disabled={isActionLoading}>
                      {isActionLoading ? "Cancelando..." : "Cancelar"}
                    </Button>
                    <Link to="/reimbursements/$id/edit" params={{ id: reimbursement.id }}>
                      <Button variant="outline">Editar solicitação</Button>
                    </Link>
                  </div>
                )}

                {user?.perfil === "GESTOR" && reimbursement.status === "ENVIADO" && (
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsRejectDialogOpen(true)} disabled={isActionLoading}>
                      Rejeitar
                    </Button>
                    <Button onClick={handleApprove} disabled={isActionLoading}>
                      {isActionLoading ? "Aprovando..." : "Aprovar"}
                    </Button>
                  </div>
                )}

                {user?.perfil === "FINANCEIRO" && reimbursement.status === "APROVADO" && (
                  <div className="flex justify-end">
                    <Button onClick={handlePay} disabled={isActionLoading}>
                      {isActionLoading ? "Processando..." : "Marcar como pago"}
                    </Button>
                  </div>
                )}

                {/* Grid de informações */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Valor</p>
                    <p className="text-lg font-semibold">
                      R$ {parseFloat(reimbursement.valor).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Data da Despesa</p>
                    <p className="text-sm font-medium">
                      {new Date(reimbursement.dataDespesa).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Categoria</p>
                    <p className="text-sm font-medium">{reimbursement.categoria?.nome || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Criado em</p>
                    <p className="text-sm font-medium">
                      {new Date(reimbursement.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* Justificativa de Rejeição */}
                {reimbursement.justificativaRejeicao && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-semibold text-destructive mb-2">Motivo da Rejeição:</p>
                    <p className="text-sm">{reimbursement.justificativaRejeicao}</p>
                  </div>
                )}

                {/* Anexos */}
                {reimbursement.anexos && reimbursement.anexos.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Anexos ({reimbursement.anexos.length})</p>
                    <div className="space-y-2">
                      {reimbursement.anexos.map((anexo) => (
                        <a
                          key={anexo.id}
                          href={anexo.urlArquivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 bg-muted rounded hover:bg-muted/80 transition-colors text-sm truncate"
                          title={anexo.nomeArquivo}
                        >
                          📎 {anexo.nomeArquivo}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Histórico */}
            {history && history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico</CardTitle>
                  <CardDescription>Trilha de auditoria completa da solicitação</CardDescription>
                </CardHeader>
                <CardContent>
                  <HistoryTimeline entries={history} />
                </CardContent>
              </Card>
            )}

            <RejectionDialog
              open={isRejectDialogOpen}
              onOpenChange={setIsRejectDialogOpen}
              onConfirm={handleReject}
              isSubmitting={isActionLoading}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
