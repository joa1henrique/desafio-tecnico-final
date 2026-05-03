import { Request, Response } from "express";
import { createUser as createUserService, listUsers as listUsersService } from "../services";

export async function createUser(req: Request, res: Response) {
  const user = await createUserService(req.body);
  return res.status(201).json(user);
}

export async function listUsers(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;

  const result = await listUsersService(page, pageSize);
  return res.status(200).json(result);
}
