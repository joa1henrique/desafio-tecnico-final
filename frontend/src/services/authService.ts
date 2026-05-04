import { api } from "@/services/api";
import type { AuthResponse, LoginInput } from "@/types";

export async function login(input: LoginInput) {
  const response = await api.post<AuthResponse>("/auth/login", input);
  return response.data;
}

export async function logout() {
  await api.post("/auth/logout");
}