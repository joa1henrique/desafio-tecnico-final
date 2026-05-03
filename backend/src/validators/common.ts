import { z } from "zod";
import { PerfilUsuario, StatusSolicitacao } from "@prisma/client";

export const idSchema = z.uuid();

export const statusSchema = z.nativeEnum(StatusSolicitacao);

export const perfilSchema = z.nativeEnum(PerfilUsuario);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
