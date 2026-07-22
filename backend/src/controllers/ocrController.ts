import { Request, Response } from 'express';
import { createWorker } from 'tesseract.js';
import { prisma } from '../lib/prisma';

export const scanPrescriptionImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Rasm fayli yuklanmadi' });
      return;
    }

    // Process image with Tesseract OCR (Latin + Cyrillic English/Uzbek/Russian)
    const worker = await createWorker('eng+rus');
    const { data: { text } } = await worker.recognize(file.buffer);
    await worker.terminate();

    const cleanText = text.trim();
    if (!cleanText) {
      res.json({ text: '', medicines: [] });
      return;
    }

    // Split words with length >= 3 to search for medicine matches
    const words = Array.from(new Set(
      cleanText
        .split(/[\s,.\-\n\r]+/)
        .map(w => w.replace(/[^a-zA-Zа-яА-Я0-9]/g, ''))
        .filter(w => w.length >= 3)
    ));

    const ORConditions: any[] = [];
    words.forEach(word => {
      ORConditions.push({ name: { contains: word } });
      ORConditions.push({ activeSubstance: { contains: word } });
      ORConditions.push({ internationalName: { contains: word } });
    });

    let matchedMedicines: any[] = [];
    if (ORConditions.length > 0) {
      matchedMedicines = await prisma.medicine.findMany({
        where: { OR: ORConditions },
        include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
        take: 10,
      });
    }

    res.json({
      extractedText: cleanText,
      detectedKeywords: words.slice(0, 15),
      medicines: matchedMedicines,
    });
  } catch (error) {
    console.error('OCR scanning error:', error);
    res.status(500).json({ message: 'Rasmdan matn o\'qishda xatolik' });
  }
};
