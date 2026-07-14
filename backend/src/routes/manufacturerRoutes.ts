import express from 'express';
import { getManufacturers, createManufacturer, updateManufacturer, deleteManufacturer } from '../controllers/manufacturerController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getManufacturers);
router.post('/', protect, createManufacturer);
router.put('/:id', protect, updateManufacturer);
router.delete('/:id', protect, deleteManufacturer);

export default router;
