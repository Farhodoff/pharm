import { useEffect, useState } from 'react';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminManufacturers() {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentManufacturer, setCurrentManufacturer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', country: '' });

  const fetchManufacturers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/manufacturers');
      setManufacturers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const openModal = (manufacturer: any = null) => {
    if (manufacturer) {
      setCurrentManufacturer(manufacturer);
      setFormData({ name: manufacturer.name, country: manufacturer.country || '' });
    } else {
      setCurrentManufacturer(null);
      setFormData({ name: '', country: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentManufacturer) {
        await api.put(`/manufacturers/${currentManufacturer.id}`, formData);
      } else {
        await api.post('/manufacturers', formData);
      }
      closeModal();
      fetchManufacturers();
    } catch (error) {
      console.error(error);
      alert('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      try {
        await api.delete(`/manufacturers/${id}`);
        fetchManufacturers();
      } catch (error) {
        console.error(error);
        alert('Xatolik yuz berdi. Ishlab chiqaruvchiga tegishli dorilar bo\'lishi mumkin.');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Ishlab chiqaruvchilar</h3>
        <button 
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>Yangi qo'shish</span>
        </button>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600 w-16">ID</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Nomi</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Davlat</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">Yuklanmoqda...</td>
              </tr>
            ) : manufacturers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">Hech narsa topilmadi</td>
              </tr>
            ) : (
              manufacturers.map((m: any) => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-500">{m.id}</td>
                  <td className="p-4 font-medium text-slate-800">{m.name}</td>
                  <td className="p-4 text-slate-500">{m.country || '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => openModal(m)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(m.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                    >
                      <Trash2 size={18} />
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {currentManufacturer ? 'Tahrirlash' : 'Yangi qo\'shish'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomi</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Davlat</label>
                <input 
                  type="text" 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
