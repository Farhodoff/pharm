import { useState } from 'react';
import { Lock, Save } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Yangi parollar mos kelmadi');
      return;
    }

    try {
      await api.post('/admin/update-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Parol muvaffaqiyatli o\'zgartirildi');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        toast.error('Joriy parol xato');
      } else {
        toast.error('Xatolik yuz berdi');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Lock size={20} className="text-blue-600" />
            Parolni o'zgartirish
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Joriy parol</label>
            <input 
              type="password" 
              name="currentPassword" 
              value={passwords.currentPassword}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-blue-500"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yangi parol</label>
            <input 
              type="password" 
              name="newPassword" 
              value={passwords.newPassword}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-blue-500"
              required 
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yangi parolni tasdiqlang</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-blue-500"
              required 
              minLength={6}
            />
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <button 
              type="submit"
              className="flex items-center justify-center space-x-2 w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              <Save size={18} />
              <span>Saqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
