import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { prisma } from '../lib/prisma';
import { createAuditLog } from '../utils/auditLogger';

export const importMedicinesFromExcel = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Fayl yuklanmadi' });
      return;
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      res.status(400).json({ message: 'Excel fayl bo\'sh' });
      return;
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      const name = row['Savdo nomi'] || row['Nomi'] || row['name'];
      if (!name) continue;

      const price = Number(row['Narx'] || row['price'] || 0);
      const discountPrice = row['Chegirma narxi'] || row['discountPrice'] ? Number(row['Chegirma narxi'] || row['discountPrice']) : null;
      const wholesalePrice = row['Ulgurji narx'] || row['wholesalePrice'] ? Number(row['Ulgurji narx'] || row['wholesalePrice']) : null;
      const quantityInStock = Number(row['Omborda'] || row['quantityInStock'] || 0);
      const activeSubstance = row['Faol modda'] || row['activeSubstance'] || null;
      const internationalName = row['Xalqaro nomi'] || row['internationalName'] || null;
      const batchNumber = row['Partiya raqami'] || row['batchNumber'] ? String(row['Partiya raqami'] || row['batchNumber']) : null;
      const categoryName = row['Kategoriya'] || row['category'] || null;
      const manufacturerName = row['Ishlab chiqaruvchi'] || row['manufacturer'] || null;

      let rawExpiry = row['Yaroqlilik muddati'] || row['expiryDate'];
      let expiryDate: Date | null = null;
      if (rawExpiry) {
        const parsed = new Date(rawExpiry);
        if (!isNaN(parsed.getTime())) {
          expiryDate = parsed;
        }
      }

      // Upsert Category
      let categoryId: number | null = null;
      if (categoryName) {
        let cat = await prisma.category.findUnique({ where: { name: String(categoryName) } });
        if (!cat) {
          cat = await prisma.category.create({ data: { name: String(categoryName) } });
        }
        categoryId = cat.id;
      }

      // Upsert Manufacturer
      let manufacturerId: number | null = null;
      if (manufacturerName) {
        let man = await prisma.manufacturer.findFirst({ where: { name: String(manufacturerName) } });
        if (!man) {
          man = await prisma.manufacturer.create({ data: { name: String(manufacturerName), country: 'O\'zbekiston' } });
        }
        manufacturerId = man.id;
      }

      const existing = await prisma.medicine.findFirst({
        where: { name: String(name) },
      });

      if (existing) {
        await prisma.medicine.update({
          where: { id: existing.id },
          data: {
            internationalName,
            activeSubstance,
            price,
            discountPrice,
            wholesalePrice,
            quantityInStock,
            batchNumber,
            expiryDate,
            categoryId: categoryId || existing.categoryId,
            manufacturerId: manufacturerId || existing.manufacturerId,
          },
        });
        updatedCount++;
      } else {
        await prisma.medicine.create({
          data: {
            name: String(name),
            internationalName,
            activeSubstance,
            price,
            discountPrice,
            wholesalePrice,
            quantityInStock,
            batchNumber,
            expiryDate,
            categoryId,
            manufacturerId,
          },
        });
        createdCount++;
      }
    }

    const adminUser = (req as any).user?.username || 'Admin';
    await createAuditLog(adminUser, 'BULK_IMPORT', { createdCount, updatedCount, totalProcessed: rows.length });

    res.json({
      success: true,
      message: `${createdCount} ta yangi dori qo'shildi, ${updatedCount} ta dori yangilandi`,
      createdCount,
      updatedCount,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Excel importda xatolik yuz berdi' });
  }
};

export const exportMedicinesToExcel = async (_req: Request, res: Response) => {
  try {
    const medicines = await prisma.medicine.findMany({
      include: { category: true, manufacturer: true },
      orderBy: { id: 'asc' },
    });

    const exportData = medicines.map((m) => ({
      ID: m.id,
      'Savdo nomi': m.name,
      'Xalqaro nomi': m.internationalName || '',
      'Faol modda': m.activeSubstance || '',
      Kategoriya: m.category?.name || '',
      'Ishlab chiqaruvchi': m.manufacturer?.name || '',
      Narx: m.price,
      'Chegirma narxi': m.discountPrice || '',
      'Ulgurji narx': m.wholesalePrice || '',
      Omborda: m.quantityInStock,
      'Partiya raqami': m.batchNumber || '',
      'Yaroqlilik muddati': m.expiryDate ? m.expiryDate.toISOString().slice(0, 10) : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dorilar');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Dorilar_${new Date().toISOString().slice(0, 10)}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Excel eksportda xatolik' });
  }
};
