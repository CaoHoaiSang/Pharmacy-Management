import express from "express";
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  importStock,
} from "../controllers/medicineController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getMedicines);
router.post("/", authorizeRoles("admin", "warehouse"), createMedicine);
router.put("/:id", authorizeRoles("admin", "warehouse"), updateMedicine);
router.delete("/:id", authorizeRoles("admin", "warehouse"), deleteMedicine);
router.patch("/:id/import", authorizeRoles("admin", "warehouse"), importStock);

export default router;
