import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createUserSchema, listUsersSchema } from "../validators/users";
import { createUser, listUsers } from "../controllers/users-controller";
import { authenticate } from "../middlewares/auth";
import { requireRole } from "../middlewares/require-role";
import { PerfilUsuario } from "@prisma/client";

const router = Router();

router.post(
  "/users",
  authenticate,
  requireRole(PerfilUsuario.ADMIN),
  validate(createUserSchema),
  createUser
);
router.get(
  "/users",
  authenticate,
  requireRole(PerfilUsuario.ADMIN),
  validate(listUsersSchema),
  listUsers
);

export default router;
