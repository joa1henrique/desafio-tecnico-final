import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { loginSchema } from "../validators/auth";
import { login, logout, permissions } from "../controllers/auth-controller";

const router = Router();

router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/logout", logout);
router.get("/auth/permissions", authenticate, permissions);

export default router;
