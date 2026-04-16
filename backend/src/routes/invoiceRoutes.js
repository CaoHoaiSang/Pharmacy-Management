import express from 'express'
import { getAllInvoice, getInvoiceById, createInvoice, deleteInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

router.get("/", getAllInvoice);
router.get("/:invoiceId", getInvoiceById);
router.post("/", createInvoice);
router.delete("/:invoiceId", deleteInvoice);

export default router;
