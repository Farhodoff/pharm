import express from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', protect, getAuditLogs);

export default router;
