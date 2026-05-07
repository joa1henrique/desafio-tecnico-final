import { useState } from "react";
import useSWR from "swr";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getFinancialReport, type FinancialReport } from "@/services/reportsService";
import { listCategories } from "@/services/categoriesService";
import type { Category } from "@/types";

// ── SVG Bar Chart Component (sem dependências externas) ──────────────
function BarChart({
  data,
  formatValue,
}: {
  data: { label: string; value: number; color: string }[];
  formatValue?: (v: number) => string;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 80;
  const gap = 40;
  const chartHeight = 200;
  const chartWidth = data.length * (barWidth + gap) + gap;

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight + 60}`}
      className="w-full"
      style={{ maxHeight: 300 }}
    >
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <line
          key={pct}
          x1={0}
          y1={chartHeight - chartHeight * pct}
          x2={chartWidth}
          y2={chartHeight - chartHeight * pct}
          stroke="currentColor"
          opacity={0.1}
          strokeDasharray="4"
        />
      ))}
      {/* Bars */}
      {data.map((d, i) => {
        const barHeight = maxVal > 0 ? (d.value / maxVal) * (chartHeight - 20) : 0;
        const x = gap + i * (barWidth + gap);
        const y = chartHeight - barHeight;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={d.color}
              opacity={0.85}
            >
              <animate
                attributeName="height"
                from="0"
                to={barHeight}
                dur="0.6s"
                fill="freeze"
              />
              <animate
                attributeName="y"
                from={chartHeight}
                to={y}
                dur="0.6s"
                fill="freeze"
              />
            </rect>
            {/* Value label */}
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={12}
              fontWeight={600}
            >
              {formatValue ? formatValue(d.value) : d.value}
            </text>
            {/* Bottom label */}
            <text
              x={x + barWidth / 2}
              y={chartHeight + 20}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={11}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Page Component ───────────────────────────────────────────────────
export function ReportsPage() {
  const { user, isAuthenticated } = useAuth();

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [dateError, setDateError] = useState("");

  const [appliedFilters, setAppliedFilters] = useState<{
    dataInicio?: string;
    dataFim?: string;
    categoriaId?: string;
  }>({});

  const handleApplyFilters = () => {
    // Validação: data início não pode ser posterior à data fim
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setDateError("A data inicial não pode ser posterior à data final.");
      return;
    }
    setDateError("");

    const filters: Record<string, string> = {};
    if (dataInicio) filters.dataInicio = new Date(dataInicio).toISOString();
    if (dataFim) {
      const end = new Date(dataFim);
      end.setUTCHours(23, 59, 59, 999);
      filters.dataFim = end.toISOString();
    }
    if (categoriaId) filters.categoriaId = categoriaId;
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setDataInicio("");
    setDataFim("");
    setCategoriaId("");
    setDateError("");
    setAppliedFilters({});
  };

  const { data: categories } = useSWR<Category[]>(
    isAuthenticated ? "report-categories" : null,
    async () => {
      const res = await listCategories(1, 100);
      return res.items;
    },
    { revalidateOnFocus: false }
  );

  const { data: report, isLoading, error } = useSWR<FinancialReport>(
    isAuthenticated && user?.perfil === "ADMIN"
      ? ["financial-report", appliedFilters]
      : null,
    async ([_key, filters]: any) => {
      return await getFinancialReport(filters);
    },
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  // ── Acesso negado para não-admins ──
  if (!isAuthenticated || user?.perfil !== "ADMIN") {
    return (
      <AppLayout>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Acesso negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              Apenas administradores podem acessar os relatórios financeiros.
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const pagosTotal = parseFloat(report?.pagos.total || "0");
  const aPagarTotal = parseFloat(report?.aPagar.total || "0");
  const pagosCount = report?.pagos.count || 0;
  const aPagarCount = report?.aPagar.count || 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Relatório Financeiro</h1>
          <p className="text-muted-foreground">
            Visão consolidada de valores pagos e a pagar.
          </p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Input
                  type="date"
                  value={dataInicio}
                  max={dataFim || undefined}
                  onChange={(e) => {
                    setDataInicio(e.target.value);
                    setDateError("");
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <Input
                  type="date"
                  value={dataFim}
                  min={dataInicio || undefined}
                  onChange={(e) => {
                    setDataFim(e.target.value);
                    setDateError("");
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                >
                  <option value="">Todas</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Aplicar
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpar
                </Button>
              </div>
            </div>
            {dateError && (
              <p className="text-sm text-destructive mt-2">{dateError}</p>
            )}
          </CardContent>
        </Card>

        {/* Loading / Error */}
        {isLoading && !report && (
          <p className="text-sm text-muted-foreground">Carregando relatório...</p>
        )}
        {error && (
          <p className="text-sm text-destructive">Erro ao carregar relatório.</p>
        )}

        {/* Summary Cards */}
        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(pagosTotal)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pagosCount} solicitação(ões) paga(s)
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total a Pagar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(aPagarTotal)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {aPagarCount} solicitação(ões) aprovada(s)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comparativo de Valores (R$)</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={[
                      { label: "Pagos", value: pagosTotal, color: "#22c55e" },
                      { label: "A Pagar", value: aPagarTotal, color: "#eab308" },
                    ]}
                    formatValue={formatCurrency}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quantidade de Solicitações</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={[
                      { label: "Pagas", value: pagosCount, color: "#22c55e" },
                      { label: "A Pagar", value: aPagarCount, color: "#eab308" },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
