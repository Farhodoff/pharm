import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: { medicine: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
};
