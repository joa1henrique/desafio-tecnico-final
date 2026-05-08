import { api } from "@/services/api";

export type FinancialReport = {
  pagos: { total: string; count: number };
  aPagar: { total: string; count: number };
};

//gera o relatorio financeiro consolidado, aplicando os filtros de data e categoria
export async function getFinancialReport(filters?: {
  dataInicio?: string;
  dataFim?: string;
  categoriaId?: string;
}) {
  const response = await api.get<FinancialReport>("/reimbursements/reports", {
    params: filters,
  });
  return response.data;
}
