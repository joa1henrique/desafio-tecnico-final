import { api } from "@/services/api";
import type { ApiPage, Category, CreateCategoryInput } from "@/types";

export async function listCategories(page = 1, pageSize = 20) {
  const response = await api.get<ApiPage<Category>>("/categories", {
    params: { page, pageSize },
  });

  return response.data;
}

export async function createCategory(input: CreateCategoryInput) {
  const response = await api.post<Category>("/categories", input);
  return response.data;
}

export async function updateCategory(id: string, input: CreateCategoryInput) {
  const response = await api.put<Category>(`/categories/${id}`, input);
  return response.data;
}