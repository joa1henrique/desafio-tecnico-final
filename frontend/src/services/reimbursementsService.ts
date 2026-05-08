import { api } from "@/services/api";
import type {
  ApiPage,
  CreateAttachmentInput,
  CreateReimbursementInput,
  Reimbursement,
  ReimbursementAttachment,
  ReimbursementHistoryEntry,
  RejectReimbursementInput,
  UpdateReimbursementInput,
} from "@/types";

//lista as solicitaçoes de reembolso, com suporte a filtros e paginaçao
export async function listReimbursements(page = 1, pageSize = 20, filters?: Record<string, string>) {
  const response = await api.get<ApiPage<Reimbursement>>("/reimbursements", {
    params: { page, pageSize, ...filters },
  });

  return response.data;
}

//obtem os detalhes de uma solicitaçao especifica pelo id
export async function getReimbursement(id: string) {
  const response = await api.get<Reimbursement>(`/reimbursements/${id}`);
  return response.data;
}

//registra uma nova solicitaçao de reembolso no sistema
export async function createReimbursement(input: CreateReimbursementInput) {
  const response = await api.post<Reimbursement>("/reimbursements", input);
  return response.data;
}

//atualiza os dados de uma solicitaçao que ainda nao foi enviada
export async function updateReimbursement(id: string, input: UpdateReimbursementInput) {
  const response = await api.put<Reimbursement>(`/reimbursements/${id}`, input);
  return response.data;
}

//altera o status da solicitaçao para enviado iniciando o fluxo de aprovaçao
export async function submitReimbursement(id: string) {
  const response = await api.post<Reimbursement>(`/reimbursements/${id}/submit`);
  return response.data;
}

//permite que o solicitante cancele sua propria solicitaçao
export async function cancelReimbursement(id: string) {
  const response = await api.post<Reimbursement>(`/reimbursements/${id}/cancel`);
  return response.data;
}

//aprova uma solicitaçao (açao exclusiva de gestores)
export async function approveReimbursement(id: string) {
  const response = await api.post<Reimbursement>(`/reimbursements/${id}/approve`);
  return response.data;
}

//rejeita uma solicitaçao informando o motivo (açao exclusiva de gestores)
export async function rejectReimbursement(id: string, input: RejectReimbursementInput) {
  const response = await api.post<Reimbursement>(`/reimbursements/${id}/reject`, input);
  return response.data;
}

//registra o pagamento de uma solicitaçao aprovada (açao exclusiva de financeiros)
export async function payReimbursement(id: string) {
  const response = await api.post<Reimbursement>(`/reimbursements/${id}/pay`);
  return response.data;
}

//retorna o historico completo de açoes e mudanças de status
export async function listReimbursementHistory(id: string) {
  const response = await api.get<ReimbursementHistoryEntry[]>(`/reimbursements/${id}/history`);
  return response.data;
}

//lista os arquivos e comprovantes anexados a solicitaçao
export async function listReimbursementAttachments(id: string) {
  const response = await api.get<ReimbursementAttachment[]>(`/reimbursements/${id}/attachments`);
  return response.data;
}

//adiciona um novo anexo (comprovante) a solicitaçao
export async function createReimbursementAttachment(id: string, input: CreateAttachmentInput) {
  const response = await api.post<ReimbursementAttachment>(`/reimbursements/${id}/attachments`, input);
  return response.data;
}