import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createAuditLog } from '../utils/auditLogger';

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const { search, category, minPrice, maxPrice, ageLimit, prescriptionRequired, page, limit } = req.query;

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
    if (prescriptionRequired !== undefined && prescriptionRequired !== '') {
      filter.prescriptionRequired = prescriptionRequired === 'true';
    }

    // Pagination
    const pageNum = page ? Math.max(1, Number(page)) : null;
    const limitNum = limit ? Math.min(100, Number(limit)) : null;
    const skip = pageNum && limitNum ? (pageNum - 1) * limitNum : undefined;

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where: filter,
        include: { category: true, manufacturer: true, images: true, reviews: { select: { rating: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum ?? undefined,
      }),
      prisma.medicine.count({ where: filter }),
    ]);

    const medicinesWithRating = medicines.map((m) => {
      const totalRating = m.reviews.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = m.reviews.length > 0 ? Number((totalRating / m.reviews.length).toFixed(1)) : 0;
      return {
        ...m,
        reviewsCount: m.reviews.length,
        averageRating,
        reviews: undefined
      };
    });

    res.json({
      data: medicinesWithRating,
      total,
      page: pageNum ?? 1,
      totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
    });
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
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!medicine) {
      res.status(404).json({ message: 'Medicine not found' });
      return;
    }

    const totalRating = medicine.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = medicine.reviews.length > 0 ? Number((totalRating / medicine.reviews.length).toFixed(1)) : 0;

    res.json({
      ...medicine,
      averageRating,
      reviewsCount: medicine.reviews.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching medicine' });
  }
};

export const getMedicineAnalogs = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: Number(id) },
      select: { id: true, activeSubstance: true, name: true },
    });

    if (!medicine || !medicine.activeSubstance) {
      res.json({ data: [] });
      return;
    }

    const analogs = await prisma.medicine.findMany({
      where: {
        activeSubstance: { contains: medicine.activeSubstance },
        id: { not: Number(id) },
      },
      include: { category: true, manufacturer: true, images: { where: { isPrimary: true }, take: 1 } },
      take: 8,
    });

    res.json({ data: analogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching medicine analogs' });
  }
};

