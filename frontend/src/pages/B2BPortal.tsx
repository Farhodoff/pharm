import { useState } from 'react';
import { Building2, CheckCircle2, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '../utils/translations';

export default function B2BPortal() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    companyName: '',
    tin: '',
    contactName: '',
    phone: '',
    address: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success(t('b2bSuccessMsg'));
  };

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl space-y-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {t('b2bTag')}
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">
              {t('b2bTitle')}
            </h1>
            <p className="text-blue-100 text-sm md:text-base">
              {t('b2bDesc')}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center shrink-0 w-full md:w-auto">
            <Building2 size={48} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-xl font-black">{t('b2bStatTitle')}</p>
            <p className="text-xs text-blue-200">{t('b2bStatDesc')}</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{t('b2bFeature1Title')}</h3>
            <p className="text-slate-500 text-sm">{t('b2bFeature1Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{t('b2bFeature2Title')}</h3>
            <p className="text-slate-500 text-sm">{t('b2bFeature2Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{t('b2bFeature3Title')}</h3>
            <p className="text-slate-500 text-sm">{t('b2bFeature3Desc')}</p>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 md:p-12 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">{t('b2bFormTitle')}</h2>
            <p className="text-slate-500 text-sm">{t('b2bFormDesc')}</p>
          </div>

          {submitted ? (
            <div className="text-center py-10 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
              <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
              <h3 className="text-xl font-bold text-emerald-900">{t('b2bSuccessTitle')}</h3>
              <p className="text-sm text-emerald-700">{t('b2bSuccessDesc')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('companyName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full border rounded-xl p-3 bg-slate-50 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('tin')}</label>
                  <input
                    type="text"
                    required
                    value={formData.tin}
                    onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                    className="w-full border rounded-xl p-3 bg-slate-50 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('contactName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full border rounded-xl p-3 bg-slate-50 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('phone')}</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998"
                    className="w-full border rounded-xl p-3 bg-slate-50 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('addressInput')}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-xl p-3 bg-slate-50 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-4"
              >
                <span>{t('submitApplication')}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
