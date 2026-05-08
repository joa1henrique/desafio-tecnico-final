import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";
import { env } from "../config/env";

type LoginInput = {
  email: string;
  senha: string;
};

//valida as credenciais do usuario e gera o token jwt de acesso
export async function login(input: LoginInput) {
  const user = await prisma.usuario.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials", getStatusText(401));
  }

  const isValid = await bcrypt.compare(input.senha, user.senha);
  if (!isValid) {
    throw new ApiError(401, "Invalid credentials", getStatusText(401));
  }

  const signOptions: SignOptions = {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    {
      perfil: user.perfil,
    },
    env.JWT_SECRET,
    signOptions
  );

  return {
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
    },
  };
}