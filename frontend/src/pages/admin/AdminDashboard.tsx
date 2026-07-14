import { useEffect, useState } from 'react';
import { Pill, Tags, AlertTriangle, PackageSearch, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import api from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/medicines/stats'),
      api.get('/medicines?limit=1000')
    ]).then(([statsRes, medsRes]) => {
      setStats(statsRes.data);
      setMedicines(medsRes.data.data);
    });
  }, []);

  if (!stats) return <div className="p-4">Yuklanmoqda...</div>;

  const exportToExcel = () => {
    const dataToExport = medicines.map(m => ({
      ID: m.id,
      'Savdo nomi': m.name,
      'Xalqaro nomi': m.internationalName || '',
      Kategoriya: m.category?.name || '',
      'Ishlab chiqaruvchi': m.manufacturer?.name || '',
      Narx: m.price,
      Omborda: m.quantityInStock,
      'Yaroqlilik muddati': m.storage?.shelfLife || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dorilar");
    XLSX.writeFile(workbook, "Dorilar_Ro'yxati.xlsx");
  };

  const categoryChartData = stats.categoryStats.map((cat: any) => ({
    name: cat.name,
    soni: cat._count.medicines
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Boshqaruv paneli</h2>
        <button 
          onClick={exportToExcel}
          className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors w-full sm:w-auto"
        >
          <Download size={18} />
          <span>Excel ga yuklash (Dorilar)</span>
        </button>
      </div>

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
              {medicines.reduce((acc, curr) => acc + curr.quantityInStock, 0)} dona
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Kategoriya bo'yicha dorilar (Bar)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="soni" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Kategoriya bo'yicha ulush (Pie)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="soni"
                >
                  {categoryChartData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
