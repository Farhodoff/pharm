import { prisma } from '../lib/prisma';

export const createAuditLog = async (username: string, action: string, details: any, adminId?: number) => {
  try {
    await prisma.auditLog.create({
      data: {
        username: username || 'Admin',
        adminId: adminId || null,
        action,
        details: typeof details === 'string' ? details : JSON.stringify(details),
      },
    });
  } catch (error) {
    console.error('Audit log creation error:', error);
  }
};
