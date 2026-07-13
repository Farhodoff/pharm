import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Search as SearchIcon, Moon, Sun, Menu, X } from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { searchQuery, setSearchQuery } = useSearchStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const navLinks = [
    { name: 'Bosh sahifa', path: '/' },
    { name: 'Kategoriyalar', path: '/search' },
    { name: 'Chegirmalar', path: '/search?discount=true' },
    { name: 'Yangi dorilar', path: '/search?latest=true' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200' : 'bg-white'
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Pill className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">BIO NEX <span className="text-blue-600">STAR</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative w-64">
          <input
            type="text"
            placeholder="Dori izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <SearchIcon className="absolute left-3 text-slate-400" size={18} />
        </form>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-4 shadow-lg absolute w-full">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Dori izlash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500"
            />
            <SearchIcon className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </form>
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-600 p-2 hover:bg-slate-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center space-x-2 text-slate-600"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span>Tungi rejim</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
