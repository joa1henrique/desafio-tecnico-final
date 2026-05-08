import { StatusSolicitacao, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type ReportFilters = {
  dataInicio?: Date;
  dataFim?: Date;
  categoriaId?: string;
};

//calcula o resumo financeiro de valores pagos e aprovados
export async function getFinancialReport(filters?: ReportFilters) {
  const baseWhere: Prisma.SolicitacaoWhereInput = {};

  if (filters?.dataInicio || filters?.dataFim) {
    baseWhere.dataDespesa = {};
    if (filters.dataInicio) {
      baseWhere.dataDespesa.gte = filters.dataInicio;
    }
    if (filters.dataFim) {
      const dFim = new Date(filters.dataFim);
      dFim.setHours(23, 59, 59, 999);
      baseWhere.dataDespesa.lte = dFim;
    }
  }

  if (filters?.categoriaId) {
    baseWhere.categoriaId = filters.categoriaId;
  }

  const [pagos, aPagar] = await Promise.all([
    prisma.solicitacao.aggregate({
      where: { ...baseWhere, status: StatusSolicitacao.PAGO },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.solicitacao.aggregate({
      where: { ...baseWhere, status: StatusSolicitacao.APROVADO },
      _sum: { valor: true },
      _count: true,
    }),
  ]);

  return {
    pagos: {
      total: pagos._sum.valor?.toString() || "0",
      count: pagos._count,
    },
    aPagar: {
      total: aPagar._sum.valor?.toString() || "0",
      count: aPagar._count,
    },
  };
}
