import { useEffect, useState, useMemo } from 'react';
import { Users, Search as SearchIcon, Phone, CalendarDays, ShoppingCart, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch { toast.error('Mijozlarni yuklashda xatolik');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2.5 rounded-xl">
            <Users size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Foydalanuvchilar</h3>
            <p className="text-xs text-slate-500">{users.length} ta mijoz</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-slate-50">
        <div className="relative max-w-md">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Mijoz ismi yoki telefon raqami..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-14">ID</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mijoz</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Telefon</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Ro'yxatdan o'tgan</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Buyurtmalar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Yuklanmoqda...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center">
                <Users size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500 font-medium">
                  {searchQuery ? `"${searchQuery}" bo'yicha mijoz topilmadi` : 'Mijozlar yo\'q'}
                </p>
              </td></tr>
            ) : (
              filtered.map((u: any) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-purple-50/30 transition-colors group">
                  <td className="p-4 text-sm text-slate-400 font-mono">#{u.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {(u.name || '?')[0]}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{u.name}</div>
                        {u.address && <div className="text-xs text-slate-400">{u.address}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Phone size={13} className="text-slate-400" />
                      {u.phone}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-slate-400" />
                      {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <ShoppingCart size={14} className="text-slate-400" />
                      {u._count?.orders || 0} ta
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
