import { Request, Response } from "express";
import * as categoriesService from "../services/categories-service";

export async function listCategories(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;

  const result = await categoriesService.listCategories(page, pageSize);
  return res.status(200).json(result);
}

export async function createCategory(req: Request, res: Response) {
  const category = await categoriesService.createCategory(req.body);

  return res.status(201).json(category);
}

export async function updateCategory(req: Request, res: Response) {
  const id = String(req.params.id);
  const category = await categoriesService.updateCategory(id, req.body);

  return res.status(200).json(category);
}
