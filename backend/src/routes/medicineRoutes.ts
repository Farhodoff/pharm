import express from 'express';
import { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine, getDashboardStats, updateMedicineStock } from '../controllers/medicineController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.get('/', getMedicines);
router.get('/stats', protect, getDashboardStats);
router.get('/:id', getMedicineById);

router.post('/', protect, upload.array('images', 5), createMedicine);
router.put('/:id', protect, upload.array('images', 5), updateMedicine);
router.patch('/:id/stock', protect, updateMedicineStock);
router.delete('/:id', protect, deleteMedicine);

export default router;