export const getExpiryAlerts = async (_req: Request, res: Response) => {
  try {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const expiringMedicines = await prisma.medicine.findMany({
      where: {
        expiryDate: {
          not: null,
          lte: ninetyDaysFromNow,
        },
      },
      include: { category: true, manufacturer: true },
      orderBy: { expiryDate: 'asc' },
    });

    res.json({ data: expiringMedicines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching expiry alerts' });
  }
};

export const createMedicine = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const files = req.files as Express.Multer.File[];

    const sideEffects = data.sideEffects ? JSON.stringify(JSON.parse(data.sideEffects)) : undefined;
    const contraindications = data.contraindications ? JSON.stringify(JSON.parse(data.contraindications)) : undefined;

    const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

    const medicine = await prisma.medicine.create({
      data: {
        name: data.name,
        internationalName: data.internationalName,
        activeSubstance: data.activeSubstance,
        description: data.description,
        price: Number(data.price),
        discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
        wholesalePrice: data.wholesalePrice ? Number(data.wholesalePrice) : null,
        prescriptionRequired: data.prescriptionRequired === 'true' || data.prescriptionRequired === true,
        ageLimit: data.ageLimit,
        quantityInStock: Number(data.quantityInStock || 0),
        batchNumber: data.batchNumber || null,
        expiryDate: expiryDate && !isNaN(expiryDate.getTime()) ? expiryDate : null,
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        manufacturerId: data.manufacturerId ? Number(data.manufacturerId) : null,
        
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

    const adminUser = (req as any).user?.username || 'Admin';
    await createAuditLog(adminUser, 'CREATE_MEDICINE', { id: medicine.id, name: medicine.name, price: medicine.price });

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

    const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

    const updateData: any = {
      name: data.name,
      internationalName: data.internationalName,
      activeSubstance: data.activeSubstance,
      description: data.description,
      price: data.price ? Number(data.price) : undefined,
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      wholesalePrice: data.wholesalePrice ? Number(data.wholesalePrice) : null,
      prescriptionRequired: data.prescriptionRequired === 'true' || data.prescriptionRequired === true,
      ageLimit: data.ageLimit,
      quantityInStock: data.quantityInStock !== undefined ? Number(data.quantityInStock) : undefined,
      batchNumber: data.batchNumber !== undefined ? (data.batchNumber || null) : undefined,
      expiryDate: expiryDate && !isNaN(expiryDate.getTime()) ? expiryDate : null,
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      manufacturerId: data.manufacturerId ? Number(data.manufacturerId) : undefined,
    };

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

    const adminUser = (req as any).user?.username || 'Admin';
    await createAuditLog(adminUser, 'UPDATE_MEDICINE', { id: medicine.id, name: medicine.name, price: medicine.price });

    res.json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating medicine' });
  }
};

export const deleteMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await prisma.medicine.findUnique({ where: { id: Number(id) }, select: { name: true } });
    await prisma.medicine.delete({
      where: { id: Number(id) },
    });

    const adminUser = (req as any).user?.username || 'Admin';
    await createAuditLog(adminUser, 'DELETE_MEDICINE', { id: Number(id), name: existing?.name });

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

    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const expiringMedicinesCount = await prisma.medicine.count({
      where: { expiryDate: { lte: ninetyDaysFromNow, not: null } }
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
      expiringMedicinesCount,
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

    const adminUser = (req as any).user?.username || 'Admin';
    await createAuditLog(adminUser, 'UPDATE_STOCK', { id: medicine.id, name: medicine.name, newStock: medicine.quantityInStock });

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock' });
  }
};

// ===== Search Suggestions =====

export const getSearchSuggestions = async (req: Request, res: Response) => {
  const { q } = req.query;
  
  if (!q || String(q).length < 2) {
    res.json({ suggestions: [] });
    return;
  }

  try {
    const query = String(q);
    
    const [medicines, categories, manufacturers] = await Promise.all([
      prisma.medicine.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { internationalName: { contains: query } },
            { activeSubstance: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          internationalName: true,
          activeSubstance: true,
          price: true,
          discountPrice: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
        take: 8,
      }),
      prisma.category.findMany({
        where: { name: { contains: query } },
        select: { id: true, name: true },
        take: 3,
      }),
      prisma.manufacturer.findMany({
        where: { name: { contains: query } },
        select: { id: true, name: true },
        take: 3,
      }),
    ]);

    res.json({
      suggestions: {
        medicines: medicines.map(m => ({
          id: m.id,
          name: m.name,
          internationalName: m.internationalName,
          activeSubstance: m.activeSubstance,
          price: m.price,
          discountPrice: m.discountPrice,
          image: m.images[0]?.url || null,
          type: 'medicine' as const,
        })),
        categories: categories.map(c => ({
          id: c.id,
          name: c.name,
          type: 'category' as const,
        })),
        manufacturers: manufacturers.map(m => ({
          id: m.id,
          name: m.name,
          type: 'manufacturer' as const,
        })),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching suggestions' });
  }
};

export const getPopularSearches = async (_req: Request, res: Response) => {
  try {
    const popular = await prisma.searchLog.findMany({
      orderBy: { count: 'desc' },
      take: 10,
      select: { query: true, count: true },
    });
    res.json({ popularSearches: popular });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching popular searches' });
  }
};

export const logSearch = async (req: Request, res: Response) => {
  const { query } = req.body;
  
  if (!query || !String(query).trim()) {
    res.status(400).json({ message: 'Query is required' });
    return;
  }

  try {
    const q = String(query).trim().toLowerCase();
    
    const existing = await prisma.searchLog.findFirst({
      where: { query: q },
    });

    if (existing) {
      await prisma.searchLog.update({
        where: { id: existing.id },
        data: { count: { increment: 1 } },
      });
    } else {
      await prisma.searchLog.create({
        data: { query: q },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging search' });
  }
};

export const createMedicineReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userName, rating, comment } = req.body;

  if (!userName || !rating) {
    res.status(400).json({ message: 'Ism va baho kiritilishi shart' });
    return;
  }

  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: Number(id) }
    });

    if (!medicine) {
      res.status(404).json({ message: 'Dori topilmadi' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        medicineId: Number(id),
        userName: String(userName),
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: comment ? String(comment) : null,
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};

export const getMedicineReviews = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { medicineId: Number(id) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

