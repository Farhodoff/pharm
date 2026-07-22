import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './lib/config';

import authRoutes from './routes/authRoutes';
import medicineRoutes from './routes/medicineRoutes';
import categoryRoutes from './routes/categoryRoutes';
import manufacturerRoutes from './routes/manufacturerRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes';
import auditRoutes from './routes/auditRoutes';
import articleRoutes from './routes/articleRoutes';
import importExportRoutes from './routes/importExportRoutes';
import ocrRoutes from './routes/ocrRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/admin', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/import-export', importExportRoutes);
app.use('/api/ocr', ocrRoutes);

app.get('/', (req, res) => {
  res.send('Pharmacy API is running...');
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
