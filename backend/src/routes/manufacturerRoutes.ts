import express from 'express';
import { getManufacturers } from '../controllers/manufacturerController';

const router = express.Router();

router.get('/', getManufacturers);

export default router;
