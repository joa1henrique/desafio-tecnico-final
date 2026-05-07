import { Request, Response } from "express";
import { ApiError } from "../errors/api-error";
import { getStatusText } from "../utils/http-status";
import { normalizeToUtcDate } from "../utils/date";
import * as reportsService from "../services/reports-service";

function requireUser(req: Request) {
  if (!req.user) {
    throw new ApiError(401, "Missing user", getStatusText(401));
  }
  return req.user;
}

export async function getFinancialReport(req: Request, res: Response) {
  requireUser(req);
  const query = (req.validated?.query || req.query) as any;

  const filters: reportsService.ReportFilters = {};

  if (query.dataInicio) {
    filters.dataInicio = normalizeToUtcDate(query.dataInicio);
  }
  if (query.dataFim) {
    filters.dataFim = normalizeToUtcDate(query.dataFim);
  }
  if (query.categoriaId) {
    filters.categoriaId = query.categoriaId;
  }

  const result = await reportsService.getFinancialReport(filters);
  return res.status(200).json(result);
}
