import { z } from "zod";

export const idSchema = z.uuid();

export const statusSchema = z.enum([
  "RASCUNHO",
  "ENVIADO",
  "APROVADO",
  "REJEITADO",
  "PAGO",
  "CANCELADO",
]);

export const perfilSchema = z.enum([
  "COLABORADOR",
  "GESTOR",
  "FINANCEIRO",
  "ADMIN",
]);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
