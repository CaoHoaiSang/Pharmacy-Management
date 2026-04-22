import express from "express";
import { getCurrentUser, login } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);

export default router;
