import { PerfilUsuario } from "@prisma/client";

export type PermissionKey =
  | "create_reimbursement"
  | "view_own_reimbursements"
  | "view_sent_reimbursements"
  | "view_approved_reimbursements"
  | "view_all_reimbursements"
  | "view_financial_reports"
  | "manage_users"
  | "manage_categories";

const rolePermissions: Record<PerfilUsuario, PermissionKey[]> = {
  COLABORADOR: ["create_reimbursement", "view_own_reimbursements"],
  GESTOR: ["view_sent_reimbursements"],
  FINANCEIRO: ["view_approved_reimbursements"],
  ADMIN: [
    "view_all_reimbursements",
    "view_financial_reports",
    "manage_users",
    "manage_categories",
  ],
};

export function getPermissionsByRole(role: PerfilUsuario): PermissionKey[] {
  return rolePermissions[role] ?? [];
}