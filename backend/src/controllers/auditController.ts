import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { action, search, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (action) {
      filter.action = String(action);
    }
    if (search) {
      filter.OR = [
        { username: { contains: String(search) } },
        { action: { contains: String(search) } },
        { details: { contains: String(search) } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.auditLog.count({ where: filter }),
    ]);

    res.json({
      data: logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
};
