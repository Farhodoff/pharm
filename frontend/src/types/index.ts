// ===== Models =====

export interface Category {
  id: number;
  name: string;
  icon?: string;
  createdAt: string;
  _count?: { medicines: number };
}

export interface Manufacturer {
  id: number;
  name: string;
  country: string;
  createdAt: string;
}

export interface MedicineImage {
  id: number;
  medicineId: number;
  url: string;
  isPrimary: boolean;
}

export interface MedicineDetail {
  id: number;
  medicineId: number;
  pharmacologicalGroup?: string;
  packageType?: string;
  packageSize?: string;
}

export interface MedicineUsage {
  id: number;
  medicineId: number;
  usageAreas?: string;
  adultDosage?: string;
  childDosage?: string;
  howToUse?: string;
  timesPerDay?: string;
  beforeOrAfterMeal?: string;
}

export interface MedicineSideEffect {
  id: number;
  medicineId: number;
  effects?: string; // JSON stringified array
}

export interface MedicineContraindication {
  id: number;
  medicineId: number;
  conditions?: string; // JSON stringified array
}

export interface MedicineStorage {
  id: number;
  medicineId: number;
  temperature?: string;
  humidity?: string;
  light?: string;
  shelfLife?: string;
}

export interface Medicine {
  id: number;
  name: string;
  internationalName?: string;
  activeSubstance?: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  wholesalePrice?: number | null;
  prescriptionRequired: boolean;
  ageLimit?: string;
  quantityInStock: number;
  batchNumber?: string;
  expiryDate?: string;
  categoryId?: number;
  manufacturerId?: number;
  category?: Category;
  manufacturer?: Manufacturer;
  details?: MedicineDetail;
  usage?: MedicineUsage;
  sideEffects?: MedicineSideEffect;
  contraindications?: MedicineContraindication;
  storage?: MedicineStorage;
  images?: MedicineImage[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  adminId?: number;
  username: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// ===== Form Types =====

export interface MedicineFormData {
  name: string;
  internationalName: string;
  activeSubstance: string;
  description: string;
  price: string;
  discountPrice: string;
  wholesalePrice: string;
  prescriptionRequired: boolean;
  ageLimit: string;
  quantityInStock: string;
  batchNumber: string;
  expiryDate: string;
  categoryId: string;
  manufacturerId: string;
  pharmacologicalGroup: string;
  packageType: string;
  packageSize: string;
  usageAreas: string;
  adultDosage: string;
  childDosage: string;
  howToUse: string;
  timesPerDay: string;
  beforeOrAfterMeal: string;
  sideEffects: string;
  contraindications: string;
  temperature: string;
  humidity: string;
  light: string;
  shelfLife: string;
}

export const EMPTY_MEDICINE_FORM: MedicineFormData = {
  name: '', internationalName: '', activeSubstance: '', description: '',
  price: '', discountPrice: '', wholesalePrice: '', prescriptionRequired: false, ageLimit: '',
  quantityInStock: '', batchNumber: '', expiryDate: '', categoryId: '', manufacturerId: '',
  pharmacologicalGroup: '', packageType: '', packageSize: '',
  usageAreas: '', adultDosage: '', childDosage: '', howToUse: '',
  timesPerDay: '', beforeOrAfterMeal: '',
  sideEffects: '', contraindications: '',
  temperature: '', humidity: '', light: '', shelfLife: '',
};

// ===== Dashboard =====

export interface DashboardStats {
  totalMedicines: number;
  totalCategories: number;
  lowStockMedicines: number;
  expiringMedicinesCount?: number;
  categoryStats: Category[];
}

// ===== Helpers =====

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function getImageUrl(path?: string): string {
  if (!path) return '/placeholder-pill.svg';
  if (path.startsWith('http')) return path;
  return `${API_BASE.replace('/api', '')}${path}`;
}
