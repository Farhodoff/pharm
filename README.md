# BIO NEX STAR — Pharmacy Web App

Professional farmasevtika ma'lumotnomasi veb-sayti.

## Tech Stack
- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (Neon.tech) / SQLite (local)
- **ORM:** Prisma

## Local Development

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# .env faylida DATABASE_URL ni o'rnating
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# .env faylida VITE_API_URL ni o'rnating
npm run dev
```

## Vercel Deployment

### Backend (Vercel)
1. [vercel.com](https://vercel.com) ga kiring va "New Project" bosing
2. GitHub repo → `backend` papkasini tanlang (Root Directory: `backend`)
3. Environment Variables qo'shing:
   - `DATABASE_URL` → Neon.tech PostgreSQL URL
   - `JWT_SECRET` → maxfiy kalit
4. Deploy bosing

### Frontend (Vercel)
1. Yana "New Project" → `frontend` papkasini tanlang (Root Directory: `frontend`)
2. Environment Variables qo'shing:
   - `VITE_API_URL` → Backend Vercel URL + `/api` (masalan: `https://your-backend.vercel.app/api`)
3. Deploy bosing

### Neon.tech (Bepul PostgreSQL)
1. [neon.tech](https://neon.tech) da ro'yxatdan o'ting
2. Yangi project yarating
3. Connection string ni nusxalab, `DATABASE_URL` ga qo'ying
4. `npx prisma migrate deploy` → bazani yarating
5. `npx prisma db seed` → boshlang'ich ma'lumotlarni kiriting

## Admin Login
- **Username:** `admin`
- **Password:** `admin123`
