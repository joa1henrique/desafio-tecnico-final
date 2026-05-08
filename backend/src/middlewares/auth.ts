import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PerfilUsuario } from "@prisma/client";
import { env } from "../config/env";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";

type JwtPayload = {
  sub: string;
  perfil: PerfilUsuario;
};

//verifica a presença e validade do token jwt no cabeçalho da requisiçao
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  let token: string | undefined;

  if (header) {
    const [type, value] = header.split(" ");
    if (type !== "Bearer" || !value) {
      return next(new ApiError(401, "Invalid token", getStatusText(401)));
    }
    token = value;
  }

  if (!token) {
    return next(new ApiError(401, "Missing token", getStatusText(401)));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.sub, perfil: payload.perfil };
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token", getStatusText(401)));
  }
}
