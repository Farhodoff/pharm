import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pharmacy_key_2026';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
       res.status(401).json({ message: 'Invalid credentials' });
       return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
       res.status(401).json({ message: 'Invalid credentials' });
       return;
    }

    const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
