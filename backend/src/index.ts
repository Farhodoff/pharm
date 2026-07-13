import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes';
import medicineRoutes from './routes/medicineRoutes';
import categoryRoutes from './routes/categoryRoutes';
import manufacturerRoutes from './routes/manufacturerRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/admin', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/manufacturers', manufacturerRoutes);

app.get('/', (req, res) => {
  res.send('Pharmacy API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
