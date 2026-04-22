import express from "express";
import { getAdminDashboard } from "../controllers/adminController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("admin"));

router.get("/dashboard", getAdminDashboard);

export default router;
