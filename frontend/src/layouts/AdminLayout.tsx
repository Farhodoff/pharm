import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Pill, Tags, Menu, X, Factory, PackageSearch, ShoppingCart, Users, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function AdminLayout() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    { name: 'Medicines', path: '/admin/medicines', icon: <Pill size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <Tags size={20} /> },
    { name: 'Manufacturers', path: '/admin/manufacturers', icon: <Factory size={20} /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <PackageSearch size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Customers', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 text-2xl font-bold border-b border-slate-700 flex justify-between items-center">
          <div><span className="text-blue-500">BIO NEX STAR</span> Admin</div>
          <button className="md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {menu.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-slate-300 hover:text-white p-3 w-full rounded-lg hover:bg-red-600/20 transition-colors"
          >
            <LogOut size={20} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 md:px-6 justify-between">
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden text-slate-600 hover:text-slate-900"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 hidden sm:block">
              {menu.find(m => m.path === location.pathname)?.name || 'Admin Panel'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500 hidden sm:block">Admin xush kelibsiz!</span>
            <Link to="/" className="text-sm text-blue-600 hover:underline">Saytga qaytish</Link>
          </div>
        </header>
        <div className="p-4 md:p-6 flex-grow overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
