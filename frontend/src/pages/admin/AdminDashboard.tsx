import { useEffect, useState } from 'react';
import { Pill, Tags, AlertTriangle, PackageSearch } from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/medicines/stats').then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="p-4">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <Pill size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Jami dorilar</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalMedicines}</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600">
            <Tags size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Kategoriyalar soni</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalCategories}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-indigo-100 p-4 rounded-xl text-indigo-600">
            <PackageSearch size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Ombordagi mahsulotlar</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {/* Total stock count could be sum, using total medicines for demo */}
              Ko'p
            </h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-red-100 p-4 rounded-xl text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Kam qolganlar</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.lowStockMedicines}</h3>
          </div>
        </div>
      </div>

      {/* Basic Chart/Table representation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Kategoriya bo'yicha dorilar</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats.categoryStats.map((cat: any) => (
              <div key={cat.id} className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">{cat.name}</span>
                <div className="flex items-center space-x-4 flex-grow ml-4">
                  <div className="h-2 bg-slate-100 rounded-full flex-grow overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" 
                      style={{ width: `${Math.min((cat._count.medicines / (stats.totalMedicines || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-slate-800 w-8 text-right">{cat._count.medicines}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
