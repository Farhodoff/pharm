import express from 'express';
import multer from 'multer';
import {
  importMedicinesFromExcel,
  exportMedicinesToExcel,
} from '../controllers/importExportController';
import { protect } from '../middlewares/authMiddleware';

const uploadMemory = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/import', protect, uploadMemory.single('file'), importMedicinesFromExcel);
router.get('/export', protect, exportMedicinesToExcel);

export default router;
