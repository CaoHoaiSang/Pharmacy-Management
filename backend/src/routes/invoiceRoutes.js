import express from 'express'
import { getAllInvoice, createInvoice, deleteInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

router.get("/", getAllInvoice);
router.post("/", createInvoice);
router.delete("/:invoiceId", deleteInvoice)

export default router;
