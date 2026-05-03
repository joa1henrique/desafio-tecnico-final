
import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";

// Extende o tipo Request para incluir a propriedade validated
declare module "express-serve-static-core" {
  interface Request {
    validated?: {
      body?: unknown;
      params?: unknown;
      query?: unknown;
    };
  }
}

export function validate(schema: ZodType<unknown>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
      // Armazena o objeto validado em req.validated
      req.validated = parsed;
      return next();
    } catch (error) {
      const issues = error instanceof ZodError ? error.issues : undefined;
      const message =
        issues?.[0]?.message ??
        (error instanceof Error ? error.message : "Invalid request data");
      return next(new ApiError(400, message, getStatusText(400), issues));
    }
  };
}
