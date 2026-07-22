import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Search as SearchIcon, Moon, Sun, Menu, X, Sparkles, Globe, Building2, Newspaper } from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';
import SearchSuggestions from './SearchSuggestions';
import OcrModal from './OcrModal';
import { useTranslation } from '../utils/translations';
import type { Language } from '../utils/translations';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark_mode');
    return saved === 'true';
  });

  const { lang, setLang, t } = useTranslation();
  const { searchQuery, setSearchQuery, setIsSuggestionsOpen, isSuggestionsOpen, addRecentSearch, logSearch } = useSearchStore();
  const navigate = useNavigate();
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(searchQuery);
  };

  const doSearch = (query: string) => {
    if (query.trim()) {
      addRecentSearch(query);
      logSearch(query);
      setIsSuggestionsOpen(false);
      navigate(`/search?q=${query}`);
    }
  };

  const navLinks = [
    { name: 'Bosh sahifa', path: '/' },
    { name: 'Kategoriyalar', path: '/search' },
    { name: 'Chegirmalar', path: '/search?discount=true' },
    { name: 'Blog', path: '/blog', icon: <Newspaper size={15} /> },
    { name: 'B2B Portal', path: '/b2b', icon: <Building2 size={15} /> },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
        }`}
      >
        {/* ── TOP BAR: Logo + Search + Lang + Dark Mode ── */}
        <div className="border-b border-slate-100">
          <div className="container mx-auto px-4 h-14 flex items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Pill className="text-white" size={22} />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">
                BIO NEX <span className="text-blue-600">STAR</span>
              </span>
            </Link>

            {/* Search Bar — fills remaining space on desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative flex-1 max-w-xl mx-auto">
              <input
                ref={desktopSearchRef}
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSuggestionsOpen(true);
                }}
                onFocus={() => setIsSuggestionsOpen(true)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
              <SearchIcon className="absolute left-3.5 text-slate-400" size={16} />
              {isSuggestionsOpen && (
                <SearchSuggestions
                  inputRef={desktopSearchRef}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSearch={doSearch}
                />
              )}
            </form>

            {/* Right-side actions: Lang + Dark mode (desktop only) */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 rounded-full px-1.5 py-1 text-xs font-bold text-slate-700">
                <Globe size={13} className="mr-1 text-slate-400" />
                {(['uz', 'ru', 'en'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-1.5 py-0.5 rounded-full uppercase transition-all ${
                      lang === l ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            {/* Mobile/Tablet Menu Button */}
            <button
              className="lg:hidden ml-auto p-2 text-slate-600 shrink-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ── BOTTOM BAR: Navigation + OCR Button (desktop only) ── */}
        <div className="hidden lg:block border-b border-slate-50">
          <div className="container mx-auto px-4 h-10 flex items-center justify-between">
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-slate-600 hover:text-blue-600 font-medium text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
            </nav>

            {/* OCR Button */}
            <button
              onClick={() => setIsOcrOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border border-indigo-200 whitespace-nowrap"
              title="Retseptdan / Rasmdan qidiruv"
            >
              <Sparkles size={14} className="text-indigo-600" />
              <span>Rasmdan izlash</span>
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                ref={mobileSearchRef}
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSuggestionsOpen(true);
                }}
                onFocus={() => setIsSuggestionsOpen(true)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 text-sm"
              />
              <SearchIcon className="absolute left-3 top-3 text-slate-400" size={18} />
              {isSuggestionsOpen && (
                <SearchSuggestions
                  inputRef={mobileSearchRef}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSearch={doSearch}
                />
              )}
            </form>

            {/* Mobile OCR Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsOcrOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md"
            >
              <Sparkles size={16} />
              <span>{t('ocrBtn')}</span>
            </button>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-slate-600 p-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Lang + Dark Mode */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center bg-slate-100 rounded-full px-2 py-1 text-xs font-bold text-slate-700">
                <Globe size={14} className="mr-1 text-slate-400" />
                {(['uz', 'ru', 'en'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-0.5 rounded-full uppercase transition-all ${
                      lang === l ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center space-x-2 text-slate-600 text-sm font-medium"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{isDarkMode ? 'Yorug\' rejim' : 'Tungi rejim'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* OCR Prescription Search Modal */}
      <OcrModal isOpen={isOcrOpen} onClose={() => setIsOcrOpen(false)} />
    </>
  );
}
