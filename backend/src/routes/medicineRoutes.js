import express from 'express';
import {
    getMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    importStock
} from '../controllers/medicineController.js';

const router = express.Router();

router.get('/', getMedicines);           // Đọc
router.post('/', createMedicine);        // Thêm
router.put('/:id', updateMedicine);      // Sửa
router.delete('/:id', deleteMedicine);   // Xóa

router.patch('/:id/import', importStock);


export default router;