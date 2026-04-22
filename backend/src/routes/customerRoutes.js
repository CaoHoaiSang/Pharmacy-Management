import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomer,
  updateCustomer,
} from "../controllers/customerController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorizeRoles("admin", "staff"), getAllCustomer);
router.post("/", authorizeRoles("admin", "staff"), createCustomer);
router.put("/:id", authorizeRoles("admin", "staff"), updateCustomer);
router.delete("/:id", authorizeRoles("admin"), deleteCustomer);

export default router;
