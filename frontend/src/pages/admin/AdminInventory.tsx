import { useEffect, useState } from 'react';
import { Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import api from '../../services/api';
import { getImageUrl } from '../../types';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/medicines?limit=1000');
      setMedicines(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStock = async (id: number, currentStock: number, change: number) => {
    const newStock = currentStock + change;
    if (newStock < 0) return;

    try {
      await api.patch(`/medicines/${id}/stock`, { quantityInStock: newStock });
      toast.success('Ombor yangilandi');
      setMedicines(medicines.map(m => m.id === id ? { ...m, quantityInStock: newStock } : m));
    } catch (error) {
      console.error(error);
      toast.error('Xatolik yuz berdi');
    }
  };

  const lowStockThreshold = 10;
  const outOfStock = medicines.filter(m => m.quantityInStock === 0).length;
  const lowStock = medicines.filter(m => m.quantityInStock > 0 && m.quantityInStock <= lowStockThreshold).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Jami dorilar turi</p>
            <h4 className="text-2xl font-bold text-slate-800">{medicines.length}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Kam qolgan dorilar</p>
            <h4 className="text-2xl font-bold text-slate-800">{lowStock}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tugagan dorilar</p>
            <h4 className="text-2xl font-bold text-slate-800">{outOfStock}</h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800">Omborxona holati</h3>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">Dori nomi</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Kategoriya</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Holati</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Ombordagi miqdori</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Tezkor amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">Yuklanmoqda...</td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">Dorilar yo'q</td>
                </tr>
              ) : (
                // Sort by stock quantity ascending
                [...medicines].sort((a, b) => a.quantityInStock - b.quantityInStock).map((med) => (
                  <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={getImageUrl(med.images?.[0]?.url)} 
                          alt="" 
                          className="w-10 h-10 object-cover rounded-lg bg-slate-100"
                        />
                        <div>
                          <div className="font-medium text-slate-800">{med.name}</div>
                          <div className="text-xs text-slate-500">{med.manufacturer?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{med.category?.name}</td>
                    <td className="p-4">
                      {med.quantityInStock === 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">Tugagan</span>
                      ) : med.quantityInStock <= lowStockThreshold ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">Kam qolgan</span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">Yetarli</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-800 text-lg">
                      {med.quantityInStock} <span className="text-sm text-slate-500 font-normal">dona</span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleUpdateStock(med.id, med.quantityInStock, -1)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                        title="1 ta ayirish"
                      >
                        <ArrowDownCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStock(med.id, med.quantityInStock, 1)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-block"
                        title="1 ta qo'shish"
                      >
                        <ArrowUpCircle size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
