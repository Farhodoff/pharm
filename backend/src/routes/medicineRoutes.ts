import express from 'express';
import { 
  getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine, 
  getDashboardStats, updateMedicineStock, getSearchSuggestions, getPopularSearches, logSearch,
  getMedicineAnalogs, getExpiryAlerts, getMedicineReviews, createMedicineReview
} from '../controllers/medicineController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.get('/', getMedicines);
router.get('/stats', protect, getDashboardStats);
router.get('/expiry-alerts', protect, getExpiryAlerts);
router.get('/suggestions', getSearchSuggestions);
router.get('/popular-searches', getPopularSearches);
router.get('/:id', getMedicineById);
router.get('/:id/analogs', getMedicineAnalogs);
router.get('/:id/reviews', getMedicineReviews);

router.post('/', protect, upload.array('images', 5), createMedicine);
router.post('/log-search', logSearch);
router.post('/:id/reviews', createMedicineReview);
router.put('/:id', protect, upload.array('images', 5), updateMedicine);
router.patch('/:id/stock', protect, updateMedicineStock);
router.delete('/:id', protect, deleteMedicine);

export default router;
