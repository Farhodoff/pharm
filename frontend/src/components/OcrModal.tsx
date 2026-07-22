import { useState } from 'react';
import { X, UploadCloud, Search, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../utils/format';
import { getImageUrl } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from '../utils/translations';

interface OcrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OcrModal({ isOpen, onClose }: OcrModalProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<{
    extractedText: string;
    detectedKeywords: string[];
    medicines: any[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResults(null);
    }
  };

  const handleScan = async () => {
    if (!file) {
      toast.error(t('noImage'));
      return;
    }

    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/ocr/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResults(res.data);
      if (!res.data.medicines || res.data.medicines.length === 0) {
        toast.error(t('noMedicineFoundToast'));
      } else {
        toast.success(`${res.data.medicines.length} ${t('matchSuccessToast')}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(t('ocrErrorToast'));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <Sparkles size={22} className="text-yellow-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('ocrTitle')}</h3>
              <p className="text-xs text-blue-100">{t('ocrSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Upload Area */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 bg-slate-50 transition-colors relative cursor-pointer group">
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            {preview ? (
              <div className="relative w-full max-h-48 rounded-xl overflow-hidden flex justify-center bg-black/5">
                <img src={preview} alt="Retsept" className="max-h-48 object-contain" />
              </div>
            ) : (
              <div className="text-center py-4">
                <UploadCloud size={48} className="mx-auto text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-slate-700">{t('uploadPrompt')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('uploadFormat')}</p>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {scanning ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{t('scanning')}</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>{t('scanBtn')}</span>
                </>
              )}
            </button>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {results.extractedText && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('extractedText')}</h4>
                  <p className="text-xs text-slate-700 font-mono bg-white p-2.5 rounded-xl border border-slate-200 line-clamp-3">{results.extractedText}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span>{t('foundMatches')}</span>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold">{results.medicines.length} {t('matchesCount')}</span>
                </h4>

                {results.medicines.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">{t('noMedicines')}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.medicines.map((m: any) => (
                      <Link
                        key={m.id}
                        to={`/medicine/${m.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-blue-500 hover:shadow-md bg-white transition-all group"
                      >
                        <img src={getImageUrl(m.images?.[0]?.url)} alt={m.name} className="w-12 h-12 object-cover rounded-xl bg-slate-50 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600">{m.name}</h5>
                          <p className="text-xs text-slate-400 truncate">{m.activeSubstance || m.category?.name}</p>
                          <p className="text-xs font-bold text-blue-600 mt-0.5">{formatPrice(m.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
