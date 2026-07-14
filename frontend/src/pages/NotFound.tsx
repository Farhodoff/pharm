import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Pill } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="text-center max-w-lg w-full">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[160px] sm:text-[200px] font-black text-blue-600/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-blue-100 flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-2xl mb-3">
                <Pill size={40} className="text-blue-600" />
              </div>
              <span className="text-sm font-bold text-blue-600 tracking-widest uppercase">
                Sahifa topilmadi
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Voy! Bu yerda hech narsa yo'q 🔍
          </h2>
          <p className="text-slate-500 text-base leading-relaxed">
            Siz izlayotgan sahifa mavjud emas, o'chirilgan yoki URL manzili noto'g'ri kiritilgan bo'lishi mumkin.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-medium hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            <ArrowLeft size={18} />
            <span>Orqaga qaytish</span>
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
          >
            <Home size={18} />
            <span>Bosh sahifaga</span>
          </Link>
          <Link
            to="/search"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
          >
            <Search size={18} />
            <span>Dori qidirish</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
