import { z } from "zod";
import { idSchema, paginationSchema } from "./common";

export const createCategorySchema = z.object({
  body: z.object({
    nome: z.string().min(1),
    ativo: z.boolean().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateCategorySchema = z.object({
  body: z.object({
    nome: z.string().min(1).optional(),
    ativo: z.boolean().optional(),
  }),
  params: z.object({ id: idSchema }),
  query: z.object({}),
});

export const listCategoriesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: paginationSchema,
});
