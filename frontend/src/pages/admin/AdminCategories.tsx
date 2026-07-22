import { useEffect, useState, useMemo } from 'react';
import { Edit2, Trash2, Plus, X, Search as SearchIcon, Tags, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', icon: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Kategoriyalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.icon || '').toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const openModal = (category: any = null) => {
    setCurrentCategory(category);
    setFormData(category ? { name: category.name, icon: category.icon || '' } : { name: '', icon: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentCategory) {
        await api.put(`/categories/${currentCategory.id}`, formData);
        toast.success('Kategoriya yangilandi');
      } else {
        await api.post('/categories', formData);
        toast.success('Kategoriya qo\'shildi');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Kategoriya o\'chirildi');
      fetchCategories();
    } catch {
      toast.error('Kategoriyada dorilar bo\'lishi mumkin');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-xl">
            <Tags size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Kategoriyalar</h3>
            <p className="text-xs text-slate-500">{categories.length} ta kategoriya</p>
          </div>
        </div>
        <button onClick={() => openModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 shrink-0">
          <Plus size={18} />
          <span>Yangi qo'shish</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-slate-50">
        <div className="relative max-w-xs">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Kategoriya qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">ID</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nomi</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Icon</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-12 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Yuklanmoqda...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-12 text-center">
                <Tags size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500 font-medium">
                  {searchQuery ? `"${searchQuery}" bo'yicha hech narsa topilmadi` : 'Kategoriyalar yo\'q'}
                </p>
              </td></tr>
            ) : (
              filtered.map((cat: any) => (
                <tr key={cat.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4 text-sm text-slate-400 font-mono">#{cat.id}</td>
                  <td className="p-4">
                    <span className="font-medium text-slate-800">{cat.name}</span>
                    {cat._count?.medicines > 0 && (
                      <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{cat._count.medicines} ta dori</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-500">{cat.icon || '-'}</td>
                  <td className="p-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block" title="Tahrirlash">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block" title="O'chirish">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Tags size={18} className="text-blue-500" />
                {currentCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomi *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Kategoriya nomi" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Icon (ixtiyoriy)</label>
                <input type="text" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Icon nomi (masalan: Heart)" />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                  Bekor qilish
                </button>
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
