import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, Search as SearchIcon } from 'lucide-react';
import api from '../services/api';
import MedicineCard from '../components/MedicineCard';
import { useSearchStore } from '../store/useSearchStore';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, setSearchQuery } = useSearchStore();
  
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    ageLimit: searchParams.get('ageLimit') || '',
    prescriptionRequired: searchParams.get('prescriptionRequired') || '',
  });

  useEffect(() => {
    // Initial sync of URL search query to store
    const q = searchParams.get('q');
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
    
    api.get('/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.ageLimit) params.append('ageLimit', filters.ageLimit);
        if (filters.prescriptionRequired) params.append('prescriptionRequired', filters.prescriptionRequired);
        
        // Handling special query params like discount and latest if navigated from home
        if (searchParams.get('discount') === 'true') {
          // the backend doesn't have ?discount=true query yet, but we'll fetch all and filter in frontend for simplicity
        }

        const res = await api.get(`/medicines?${params.toString()}`);
        let data = res.data;

        if (searchParams.get('discount') === 'true') {
          data = data.filter((m: any) => m.discountPrice !== null);
        }

        setMedicines(data);
      } catch (error) {
        console.error('Error fetching medicines', error);
      } finally {
        setLoading(false);
      }
    };

    // Update URL params
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    if (filters.category) newParams.set('category', filters.category);
    if (searchParams.get('discount')) newParams.set('discount', 'true');
    setSearchParams(newParams, { replace: true });

    const timeoutId = setTimeout(() => {
      fetchMedicines();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      ageLimit: '',
      prescriptionRequired: '',
    });
    setSearchQuery('');
  };

  const FilterSidebar = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center space-x-2">
          <Filter size={18} />
          <span>Filterlar</span>
        </h3>
        <button onClick={resetFilters} className="text-xs text-blue-600 hover:underline font-medium">
          Tozalash
        </button>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Kategoriya</label>
        <select 
          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">Barchasi</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Narx (so'm)</label>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700"
          />
          <span className="text-slate-400">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700"
          />
        </div>
      </div>

      {/* Age Limit */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Yosh chegarasi</label>
        <select 
          className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
          value={filters.ageLimit}
          onChange={(e) => handleFilterChange('ageLimit', e.target.value)}
        >
          <option value="">Barchasi</option>
          <option value="0+">0+ (Chaqaloqlar)</option>
          <option value="3+">3+</option>
          <option value="6+">6+</option>
          <option value="12+">12+</option>
          <option value="18+">18+ (Faqat kattalar)</option>
        </select>
      </div>

      {/* Prescription */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Retsept</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" 
              name="prescription" 
              value="" 
              checked={filters.prescriptionRequired === ''}
              onChange={(e) => handleFilterChange('prescriptionRequired', e.target.value)}
              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-sm text-slate-600">Barchasi</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" 
              name="prescription" 
              value="false" 
              checked={filters.prescriptionRequired === 'false'}
              onChange={(e) => handleFilterChange('prescriptionRequired', e.target.value)}
              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-sm text-slate-600">Retseptsiz</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" 
              name="prescription" 
              value="true" 
              checked={filters.prescriptionRequired === 'true'}
              onChange={(e) => handleFilterChange('prescriptionRequired', e.target.value)}
              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-sm text-slate-600">Retsept bilan</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Qidiruv natijalari</h1>
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-700"
          >
            <SlidersHorizontal size={18} />
            <span>Filter</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            <div className="hidden md:flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-800">
                {searchQuery ? `"${searchQuery}" bo'yicha natijalar` : 'Barcha dorilar'}
              </h1>
              <span className="text-slate-500">{medicines.length} ta topildi</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>)}
              </div>
            ) : medicines.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {medicines.map((med: any) => (
                  <MedicineCard key={med.id} medicine={med} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <SearchIcon size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Hech narsa topilmadi</h2>
                <p className="text-slate-500">Boshqa so'z bilan izlab ko'ring yoki filterlarni tozalang.</p>
                <button 
                  onClick={resetFilters}
                  className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Filterlarni tozalash
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          <div className="relative w-4/5 max-w-sm bg-slate-50 h-full overflow-y-auto p-6 shadow-2xl ml-auto">
            <button 
              onClick={() => setShowMobileFilters(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 bg-slate-200 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="mt-8">
              <FilterSidebar />
            </div>
            <button 
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl mt-6 font-medium shadow-lg"
            >
              Natijalarni ko'rish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
