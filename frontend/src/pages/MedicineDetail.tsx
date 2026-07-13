import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, AlertCircle, ShieldAlert, Tag, Package, Box } from 'lucide-react';
import api from '../services/api';
import { formatPrice } from '../utils/format';

export default function MedicineDetail() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tavsif');

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await api.get(`/medicines/${id}`);
        setMedicine(res.data);
      } catch (error) {
        console.error('Error fetching medicine details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  if (loading) {
    return <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">Yuklanmoqda...</div>;
  }

  if (!medicine) {
    return <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">Dori topilmadi.</div>;
  }

  const primaryImage = medicine.images?.find((img: any) => img.isPrimary)?.url || '/placeholder-pill.png';

  const tabs = [
    { id: 'tavsif', label: 'Tavsif' },
    { id: 'qollash', label: 'Qo\'llash sohasi' },
    { id: 'dozalash', label: 'Dozalash' },
    { id: 'qarshi', label: 'Qarshi ko\'rsatmalar' },
    { id: 'yon', label: 'Yon ta\'sirlari' },
    { id: 'saqlash', label: 'Saqlash' },
  ];

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4">
        
        <Link to={-1 as any} className="inline-flex items-center space-x-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span>Orqaga</span>
        </Link>

        {/* Top Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
            {/* Image */}
            <div className="lg:col-span-2 bg-slate-100 p-8 flex items-center justify-center">
              <img 
                src={primaryImage.startsWith('http') ? primaryImage : `http://localhost:4000${primaryImage}`} 
                alt={medicine.name} 
                className="max-h-96 object-contain mix-blend-multiply drop-shadow-xl"
              />
            </div>

            {/* Info */}
            <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold uppercase flex items-center space-x-1">
                  <Tag size={12} />
                  <span>{medicine.category?.name}</span>
                </span>
                {medicine.prescriptionRequired && (
                  <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-xs font-semibold uppercase flex items-center space-x-1">
                    <ShieldAlert size={12} />
                    <span>Retsept talab qilinadi</span>
                  </span>
                )}
                {medicine.ageLimit && (
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {medicine.ageLimit} yosh
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-2">{medicine.name}</h1>
              <p className="text-lg text-slate-500 mb-6">{medicine.internationalName}</p>

              <div className="bg-slate-50 p-4 rounded-2xl mb-8 flex items-center space-x-4 border border-slate-100">
                <AlertCircle className="text-blue-500 shrink-0" size={24} />
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold block text-slate-800">Faol modda:</span> 
                  {medicine.activeSubstance}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <span className="block text-sm text-slate-400 mb-1">Narxi</span>
                  {medicine.discountPrice ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-blue-600">{formatPrice(medicine.discountPrice)}</span>
                      <span className="text-lg text-slate-400 line-through">{formatPrice(medicine.price)}</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-slate-800">{formatPrice(medicine.price)}</span>
                  )}
                </div>
                <div>
                  <span className="block text-sm text-slate-400 mb-1">Mavjudlik</span>
                  <span className={`text-lg font-bold ${medicine.quantityInStock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {medicine.quantityInStock > 0 ? 'Omborda mavjud' : 'Vaqtinchalik yo\'q'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 border-t border-slate-100 pt-6">
                <div className="flex items-center space-x-2">
                  <Building2 size={16} className="text-slate-400" />
                  <span>{medicine.manufacturer?.name} ({medicine.manufacturer?.country})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package size={16} className="text-slate-400" />
                  <span>{medicine.details?.packageType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Box size={16} className="text-slate-400" />
                  <span>{medicine.details?.packageSize}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 lg:p-10">
            {activeTab === 'tavsif' && (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Dori vositasi haqida</h3>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{medicine.description || "Ma'lumot kiritilmagan"}</p>
                
                {medicine.details?.pharmacologicalGroup && (
                  <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100 inline-block">
                    <span className="font-semibold text-slate-800 block mb-1">Farmakologik guruh:</span>
                    <span className="text-slate-600">{medicine.details.pharmacologicalGroup}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'qollash' && (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Qo'llanilishi</h3>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{medicine.usage?.usageAreas || "Ma'lumot kiritilmagan"}</p>
              </div>
            )}

            {activeTab === 'dozalash' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Qabul qilish tartibi</h3>
                  <ul className="space-y-4">
                    <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="block text-sm font-semibold text-blue-600 mb-1">Qanday ichiladi</span>
                      <span className="text-slate-700">{medicine.usage?.howToUse || "-"}</span>
                    </li>
                    <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="block text-sm font-semibold text-blue-600 mb-1">Kunlik me'yor</span>
                      <span className="text-slate-700">{medicine.usage?.timesPerDay || "-"}</span>
                    </li>
                    <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="block text-sm font-semibold text-blue-600 mb-1">Ovqatlanish bilan bog'liqligi</span>
                      <span className="text-slate-700">{medicine.usage?.beforeOrAfterMeal || "-"}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Yosh bo'yicha dozalash</h3>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="block font-bold text-slate-800 mb-2">Kattalar uchun</span>
                      <p className="text-slate-600">{medicine.usage?.adultDosage || "-"}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="block font-bold text-slate-800 mb-2">Bolalar uchun</span>
                      <p className="text-slate-600">{medicine.usage?.childDosage || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'qarshi' && (
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
                  <ShieldAlert className="text-red-500" />
                  <span>Qarshi ko'rsatmalar</span>
                </h3>
                {medicine.contraindications?.conditions ? (
                  <ul className="list-disc list-inside space-y-2 text-slate-600 bg-red-50 p-6 rounded-2xl border border-red-100">
                    {JSON.parse(medicine.contraindications.conditions).map((cond: string, i: number) => (
                      <li key={i}>{cond}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">Ma'lumot kiritilmagan</p>
                )}
              </div>
            )}

            {activeTab === 'yon' && (
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
                  <AlertCircle className="text-yellow-500" />
                  <span>Nojo'ya ta'sirlari</span>
                </h3>
                {medicine.sideEffects?.effects ? (
                  <ul className="list-disc list-inside space-y-2 text-slate-600 bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                    {JSON.parse(medicine.sideEffects.effects).map((eff: string, i: number) => (
                      <li key={i}>{eff}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">Ma'lumot kiritilmagan</p>
                )}
              </div>
            )}

            {activeTab === 'saqlash' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-sm text-slate-400 mb-2">Harorat</span>
                  <span className="font-bold text-slate-800">{medicine.storage?.temperature || "-"}</span>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-sm text-slate-400 mb-2">Namlik</span>
                  <span className="font-bold text-slate-800">{medicine.storage?.humidity || "-"}</span>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-sm text-slate-400 mb-2">Yorug'lik</span>
                  <span className="font-bold text-slate-800">{medicine.storage?.light || "-"}</span>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-sm text-slate-400 mb-2">Yaroqlilik muddati</span>
                  <span className="font-bold text-blue-600">{medicine.storage?.shelfLife || "-"}</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
