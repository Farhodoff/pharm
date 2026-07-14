import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Buyurtmalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success('Holat o\'zgartirildi');
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error('Xatolik yuz berdi');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700';
      case 'DELIVERING': return 'bg-amber-100 text-amber-700';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-800">Buyurtmalar</h3>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600 w-16">ID</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Mijoz</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Sana</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Umumiy summa</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Holati</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">Holatni o'zgartirish</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">Yuklanmoqda...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">Buyurtmalar yo'q</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-500">#{o.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{o.user?.name}</div>
                    <div className="text-xs text-slate-500">{o.user?.phone}</div>
                  </td>
                  <td className="p-4 text-slate-600">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-bold text-slate-800">{formatPrice(o.totalAmount)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      value={o.status} 
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1 bg-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="NEW">NEW</option>
                      <option value="DELIVERING">DELIVERING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
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
