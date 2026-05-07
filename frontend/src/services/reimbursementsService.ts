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

export async function listReimbursements(page = 1, pageSize = 20, filters?: Record<string, string>) {
  const response = await api.get<ApiPage<Reimbursement>>("/reimbursements", {
    params: { page, pageSize, ...filters },
  });

  return response.data;
}

export async function getReimbursement(id: string) {
  const response = await api.get<Reimbursement>(`/reimbursements/${id}`);
  return response.data;
}

export async function createReimbursement(input: CreateReimbursementInput) {
  const response = await api.post<Reimbursement>("/reimbursements", input);
  return response.data;
}

export async function updateReimbursement(id: string, input: UpdateReimbursementInput) {
  const response = await api.put<Reimbursement>(`/reimbursements/${id}`, input);
  return response.data;
}

export async function submitReimbursement(id: string) {
  const response = await api.post<Reimbursement>(`/reimbursements/${id}/submit`);
  return response.data;
}

export async function cancelReimbursement(id: string) {
  const response = await api.post<Reimbursement>(`/reimbursements/${id}/cancel`);
  return response.data;
}

export async function approveReimbursement(id: string) {
  const response = await api.post<Reimbursement>(`/reimbursements/${id}/approve`);
  return response.data;
}

export async function rejectReimbursement(id: string, input: RejectReimbursementInput) {
  const response = await api.post<Reimbursement>(`/reimbursements/${id}/reject`, input);
  return response.data;
}

export async function payReimbursement(id: string) {
  const response = await api.post<Reimbursement>(`/reimbursements/${id}/pay`);
  return response.data;
}

export async function listReimbursementHistory(id: string) {
  const response = await api.get<ReimbursementHistoryEntry[]>(`/reimbursements/${id}/history`);
  return response.data;
}

export async function listReimbursementAttachments(id: string) {
  const response = await api.get<ReimbursementAttachment[]>(`/reimbursements/${id}/attachments`);
  return response.data;
}

export async function createReimbursementAttachment(id: string, input: CreateAttachmentInput) {
  const response = await api.post<ReimbursementAttachment>(`/reimbursements/${id}/attachments`, input);
  return response.data;
}