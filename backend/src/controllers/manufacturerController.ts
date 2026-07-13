import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getManufacturers = async (req: Request, res: Response) => {
  try {
    const manufacturers = await prisma.manufacturer.findMany();
    res.json(manufacturers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching manufacturers' });
  }
};
