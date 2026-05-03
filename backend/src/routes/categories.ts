import { Router } from "express";
import { validate } from "../middlewares/validate";
import {
  createCategorySchema,
  listCategoriesSchema,
  updateCategorySchema,
} from "../validators/categories";
import {
  createCategory,
  listCategories,
  updateCategory,
} from "../controllers/categories-controller";
import { authenticate } from "../middlewares/auth";
import { requireRole } from "../middlewares/require-role";
import { PerfilUsuario } from "@prisma/client";

const router = Router();

router.get("/categories", validate(listCategoriesSchema), listCategories);
router.post(
  "/categories",
  authenticate,
  requireRole(PerfilUsuario.ADMIN),
  validate(createCategorySchema),
  createCategory
);
router.put(
  "/categories/:id",
  authenticate,
  requireRole(PerfilUsuario.ADMIN),
  validate(updateCategorySchema),
  updateCategory
);

export default router;
