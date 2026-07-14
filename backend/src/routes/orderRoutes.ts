import express from 'express';
import { getOrders, updateOrderStatus } from '../controllers/orderController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', protect, getOrders);
router.patch('/:id/status', protect, updateOrderStatus);

export default router;
