import { useEffect, useState, useMemo } from 'react';
import { History, Search as SearchIcon, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../../services/api';
import type { AuditLog } from '../../types';
import toast from 'react-hot-toast';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs?limit=100');
      setLogs(res.data.data);
    } catch {
      toast.error('Audit loglarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (actionFilter) {
      result = result.filter(l => l.action === actionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.username.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, searchQuery, actionFilter]);

  const getActionBadge = (action: string) => {
    if (action.startsWith('CREATE')) return 'bg-emerald-100 text-emerald-700';
    if (action.startsWith('UPDATE')) return 'bg-blue-100 text-blue-700';
    if (action.startsWith('DELETE')) return 'bg-red-100 text-red-700';
    if (action.startsWith('BULK')) return 'bg-purple-100 text-purple-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2.5 rounded-xl">
            <History size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Admin Harakatlar Tarixi (Audit Logs)</h3>
            <p className="text-xs text-slate-500">Tizimdagi adminlar tomonidan amalga oshirilgan barcha o'zgarishlar</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-2 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Admin nomi, harakat yoki tafsilotlarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Barcha harakatlar</option>
          <option value="CREATE_MEDICINE">Dori qo'shish</option>
          <option value="UPDATE_MEDICINE">Dori tahrirlash</option>
          <option value="DELETE_MEDICINE">Dori o'chirish</option>
          <option value="UPDATE_STOCK">Ombor yangilash</option>
          <option value="BULK_IMPORT">Excel Import</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">ID</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Harakat (Action)</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tafsilotlar</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Vaqti</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Yuklanmoqda...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center">
                <ShieldAlert size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500 font-medium">Harakatlar tarixi topilmadi</p>
              </td></tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-mono text-slate-400">#{log.id}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800 text-sm">{log.username}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-600 max-w-md truncate">
                    {log.details}
                  </td>
                  <td className="p-4 text-right text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleString('uz-UZ')}
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
