import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getCategories);
router.post("/", authorizeRoles("admin", "warehouse"), createCategory);
router.put("/:id", authorizeRoles("admin", "warehouse"), updateCategory);
router.delete("/:id", authorizeRoles("admin", "warehouse"), deleteCategory);

export default router;
