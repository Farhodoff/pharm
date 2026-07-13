import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
    },
  });
  console.log('Admin created:', admin.username);

  // 2. Create Categories
  const categoriesData = [
    { name: 'Og\'riq qoldiruvchi', icon: 'Pill' },
    { name: 'Antibiotik', icon: 'Syringe' },
    { name: 'Vitaminlar', icon: 'Apple' },
    { name: 'Yurak dorilari', icon: 'Heart' },
    { name: 'Allergiya', icon: 'Shield' },
  ];

  const createdCategories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, icon: cat.icon },
    });
    createdCategories.push(category);
  }
  console.log('Categories created');

  // 3. Create Manufacturer
  const manufacturer = await prisma.manufacturer.create({
    data: {
      name: 'UzFarma',
      country: 'O\'zbekiston',
    },
  });
  console.log('Manufacturer created:', manufacturer.name);

  // 4. Create sample medicine
  const medicine = await prisma.medicine.create({
    data: {
      name: 'Trimol',
      internationalName: 'Paracetamol + Caffeine',
      activeSubstance: 'Paracetamol',
      description: 'Kuchli og\'riq qoldiruvchi vosita',
      price: 15000,
      discountPrice: 12000,
      prescriptionRequired: false,
      ageLimit: '12+',
      quantityInStock: 100,
      categoryId: createdCategories[0].id,
      manufacturerId: manufacturer.id,
      details: {
        create: {
          pharmacologicalGroup: 'Analgetik',
          packageType: 'Blister',
          packageSize: '10 dona',
        },
      },
      usage: {
        create: {
          usageAreas: 'Bosh og\'rig\'i, tish og\'rig\'i',
          adultDosage: '1 ta tabletkadan',
          childDosage: 'Tavsiya etilmaydi',
          howToUse: 'Ichish',
          timesPerDay: '3 mahal',
          beforeOrAfterMeal: 'Ovqatdan so\'ng',
        },
      },
      sideEffects: {
        create: {
          effects: JSON.stringify(['Ko\'ngil aynishi', 'Allergiya']),
        },
      },
      contraindications: {
        create: {
          conditions: JSON.stringify(['Jigar kasalliklari', 'Homiladorlik']),
        },
      },
      storage: {
        create: {
          temperature: '25°C gacha',
          humidity: 'Quruq joyda',
          light: 'Yorug\'likdan himoyalangan',
          shelfLife: '3 yil',
        },
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
            isPrimary: true,
          }
        ]
      }
    },
  });
  console.log('Medicine created:', medicine.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
