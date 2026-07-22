import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowRight, Loader2, Calendar, Newspaper } from 'lucide-react';
import api from '../services/api';
import type { Article } from '../types';
import { useTranslation } from '../utils/translations';

export default function Blog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.get('/articles?published=true&limit=20');
        setArticles(res.data.data);
      } catch (error) {
        console.error('Fetch blog error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-center">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {t('blogTag')}
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">
              {t('blogTitle')}
            </h1>
            <p className="text-blue-100 text-sm md:text-base">
              {t('blogSubtitle')}
            </p>
          </div>
        </div>

        {/* Article Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <Newspaper size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">{t('noArticles')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art) => (
              <article
                key={art.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {art.image && (
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {new Date(art.createdAt).toLocaleDateString('uz-UZ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={13} />
                        {art.views} {t('views')}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                      {art.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>

                  <Link
                    to={`/blog/${art.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:text-blue-700 pt-2"
                  >
                    <span>{t('readMore')}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
