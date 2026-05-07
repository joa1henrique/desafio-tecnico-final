import { StatusSolicitacao, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type ReportFilters = {
  dataInicio?: Date;
  dataFim?: Date;
  categoriaId?: string;
};

export async function getFinancialReport(filters?: ReportFilters) {
  const baseWhere: Prisma.SolicitacaoWhereInput = {};

  if (filters?.dataInicio || filters?.dataFim) {
    baseWhere.criadoEm = {};
    if (filters.dataInicio) {
      (baseWhere.criadoEm as any).gte = filters.dataInicio;
    }
    if (filters.dataFim) {
      (baseWhere.criadoEm as any).lte = filters.dataFim;
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
