import { useEffect, useState, useMemo } from 'react';
import { ShoppingCart, Search as SearchIcon, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['NEW', 'DELIVERING', 'COMPLETED', 'CANCELLED'];

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  NEW: { label: 'Yangi', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  DELIVERING: { label: 'Yetkazilmoqda', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  COMPLETED: { label: 'Bajarilgan', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Bekor qilingan', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch { toast.error('Buyurtmalarni yuklashda xatolik');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter) result = result.filter(o => o.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        (o.user?.name || '').toLowerCase().includes(q) ||
        (o.user?.phone || '').includes(q) ||
        `#${o.id}`.includes(q)
      );
    }
    return result;
  }, [orders, searchQuery, statusFilter]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success('Holat o\'zgartirildi');
      fetchOrders();
    } catch { toast.error('Xatolik yuz berdi'); }
  };

  const ordersByStatus = useMemo(() => ({
    NEW: orders.filter(o => o.status === 'NEW').length,
    DELIVERING: orders.filter(o => o.status === 'DELIVERING').length,
    COMPLETED: orders.filter(o => o.status === 'COMPLETED').length,
    CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
  }), [orders]);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_OPTIONS.map(s => (
          <div key={s} className={`bg-white rounded-xl border ${STATUS_META[s].color.replace('text', 'border')} p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_META[s].dot}`} />
              <span className="text-2xl font-bold text-slate-800">{(ordersByStatus as any)[s]}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{STATUS_META[s].label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-500" />
            Buyurtmalar
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buyurtma ID, mijoz nomi yoki tel..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['', ...STATUS_OPTIONS].map(s => (
                <button key={s || 'all'} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {s ? (STATUS_META[s]?.label || s) : 'Barchasi'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-14">ID</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mijoz</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Sana</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Summa</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Holati</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Yuklanmoqda...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center">
                  <ShoppingCart size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-slate-500 font-medium">
                    {searchQuery || statusFilter ? 'Buyurtma topilmadi' : 'Buyurtmalar yo\'q'}
                  </p>
                </td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-mono text-slate-500">#{o.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(o.user?.name || '?')[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{o.user?.name || 'Noma\'lum'}</div>
                          <div className="text-xs text-slate-400">{o.user?.phone || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 hidden md:table-cell">
                      {new Date(o.createdAt).toLocaleDateString('uz-UZ')}
                      <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-800 text-sm">{formatPrice(o.totalAmount)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${STATUS_META[o.status]?.color || ''}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[o.status]?.dot || 'bg-slate-400'}`} />
                        {STATUS_META[o.status]?.label || o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                        ))}
                      </select>
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
