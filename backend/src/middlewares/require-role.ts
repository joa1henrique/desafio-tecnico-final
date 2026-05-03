import { NextFunction, Request, Response } from "express";
import { PerfilUsuario } from "@prisma/client";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";

export const requireRole = (...roles: PerfilUsuario[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Missing token", getStatusText(401)));
    }

    if (!roles.includes(req.user.perfil)) {
      return next(new ApiError(403, "Forbidden", getStatusText(403)));
    }

    return next();
  };
};
