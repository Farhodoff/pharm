import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, AlertCircle, ShieldAlert, Tag, Package, Box, Expand } from 'lucide-react';
import api from '../services/api';
import { formatPrice } from '../utils/format';
import type { Medicine } from '../types';
import { getImageUrl } from '../types';
import ImageLightbox from '../components/ImageLightbox';
import MedicineCard from '../components/MedicineCard';
import { useTranslation } from '../utils/translations';

export default function MedicineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [analogs, setAnalogs] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tavsif');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const navigateLightbox = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  // Sync selectedImageIndex with the primary image when medicine loads
  useEffect(() => {
    if (medicine) {
      const idx = (medicine.images || []).findIndex((img) => img.isPrimary);
      setSelectedImageIndex(Math.max(0, idx));
    }
  }, [medicine?.id]);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const [res, analogRes] = await Promise.all([
          api.get(`/medicines/${id}`),
          api.get(`/medicines/${id}/analogs`),
        ]);
        setMedicine(res.data);
        setAnalogs(analogRes.data.data || []);
      } catch (error) {
        console.error('Error fetching medicine details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  if (loading) {
    return <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">{t('loading')}</div>;
  }

  if (!medicine) {
    return <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">{t('notFound')}</div>;
  }

  const images = medicine.images || [];

  const tabs = [
    { id: 'tavsif', label: t('tabDescription') },
    { id: 'qollash', label: t('tabUsage') },
    { id: 'dozalash', label: t('tabDosage') },
    { id: 'qarshi', label: t('tabContraindications') },
    { id: 'yon', label: t('tabSideEffects') },
    { id: 'saqlash', label: t('tabStorage') },
  ];

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span>{t('back')}</span>
        </button>

        {/* Top Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8 transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
            {/* Image Gallery */}
            <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-700 p-6 lg:p-8 flex flex-col items-center justify-center gap-4 transition-colors duration-300">
              {/* Main Image */}
              <div
                className="relative w-full max-w-md aspect-square flex items-center justify-center bg-white/60 dark:bg-slate-600/60 rounded-2xl cursor-pointer group overflow-hidden"
                onClick={() => openLightbox(selectedImageIndex)}
              >
                <img
                  src={getImageUrl(images[selectedImageIndex]?.url)}
                  alt={medicine.name}
                  className="max-h-full max-w-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-slate-700 p-2.5 rounded-full shadow-lg">
                    <Expand size={22} />
                  </div>
                </div>
                {images.length > 1 && (
                  <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 w-full overflow-x-auto pb-1 justify-center flex-wrap">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === selectedImageIndex
                          ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(img.url)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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
                    <span>{t('prescriptionRequired')}</span>
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
                  <span className="font-semibold block text-slate-800">{t('activeSubstance')}</span> 
                  {medicine.activeSubstance}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <span className="block text-sm text-slate-400 mb-1">{t('price')}</span>
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
                  <span className="block text-sm text-slate-400 mb-1">{t('availability')}</span>
                  <span className={`text-lg font-bold ${medicine.quantityInStock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {medicine.quantityInStock > 0 ? t('inStock') : t('outOfStock')}
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
                <h3 className="text-xl font-bold text-slate-800 mb-4">{t('aboutMedicine')}</h3>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{medicine.description || t('noData')}</p>
                
                {medicine.details?.pharmacologicalGroup && (
                  <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100 inline-block">
                    <span className="font-semibold text-slate-800 block mb-1">{t('pharmacologicalGroup')}</span>
                    <span className="text-slate-600">{medicine.details.pharmacologicalGroup}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'qollash' && (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{t('usageTitle')}</h3>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{medicine.usage?.usageAreas || t('noData')}</p>
              </div>
            )}

            {activeTab === 'dozalash' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{t('dosageTitle')}</h3>
                  <ul className="space-y-4">
                    <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="block text-sm font-semibold text-blue-600 mb-1">{t('howToUse')}</span>
                      <span className="text-slate-700">{medicine.usage?.howToUse || "-"}</span>
                    </li>
                    <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="block text-sm font-semibold text-blue-600 mb-1">{t('dailyDose')}</span>
                      <span className="text-slate-700">{medicine.usage?.timesPerDay || "-"}</span>
                    </li>
                    <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="block text-sm font-semibold text-blue-600 mb-1">{t('withMeal')}</span>
                      <span className="text-slate-700">{medicine.usage?.beforeOrAfterMeal || "-"}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{t('dosageTitle')}</h3>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="block font-bold text-slate-800 mb-2">{t('adultDosage')}</span>
                      <p className="text-slate-600">{medicine.usage?.adultDosage || "-"}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="block font-bold text-slate-800 mb-2">{t('childDosage')}</span>
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
                  <span>{t('contraindicationsTitle')}</span>
                </h3>
                {medicine.contraindications?.conditions ? (
                  <ul className="list-disc list-inside space-y-2 text-slate-600 bg-red-50 p-6 rounded-2xl border border-red-100">
                    {JSON.parse(medicine.contraindications.conditions).map((cond: string, i: number) => (
                      <li key={i}>{cond}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">{t('noData')}</p>
                )}
              </div>
            )}

            {activeTab === 'yon' && (
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
                  <AlertCircle className="text-yellow-500" />
                  <span>{t('sideEffectsTitle')}</span>
                </h3>
                {medicine.sideEffects?.effects ? (
                  <ul className="list-disc list-inside space-y-2 text-slate-600 bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                    {JSON.parse(medicine.sideEffects.effects).map((eff: string, i: number) => (
                      <li key={i}>{eff}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">{t('noData')}</p>
                )}
              </div>
            )}

            {activeTab === 'saqlash' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-sm text-slate-400 mb-2">{t('temperature')}</span>
                  <span className="font-bold text-slate-800">{medicine.storage?.temperature || "-"}</span>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-sm text-slate-400 mb-2">{t('humidity')}</span>
                  <span className="font-bold text-slate-800">{medicine.storage?.humidity || "-"}</span>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-sm text-slate-400 mb-2">{t('light')}</span>
                  <span className="font-bold text-slate-800">{medicine.storage?.light || "-"}</span>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-sm text-slate-400 mb-2">{t('shelfLife')}</span>
                  <span className="font-bold text-blue-600">{medicine.storage?.shelfLife || "-"}</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Muqobil (Analog) Dorilar Section */}
        {analogs.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-2xl font-bold text-slate-800">{t('analogsTitle')}</h3>
              <p className="text-sm text-slate-500">
                {t('analogsDesc')} (<span className="font-bold text-slate-700">{medicine.activeSubstance}</span>)
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {analogs.map((item) => (
                <MedicineCard key={item.id} medicine={item} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Image Lightbox */}
      {isLightboxOpen && images.length > 0 && (
        <ImageLightbox
          images={images}
          currentIndex={selectedImageIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </div>
  );
}
