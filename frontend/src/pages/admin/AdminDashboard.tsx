import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill, Tags, AlertTriangle, PackageSearch, Download, TrendingUp,
  ArrowRight, Search, BarChart3, PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import * as XLSX from 'xlsx';
import api from '../../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [popularSearches, setPopularSearches] = useState<any[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, medsRes, popularRes, alertsRes] = await Promise.all([
          api.get('/medicines/stats'),
          api.get('/medicines?limit=1000'),
          api.get('/medicines/popular-searches'),
          api.get('/medicines/expiry-alerts')
        ]);
        setStats(statsRes.data);
        setMedicines(medsRes.data.data);
        setPopularSearches(popularRes.data.popularSearches || []);
        setExpiryAlerts(alertsRes.data.data || []);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 text-sm">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const exportToExcel = () => {
    const dataToExport = medicines.map(m => ({
      ID: m.id,
      'Savdo nomi': m.name,
      'Xalqaro nomi': m.internationalName || '',
      Kategoriya: m.category?.name || '',
      'Ishlab chiqaruvchi': m.manufacturer?.name || '',
      Narx: m.price,
      Omborda: m.quantityInStock,
      'Holati': m.quantityInStock === 0 ? 'Tugagan' : m.quantityInStock <= 10 ? 'Kam qolgan' : 'Yetarli',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dorilar');
    XLSX.writeFile(workbook, `Dorilar_Ro'yxati_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const categoryChartData = (stats.categoryStats || []).map((cat: any) => ({
    name: cat.name,
    soni: cat._count?.medicines || 0,
  }));

  const totalStock = medicines.reduce((acc, curr) => acc + curr.quantityInStock, 0);
  const lowStockItems = medicines.filter(m => m.quantityInStock > 0 && m.quantityInStock <= 10).slice(0, 5);
  const outOfStockItems = medicines.filter(m => m.quantityInStock === 0).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Boshqaruv paneli</h2>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
          >
            <Download className="w-4 h-4" />
            <span>Excel hisobot</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
              <Pill className="text-blue-600 w-6 h-6" />
            </div>
            <span className="text-xs text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full font-medium">Jami</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.totalMedicines}</h3>
          <p className="text-sm text-slate-500">Dorilar soni</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-xl group-hover:bg-emerald-200 transition-colors">
              <Tags className="text-emerald-600 w-6 h-6" />
            </div>
            <span className="text-xs text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">Jami</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.totalCategories}</h3>
          <p className="text-sm text-slate-500">Kategoriyalar</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 p-3 rounded-xl group-hover:bg-indigo-200 transition-colors">
              <PackageSearch className="text-indigo-600 w-6 h-6" />
            </div>
            <span className="text-xs text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full font-medium">Omborda</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-1">{totalStock.toLocaleString()}</h3>
          <p className="text-sm text-slate-500">dona mahsulot</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-xl group-hover:bg-red-200 transition-colors">
              <AlertTriangle className="text-red-600 w-6 h-6" />
            </div>
            <span className="text-xs text-red-500 bg-red-50 px-2.5 py-1 rounded-full font-medium">Xabar</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.lowStockMedicines}</h3>
          <p className="text-sm text-slate-500">Kam qolgan dorilar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Kategoriya bo'yicha dorilar
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="soni" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-blue-500" />
            Kategoriya ulushi
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ percent }: any) => `${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="soni"
                >
                  {categoryChartData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Popular Searches + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Searches */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Eng ko'p qidirilganlar
          </h3>
          {popularSearches.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Hozircha ma'lumot yo'q</p>
          ) : (
            <div className="space-y-2">
              {popularSearches.slice(0, 8).map((item: any, i: number) => (
                <div key={item.query} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-slate-100 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{item.query}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">{item.count} marta</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Diqqat! Kam qolgan dorilar
          </h3>
          <div className="space-y-2 mb-4">
            {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">Barcha dorilar yetarli miqdorda</p>
            ) : (
              <>
                {outOfStockItems.map((m: any) => (
                  <Link key={m.id} to={`/admin/medicines`}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                      <span className="text-sm font-medium text-slate-700 truncate group-hover:text-red-700">{m.name}</span>
                    </div>
                    <span className="text-xs font-bold text-red-600 shrink-0 ml-2">Tugagan</span>
                  </Link>
                ))}
                {lowStockItems.map((m: any) => (
                  <Link key={m.id} to={`/admin/medicines`}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />
                      <span className="text-sm font-medium text-slate-700 truncate group-hover:text-amber-700">{m.name}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 shrink-0 ml-2">{m.quantityInStock} dona</span>
                  </Link>
                ))}
              </>
            )}
          </div>
          
          {/* Expiry Alerts */}
          {expiryAlerts.length > 0 && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Muddati yaqinlashgan dorilar
              </h3>
              <div className="space-y-2">
                {expiryAlerts.slice(0, 5).map((m: any) => {
                  const daysLeft = Math.ceil((new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  return (
                    <Link key={m.id} to={`/admin/medicines`}
                      className="flex items-center justify-between py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate group-hover:text-red-700">{m.name}</span>
                      </div>
                      <span className="text-xs font-bold text-red-600 shrink-0 ml-2">{daysLeft} kun qoldi</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <Link to="/admin/inventory"
            className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium hover:bg-blue-50 py-2 rounded-xl transition-colors"
          >
            Omborxona paneliga o'tish <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

