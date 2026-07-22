import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Search from './pages/Search';
import MedicineDetail from './pages/MedicineDetail';
import Blog from './pages/Blog';
import ArticleDetail from './pages/ArticleDetail';
import B2BPortal from './pages/B2BPortal';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMedicines from './pages/admin/AdminMedicines';
import AdminCategories from './pages/admin/AdminCategories';
import AdminManufacturers from './pages/admin/AdminManufacturers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminArticles from './pages/admin/AdminArticles';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

import { LanguageContext, translations } from './utils/translations';
import type { Language } from './utils/translations';

function App() {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved as Language) || 'uz';
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('app_lang', l);
  };

  const t = (key: keyof typeof translations['uz']) => {
    return translations[lang]?.[key] || translations['uz'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="medicine/:id" element={<MedicineDetail />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<ArticleDetail />} />
            <Route path="b2b" element={<B2BPortal />} />
          </Route>

          {/* Admin Login (no layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="medicines" element={<AdminMedicines />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="manufacturers" element={<AdminManufacturers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </LanguageContext.Provider>
  );
}

export default App;
