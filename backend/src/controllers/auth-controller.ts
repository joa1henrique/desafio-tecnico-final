import { Request, Response } from "express";
import { PerfilUsuario } from "@prisma/client";
import { env } from "../config/env";
import { login as loginService } from "../services/auth-service";
import { getPermissionsByRole } from "../constants/role-permissions";

export async function login(req: Request, res: Response) {
  const result = await loginService(req.body);

  return res.status(200).json(result);
}

export async function logout(_req: Request, res: Response) {
  return res.sendStatus(204);
}

export async function permissions(req: Request, res: Response) {
  const perfil = req.user?.perfil;

  if (!perfil) {
    return res.status(401).json({ message: "Missing token" });
  }

  return res.status(200).json({ permissions: getPermissionsByRole(perfil as PerfilUsuario) });
}
