import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-black text-blue-600 opacity-20">404</h1>
        <div className="bg-white p-8 rounded-3xl shadow-xl -mt-16 relative z-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Sahifa topilmadi</h2>
          <p className="text-slate-500 mb-8">
            Kechirasiz, siz izlayotgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center space-x-2 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <Home size={18} />
            <span>Bosh sahifaga qaytish</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
