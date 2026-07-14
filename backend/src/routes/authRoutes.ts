import express from 'express';
import { login, updatePassword } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/login', login);
router.post('/update-password', protect, updatePassword);

export default router;
