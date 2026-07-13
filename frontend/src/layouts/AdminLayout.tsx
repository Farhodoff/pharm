import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Pill, Tags } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

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
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-700">
          <span className="text-blue-500">BIO NEX STAR</span> Admin
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {menu.map((item) => (
            <Link
              key={item.name}
              to={item.path}
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
      <main className="flex-grow flex flex-col">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            {menu.find(m => m.path === location.pathname)?.name || 'Admin Panel'}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">Admin xush kelibsiz!</span>
            <Link to="/" className="text-sm text-blue-600 hover:underline">Saytga qaytish</Link>
          </div>
        </header>
        <div className="p-6 flex-grow overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
