import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";

//garante que a requisiçao possua um usuario autenticado antes de prosseguir
export function requireUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new ApiError(401, "Missing user", getStatusText(401)));
  }

  return next();
}
