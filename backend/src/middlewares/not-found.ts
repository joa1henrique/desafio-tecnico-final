import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";

//intercepta rotas inexistentes e retorna um erro 404 padronizado
export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "Route not found", getStatusText(404)));
}
