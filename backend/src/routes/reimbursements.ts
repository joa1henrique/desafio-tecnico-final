import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { requireRole } from "../middlewares/require-role";
import { validate } from "../middlewares/validate";
import {
  approveReimbursement,
  createAttachment,
  createReimbursement,
  getReimbursement,
  listAttachments,
  listHistory,
  listReimbursements,
  payReimbursement,
  rejectReimbursement,
  submitReimbursement,
  cancelReimbursement,
  updateReimbursement,
} from "../controllers/reimbursements-controller";
import {
  createAttachmentSchema,
  createReimbursementSchema,
  listReimbursementsSchema,
  rejectReimbursementSchema,
  reimbursementIdParamSchema,
  updateReimbursementSchema,
} from "../validators/reimbursements";
import { PerfilUsuario } from "@prisma/client";

const router = Router();

router.use(authenticate);

router.get(
  "/reimbursements",
  validate(listReimbursementsSchema),
  listReimbursements
);
router.post(
  "/reimbursements",
  requireRole(PerfilUsuario.COLABORADOR),
  validate(createReimbursementSchema),
  createReimbursement
);
router.get(
  "/reimbursements/:id",
  validate(reimbursementIdParamSchema),
  getReimbursement
);
router.put(
  "/reimbursements/:id",
  requireRole(PerfilUsuario.COLABORADOR),
  validate(updateReimbursementSchema),
  updateReimbursement
);
router.post(
  "/reimbursements/:id/submit",
  requireRole(PerfilUsuario.COLABORADOR),
  validate(reimbursementIdParamSchema),
  submitReimbursement
);
router.post(
  "/reimbursements/:id/cancel",
  requireRole(PerfilUsuario.COLABORADOR),
  validate(reimbursementIdParamSchema),
  cancelReimbursement
);
router.post(
  "/reimbursements/:id/approve",
  requireRole(PerfilUsuario.GESTOR),
  validate(reimbursementIdParamSchema),
  approveReimbursement
);
router.post(
  "/reimbursements/:id/reject",
  requireRole(PerfilUsuario.GESTOR),
  validate(rejectReimbursementSchema),
  rejectReimbursement
);
router.post(
  "/reimbursements/:id/pay",
  requireRole(PerfilUsuario.FINANCEIRO),
  validate(reimbursementIdParamSchema),
  payReimbursement
);
router.get(
  "/reimbursements/:id/history",
  validate(reimbursementIdParamSchema),
  listHistory
);
router.post(
  "/reimbursements/:id/attachments",
  requireRole(PerfilUsuario.COLABORADOR, PerfilUsuario.GESTOR, PerfilUsuario.FINANCEIRO, PerfilUsuario.ADMIN),
  validate(createAttachmentSchema),
  createAttachment
);
router.get(
  "/reimbursements/:id/attachments",
  validate(reimbursementIdParamSchema),
  listAttachments
);

export default router;
