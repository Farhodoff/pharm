import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import api from '../services/api';
import MedicineCard from '../components/MedicineCard';
import { useSearchStore } from '../store/useSearchStore';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [popularMedicines, setPopularMedicines] = useState([]);
  const [discountMedicines, setDiscountMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchQuery } = useSearchStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, medRes] = await Promise.all([
          api.get('/categories'),
          api.get('/medicines?limit=20')
        ]);
        setCategories(catRes.data);

        // Popular = first 4
        setPopularMedicines(medRes.data.data.slice(0, 4));

        // Discounted
        const discounted = medRes.data.data.filter((m: any) => m.discountPrice).slice(0, 4);
        setDiscountMedicines(discounted);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-slate-900 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2000')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <span className="bg-blue-600/30 text-blue-200 border border-blue-500/30 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold mb-6 backdrop-blur-sm">
            #1 Farmasevtika Ma'lumotnomasi
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            Sifatli farmasevtika <br className="hidden md:block"/> mahsulotlari
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 md:mb-10 max-w-2xl px-2">
            Kerakli dorini tez va oson toping. Barcha ma'lumotlar ishonchli manbalardan.
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative flex flex-col sm:flex-row items-center bg-transparent sm:bg-white rounded-2xl sm:rounded-full p-0 sm:p-2 shadow-none sm:shadow-2xl gap-2 sm:gap-0">
            <div className="w-full relative flex items-center bg-white rounded-full p-2 sm:p-0">
              <SearchIcon className="text-slate-400 ml-4 hidden sm:block" size={24} />
              <SearchIcon className="text-slate-400 ml-2 sm:hidden" size={20} />
              <input 
                type="text" 
                placeholder="Dori nomi, kasallik yoki modda..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-3 sm:px-4 py-2 sm:py-3 text-slate-800 bg-transparent focus:outline-none text-base sm:text-lg w-full"
              />
            </div>
            <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-3 rounded-full font-medium transition-colors mt-2 sm:mt-0">
              Qidirish
            </button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Ishonchli ma'lumot</h3>
              <p className="text-slate-500 text-sm">Barcha dorilar rasmiy tasdiqlangan.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <Truck size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Dorixonalarda mavjud</h3>
              <p className="text-slate-500 text-sm">Respublikamizdagi yirik dorixonalarda.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
              <Clock size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Tezkor izlash</h3>
              <p className="text-slate-500 text-sm">Vaqtingizni tejab, keraklisini toping.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Kategoriyalar</h2>
            <p className="text-slate-500">O'zingizga kerakli bo'limni tanlang</p>
          </div>
          <Link to="/search" className="hidden md:flex items-center space-x-2 text-blue-600 font-medium hover:underline">
            <span>Barchasini ko'rish</span>
            <ArrowRight size={18} />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((cat: any) => (
              <Link 
                key={cat.id} 
                to={`/search?category=${cat.id}`}
                className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:shadow-lg transition-all group"
              >
                <div className="bg-slate-50 p-4 rounded-full mb-4 group-hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {cat.name.charAt(0)}
                  </div>
                </div>
                <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular Medicines */}
      <section className="py-16 bg-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Mashhur Dorilar</h2>
              <p className="text-slate-500">Eng ko'p izlangan mahsulotlar</p>
            </div>
            <Link to="/search" className="flex items-center space-x-2 text-blue-600 font-medium hover:underline">
              <span>Barchasini ko'rish</span>
              <ArrowRight size={18} />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularMedicines.map((med: any) => (
                <MedicineCard key={med.id} medicine={med} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Discounted Medicines */}
      {discountMedicines.length > 0 && (
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Chegirmadagi dorilar</h2>
              <p className="text-slate-500">Maxsus narxdagi takliflar</p>
            </div>
            <Link to="/search?discount=true" className="flex items-center space-x-2 text-blue-600 font-medium hover:underline">
              <span>Barchasini ko'rish</span>
              <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {discountMedicines.map((med: any) => (
              <MedicineCard key={med.id} medicine={med} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
