import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const { search, category, minPrice, maxPrice, ageLimit, prescriptionRequired } = req.query;

    const filter: any = {};

    if (search) {
      filter.OR = [
        { name: { contains: String(search) } },
        { internationalName: { contains: String(search) } },
        { activeSubstance: { contains: String(search) } },
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
    const files = req.files as Express.Multer.File[];

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
        images: files && files.length > 0 ? {
          create: files.map((file, index) => ({
            url: `/uploads/${file.filename}`,
            isPrimary: index === 0
          }))
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
    const files = req.files as Express.Multer.File[];

    const sideEffects = data.sideEffects ? JSON.stringify(JSON.parse(data.sideEffects)) : undefined;
    const contraindications = data.contraindications ? JSON.stringify(JSON.parse(data.contraindications)) : undefined;

    const updateData: any = {
      name: data.name,
      internationalName: data.internationalName,
      activeSubstance: data.activeSubstance,
      description: data.description,
      price: data.price ? Number(data.price) : undefined,
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      prescriptionRequired: data.prescriptionRequired === 'true' || data.prescriptionRequired === true,
      ageLimit: data.ageLimit,
      quantityInStock: data.quantityInStock ? Number(data.quantityInStock) : 0,
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      manufacturerId: data.manufacturerId ? Number(data.manufacturerId) : undefined,
    };

    // Note: for a robust solution, we should update nested relations properly.
    // Since Prisma update with nested create/update can be tricky if they don't exist,
    // we use upsert for relations.

    const medicine = await prisma.medicine.update({
      where: { id: Number(id) },
      data: {
        ...updateData,
        details: {
          upsert: {
            create: {
              pharmacologicalGroup: data.pharmacologicalGroup,
              packageType: data.packageType,
              packageSize: data.packageSize,
            },
            update: {
              pharmacologicalGroup: data.pharmacologicalGroup,
              packageType: data.packageType,
              packageSize: data.packageSize,
            }
          }
        },
        usage: {
          upsert: {
            create: {
              usageAreas: data.usageAreas,
              adultDosage: data.adultDosage,
              childDosage: data.childDosage,
              howToUse: data.howToUse,
              timesPerDay: data.timesPerDay,
              beforeOrAfterMeal: data.beforeOrAfterMeal,
            },
            update: {
              usageAreas: data.usageAreas,
              adultDosage: data.adultDosage,
              childDosage: data.childDosage,
              howToUse: data.howToUse,
              timesPerDay: data.timesPerDay,
              beforeOrAfterMeal: data.beforeOrAfterMeal,
            }
          }
        },
        sideEffects: {
          upsert: {
            create: { effects: sideEffects },
            update: { effects: sideEffects }
          }
        },
        contraindications: {
          upsert: {
            create: { conditions: contraindications },
            update: { conditions: contraindications }
          }
        },
        storage: {
          upsert: {
            create: {
              temperature: data.temperature,
              humidity: data.humidity,
              light: data.light,
              shelfLife: data.shelfLife,
            },
            update: {
              temperature: data.temperature,
              humidity: data.humidity,
              light: data.light,
              shelfLife: data.shelfLife,
            }
          }
        },
      },
      include: { images: true }
    });

    if (files && files.length > 0) {
      await prisma.medicineImage.deleteMany({ where: { medicineId: Number(id) } });
      await prisma.medicineImage.createMany({
        data: files.map((file, index) => ({
          url: `/uploads/${file.filename}`,
          isPrimary: index === 0,
          medicineId: Number(id)
        }))
      });
    }

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

export const updateMedicineStock = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantityInStock } = req.body;
  
  try {
    const medicine = await prisma.medicine.update({
      where: { id: Number(id) },
      data: { quantityInStock: Number(quantityInStock) }
    });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock' });
  }
};
