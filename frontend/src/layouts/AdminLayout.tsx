import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import {
  LogOut, LayoutDashboard, Pill, Tags, Menu, X, Factory,
  PackageSearch, ShoppingCart, Users, Settings, Search,
  ChevronLeft, ChevronRight, History, Newspaper,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    return saved === 'true';
  });

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Save collapse state
  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Dorilar', path: '/admin/medicines', icon: <Pill size={20} /> },
    { name: 'Kategoriyalar', path: '/admin/categories', icon: <Tags size={20} /> },
    { name: 'Ishlab chiqar.', path: '/admin/manufacturers', icon: <Factory size={20} /> },
    { name: 'Omborxona', path: '/admin/inventory', icon: <PackageSearch size={20} /> },
    { name: 'Buyurtmalar', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'SEO Blog CMS', path: '/admin/articles', icon: <Newspaper size={20} /> },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: <History size={20} /> },
    { name: 'Foydalanuvchilar', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Sozlamalar', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out md:static ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Sidebar bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-r-2xl shadow-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between border-b border-white/10 ${
            isCollapsed ? 'p-4' : 'p-5'
          }`}>
            {isCollapsed ? (
              <div className="w-full text-center">
                <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                  <Pill className="text-white" size={20} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/30">
                    <Pill className="text-white" size={22} />
                  </div>
                  <div className="leading-tight">
                    <span className="text-lg font-bold text-white">BIO NEX</span>
                    <span className="text-lg font-bold text-blue-400"> STAR</span>
                    <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Admin Panel</p>
                  </div>
                </div>
                <button
                  className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X size={20} />
                </button>
              </>
            )}
          </div>

          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-20 z-20 w-6 h-6 bg-white border border-slate-300 rounded-full items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-500 shadow-md transition-all"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Navigation */}
          <nav className="flex-grow p-3 space-y-1 overflow-y-auto overflow-x-hidden mt-2">
            {menu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-xl transition-all duration-200 ${
                    isCollapsed ? 'p-3 justify-center' : 'p-3'
                  } ${
                    isActive
                      ? 'bg-blue-600/20 text-white shadow-sm border border-blue-500/20'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                  title={item.name}
                >
                  <div className={`shrink-0 transition-transform duration-200 ${
                    isActive ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-white'
                  }`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-6 bg-blue-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className={`border-t border-white/10 ${isCollapsed ? 'p-3' : 'p-4'}`}>
            {!isCollapsed && (
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Administrator</p>
                  <p className="text-[11px] text-slate-400 truncate">SuperAdmin</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 text-slate-400 hover:text-red-400 p-3 w-full rounded-xl hover:bg-red-500/10 transition-all duration-200 group ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Chiqish"
            >
              <LogOut size={18} className="group-hover:scale-110 transition-transform" />
              {!isCollapsed && <span className="text-sm font-medium">Chiqish</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center px-4 md:px-6 justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">
              {menu.find(m => m.path === location.pathname)?.name || 'Admin Panel'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Search size={14} />
              Saytga qaytish
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 flex-grow overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
