import { api } from "@/services/api";
import type { ApiPage, CreateUserInput, User } from "@/types";

export async function listUsers(page = 1, pageSize = 20) {
  const response = await api.get<ApiPage<User>>("/users", {
    params: { page, pageSize },
  });

  return response.data;
}

export async function createUser(input: CreateUserInput) {
  const response = await api.post<User>("/users", input);
  return response.data;
}