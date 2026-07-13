import { Request, Response } from 'express';
import { prisma } from '../index';

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const { search, category, minPrice, maxPrice, ageLimit, prescriptionRequired } = req.query;

    const filter: any = {};

    if (search) {
      filter.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { internationalName: { contains: String(search), mode: 'insensitive' } },
        { activeSubstance: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    
    if (category) filter.categoryId = Number(category);
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.gte = Number(minPrice);
      if (maxPrice) filter.price.lte = Number(maxPrice);
    }
    if (ageLimit) filter.ageLimit = String(ageLimit);
    if (prescriptionRequired !== undefined) filter.prescriptionRequired = prescriptionRequired === 'true';

    const medicines = await prisma.medicine.findMany({
      where: filter,
      include: {
        category: true,
        manufacturer: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching medicines' });
  }
};

export const getMedicineById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        manufacturer: true,
        details: true,
        usage: true,
        sideEffects: true,
        contraindications: true,
        storage: true,
        images: true,
      },
    });

    if (!medicine) {
      res.status(404).json({ message: 'Medicine not found' });
      return;
    }

    res.json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching medicine' });
  }
};

export const createMedicine = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const file = req.file;

    // Parse nested objects if sent as strings (FormData from frontend)
    const sideEffects = data.sideEffects ? JSON.stringify(JSON.parse(data.sideEffects)) : undefined;
    const contraindications = data.contraindications ? JSON.stringify(JSON.parse(data.contraindications)) : undefined;

    const medicine = await prisma.medicine.create({
      data: {
        name: data.name,
        internationalName: data.internationalName,
        activeSubstance: data.activeSubstance,
        description: data.description,
        price: Number(data.price),
        discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
        prescriptionRequired: data.prescriptionRequired === 'true' || data.prescriptionRequired === true,
        ageLimit: data.ageLimit,
        quantityInStock: Number(data.quantityInStock || 0),
        categoryId: Number(data.categoryId),
        manufacturerId: Number(data.manufacturerId),
        
        details: {
          create: {
            pharmacologicalGroup: data.pharmacologicalGroup,
            packageType: data.packageType,
            packageSize: data.packageSize,
          }
        },
        usage: {
          create: {
            usageAreas: data.usageAreas,
            adultDosage: data.adultDosage,
            childDosage: data.childDosage,
            howToUse: data.howToUse,
            timesPerDay: data.timesPerDay,
            beforeOrAfterMeal: data.beforeOrAfterMeal,
          }
        },
        sideEffects: {
          create: { effects: sideEffects }
        },
        contraindications: {
          create: { conditions: contraindications }
        },
        storage: {
          create: {
            temperature: data.temperature,
            humidity: data.humidity,
            light: data.light,
            shelfLife: data.shelfLife,
          }
        },
        images: file ? {
          create: [{ url: `/uploads/${file.filename}`, isPrimary: true }]
        } : undefined
      },
      include: { images: true }
    });

    res.status(201).json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating medicine' });
  }
};

export const updateMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = req.body;

    const medicine = await prisma.medicine.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        price: data.price ? Number(data.price) : undefined,
        quantityInStock: data.quantityInStock ? Number(data.quantityInStock) : undefined,
      },
    });

    res.json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating medicine' });
  }
};

export const deleteMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.medicine.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medicine' });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalMedicines = await prisma.medicine.count();
    const totalCategories = await prisma.category.count();
    const lowStockMedicines = await prisma.medicine.count({
      where: { quantityInStock: { lt: 10 } }
    });
    
    const categoryStats = await prisma.category.findMany({
      include: {
        _count: {
          select: { medicines: true }
        }
      }
    });

    res.json({
      totalMedicines,
      totalCategories,
      lowStockMedicines,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
}
