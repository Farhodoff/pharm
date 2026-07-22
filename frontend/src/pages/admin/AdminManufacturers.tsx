import { useEffect, useState, useMemo } from 'react';
import { Edit2, Trash2, Plus, X, Search as SearchIcon, Factory, Loader2, Globe } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminManufacturers() {
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', country: '' });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/manufacturers');
      setManufacturers(res.data);
    } catch { toast.error('Xatolik yuz berdi');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return manufacturers;
    const q = searchQuery.toLowerCase();
    return manufacturers.filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.country || '').toLowerCase().includes(q)
    );
  }, [manufacturers, searchQuery]);

  const openModal = (item: any = null) => {
    setCurrent(item);
    setFormData(item ? { name: item.name, country: item.country || '' } : { name: '', country: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (current) {
        await api.put(`/manufacturers/${current.id}`, formData);
        toast.success('Yangilandi');
      } else {
        await api.post('/manufacturers', formData);
        toast.success('Qo\'shildi');
      }
      setIsModalOpen(false);
      fetch();
    } catch { toast.error('Xatolik'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/manufacturers/${id}`);
      toast.success('O\'chirildi');
      fetch();
    } catch { toast.error('Ishlab chiqaruvchiga tegishli dorilar bo\'lishi mumkin'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2.5 rounded-xl">
            <Factory size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Ishlab chiqaruvchilar</h3>
            <p className="text-xs text-slate-500">{manufacturers.length} ta kompaniya</p>
          </div>
        </div>
        <button onClick={() => openModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 shrink-0">
          <Plus size={18} /><span>Yangi qo'shish</span>
        </button>
      </div>

      <div className="px-6 py-3 border-b border-slate-50">
        <div className="relative max-w-xs">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Ishlab chiqaruvchi qidirish..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">ID</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nomi</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Davlat</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-12 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Yuklanmoqda...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-12 text-center">
                <Factory size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500 font-medium">
                  {searchQuery ? `"${searchQuery}" bo'yicha hech narsa topilmadi` : 'Ishlab chiqaruvchilar yo\'q'}
                </p>
              </td></tr>
            ) : (
              filtered.map((m: any) => (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group">
                  <td className="p-4 text-sm text-slate-400 font-mono">#{m.id}</td>
                  <td className="p-4 font-medium text-slate-800">{m.name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Globe size={14} className="text-slate-400" />
                      {m.country || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block" title="Tahrirlash">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block" title="O'chirish">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Factory size={18} className="text-indigo-500" />
                {current ? 'Tahrirlash' : 'Yangi ishlab chiqaruvchi'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomi *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Davlat *</label>
                <input type="text" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" required />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors">Bekor qilish</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70">
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
