import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ReimbursementStatus } from "@/types";

describe("StatusBadge", () => {
  const statusLabelMap: Record<ReimbursementStatus, string> = {
    RASCUNHO: "Rascunho",
    ENVIADO: "Enviado",
    APROVADO: "Aprovado",
    REJEITADO: "Rejeitado",
    PAGO: "Pago",
    CANCELADO: "Cancelado",
  };

  it.each(Object.entries(statusLabelMap))(
    'renderiza label "%s" para status %s',
    (status, expectedLabel) => {
      render(<StatusBadge status={status as ReimbursementStatus} />);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    }
  );

  it('renderiza "Desconhecido" para status inválido', () => {
    render(<StatusBadge status={"INVALIDO" as ReimbursementStatus} />);
    expect(screen.getByText("Desconhecido")).toBeInTheDocument();
  });
});
