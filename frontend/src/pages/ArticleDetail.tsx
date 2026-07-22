import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, User, Share2, Loader2 } from 'lucide-react';
import api from '../services/api';
import type { Article } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from '../utils/translations';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      try {
        const res = await api.get(`/articles/${slug}`);
        setArticle(res.data);
      } catch (error) {
        console.error('Fetch article error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('articleCopied'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-slate-800">{t('articleNotFound')}</h2>
        <Link to="/blog" className="text-blue-600 font-bold mt-4 inline-block">{t('backToBlog')}</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={18} />
          <span>{t('backToAllArticles')}</span>
        </Link>

        <article className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-slate-100 pb-4 text-xs md:text-sm text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <User size={16} className="text-blue-600" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  {new Date(article.createdAt).toLocaleDateString('uz-UZ')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={16} />
                  {article.views} {t('views')}
                </span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors"
              >
                <Share2 size={14} />
                <span>{t('share')}</span>
              </button>
            </div>
          </div>

          {article.image && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-[450px]">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div
            className="prose prose-blue max-w-none text-slate-800 leading-relaxed text-base md:text-lg space-y-4"
            dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
          />
        </article>
      </div>
    </div>
  );
}
