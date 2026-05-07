import { Request, Response } from "express";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";
import * as reimbursementsService from "../services/reimbursements-service";

function requireUser(req: Request) {
  if (!req.user) {
    throw new ApiError(401, "Missing user", getStatusText(401));
  }

  return req.user;
}

export async function listReimbursements(req: Request, res: Response) {
  const user = requireUser(req);
  const query = (req.validated?.query || req.query) as any;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;

  const filtersOptions = {
    status: query.status,
    categoriaId: query.categoriaId,
    colaboradorNome: query.colaboradorNome,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };

  const result = await reimbursementsService.listReimbursements(user, page, pageSize, filtersOptions);
  return res.status(200).json(result);
}

export async function createReimbursement(req: Request, res: Response) {
  const user = requireUser(req);
  const created = await reimbursementsService.createReimbursement(user, req.body);
  return res.status(201).json(created);
}

export async function getReimbursement(req: Request, res: Response) {
  const user = requireUser(req);
  const solicitacao = await reimbursementsService.getReimbursement(user, String(req.params.id));
  return res.status(200).json(solicitacao);
}

export async function updateReimbursement(req: Request, res: Response) {
  const user = requireUser(req);
  const updated = await reimbursementsService.updateReimbursement(user, String(req.params.id), req.body);
  return res.status(200).json(updated);
}

export async function submitReimbursement(req: Request, res: Response) {
  const user = requireUser(req);
  const updated = await reimbursementsService.submitReimbursement(user, String(req.params.id));
  return res.status(200).json(updated);
}

export async function approveReimbursement(req: Request, res: Response) {
  const user = requireUser(req);
  const updated = await reimbursementsService.approveReimbursement(user, String(req.params.id));
  return res.status(200).json(updated);
}

export async function rejectReimbursement(req: Request, res: Response) {
  const user = requireUser(req);
  const updated = await reimbursementsService.rejectReimbursement(user, String(req.params.id), req.body);
  return res.status(200).json(updated);
}

export async function cancelReimbursement(req: Request, res: Response) {
  const user = requireUser(req);
  const updated = await reimbursementsService.cancelReimbursement(user, String(req.params.id));
  return res.status(200).json(updated);
}

export async function payReimbursement(req: Request, res: Response) {
  const user = requireUser(req);
  const updated = await reimbursementsService.payReimbursement(user, String(req.params.id));
  return res.status(200).json(updated);
}

export async function listHistory(req: Request, res: Response) {
  const user = requireUser(req);
  const historicos = await reimbursementsService.listHistory(user, String(req.params.id));
  return res.status(200).json(historicos);
}

export async function createAttachment(req: Request, res: Response) {
  const user = requireUser(req);
  const anexo = await reimbursementsService.createAttachment(user, String(req.params.id), req.body);
  return res.status(201).json(anexo);
}

export async function listAttachments(req: Request, res: Response) {
  const user = requireUser(req);
  const anexos = await reimbursementsService.listAttachments(user, String(req.params.id));
  return res.status(200).json(anexos);
}