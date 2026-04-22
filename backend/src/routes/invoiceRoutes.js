import express from "express";
import {
  getAllInvoice,
  getInvoiceById,
  createInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorizeRoles("admin", "staff"), getAllInvoice);
router.get("/:id", authorizeRoles("admin", "staff"), getInvoiceById);
router.post("/", authorizeRoles("admin", "staff"), createInvoice);
router.delete("/:id", authorizeRoles("admin"), deleteInvoice);

export default router;
