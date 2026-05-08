import { api } from "@/services/api";
import type { ApiPage, CreateUserInput, User } from "@/types";

//lista os usuarios do sistema, com paginaçao
export async function listUsers(page = 1, pageSize = 20) {
  const response = await api.get<ApiPage<User>>("/users", {
    params: { page, pageSize },
  });

  return response.data;
}

//cadastra um novo usuario no sistema
export async function createUser(input: CreateUserInput) {
  const response = await api.post<User>("/users", input);
  return response.data;
}