import express from "express";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getSuppliers);
router.post("/", authorizeRoles("admin", "warehouse"), createSupplier);
router.put("/:id", authorizeRoles("admin", "warehouse"), updateSupplier);
router.delete("/:id", authorizeRoles("admin", "warehouse"), deleteSupplier);

export default router;
