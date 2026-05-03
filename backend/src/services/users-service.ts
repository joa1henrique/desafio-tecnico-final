import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";

type CreateUserInput = {
  nome: string;
  email: string;
  senha: string;
  perfil: string;
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

export async function createUser(input: CreateUserInput) {
  const existing = await prisma.usuario.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError(400, "Email already in use", getStatusText(400));
  }

  const senhaHash = await bcrypt.hash(input.senha, 10);

  return prisma.usuario.create({
    data: {
      nome: input.nome,
      email: input.email,
      senha: senhaHash,
      perfil: input.perfil,
    },
    select: userSelect(),
  });
}

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

  return { items, page, pageSize, total };
}