import bcrypt from "bcryptjs";
import { PerfilUsuario } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";
import { serializeDates } from "../utils/date";

type CreateUserInput = {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
};

function userSelect() {
  return {
    id: true,
    nome: true,
    email: true,
    perfil: true,
    criadoEm: true,
    atualizadoEm: true,
  } as const;
}

//cria um novo usuario com senha criptografada e validaçao de email
export async function createUser(input: CreateUserInput) {
  const existing = await prisma.usuario.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError(400, "Email already in use", getStatusText(400));
  }

  const senhaHash = await bcrypt.hash(input.senha, 10);

  const user = await prisma.usuario.create({
    data: {
      nome: input.nome,
      email: input.email,
      senha: senhaHash,
      perfil: input.perfil,
    },
    select: userSelect(),
  });

  return serializeDates(user);
}

//lista os usuarios cadastrados com paginaçao e sem expor a senha
export async function listUsers(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.usuario.findMany({
      skip,
      take: pageSize,
      orderBy: { criadoEm: "desc" },
      select: userSelect(),
    }),
    prisma.usuario.count(),
  ]);

  return serializeDates({ items, page, pageSize, total });
}