import { useEffect, useState, useMemo, useCallback } from 'react';
import { Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Search as SearchIcon, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { getImageUrl } from '../../types';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'enough'>('all');
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/medicines?limit=1000');
      setMedicines(res.data.data);
    } catch { toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateStock = async (id: number, currentStock: number, change: number) => {
    const newStock = Math.max(0, currentStock + change);
    setUpdating(id);
    try {
      await api.patch(`/medicines/${id}/stock`, { quantityInStock: newStock });
      setMedicines(prev => prev.map(m => m.id === id ? { ...m, quantityInStock: newStock } : m));
    } catch { toast.error('Xatolik yuz berdi');
    } finally { setUpdating(null); }
  };

  const filtered = useMemo(() => {
    let result = [...medicines];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.category?.name || '').toLowerCase().includes(q) ||
        (m.manufacturer?.name || '').toLowerCase().includes(q)
      );
    }
    switch (stockFilter) {
      case 'low': result = result.filter(m => m.quantityInStock > 0 && m.quantityInStock <= 10); break;
      case 'out': result = result.filter(m => m.quantityInStock === 0); break;
      case 'enough': result = result.filter(m => m.quantityInStock > 10); break;
    }
    return result.sort((a, b) => a.quantityInStock - b.quantityInStock);
  }, [medicines, searchQuery, stockFilter]);

  const lowStockThreshold = 10;
  const stats = useMemo(() => ({
    total: medicines.length,
    outOfStock: medicines.filter(m => m.quantityInStock === 0).length,
    lowStock: medicines.filter(m => m.quantityInStock > 0 && m.quantityInStock <= lowStockThreshold).length,
    enough: medicines.filter(m => m.quantityInStock > lowStockThreshold).length,
  }), [medicines]);

  const getStockBadge = (qty: number) => {
    if (qty === 0) return { label: 'Tugagan', class: 'bg-red-100 text-red-700' };
    if (qty <= lowStockThreshold) return { label: 'Kam qolgan', class: 'bg-amber-100 text-amber-700' };
    return { label: 'Yetarli', class: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-xl"><Package size={20} className="text-blue-600" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Jami</p><h4 className="text-xl font-bold text-slate-800">{stats.total}</h4></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><Package size={20} className="text-emerald-600" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Yetarli</p><h4 className="text-xl font-bold text-slate-800">{stats.enough}</h4></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2.5 rounded-xl"><AlertTriangle size={20} className="text-amber-600" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Kam</p><h4 className="text-xl font-bold text-slate-800">{stats.lowStock}</h4></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2.5 rounded-xl"><AlertTriangle size={20} className="text-red-600" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Tugagan</p><h4 className="text-xl font-bold text-slate-800">{stats.outOfStock}</h4></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-blue-500" />
            Omborxona holati
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Dori nomi, kategoriya yoki ishlab chiqaruvchi..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Barchasi' },
                { value: 'low', label: 'Kam qolgan' },
                { value: 'out', label: 'Tugagan' },
                { value: 'enough', label: 'Yetarli' },
              ].map(f => (
                <button key={f.value} onClick={() => setStockFilter(f.value as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    stockFilter === f.value ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dori nomi</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Kategoriya</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Holati</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Miqdori</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Tezkor amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Yuklanmoqda...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center">
                  <Package size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-slate-500 font-medium">{searchQuery || stockFilter !== 'all' ? 'Natija topilmadi' : 'Dorilar yo\'q'}</p>
                </td></tr>
              ) : (
                filtered.map((med) => {
                  const badge = getStockBadge(med.quantityInStock);
                  return (
                    <tr key={med.id} className={`border-b border-slate-50 transition-colors group ${
                      med.quantityInStock === 0 ? 'bg-red-50/30 hover:bg-red-50/60' :
                      med.quantityInStock <= lowStockThreshold ? 'bg-amber-50/30 hover:bg-amber-50/60' :
                      'hover:bg-slate-50/50'
                    }`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {med.images?.[0] && (
                            <img src={getImageUrl(med.images[0].url)} alt="" className="w-9 h-9 object-cover rounded-lg bg-slate-100 shrink-0" />
                          )}
                          <div>
                            <div className="font-medium text-slate-800 text-sm">{med.name}</div>
                            <div className="text-xs text-slate-400">{med.manufacturer?.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 hidden md:table-cell">{med.category?.name || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${badge.class}`}>{badge.label}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-lg font-bold text-slate-800">{med.quantityInStock}</span>
                        <span className="text-xs text-slate-400 ml-1">dona</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${
                            med.quantityInStock === 0 ? 'bg-red-500' :
                            med.quantityInStock <= lowStockThreshold ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} style={{ width: `${Math.min(100, (med.quantityInStock / 50) * 100)}%` }} />
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button onClick={() => handleUpdateStock(med.id, med.quantityInStock, -1)}
                          disabled={med.quantityInStock === 0 || updating === med.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block disabled:opacity-30 disabled:cursor-not-allowed" title="1 ta kamaytirish">
                          <ArrowDownCircle size={20} />
                        </button>
                        <button onClick={() => handleUpdateStock(med.id, med.quantityInStock, 1)}
                          disabled={updating === med.id}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-block disabled:opacity-30" title="1 ta ko'paytirish">
                          {updating === med.id ? <Loader2 size={20} className="animate-spin" /> : <ArrowUpCircle size={20} />}
                        </button>
                        <button onClick={() => handleUpdateStock(med.id, med.quantityInStock, 10)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block ml-1" title="10 ta qo'shish">
                          +10
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
