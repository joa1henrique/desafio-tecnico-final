import type { UserRole } from "@/types";

export type ActionKey = 
  | "create_reimbursement"
  | "view_own_reimbursements"
  | "view_sent_reimbursements"
  | "view_approved_reimbursements"
  | "view_all_reimbursements"
  | "view_financial_reports"
  | "manage_users"
  | "manage_categories";

export interface RolePermission {
  title: string;
  description: string;
  href: string;
  action: ActionKey;
}

export const rolePermissions: Record<UserRole, RolePermission[]> = {
  COLABORADOR: [
    {
      title: "Nova solicitação",
      description: "Abra um rascunho para registrar uma despesa.",
      href: "/reimbursements/new",
      action: "create_reimbursement",
    },
    {
      title: "Minhas solicitações",
      description: "Acompanhe status, histórico e anexos.",
      href: "/reimbursements",
      action: "view_own_reimbursements",
    },
  ],
  GESTOR: [
    {
      title: "Solicitações enviadas",
      description: "Visualize, aprove e rejeite solicitações.",
      href: "/reimbursements/pending",
      action: "view_sent_reimbursements",
    },
  ],
  FINANCEIRO: [
    {
      title: "Solicitações aprovadas",
      description: "Visualize e marque solicitações como pagas.",
      href: "/reimbursements/approved",
      action: "view_approved_reimbursements",
    },
  ],
  ADMIN: [
    {
      title: "Todas as solicitações",
      description: "Visualize todas as solicitações registradas no sistema.",
      href: "/reimbursements",
      action: "view_all_reimbursements",
    },
    {
      title: "Relatório Financeiro",
      description: "Gráficos de valores pagos e a pagar, com filtros.",
      href: "/reports",
      action: "view_financial_reports",
    },
    {
      title: "Usuários",
      description: "Administre usuários do sistema.",
      href: "/users",
      action: "manage_users",
    },
    {
      title: "Categorias",
      description: "Gerencie as categorias de despesas.",
      href: "/categories",
      action: "manage_categories",
    },
  ],
};

export function getPermissionsByRole(role: UserRole): RolePermission[] {
  return rolePermissions[role] || [];
}
