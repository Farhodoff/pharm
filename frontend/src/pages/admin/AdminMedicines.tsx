import { useEffect, useState } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '', internationalName: '', activeSubstance: '', description: '',
    price: '', discountPrice: '', prescriptionRequired: false, ageLimit: '',
    quantityInStock: '', categoryId: '', manufacturerId: '',
    pharmacologicalGroup: '', packageType: '', packageSize: '',
    usageAreas: '', adultDosage: '', childDosage: '', howToUse: '',
    timesPerDay: '', beforeOrAfterMeal: '',
    sideEffects: '', contraindications: '',
    temperature: '', humidity: '', light: '', shelfLife: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medRes, catRes, manRes] = await Promise.all([
        api.get('/medicines'),
        api.get('/categories'),
        api.get('/manufacturers')
      ]);
      setMedicines(medRes.data);
      setCategories(catRes.data);
      setManufacturers(manRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setFormData({
      name: '', internationalName: '', activeSubstance: '', description: '',
      price: '', discountPrice: '', prescriptionRequired: false, ageLimit: '',
      quantityInStock: '', categoryId: '', manufacturerId: '',
      pharmacologicalGroup: '', packageType: '', packageSize: '',
      usageAreas: '', adultDosage: '', childDosage: '', howToUse: '',
      timesPerDay: '', beforeOrAfterMeal: '',
      sideEffects: '', contraindications: '',
      temperature: '', humidity: '', light: '', shelfLife: '',
    });
    setFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'sideEffects' || key === 'contraindications') {
          if (formData[key]) {
            data.append(key, JSON.stringify(formData[key].split(',').map((s: string) => s.trim())));
          }
        } else {
          data.append(key, formData[key]);
        }
      });
      if (file) data.append('image', file);

      await api.post('/medicines', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      closeModal();
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      try {
        await api.delete(`/medicines/${id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-800">Dorilar boshqaruvi</h3>
        <button 
          onClick={openModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus size={18} />
          <span>Yangi dori qo'shish</span>
        </button>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Nomi</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Kategoriya</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Narxi</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Soni</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">Yuklanmoqda...</td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">Dorilar yo'q</td>
              </tr>
            ) : (
              medicines.map((med: any) => (
                <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={med.images?.[0]?.url?.startsWith('http') ? med.images[0].url : `http://localhost:4000${med.images?.[0]?.url || '/placeholder.png'}`} 
                        alt="" 
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100"
                      />
                      <div>
                        <div className="font-medium text-slate-800">{med.name}</div>
                        <div className="text-xs text-slate-500">{med.internationalName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{med.category?.name}</td>
                  <td className="p-4 font-medium text-slate-800">{formatPrice(med.price)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${med.quantityInStock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {med.quantityInStock} dona
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleDelete(med.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-4xl bg-white h-full overflow-y-auto shadow-2xl ml-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Yangi dori qo'shish</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex-grow overflow-y-auto">
              <div className="space-y-8">
                
                {/* Basic Info */}
                <section>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Asosiy ma'lumotlar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Savdo nomi *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Xalqaro nomi</label>
                      <input type="text" name="internationalName" value={formData.internationalName} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Kategoriya *</label>
                      <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" required>
                        <option value="">Tanlang</option>
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ishlab chiqaruvchi *</label>
                      <select name="manufacturerId" value={formData.manufacturerId} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" required>
                        <option value="">Tanlang</option>
                        {manufacturers.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Narx (so'm) *</label>
                      <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Chegirma narx (ixtiyoriy)</label>
                      <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Rasm yuklash</label>
                      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="w-full border border-slate-200 rounded-xl p-2 bg-slate-50 focus:border-blue-500" />
                    </div>
                  </div>
                </section>

                {/* Details */}
                <section>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Tafsilotlar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 mt-6">
                      <input type="checkbox" name="prescriptionRequired" checked={formData.prescriptionRequired} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded" />
                      <label className="text-sm font-medium text-slate-700">Retsept talab qilinadi</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Yosh chegarasi</label>
                      <input type="text" name="ageLimit" value={formData.ageLimit} onChange={handleInputChange} placeholder="Masalan: 12+" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ombor miqdori</label>
                      <input type="number" name="quantityInStock" value={formData.quantityInStock} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Batafsil tavsif</label>
                      <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500"></textarea>
                    </div>
                  </div>
                </section>

                {/* Submit */}
                <div className="pt-6 border-t border-slate-200 flex space-x-4">
                  <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                    Bekor qilish
                  </button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                    Saqlash va qo'shish
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
