import { PerfilUsuario, AcaoSolicitacao, Prisma, StatusSolicitacao } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";
import { canTransitionStatus } from "../utils/status-transitions";
import { normalizeToUtcDate, serializeDates } from "../utils/date";

export type AuthenticatedUser = {
  id: string;
  perfil: PerfilUsuario;
};

type CreateReimbursementInput = {
  categoriaId: string;
  descricao: string;
  valor: string | number;
  dataDespesa: Date;
};

type UpdateReimbursementInput = Partial<CreateReimbursementInput>;

type RejectReimbursementInput = {
  justificativaRejeicao: string;
};

type CreateAttachmentInput = {
  nomeArquivo: string;
  urlArquivo: string;
  tipoArquivo: string;
};

async function getSolicitacaoOrThrow(id: string) {
  const solicitacao = await prisma.solicitacao.findUnique({
    where: { id },
    include: { anexos: true, historicos: true },
  });

  if (!solicitacao) {
    throw new ApiError(404, "Solicitacao not found", getStatusText(404));
  }

  return solicitacao;
}

function ensureOwner(userId: string, solicitanteId: string) {
  if (userId !== solicitanteId) {
    throw new ApiError(403, "Forbidden", getStatusText(403));
  }
}

async function ensureCategoriaAtiva(categoriaId: string) {
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria || !categoria.ativo) {
    throw new ApiError(400, "Categoria nao encontrada ou inativa", getStatusText(400));
  }
}

async function registerHistory(
  solicitacaoId: string,
  usuarioId: string,
  acao: AcaoSolicitacao,
  observacao: string
) {
  await prisma.historicoSolicitacao.create({
    data: {
      solicitacaoId,
      usuarioId,
      acao,
      observacao,
    },
  });
}

function ensureStatusTransition(current: StatusSolicitacao, next: StatusSolicitacao) {
  if (!canTransitionStatus(current, next)) {
    throw new ApiError(400, "Transicao de status invalida", getStatusText(400));
  }
}

export async function listReimbursements(user: AuthenticatedUser, page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  const filters: Prisma.SolicitacaoWhereInput = {};

  if (user.perfil === PerfilUsuario.COLABORADOR) {
    filters.solicitanteId = user.id;
  }

  if (user.perfil === PerfilUsuario.GESTOR) {
    filters.status = StatusSolicitacao.ENVIADO;
  }

  if (user.perfil === PerfilUsuario.FINANCEIRO) {
    filters.status = StatusSolicitacao.APROVADO;
  }

  const [items, total] = await Promise.all([
    prisma.solicitacao.findMany({
      where: filters,
      skip,
      take: pageSize,
      orderBy: { criadoEm: "desc" },
    }),
    prisma.solicitacao.count({ where: filters }),
  ]);

  return serializeDates({ items, page, pageSize, total });
}

export async function createReimbursement(user: AuthenticatedUser, input: CreateReimbursementInput) {
  await ensureCategoriaAtiva(input.categoriaId);

  const solicitacao = await prisma.solicitacao.create({
    data: {
      solicitanteId: user.id,
      categoriaId: input.categoriaId,
      descricao: input.descricao,
      valor: new Prisma.Decimal(input.valor),
      dataDespesa: normalizeToUtcDate(input.dataDespesa),
      status: StatusSolicitacao.RASCUNHO,
    },
  });

  await registerHistory(
    solicitacao.id,
    user.id,
    AcaoSolicitacao.CRIADO,
    "Solicitacao criada"
  );

  return serializeDates(solicitacao);
}

export async function getReimbursement(user: AuthenticatedUser, id: string) {
  const solicitacao = await getSolicitacaoOrThrow(id);

  if (user.perfil === PerfilUsuario.COLABORADOR) {
    ensureOwner(user.id, solicitacao.solicitanteId);
  }

  return serializeDates(solicitacao);
}

export async function updateReimbursement(user: AuthenticatedUser, id: string, input: UpdateReimbursementInput) {
  const solicitacao = await getSolicitacaoOrThrow(id);
  ensureOwner(user.id, solicitacao.solicitanteId);

  if (solicitacao.status !== StatusSolicitacao.RASCUNHO) {
    throw new ApiError(400, "Solicitacao nao pode ser editada", getStatusText(400));
  }

  if (input.categoriaId) {
    await ensureCategoriaAtiva(input.categoriaId);
  }

  const updated = await prisma.solicitacao.update({
    where: { id: solicitacao.id },
    data: {
      categoriaId: input.categoriaId ?? solicitacao.categoriaId,
      descricao: input.descricao ?? solicitacao.descricao,
      valor: input.valor ? new Prisma.Decimal(input.valor) : solicitacao.valor,
      dataDespesa: input.dataDespesa
        ? normalizeToUtcDate(input.dataDespesa)
        : solicitacao.dataDespesa,
    },
  });

  await registerHistory(
    solicitacao.id,
    user.id,
    AcaoSolicitacao.ATUALIZADO,
    "Solicitacao atualizada"
  );

  return serializeDates(updated);
}

