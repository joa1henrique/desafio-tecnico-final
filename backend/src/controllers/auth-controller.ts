import { Request, Response } from "express";
import { PerfilUsuario } from "@prisma/client";
import { env } from "../config/env";
import { login as loginService } from "../services/auth-service";
import { getPermissionsByRole } from "../constants/role-permissions";

export async function login(req: Request, res: Response) {
  const result = await loginService(req.body);

  res.cookie(env.COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
  });

  return res.status(200).json(result);
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
  });
  return res.sendStatus(204);
}

export async function permissions(req: Request, res: Response) {
  const perfil = req.user?.perfil;

  if (!perfil) {
    return res.status(401).json({ message: "Missing token" });
  }

  return res.status(200).json({ permissions: getPermissionsByRole(perfil as PerfilUsuario) });
}
