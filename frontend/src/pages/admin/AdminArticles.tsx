import { useEffect, useState } from 'react';
import { Newspaper, Plus, Edit2, Trash2, X, Eye, Loader2 } from 'lucide-react';
import api from '../../services/api';
import type { Article } from '../../types';
import toast from 'react-hot-toast';

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    author: 'BIO NEX STAR Farmatsevt',
    published: true,
  });

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/articles?limit=100');
      setArticles(res.data.data);
    } catch {
      toast.error('Maqolalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const openModal = (article?: Article) => {
    if (article) {
      setCurrentArticle(article);
      setFormData({
        title: article.title,
        excerpt: article.excerpt || '',
        content: article.content,
        image: article.image || '',
        author: article.author || 'BIO NEX STAR Farmatsevt',
        published: article.published,
      });
    } else {
      setCurrentArticle(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        author: 'BIO NEX STAR Farmatsevt',
        published: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentArticle) {
        await api.put(`/articles/${currentArticle.id}`, formData);
        toast.success('Maqola yangilandi');
      } else {
        await api.post('/articles', formData);
        toast.success('Yangi maqola e\'lon qilindi');
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Rostdan ham maqolani o'chirmoqchimisiz?")) {
      try {
        await api.delete(`/articles/${id}`);
        toast.success('Maqola o\'chirildi');
        fetchArticles();
      } catch {
        toast.error('O\'chirishda xatolik');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-xl">
            <Newspaper size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tibbiy Blog CMS (SEO Maqolalar)</h3>
            <p className="text-xs text-slate-500">Google va Yandex SEO trafigini oshirish uchun professional maqolalar</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 shrink-0"
        >
          <Plus size={18} />
          <span>Yangi maqola yozish</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sarlavha</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Muallif</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ko'rishlar</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Holati</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Yuklanmoqda...</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400">Hozircha maqolalar mavjud emas</td></tr>
            ) : (
              articles.map((art) => (
                <tr key={art.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-slate-800 text-sm">{art.title}</div>
                    <div className="text-xs text-slate-400 truncate max-w-sm">{art.excerpt}</div>
                  </td>
                  <td className="p-4 text-xs text-slate-600">{art.author}</td>
                  <td className="p-4 text-xs text-slate-600 flex items-center gap-1">
                    <Eye size={14} className="text-slate-400" />
                    <span>{art.views}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${art.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {art.published ? 'Faol' : 'Qoralama'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button onClick={() => openModal(art)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(art.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">{currentArticle ? 'Maqolani tahrirlash' : 'Yangi maqola yaratish'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Maqola sarlavhasi *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full border rounded-xl p-3 bg-slate-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qisqa tavsif (Excerpt) *</label>
                <textarea rows={2} value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} required className="w-full border rounded-xl p-3 bg-slate-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Maqola matni (HTML / Plaintext) *</label>
                <textarea rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required className="w-full border rounded-xl p-3 bg-slate-50 font-mono text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rasm URL (ixtiyoriy)</label>
                  <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." className="w-full border rounded-xl p-3 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Muallif</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full border rounded-xl p-3 bg-slate-50" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="pub" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="w-5 h-5 text-blue-600 rounded" />
                <label htmlFor="pub" className="text-sm font-semibold text-slate-700">Chop etish (Saytda ko'rinadi)</label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 rounded-xl font-medium text-slate-700">Bekor qilish</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">Saqlash va chop etish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
