import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Mijozlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-800">Mijozlar ({users.length})</h3>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600 w-16">ID</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Mijoz ism/familiyasi</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Telefon</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Ro'yxatdan o'tgan sana</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">Buyurtmalar soni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">Yuklanmoqda...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">Mijozlar topilmadi</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-500">#{u.id}</td>
                  <td className="p-4 font-medium text-slate-800">{u.name}</td>
                  <td className="p-4 text-slate-600">{u.phone}</td>
                  <td className="p-4 text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-800 text-right">{u._count?.orders || 0} ta</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
