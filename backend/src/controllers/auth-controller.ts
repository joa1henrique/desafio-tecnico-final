import { Request, Response } from "express";
import { env } from "../config/env";
import { login as loginService } from "../services/auth-service";

export async function login(req: Request, res: Response) {
  const result = await loginService(req.body);

  res.cookie(env.COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
  });

  return res.status(200).json(result);
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
  });
  return res.sendStatus(204);
}
