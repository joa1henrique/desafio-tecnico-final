import { z } from "zod";
import { perfilSchema, idSchema, paginationSchema } from "./common";

export const createUserSchema = z.object({
  body: z.object({
    nome: z.string().min(1),
    email: z.email(),
    senha: z.string().min(6),
    perfil: perfilSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const listUsersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: paginationSchema,
});

export const userIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: idSchema }),
  query: z.object({}).optional(),
});
