import { useEffect, useState, useRef, useMemo } from 'react';
import { Trash2, Plus, X, Edit2, UploadCloud, Search as SearchIcon, Pill, Loader2, FileSpreadsheet, Download } from 'lucide-react';
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<MedicineFormData>(EMPTY_MEDICINE_FORM);
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelImportRef = useRef<HTMLInputElement>(null);

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

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsImporting(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/import-export/import', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.message || 'Excel muvaffaqiyatli import qilindi');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Excel importda xatolik yuz berdi');
    } finally {
      setIsImporting(false);
      if (excelImportRef.current) excelImportRef.current.value = '';
    }
  };

  const handleExcelExport = async () => {
    try {
      const response = await api.get('/import-export/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Dorilar_Baza_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel fayl yuklab olindi');
    } catch (error) {
      console.error(error);
      toast.error('Excel yuklashda xatolik');
    }
  };

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
        wholesalePrice: medicine.wholesalePrice?.toString() || '',
        prescriptionRequired: medicine.prescriptionRequired || false,
        ageLimit: medicine.ageLimit || '',
        quantityInStock: medicine.quantityInStock.toString(),
        batchNumber: medicine.batchNumber || '',
        expiryDate: medicine.expiryDate ? medicine.expiryDate.slice(0, 10) : '',
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

  // Filter logic
  const filteredMedicines = useMemo(() => {
    let result = medicines;
    if (categoryFilter) {
      result = result.filter(m => m.categoryId === Number(categoryFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.internationalName || '').toLowerCase().includes(q) ||
        (m.category?.name || '').toLowerCase().includes(q) ||
        (m.manufacturer?.name || '').toLowerCase().includes(q) ||
        (m.activeSubstance || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [medicines, searchQuery, categoryFilter]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-xl">
            <Pill size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Dorilar boshqaruvi</h3>
            <p className="text-xs text-slate-500">{medicines.length} ta dori</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={excelImportRef}
            onChange={handleExcelImport}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            onClick={() => excelImportRef.current?.click()}
            disabled={isImporting}
            className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-100 transition-all shrink-0 text-sm"
            title="Excel fayl orqali ommaviy dorilarni yuklash"
          >
            {isImporting ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
            <span>Excel Import</span>
          </button>

          <button
            onClick={handleExcelExport}
            className="flex items-center space-x-2 bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-all shrink-0 text-sm"
            title="Barcha dorilarni Excel shaklida yuklab olish"
          >
            <Download size={18} />
            <span>Excel Export</span>
          </button>

          <button onClick={() => openModal()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 shrink-0 text-sm">
            <Plus size={18} /><span>Yangi dori qo'shish</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-6 py-3 border-b border-slate-50 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Dori nomi, modda, kategoriya yoki ishlab chiqaruvchi..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
          <option value="">Barcha kategoriyalar</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dori nomi</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Kategoriya</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Ishlab chiq.</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Narxi</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Yuklanmoqda...</td></tr>
            ) : filteredMedicines.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center">
                <Pill size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500 font-medium">
                  {searchQuery || categoryFilter ? 'Qidiruv bo\'yicha dori topilmadi' : 'Dorilar yo\'q'}
                </p>
              </td></tr>
            ) : (
              filteredMedicines.map((med) => (
                <tr key={med.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img src={getImageUrl(med.images?.[0]?.url)} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 text-sm truncate">{med.name}</div>
                        <div className="text-xs text-slate-400 truncate">{med.internationalName || med.activeSubstance}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 hidden md:table-cell">
                    {med.category ? (
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-medium">{med.category.name}</span>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-sm text-slate-500 hidden lg:table-cell">{med.manufacturer?.name || '-'}</td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800">{formatPrice(med.price)}</span>
                    {med.discountPrice && (
                      <span className="ml-1 text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">-{Math.round((1 - med.discountPrice/med.price) * 100)}%</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(med)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block" title="Tahrirlash">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(med.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block" title="O'chirish">
                      <Trash2 size={16} />
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
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ulgurji narx (B2B)</label>
                        <input type="number" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleInputChange} placeholder="B2B narx" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ombordagi soni (dona) *</label>
                        <input type="number" name="quantityInStock" value={formData.quantityInStock} onChange={handleInputChange} min="0" placeholder="0" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Partiya raqami (Batch)</label>
                        <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} placeholder="B-2026-01" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Yaroqlilik muddati (Expiry)</label>
                        <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:border-blue-500" />
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
