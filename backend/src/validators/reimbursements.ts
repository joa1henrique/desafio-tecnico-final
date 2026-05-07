import { z } from "zod";
import { idSchema, paginationSchema, statusSchema } from "./common";

export const createReimbursementSchema = z.object({
  body: z.object({
    categoriaId: idSchema,
    descricao: z.string().min(1),
    valor: z.coerce.number().positive(),
    dataDespesa: z.coerce.date(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateReimbursementSchema = z.object({
  body: z.object({
    categoriaId: idSchema.optional(),
    descricao: z.string().min(1).optional(),
    valor: z.coerce.number().positive().optional(),
    dataDespesa: z.coerce.date().optional(),
  }),
  params: z.object({ id: idSchema }),
  query: z.object({}),
});

export const reimbursementIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: idSchema }),
  query: z.object({}).optional(),
});

export const listReimbursementsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: paginationSchema.extend({
    status: statusSchema.optional(),
    categoriaId: idSchema.optional(),
    colaboradorNome: z.string().optional(),
    sortBy: z.enum(["criadoEm", "valor"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const rejectReimbursementSchema = z.object({
  body: z.object({
    justificativaRejeicao: z.string().min(1),
  }),
  params: z.object({ id: idSchema }),
  query: z.object({}),
});

export const createAttachmentSchema = z.object({
  body: z.object({
    nomeArquivo: z.string().min(1),
    urlArquivo: z.url(),
    tipoArquivo: z.enum(["PDF", "JPG", "PNG"]),
  }),
  params: z.object({ id: idSchema }),
  query: z.object({}),
});
