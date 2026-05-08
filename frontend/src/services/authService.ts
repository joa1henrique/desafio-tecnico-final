import { api } from "@/services/api";
import type { AuthResponse, LoginInput } from "@/types";
import type { ActionKey } from "@/constants/rolePermissions";

//autentica o usuario e retorna o token e dados basicos
export async function login(input: LoginInput) {
  const response = await api.post<AuthResponse>("/auth/login", input);
  return response.data;
}

//solicita o encerramento da sessao no backend
export async function logout() {
  await api.post("/auth/logout");
}

//obtem a lista de chaves de permissao do usuario logado
export async function getPermissions() {
  const response = await api.get<{ permissions: ActionKey[] }>("/auth/permissions");
  return response.data;
}