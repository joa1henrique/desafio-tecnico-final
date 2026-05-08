import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";

//captura todos os erros lançados na aplicaçao e formata a resposta json
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
      error: err.error,
      details: err.details,
    });
  }

  const statusCode = 500;
  return res.status(statusCode).json({
    message: "Unexpected error",
    statusCode,
    error: getStatusText(statusCode),
  });
}
