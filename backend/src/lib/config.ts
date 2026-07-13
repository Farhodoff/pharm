import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'super_secret_pharmacy_key_2026',
  jwtExpiresIn: '1d',
};
