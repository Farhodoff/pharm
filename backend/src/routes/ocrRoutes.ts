import express from 'express';
import multer from 'multer';
import { scanPrescriptionImage } from '../controllers/ocrController';

const uploadMemory = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/scan', uploadMemory.single('image'), scanPrescriptionImage);

export default router;
