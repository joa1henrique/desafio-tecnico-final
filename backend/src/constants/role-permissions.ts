import { PerfilUsuario } from "@prisma/client";

export type PermissionKey =
  | "create_reimbursement"
  | "view_own_reimbursements"
  | "view_sent_reimbursements"
  | "view_approved_reimbursements"
  | "manage_users"
  | "manage_categories";

const rolePermissions: Record<PerfilUsuario, PermissionKey[]> = {
  COLABORADOR: ["create_reimbursement", "view_own_reimbursements"],
  GESTOR: ["view_sent_reimbursements"],
  FINANCEIRO: ["view_approved_reimbursements"],
  ADMIN: [
    "create_reimbursement",
    "view_own_reimbursements",
    "view_sent_reimbursements",
    "view_approved_reimbursements",
    "manage_users",
    "manage_categories",
  ],
};

export function getPermissionsByRole(role: PerfilUsuario): PermissionKey[] {
  return rolePermissions[role] ?? [];
}