export async function submitReimbursement(user: AuthenticatedUser, id: string) {
  const solicitacao = await getSolicitacaoOrThrow(id);

  ensureOwner(user.id, solicitacao.solicitanteId);
  ensureStatusTransition(solicitacao.status, StatusSolicitacao.ENVIADO);

  const updated = await prisma.solicitacao.update({
    where: { id: solicitacao.id },
    data: { status: StatusSolicitacao.ENVIADO },
  });

  await registerHistory(
    solicitacao.id,
    user.id,
    AcaoSolicitacao.ENVIADO,
    "Solicitacao enviada para analise"
  );

  return serializeDates(updated);
}

export async function approveReimbursement(user: AuthenticatedUser, id: string) {
  const solicitacao = await getSolicitacaoOrThrow(id);
  ensureStatusTransition(solicitacao.status, StatusSolicitacao.APROVADO);

  const updated = await prisma.solicitacao.update({
    where: { id: solicitacao.id },
    data: { status: StatusSolicitacao.APROVADO },
  });

  await registerHistory(
    solicitacao.id,
    user.id,
    AcaoSolicitacao.APROVADO,
    "Solicitacao aprovada pelo gestor"
  );

  return serializeDates(updated);
}

export async function rejectReimbursement(
  user: AuthenticatedUser,
  id: string,
  input: RejectReimbursementInput
) {
  const solicitacao = await getSolicitacaoOrThrow(id);
  ensureStatusTransition(solicitacao.status, StatusSolicitacao.REJEITADO);

  const updated = await prisma.solicitacao.update({
    where: { id: solicitacao.id },
    data: {
      status: StatusSolicitacao.REJEITADO,
      justificativaRejeicao: input.justificativaRejeicao,
    },
  });

  await registerHistory(
    solicitacao.id,
    user.id,
    AcaoSolicitacao.REJEITADO,
    "Solicitacao rejeitada pelo gestor"
  );

  return serializeDates(updated);
}

export async function cancelReimbursement(user: AuthenticatedUser, id: string) {
  const solicitacao = await getSolicitacaoOrThrow(id);

  // Only owner (colaborador) can cancel their own request
  ensureOwner(user.id, solicitacao.solicitanteId);

  ensureStatusTransition(solicitacao.status, StatusSolicitacao.CANCELADO);

  const updated = await prisma.solicitacao.update({
    where: { id: solicitacao.id },
    data: { status: StatusSolicitacao.CANCELADO },
  });

  await registerHistory(
    solicitacao.id,
    user.id,
    AcaoSolicitacao.CANCELADO,
    "Solicitacao cancelada"
  );

  return serializeDates(updated);
}

export async function payReimbursement(user: AuthenticatedUser, id: string) {
  const solicitacao = await getSolicitacaoOrThrow(id);
  ensureStatusTransition(solicitacao.status, StatusSolicitacao.PAGO);

  const updated = await prisma.solicitacao.update({
    where: { id: solicitacao.id },
    data: { status: StatusSolicitacao.PAGO },
  });

  await registerHistory(
    solicitacao.id,
    user.id,
    AcaoSolicitacao.PAGO,
    "Pagamento realizado pelo financeiro"
  );

  return serializeDates(updated);
}

export async function listHistory(user: AuthenticatedUser, id: string) {
  const solicitacao = await getSolicitacaoOrThrow(id);

  if (user.perfil === PerfilUsuario.COLABORADOR) {
    ensureOwner(user.id, solicitacao.solicitanteId);
  }

  const historicos = await prisma.historicoSolicitacao.findMany({
    where: { solicitacaoId: solicitacao.id },
    orderBy: { criadoEm: "desc" },
  });

  return serializeDates(historicos);
}

export async function createAttachment(
  user: AuthenticatedUser,
  id: string,
  input: CreateAttachmentInput
) {
  const solicitacao = await getSolicitacaoOrThrow(id);

  if (user.perfil === PerfilUsuario.COLABORADOR) {
    ensureOwner(user.id, solicitacao.solicitanteId);
  }

  const allowedTypes = ["PDF", "JPG", "PNG"];
  if (!allowedTypes.includes(input.tipoArquivo)) {
    throw new ApiError(400, "Tipo de arquivo invalido", getStatusText(400));
  }

  const anexo = await prisma.anexo.create({
    data: {
      solicitacaoId: solicitacao.id,
      nomeArquivo: input.nomeArquivo,
      urlArquivo: input.urlArquivo,
      tipoArquivo: input.tipoArquivo,
    },
  });

  return serializeDates(anexo);
}

export async function listAttachments(user: AuthenticatedUser, id: string) {
  const solicitacao = await getSolicitacaoOrThrow(id);

  if (user.perfil === PerfilUsuario.COLABORADOR) {
    ensureOwner(user.id, solicitacao.solicitanteId);
  }

  const anexos = await prisma.anexo.findMany({
    where: { solicitacaoId: solicitacao.id },
    orderBy: { criadoEm: "desc" },
  });

  return serializeDates(anexos);
}