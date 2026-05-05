import { api } from "@/services/api";
import type { AuthResponse, LoginInput } from "@/types";
import type { ActionKey } from "@/constants/rolePermissions";

export async function login(input: LoginInput) {
  const response = await api.post<AuthResponse>("/auth/login", input);
  return response.data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function getPermissions() {
  const response = await api.get<{ permissions: ActionKey[] }>("/auth/permissions");
  return response.data;
}