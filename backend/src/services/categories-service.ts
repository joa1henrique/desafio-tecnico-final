import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";
import { serializeDates } from "../utils/date";

type CreateCategoryInput = {
  nome: string;
  ativo?: boolean;
};

type UpdateCategoryInput = {
  nome?: string;
  ativo?: boolean;
};

//lista as categorias de despesa, com paginaçao
export async function listCategories(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.categoria.findMany({
      skip,
      take: pageSize,
      orderBy: { criadoEm: "desc" },
    }),
    prisma.categoria.count(),
  ]);

  return serializeDates({ items, page, pageSize, total });
}

//cria uma nova categoria garantindo que o nome seja unico
export async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.categoria.findUnique({ where: { nome: input.nome } });
  if (existing) {
    throw new ApiError(400, "Category already exists", getStatusText(400));
  }

  const category = await prisma.categoria.create({
    data: { nome: input.nome, ativo: input.ativo ?? true },
  });

  return serializeDates(category);
}

//atualiza os dados de uma categoria existente
export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const existing = await prisma.categoria.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Category not found", getStatusText(404));
  }

  const category = await prisma.categoria.update({
    where: { id },
    data: { nome: input.nome, ativo: input.ativo },
  });

  return serializeDates(category);
}