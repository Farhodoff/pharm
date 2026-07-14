import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getManufacturers = async (req: Request, res: Response) => {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(manufacturers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching manufacturers' });
  }
};

export const createManufacturer = async (req: Request, res: Response) => {
  try {
    const { name, country } = req.body;
    const manufacturer = await prisma.manufacturer.create({
      data: { name, country }
    });
    res.status(201).json(manufacturer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating manufacturer' });
  }
};

export const updateManufacturer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, country } = req.body;
    const manufacturer = await prisma.manufacturer.update({
      where: { id: Number(id) },
      data: { name, country }
    });
    res.json(manufacturer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating manufacturer' });
  }
};

export const deleteManufacturer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.manufacturer.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Manufacturer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting manufacturer' });
  }
};
