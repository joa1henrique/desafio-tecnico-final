import { StatusSolicitacao } from "@prisma/client";

const allowedTransitions: Record<StatusSolicitacao, StatusSolicitacao[]> = {
  RASCUNHO: [StatusSolicitacao.ENVIADO, StatusSolicitacao.CANCELADO],
  ENVIADO: [
    StatusSolicitacao.APROVADO,
    StatusSolicitacao.REJEITADO,
    StatusSolicitacao.CANCELADO,
  ],
  APROVADO: [StatusSolicitacao.PAGO],
  REJEITADO: [],
  PAGO: [],
  CANCELADO: [],
};

export const canTransitionStatus = (
  from: StatusSolicitacao,
  to: StatusSolicitacao
) => {
  return allowedTransitions[from]?.includes(to) ?? false;
};
