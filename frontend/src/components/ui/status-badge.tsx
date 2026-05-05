import type { ReimbursementStatus } from "@/types";

const statusConfig: Record<ReimbursementStatus, { label: string; className: string }> = {
  RASCUNHO: {
    label: "Rascunho",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  },
  ENVIADO: {
    label: "Enviado",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  APROVADO: {
    label: "Aprovado",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  REJEITADO: {
    label: "Rejeitado",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  PAGO: {
    label: "Pago",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  },
  CANCELADO: {
    label: "Cancelado",
    className: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  },
};

interface StatusBadgeProps {
  status: ReimbursementStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return <span className="text-xs font-medium">Desconhecido</span>;
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
