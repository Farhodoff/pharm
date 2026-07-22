import express from 'express';
import {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

export default router;
