import express from 'express'
import { createCustomer, deleteCustomer, getAllCustomer, updateCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.get("/", getAllCustomer);
router.post("/", createCustomer);
router.put("/:customerId", updateCustomer);
router.delete("/:customerId", deleteCustomer);

export default router