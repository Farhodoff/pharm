import express from 'express';
import { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine, getDashboardStats } from '../controllers/medicineController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.get('/', getMedicines);
router.get('/stats', protect, getDashboardStats);
router.get('/:id', getMedicineById);

router.post('/', protect, upload.single('image'), createMedicine);
router.put('/:id', protect, updateMedicine);
router.delete('/:id', protect, deleteMedicine);

export default router;
