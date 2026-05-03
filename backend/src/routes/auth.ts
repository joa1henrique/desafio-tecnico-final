import { Router } from "express";
import { validate } from "../middlewares/validate";
import { loginSchema } from "../validators/auth";
import { login, logout } from "../controllers/auth-controller";

const router = Router();

router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/logout", logout);

export default router;
