import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import useSWR from "swr";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listReimbursements } from "@/services/reimbursementsService";
import { listCategories } from "@/services/categoriesService";
import type { Reimbursement, Category } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export function ReimbursementsListPage() {
  const { user, isAuthenticated } = useAuth();

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [statusFilter, setStatusFilter] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [colaboradorInput, setColaboradorInput] = useState("");
  const [colaboradorFilter, setColaboradorFilter] = useState("");
  const [sortBy, setSortBy] = useState("criadoEm");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleSearchColaborador = () => {
    setColaboradorFilter(colaboradorInput);
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, categoriaFilter, colaboradorFilter, sortBy, sortOrder]);

  const { data: categories } = useSWR(
    isAuthenticated ? "categories-filter" : null,
    async () => {
      const result = await listCategories(1, 100);
      return result.items;
    },
    { revalidateOnFocus: false }
  );

  const { data: pageData, isLoading, error } = useSWR(
    isAuthenticated ? ["reimbursements", user?.perfil, page, statusFilter, categoriaFilter, colaboradorFilter, sortBy, sortOrder] : null,
    async () => {
      const filters: Record<string, string> = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoriaFilter) filters.categoriaId = categoriaFilter;
      if (colaboradorFilter) filters.colaboradorNome = colaboradorFilter;
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;

      return await listReimbursements(page, pageSize, filters);
    },
    { revalidateOnFocus: false }
  );

  const reimbursements = pageData?.items || [];
  const total = pageData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

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
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Solicitações de Reembolso</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie suas solicitações conforme seu perfil
          </p>
        </div>

        {user?.perfil === "COLABORADOR" && (
          <div>
            <Link to="/reimbursements/new">
              <Button>Nova Solicitação</Button>
            </Link>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {user?.perfil !== "COLABORADOR" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Colaborador</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar por nome..."
                      value={colaboradorInput}
                      onChange={(e) => setColaboradorInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchColaborador()}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={handleSearchColaborador}>
                      <SearchIcon />
                    </Button>
                  </div>
                </div>
              )}

              {user?.perfil === "ADMIN" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="RASCUNHO">Rascunho</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="APROVADO">Aprovado</option>
                    <option value="REJEITADO">Rejeitado</option>
                    <option value="PAGO">Pago</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                >
                  <option value="">Todas</option>
                  {categories?.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ordenar por</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="criadoEm">Data de Criação</option>
                  <option value="valor">Valor</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ordem</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {!isLoading && !error && reimbursements.length === 0 && (
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

        {!isLoading && !error && reimbursements.length > 0 && (
          <div className="space-y-4">
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
                    {reimbursements.map((reimbursement: Reimbursement) => (
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

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando página {page} de {totalPages} ({total} registros)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
