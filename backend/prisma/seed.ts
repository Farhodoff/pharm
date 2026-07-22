import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

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
  console.log('✅ Admin created:', admin.username);

  // 2. Create Categories
  const categoriesData = [
    { name: "Og'riq qoldiruvchi", icon: 'Pill' },
    { name: 'Antibiotik', icon: 'Syringe' },
    { name: 'Vitaminlar', icon: 'Apple' },
    { name: 'Yurak dorilari', icon: 'Heart' },
    { name: 'Allergiya', icon: 'Shield' },
    { name: 'Oshqozon dorilari', icon: 'Stethoscope' },
    { name: "Sovuq qotishga qarshi", icon: 'Thermometer' },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, icon: cat.icon },
    });
    createdCategories[cat.name] = category;
  }
  console.log(`✅ ${categoriesData.length} categories created`);

  // 3. Create Manufacturers
  const manufacturersData = [
    { name: "UzFarma", country: "O'zbekiston" },
    { name: "Nobel Pharmsanoat", country: "O'zbekiston" },
    { name: "KRKA", country: "Sloveniya" },
    { name: "Sanofi", country: "Fransiya" },
    { name: "Berlin-Chemie", country: "Germaniya" },
    { name: "BIONEX STAR", country: "O'zbekiston" },
  ];

  // Delete old manufacturers (medicines are already deleted below)
  await prisma.manufacturer.deleteMany();

  const createdManufacturers: Record<string, any> = {};
  for (const m of manufacturersData) {
    const man = await prisma.manufacturer.create({ data: { name: m.name, country: m.country } });
    createdManufacturers[m.name] = man;
  }
  console.log(`✅ ${manufacturersData.length} manufacturers created\n`);

  // Helper to get random image URL
  const medicineImages = [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&q=80',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    'https://images.unsplash.com/photo-1607619056574-7b8d3ee7c2d5?w=800&q=80',
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
    'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=800&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
  ];

  // 4. Create Medicines
  const medicinesData = [
    {
      name: 'Trimol',
      internationalName: 'Paracetamol + Caffeine',
      activeSubstance: 'Paracetamol',
      description: 'Kuchli og\'riq qoldiruvchi va isitma tushiruvchi vosita. Bosh, tish va mushak og\'riqlarida samarali.',
      price: 15000,
      discountPrice: 12000,
      prescriptionRequired: false,
      ageLimit: '12+',
      quantityInStock: 250,
      category: "Og'riq qoldiruvchi",
      manufacturer: 'UzFarma',
      details: {
        pharmacologicalGroup: 'Analgetik-antipiretik',
        packageType: 'Blister',
        packageSize: '10 dona',
      },
      usage: {
        usageAreas: 'Bosh og\'rig\'i, tish og\'rig\'i, isitma, mushak og\'riqlari',
        adultDosage: '1-2 tabletkadan',
        childDosage: 'Tavsiya etilmaydi',
        howToUse: 'Ichish',
        timesPerDay: '3-4 mahal',
        beforeOrAfterMeal: 'Ovqatdan so\'ng',
      },
      sideEffects: ["Ko'ngil aynishi", 'Allergik reaksiyalar'],
      contraindications: ['Jigar yetishmovchiligi', 'Buyrak yetishmovchiligi', 'Homiladorlik'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '3 yil',
      },
    },
    {
      name: 'No-shpa',
      internationalName: 'Drotaverine',
      activeSubstance: 'Drotaverine hydrochloride',
      description: 'Spazmolitik vosita. Ichki organlar silliq mushaklarining spazmida qo\'llaniladi.',
      price: 25000,
      discountPrice: null,
      prescriptionRequired: false,
      ageLimit: '6+',
      quantityInStock: 180,
      category: "Og'riq qoldiruvchi",
      manufacturer: 'KRKA',
      details: {
        pharmacologicalGroup: 'Spazmolitik',
        packageType: 'Blister',
        packageSize: '20 dona',
      },
      usage: {
        usageAreas: 'Qorin og\'rig\'i, o\'t yo\'llari spazmi, buyrak sanchig\'i',
        adultDosage: '1-2 tabletkadan',
        childDosage: '6-12 yosh: 1 tabletkadan',
        howToUse: 'Ichish',
        timesPerDay: '2-3 mahal',
        beforeOrAfterMeal: 'Ovqatdan oldin',
      },
      sideEffects: ['Bosh aylanishi', "Ko'ngil aynishi", 'Uyquchanlik'],
      contraindications: ['Jigar yetishmovchiligi', 'Buyrak yetishmovchiligi'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '5 yil',
      },
    },
    {
      name: 'Amoksiklav',
      internationalName: 'Amoxicillin + Clavulanic acid',
      activeSubstance: 'Amoxicillin',
      description: 'Keng spektrli antibiotik. Bakterial infeksiyalarni davolashda qo\'llaniladi.',
      price: 45000,
      discountPrice: 40000,
      prescriptionRequired: true,
      ageLimit: '3+',
      quantityInStock: 120,
      category: 'Antibiotik',
      manufacturer: 'Nobel Pharmsanoat',
      details: {
        pharmacologicalGroup: 'Antibiotik (penitsillin guruhi)',
        packageType: 'Blister',
        packageSize: '15 dona',
      },
      usage: {
        usageAreas: 'Bronxit, pnevmoniya, angina, sinusit, otit',
        adultDosage: '1 tabletkadan',
        childDosage: 'Vaznga qarab hisoblanadi',
        howToUse: 'Ichish',
        timesPerDay: '2 mahal',
        beforeOrAfterMeal: 'Ovqat bilan',
      },
      sideEffects: ['Diareya', "Ko'ngil aynishi", 'Allergiya', 'Terida toshma'],
      contraindications: ['Penitsillinga allergiya', 'Jigar yetishmovchiligi'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '2 yil',
      },
    },
    {
      name: 'Azitromisin',
      internationalName: 'Azithromycin',
      activeSubstance: 'Azithromycin',
      description: 'Makrolid guruhiga mansub antibiotik. Nafas yo\'llari va teri infeksiyalarida qo\'llaniladi.',
      price: 35000,
      discountPrice: 30000,
      prescriptionRequired: true,
      ageLimit: '12+',
      quantityInStock: 90,
      category: 'Antibiotik',
      manufacturer: 'UzFarma',
      details: {
        pharmacologicalGroup: 'Antibiotik (makrolid)',
        packageType: 'Blister',
        packageSize: '6 dona',
      },
      usage: {
        usageAreas: 'Tonzillit, faringit, sinusit, bronxit, teri infeksiyalari',
        adultDosage: '1 tabletkadan (500 mg)',
        childDosage: 'Tavsiya etilmaydi',
        howToUse: 'Ichish',
        timesPerDay: '1 mahal',
        beforeOrAfterMeal: 'Ovqatdan 1 soat oldin',
      },
      sideEffects: ["Ko'ngil aynishi", "Qorinda og'riq", 'Diareya'],
      contraindications: ['Jigar yetishmovchiligi', 'Makrolidlarga allergiya'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '3 yil',
      },
    },
    {
      name: 'Vitamin C',
      internationalName: 'Ascorbic acid',
      activeSubstance: 'Ascorbic acid',
      description: 'Organizmning himoya kuchini oshiradi, immunitetni mustahkamlaydi.',
      price: 8000,
      discountPrice: 6500,
      prescriptionRequired: false,
      ageLimit: '3+',
      quantityInStock: 500,
      category: 'Vitaminlar',
      manufacturer: 'Berlin-Chemie',
      details: {
        pharmacologicalGroup: 'Vitamin',
        packageType: 'Tabletka',
        packageSize: '30 dona',
      },
      usage: {
        usageAreas: 'Immunitetni mustahkamlash, sovuq qotishning oldini olish, vitamin yetishmovchiligi',
        adultDosage: '1 tabletkadan (500 mg)',
        childDosage: '1 tabletkadan (250 mg)',
        howToUse: 'Ichish',
        timesPerDay: '1-2 mahal',
        beforeOrAfterMeal: 'Ovqatdan so\'ng',
      },
      sideEffects: ["Oshqozon bezovtaligi"],
      contraindications: ['Tromboflebit', 'Buyrak kasalliklari'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '2 yil',
      },
    },
    {
      name: 'Multivitamin kompleksi',
      internationalName: 'Multivitamin + Minerals',
      activeSubstance: 'Multi-vitamin kompleksi',
      description: 'Organizmni barcha zarur vitamin va minerallar bilan ta\'minlaydi.',
      price: 55000,
      discountPrice: 50000,
      prescriptionRequired: false,
      ageLimit: '12+',
      quantityInStock: 70,
      category: 'Vitaminlar',
      manufacturer: 'KRKA',
      details: {
        pharmacologicalGroup: 'Multivitamin',
        packageType: 'Blister',
        packageSize: '30 dona',
      },
      usage: {
        usageAreas: 'Vitamin yetishmovchiligi, charchoq, stress, ovqatlanishning noto\'g\'riligi',
        adultDosage: '1 tabletkadan',
        childDosage: '12 yoshdan: 1 tabletkadan',
        howToUse: 'Ichish',
        timesPerDay: '1 mahal',
        beforeOrAfterMeal: 'Ovqat bilan',
      },
      sideEffects: ['Allergik reaksiyalar'],
      contraindications: ['Komponentlarga yuqori sezuvchanlik'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '2 yil',
      },
    },
    {
      name: 'Cardiomagnyl',
      internationalName: 'Acetylsalicylic acid + Magnesium',
      activeSubstance: 'Acetylsalicylic acid',
      description: 'Yurak-qon tomir kasalliklarining oldini olish uchun ishlatiladi.',
      price: 32000,
      discountPrice: null,
      prescriptionRequired: true,
      ageLimit: '18+',
      quantityInStock: 60,
      category: 'Yurak dorilari',
      manufacturer: 'Nobel Pharmsanoat',
      details: {
        pharmacologicalGroup: 'Antitrombotsitar vosita',
        packageType: 'Blister',
        packageSize: '30 dona',
      },
      usage: {
        usageAreas: 'Yurak xuruji va insultning oldini olish, tromboz profilaktikasi',
        adultDosage: '1 tabletkadan',
        childDosage: 'Tavsiya etilmaydi',
        howToUse: 'Ichish',
        timesPerDay: '1 mahal',
        beforeOrAfterMeal: 'Ovqatdan so\'ng',
      },
      sideEffects: ["Oshqozon og'rig'i", "Ko'ngil aynishi", 'Qon ketish xavfi'],
      contraindications: ["Oshqozon yarasi", 'Gemofiliya', 'Homiladorlik (3-oy)'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '3 yil',
      },
    },
    {
      name: 'Captopril',
      internationalName: 'Captopril',
      activeSubstance: 'Captopril',
      description: 'Yuqori qon bosimini tushirish va yurak yetishmovchiligini davolashda qo\'llaniladi.',
      price: 18000,
      discountPrice: 15000,
      prescriptionRequired: true,
      ageLimit: '18+',
      quantityInStock: 200,
      category: 'Yurak dorilari',
      manufacturer: 'UzFarma',
      details: {
        pharmacologicalGroup: 'ACE inhibitori',
        packageType: 'Blister',
        packageSize: '40 dona',
      },
      usage: {
        usageAreas: 'Arterial gipertenziya, yurak yetishmovchiligi',
        adultDosage: '1-2 tabletkadan (25 mg)',
        childDosage: 'Tavsiya etilmaydi',
        howToUse: 'Ichish',
        timesPerDay: '2-3 mahal',
        beforeOrAfterMeal: 'Ovqatdan 1 soat oldin',
      },
      sideEffects: ['Quruq yo\'tal', 'Bosh aylanishi', "Ta'm bilishning o'zgarishi"],
      contraindications: ['Homiladorlik', "Buyrak arteriyasi stenozi", 'Anjiyoedema'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '3 yil',
      },
    },
    {
      name: 'Loratadin',
      internationalName: 'Loratadine',
      activeSubstance: 'Loratadine',
      description: 'Uzoq muddatli ta\'sirga ega antigistamin vosita. Allergik reaksiyalarni bartaraf qiladi.',
      price: 12000,
      discountPrice: 10000,
      prescriptionRequired: false,
      ageLimit: '12+',
      quantityInStock: 300,
      category: 'Allergiya',
      manufacturer: 'KRKA',
      details: {
        pharmacologicalGroup: 'Antigistamin',
        packageType: 'Blister',
        packageSize: '10 dona',
      },
      usage: {
        usageAreas: 'Allergik rinit, ürtiker, allergik dermatit, pichan isitmasi',
        adultDosage: '1 tabletkadan (10 mg)',
        childDosage: 'Tavsiya etilmaydi',
        howToUse: 'Ichish',
        timesPerDay: '1 mahal',
        beforeOrAfterMeal: 'Ovqatdan qat\'iy nazar',
      },
      sideEffects: ['Bosh og\'rig\'i', 'Uyquchanlik (kam hollarda)'],
      contraindications: ['Komponentlarga yuqori sezuvchanlik'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '3 yil',
      },
    },
    {
      name: 'Suprastin',
      internationalName: 'Chloropyramine',
      activeSubstance: 'Chloropyramine hydrochloride',
      description: 'Tez ta\'sir qiluvchi antigistamin vosita. Allergiyaning o\'tkir belgilarida qo\'llaniladi.',
      price: 14000,
      discountPrice: null,
      prescriptionRequired: false,
      ageLimit: '3+',
      quantityInStock: 150,
      category: 'Allergiya',
      manufacturer: 'Sanofi',
      details: {
        pharmacologicalGroup: 'Antigistamin',
        packageType: 'Blister',
        packageSize: '20 dona',
      },
      usage: {
        usageAreas: 'Allergik toshma, qichishish, ekzema, anafilaktik reaksiyalar',
        adultDosage: '1 tabletkadan (25 mg)',
        childDosage: '3-12 yosh: 1/2 tabletkadan',
        howToUse: 'Ichish',
        timesPerDay: '2-3 mahal',
        beforeOrAfterMeal: 'Ovqat bilan',
      },
      sideEffects: ['Uyquchanlik', 'Bosh aylanishi', 'Charchoq'],
      contraindications: ['Homiladorlik', 'Prostata adenomasi'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '5 yil',
      },
    },
    {
      name: 'Omeprazol',
      internationalName: 'Omeprazole',
      activeSubstance: 'Omeprazole',
      description: 'Oshqozon kislotaliligini kamaytiruvchi vosita. Oshqozon yarasi va reflyuksda qo\'llaniladi.',
      price: 22000,
      discountPrice: 18000,
      prescriptionRequired: true,
      ageLimit: '12+',
      quantityInStock: 110,
      category: 'Oshqozon dorilari',
      manufacturer: 'Nobel Pharmsanoat',
      details: {
        pharmacologicalGroup: 'Proton pompasi ingibitori',
        packageType: 'Blister',
        packageSize: '14 dona',
      },
      usage: {
        usageAreas: 'Oshqozon yarasi, reflyuks ezofagit, gastrit, dispepsiya',
        adultDosage: '1 kapsuladan (20 mg)',
        childDosage: 'Tavsiya etilmaydi',
        howToUse: 'Ichish',
        timesPerDay: '1 mahal',
        beforeOrAfterMeal: 'Nonushtadan oldin',
      },
      sideEffects: ['Bosh og\'rig\'i', "Qorinda og'riq", 'Ich qotishi', 'Meteorizm'],
      contraindications: ['Omeprazolga allergiya', 'Jigar yetishmovchiligi'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '2 yil',
      },
    },
    {
      name: 'Espumizan',
      internationalName: 'Simethicone',
      activeSubstance: 'Simethicone',
      description: 'Ichaklarda gaz to\'planishini kamaytiruvchi vosita. Meteorizm va qorin dam blishida samarali.',
      price: 16000,
      discountPrice: null,
      prescriptionRequired: false,
      ageLimit: '0+',
      quantityInStock: 80,
      category: 'Oshqozon dorilari',
      manufacturer: 'KRKA',
      details: {
        pharmacologicalGroup: 'Karminativ',
        packageType: 'Kapsula',
        packageSize: '25 dona',
      },
      usage: {
        usageAreas: 'Meteorizm, qorin dam blishi, operatsiyadan keyingi gaz to\'planishi',
        adultDosage: '1-2 kapsuladan (40 mg)',
        childDosage: '6 yoshdan: 1 kapsuladan',
        howToUse: 'Ichish',
        timesPerDay: '3-5 mahal',
        beforeOrAfterMeal: 'Ovqatdan so\'ng',
      },
      sideEffects: ['Allergik reaksiyalar (juda kam)'],
      contraindications: ['Ichak tutilishi', 'Komponentlarga allergiya'],
      storage: {
        temperature: '30°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '3 yil',
      },
    },
    {
      name: 'Antigrippin',
      internationalName: 'Paracetamol + Phenylephrine + Vitamin C',
      activeSubstance: 'Paracetamol',
      description: 'Sovuq qotish va gripp belgilarini kompleks davolovchi vosita.',
      price: 28000,
      discountPrice: 24000,
      prescriptionRequired: false,
      ageLimit: '12+',
      quantityInStock: 200,
      category: "Sovuq qotishga qarshi",
      manufacturer: 'UzFarma',
      details: {
        pharmacologicalGroup: 'Kompleks simptomatik vosita',
        packageType: 'Sachet',
        packageSize: '10 paket',
      },
      usage: {
        usageAreas: 'Gripp va sovuq qotish belgilari: isitma, burun bitishi, bosh og\'rig\'i',
        adultDosage: '1 paketdan',
        childDosage: 'Tavsiya etilmaydi',
        howToUse: 'Issiq suvda eritib ichish',
        timesPerDay: '3-4 mahal',
        beforeOrAfterMeal: 'Ovqatdan qat\'iy nazar',
      },
      sideEffects: ["Ko'ngil aynishi", 'Uyquchanlik', 'Bosh aylanishi'],
      contraindications: ['Homiladorlik', 'Yuqori qon bosimi', 'Jigar kasalliklari'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '2 yil',
      },
    },
    {
      name: 'Nogelment forte',
      internationalName: 'Uncaria tomentosa + Zingiber officinale',
      activeSubstance: 'Uncaria tomentosa, Zingiber officinale',
      description: 'Nogelment forte — parazitlarga qarshi, yallig\'lanishga qarshi, immunitetni kuchaytiruvchi va antioksidant ta\'sirga ega fitopreparat. Tukli unkariya va zanjabil ekstraktlarining uyg\'unligi organizmni tozalaydi, jigar va ichak faoliyatini tiklaydi.',
      price: 48000,
      discountPrice: 42000,
      prescriptionRequired: false,
      ageLimit: '1+',
      quantityInStock: 150,
      category: 'Oshqozon dorilari',
      manufacturer: 'BIONEX STAR',
      imageUrl: '/uploads/nogelment_forte.png',
      details: {
        pharmacologicalGroup: 'Antigelmint fitopreparati',
        packageType: 'Flakon (sirop)',
        packageSize: '100 ml',
      },
      usage: {
        usageAreas: 'Gelmintoz va parazitar kasalliklar, ichak disbiozi, jigar va hazm tizimi yallig\'lanishlari, immunitet pasayishi, toksikoz va intoksikatsiyalar',
        adultDosage: '5 ml dan kuniga 2 marta',
        childDosage: '5 ml dan kuniga 2 marta',
        howToUse: 'Ichish (sirop)',
        timesPerDay: '2 mahal',
        beforeOrAfterMeal: 'Ovqatdan keyin',
      },
      sideEffects: ['Kam hollarda yengil qusish hissi', 'Allergik reaksiyalar'],
      contraindications: ['Tarkibiy qismlarga yuqori sezuvchanlik'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '2 yil',
      },
    },
    {
      name: 'Immunoflan life',
      internationalName: 'Calamagrostis epigeios + Echinacea spp + Deschampsia caespitosa',
      activeSubstance: 'Calamagrostis epigeios, Echinacea spp, Deschampsia caespitosa',
      description: 'Immunoflan life — immun tizimini qo\'llab-quvvatlovchi, antivirus ta\'sirga ega bo\'lgan kompleks biologik faol qo\'shimcha.',
      price: 85000,
      discountPrice: 75000,
      prescriptionRequired: false,
      ageLimit: '0+',
      quantityInStock: 200,
      category: 'Vitaminlar',
      manufacturer: 'BIONEX STAR',
      imageUrl: '/uploads/immunoflan_life.png',
      details: {
        pharmacologicalGroup: 'Biologik faol qo\'shimcha (BFQ)',
        packageType: 'Quti (Svecha)',
        packageSize: '10 dona',
      },
      usage: {
        usageAreas: 'Organizmning viruslarga qarshi tabiiy bardoshini oshirish, shamollash, gripp va O\'RVI profilaktikasi, immun tizimini tiklash va kuchaytirish',
        adultDosage: '1-2 shamchadan kuniga',
        childDosage: '1 shamchadan kuniga',
        howToUse: 'Rektal qo\'llash',
        timesPerDay: '1-2 mahal',
        beforeOrAfterMeal: 'Ovqatdan qat\'iy nazar',
      },
      sideEffects: ['Kam hollarda yengil ich ketishi', 'Qorin sohasida bezovtalik', 'Allergik reaksiyalar'],
      contraindications: ['Tarkibiy qismlarga yuqori sezuvchanlik', 'Autoimmun kasalliklar (diabet, artrit, skleroz)'],
      storage: {
        temperature: '2-8°C atrofida',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '2 yil',
      },
    },
    {
      name: 'Artiveks forte',
      internationalName: 'Joint and Bone Supplement',
      activeSubstance: 'Glucosamine, Chondroitin, MSM',
      description: 'Artiveks forte — Bo\'g\'im va suyaklar salomatligi uchun mukammal formula. Erkin harakatlanish va bo\'g\'imlar regeneratsiyasini ta\'minlaydi.',
      price: 120000,
      discountPrice: 110000,
      prescriptionRequired: false,
      ageLimit: '18+',
      quantityInStock: 100,
      category: 'Vitaminlar',
      manufacturer: 'BIONEX STAR',
      imageUrl: '/uploads/artiveks_forte.png',
      details: {
        pharmacologicalGroup: 'Suyak va bo\'g\'imlar uchun BFQ',
        packageType: 'Quti (Tabletka)',
        packageSize: '30 dona',
      },
      usage: {
        usageAreas: 'Bo\'g\'im va suyaklar salomatligini qo\'llab-quvvatlash, erkin harakatni ta\'minlash, bo\'g\'im og\'riqlarini kamaytirish',
        adultDosage: '1 tabletkadan kuniga 1-2 marta',
        childDosage: 'Tavsiya etilmaydi',
        howToUse: 'Ichish',
        timesPerDay: '1-2 mahal',
        beforeOrAfterMeal: 'Ovqatdan keyin',
      },
      sideEffects: ['Allergik reaksiyalar', 'Kam hollarda oshqozon-ichak buzilishi'],
      contraindications: ['Tarkibiy qismlarga yuqori sezuvchanlik', 'Homiladorlik va laktatsiya davri'],
      storage: {
        temperature: '25°C gacha',
        humidity: 'Quruq joyda',
        light: 'Yorug\'likdan himoyalangan',
        shelfLife: '2 yil',
      },
    },
  ];

  // Clear existing medicines and related data to avoid duplicates on re-runs
  await prisma.medicineDetail.deleteMany();
  await prisma.medicineUsage.deleteMany();
  await prisma.medicineSideEffect.deleteMany();
  await prisma.medicineContraindication.deleteMany();
  await prisma.medicineStorage.deleteMany();
  await prisma.medicineImage.deleteMany();
  await prisma.medicine.deleteMany();

  // Each medicine gets 1-3 images for the gallery experience
  for (let i = 0; i < medicinesData.length; i++) {
    const m = medicinesData[i] as any;
    const imgUrl = m.imageUrl || medicineImages[i % medicineImages.length];

    // Pick 1-2 extra images for variety, ensuring they're different from the primary
    const extraIdx1 = (i + 3) % medicineImages.length;
    const extraIdx2 = (i + 7) % medicineImages.length;
    const extraImages = m.imageUrl ? [] : [
      { url: medicineImages[extraIdx1], isPrimary: false },
    ];
    // Add a 3rd image for some medicines
    if (!m.imageUrl && i % 2 === 0) {
      extraImages.push({ url: medicineImages[extraIdx2], isPrimary: false });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name: m.name,
        internationalName: m.internationalName,
        activeSubstance: m.activeSubstance,
        description: m.description,
        price: m.price,
        discountPrice: m.discountPrice,
        prescriptionRequired: m.prescriptionRequired,
        ageLimit: m.ageLimit,
        quantityInStock: m.quantityInStock,
        categoryId: createdCategories[m.category]?.id,
        manufacturerId: createdManufacturers[m.manufacturer]?.id,
        details: {
          create: m.details,
        },
        usage: {
          create: m.usage,
        },
        sideEffects: {
          create: {
            effects: JSON.stringify(m.sideEffects),
          },
        },
        contraindications: {
          create: {
            conditions: JSON.stringify(m.contraindications),
          },
        },
        storage: {
          create: m.storage,
        },
        images: {
          create: [
            {
              url: imgUrl,
              isPrimary: true,
            },
            ...extraImages,
          ],
        },
      },
    });

    const disc = m.discountPrice ? ` (chegirma: ${m.discountPrice} so'm)` : '';
    console.log(`   💊 ${m.name} — ${m.price.toLocaleString()} so'm${disc} [${1 + extraImages.length} rasm]`);
  }

  console.log(`\n✅ ${medicinesData.length} medicines created`);

  // Create some sample search logs for popularity
  await prisma.searchLog.deleteMany();
  const popularSearches = ['trimol', 'vitamin c', 'antibiotik', 'no-shpa', "bosh og'rig'i", 'gripp', 'allergiya', 'vitaminlar', 'captopril'];
  for (const query of popularSearches) {
    await prisma.searchLog.create({
      data: {
        query,
        count: Math.floor(Math.random() * 50) + 5,
      },
    });
  }
  console.log('✅ Popular search logs created');

  // Create initial SEO Health Articles
  await prisma.article.deleteMany();
  const sampleArticles = [
    {
      title: "Mavsumiy Gripp va Shamollashni To'g'ri Davolash Usullari",
      slug: "mavsumiy-gripp-va-shamollashni-togri-davolash",
      excerpt: "Mavsumiy shamollash va gripp belgilarida qanday dorilarni qabul qilish kerak hamda asoratlarning oldini olish yo'llari.",
      content: `
        <h2>Gripp va Shamollash O'rtasidagi Farq Nima?</h2>
        <p>Mavsum almashtirish vaqtida ko'pchilik gripp va oddiy shamollashni adashtirib qo'yishadi. Shamollash sekin-asta rivojlanadi, gripp esa birdaniga yuqori harorat (38.5°C va undan yuqori) hamda mushaklarda og'riq bilan boshlanadi.</p>
        
        <h3>Isitma Tushiruvchi Dorilarni Qachon Ichish Kerak?</h3>
        <p>Tana harorati 38.5°C dan oshganda antipiretik (paratsetamol, ibuprofen) vositalarni qabul qilish tavsiya etiladi. Ungacha organizm virusga qarshi o'zi antitanachalar ishlab chiqaradi.</p>

        <h3>Antibiotiklarni O'zboshimchalik Bilan Ichmang!</h3>
        <p>Antibiotiklar faqat bakterial infeksiyalarga ta'sir qiladi, virusli grippda antibiotiklar mutlaqo samarasiz va jigar hamda mikrobiom uchun zararli hisoblanadi.</p>
      `,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
      author: "BIO NEX STAR Bosh Farmatsevti",
      published: true,
      views: 142,
    },
    {
      title: "Vitamin C va Immunitet: Kunlik Me'yor va Foydalari",
      slug: "vitamin-c-va-immunitet-kunlik-meyor",
      excerpt: "Vitamin C nimaga kerak, organizmda uning yetishmovchiligi qanday oqibatlarga olib keladi va qanday manbalardan olish mumkin?",
      content: `
        <h2>Vitamin C (Askorbin kislotasi) Ning Asosiy Funksiyalari</h2>
        <p>Vitamin C kuchli antioksidant hisoblanadi. U kollagen sintezida, temir moddasining so'rilishida va leykotsitlar faolligini oshirishda asosiy rol o'ynaydi.</p>

        <h3>Kunlik Ehtiyoj va Dozalash</h3>
        <p>Kattalar uchun kunlik Vitamin C me'yori 75-90 mg ni tashkil qiladi. Sovuq kunlarda va shamollash profilaktikasida 500-1000 mg gacha dozalash mumkin.</p>
      `,
      image: "https://images.unsplash.com/photo-1615361200141-f45040f367be?w=800&q=80",
      author: "Dr. Alisher Vahobov",
      published: true,
      views: 98,
    },
    {
      title: "B2B Dorixonalar va Distribyutorlar Uchun Maxsus Imkoniyatlar",
      slug: "b2b-dorixonalar-va-distribyutorlar-uchun-imkoniyatlar",
      excerpt: "BIO NEX STAR bilan ulgurji shartnoma tuzish va sertifikatlangan dori vositalarini to'g'ridan-to'g'ri yetkazib berish tizimi.",
      content: `
        <h2>Ulgurji Xarid qilish Afzalliklari</h2>
        <p>Respublikamizdagi barcha dorixonalar va tibbiyot muassasalari uchun qulay B2B kabinetni taqdim etamiz. Elektron hisob-fakturalar va rasmiy kafolat bilan ulgurji narxlarga ega bo'ling.</p>
      `,
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
      author: "BIO NEX STAR B2B Bo'limi",
      published: true,
      views: 215,
    },
  ];

  for (const art of sampleArticles) {
    await prisma.article.create({ data: art });
  }
  console.log('✅ SEO Sample articles created');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('   Admin login: admin / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
