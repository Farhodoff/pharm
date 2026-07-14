import { useEffect, useState, useRef } from 'react';
import { Trash2, Plus, X, Edit2, UploadCloud } from 'lucide-react';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';
import type { Medicine, Category, Manufacturer, MedicineFormData } from '../../types';
import { EMPTY_MEDICINE_FORM, getImageUrl } from '../../types';
import toast from 'react-hot-toast';

type TabType = 'basic' | 'usage' | 'effects' | 'images';

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<MedicineFormData>(EMPTY_MEDICINE_FORM);
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medRes, catRes, manRes] = await Promise.all([
        api.get('/medicines?limit=1000'),
        api.get('/categories'),
        api.get('/manufacturers')
      ]);
      setMedicines(medRes.data.data);
      setCategories(catRes.data);
      setManufacturers(manRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (medicine?: Medicine) => {
    if (medicine) {
      setCurrentMedicine(medicine);
      setFormData({
        name: medicine.name || '',
        internationalName: medicine.internationalName || '',
        activeSubstance: medicine.activeSubstance || '',
        description: medicine.description || '',
        price: medicine.price.toString(),
        discountPrice: medicine.discountPrice?.toString() || '',
        prescriptionRequired: medicine.prescriptionRequired || false,
        ageLimit: medicine.ageLimit || '',
        quantityInStock: medicine.quantityInStock.toString(),
        categoryId: medicine.categoryId?.toString() || '',
        manufacturerId: medicine.manufacturerId?.toString() || '',
        pharmacologicalGroup: medicine.details?.pharmacologicalGroup || '',
        packageType: medicine.details?.packageType || '',
        packageSize: medicine.details?.packageSize || '',
        usageAreas: medicine.usage?.usageAreas || '',
        adultDosage: medicine.usage?.adultDosage || '',
        childDosage: medicine.usage?.childDosage || '',
        howToUse: medicine.usage?.howToUse || '',
        timesPerDay: medicine.usage?.timesPerDay || '',
        beforeOrAfterMeal: medicine.usage?.beforeOrAfterMeal || '',
        sideEffects: medicine.sideEffects?.effects ? JSON.parse(medicine.sideEffects.effects).join(', ') : '',
        contraindications: medicine.contraindications?.conditions ? JSON.parse(medicine.contraindications.conditions).join(', ') : '',
        temperature: medicine.storage?.temperature || '',
        humidity: medicine.storage?.humidity || '',
        light: medicine.storage?.light || '',
        shelfLife: medicine.storage?.shelfLife || '',
      });
    } else {
      setCurrentMedicine(null);
      setFormData(EMPTY_MEDICINE_FORM);
    }
    setFiles([]);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof MedicineFormData];
        if (key === 'sideEffects' || key === 'contraindications') {
          if (value && typeof value === 'string') {
            data.append(key, JSON.stringify(value.split(',').map(s => s.trim())));
          }
        } else {
          data.append(key, String(value));
        }
      });
      
      files.forEach(file => {
        data.append('images', file);
      });

      if (currentMedicine) {
        await api.put(`/medicines/${currentMedicine.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Dori muvaffaqiyatli yangilandi');
      } else {
        await api.post('/medicines', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Dori muvaffaqiyatli qo\'shildi');
      }
      
      closeModal();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      try {
        await api.delete(`/medicines/${id}`);
        toast.success('Dori o\'chirildi');
        fetchData();
      } catch (error) {
        console.error(error);
        toast.error('O\'chirishda xatolik');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'basic', label: 'Asosiy ma\'lumotlar' },
    { id: 'usage', label: 'Qo\'llash va Saqlash' },
    { id: 'effects', label: 'Nojo\'ya ta\'sirlari' },
    { id: 'images', label: 'Rasmlar' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-800">Dorilar boshqaruvi</h3>
        <button 
          onClick={() => openModal()}
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
              <th className="p-4 text-sm font-semibold text-slate-600">Ishlab chiqaruvchi</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Narxi</th>
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
              medicines.map((med) => (
                <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getImageUrl(med.images?.[0]?.url)} 
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
                  <td className="p-4 text-slate-600">{med.manufacturer?.name}</td>
                  <td className="p-4 font-medium text-slate-800">{formatPrice(med.price)}</td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => openModal(med)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                      title="Tahrirlash"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(med.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                      title="O'chirish"
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
            <div className="flex flex-col border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center justify-between p-6 pb-2">
                <h3 className="text-xl font-bold text-slate-800">
                  {currentMedicine ? 'Dorini tahrirlash' : 'Yangi dori qo\'shish'}
                </h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X size={24} />
                </button>
              </div>
              {/* Tabs */}
              <div className="flex px-6 space-x-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
              <div className="p-6 flex-grow overflow-y-auto">
                
                {/* BASIC INFO TAB */}
                {activeTab === 'basic' && (
                  <div className="space-y-6 animate-in fade-in">
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
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ishlab chiqaruvchi *</label>
                        <select name="manufacturerId" value={formData.manufacturerId} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" required>
                          <option value="">Tanlang</option>
                          {manufacturers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
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
                      <div className="flex items-center space-x-2 mt-6">
                        <input type="checkbox" name="prescriptionRequired" checked={formData.prescriptionRequired} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded" />
                        <label className="text-sm font-medium text-slate-700">Retsept talab qilinadi</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Yosh chegarasi</label>
                        <input type="text" name="ageLimit" value={formData.ageLimit} onChange={handleInputChange} placeholder="Masalan: 12+" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Faol modda</label>
                        <input type="text" name="activeSubstance" value={formData.activeSubstance} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Batafsil tavsif</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500"></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {/* USAGE AND STORAGE TAB */}
                {activeTab === 'usage' && (
                  <div className="space-y-6 animate-in fade-in">
                    <h4 className="font-semibold text-slate-800">Qo'llash usuli va dozalari</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Qo'llash sohalari (Usage Areas)</label>
                        <input type="text" name="usageAreas" value={formData.usageAreas} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kattalar uchun doza</label>
                        <input type="text" name="adultDosage" value={formData.adultDosage} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bolalar uchun doza</label>
                        <input type="text" name="childDosage" value={formData.childDosage} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Qanday qabul qilinadi</label>
                        <input type="text" name="howToUse" value={formData.howToUse} onChange={handleInputChange} placeholder="Masalan: Ichishga" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ovqatdan oldin/keyin</label>
                        <select name="beforeOrAfterMeal" value={formData.beforeOrAfterMeal} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500">
                          <option value="">Tanlang</option>
                          <option value="Ovqatdan oldin">Ovqatdan oldin</option>
                          <option value="Ovqatdan keyin">Ovqatdan keyin</option>
                          <option value="Ovqatlanish vaqtida">Ovqatlanish vaqtida</option>
                          <option value="Ovqatlanishga bog'liq emas">Ovqatlanishga bog'liq emas</option>
                        </select>
                      </div>
                    </div>

                    <h4 className="font-semibold text-slate-800 pt-4 border-t border-slate-100">Saqlash sharoitlari</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Harorat</label>
                        <input type="text" name="temperature" value={formData.temperature} onChange={handleInputChange} placeholder="Masalan: 2°C dan 8°C gacha" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Yaroqlilik muddati (Shelf Life)</label>
                        <input type="text" name="shelfLife" value={formData.shelfLife} onChange={handleInputChange} placeholder="Masalan: 2 yil" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                )}

                {/* EFFECTS AND CONTRAINDICATIONS TAB */}
                {activeTab === 'effects' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nojo'ya ta'sirlari (vergul bilan ajrating)</label>
                      <textarea name="sideEffects" value={formData.sideEffects} onChange={handleInputChange} rows={3} placeholder="Bosh og'rig'i, ko'ngil aynishi..." className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Qo'llash mumkin bo'lmagan holatlar (vergul bilan)</label>
                      <textarea name="contraindications" value={formData.contraindications} onChange={handleInputChange} rows={3} placeholder="Homiladorlik, buyrak yetishmovchiligi..." className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Farmakologik guruhi</label>
                      <input type="text" name="pharmacologicalGroup" value={formData.pharmacologicalGroup} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                    </div>
                  </div>
                )}

                {/* IMAGES TAB */}
                {activeTab === 'images' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div 
                      className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud size={48} className="text-slate-400 mb-4" />
                      <p className="text-slate-600 font-medium mb-1">Rasmlarni yuklash uchun bosing</p>
                      <p className="text-slate-400 text-sm">PNG, JPG (Maksimum 5 ta)</p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        multiple
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-slate-700 mb-2">Tanlangan rasmlar:</h5>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {files.map((file, idx) => (
                            <div key={idx} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                              {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center font-bold">Asosiy</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentMedicine && currentMedicine.images && currentMedicine.images.length > 0 && files.length === 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-slate-700 mb-2">Joriy rasmlar:</h5>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {currentMedicine.images.map((img: any) => (
                            <div key={img.id} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                              <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                              {img.isPrimary && <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center font-bold">Asosiy</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
              
              {/* Form Actions */}
              <div className="p-6 border-t border-slate-200 bg-white flex space-x-4 shrink-0">
                <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                  {currentMedicine ? 'O\'zgarishlarni saqlash' : 'Saqlash va qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
