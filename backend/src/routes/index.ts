import { Router } from "express";
import healthRoutes from "./health";
import authRoutes from "./auth";
import userRoutes from "./users";
import categoryRoutes from "./categories";
import reimbursementRoutes from "./reimbursements";

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(userRoutes);
router.use(categoryRoutes);
router.use(reimbursementRoutes);

export default router;
