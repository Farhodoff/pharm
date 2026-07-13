import { Pill, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Pill className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">BIO NEX <span className="text-blue-600">STAR</span></span>
          </Link>
          <p className="text-slate-500 mt-4 leading-relaxed">
            Eng ishonchli va sifatli farmasevtika mahsulotlari haqida to'liq ma'lumotlar bazasi. Sog'ligingiz o'z qo'lingizda.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tezkor havolalar</h3>
          <ul className="space-y-3">
            <li><Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors">Bosh sahifa</Link></li>
            <li><Link to="/search" className="text-slate-500 hover:text-blue-600 transition-colors">Barcha dorilar</Link></li>
            <li><Link to="/search?discount=true" className="text-slate-500 hover:text-blue-600 transition-colors">Chegirmalar</Link></li>
            <li><Link to="/search?latest=true" className="text-slate-500 hover:text-blue-600 transition-colors">Yangi kelganlar</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Bog'lanish</h3>
          <ul className="space-y-3 text-slate-500">
            <li className="flex items-center space-x-3">
              <Phone size={18} className="text-blue-600" />
              <span>+998 90 123 45 67</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={18} className="text-blue-600" />
              <span>info@bionexstar.uz</span>
            </li>
            <li className="flex items-start space-x-3">
              <MapPin size={18} className="text-blue-600 mt-1 shrink-0" />
              <span>Toshkent shahar, Yunusobod tumani, Amir Temur ko'chasi 108-uy</span>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Ijtimoiy tarmoqlar</h3>
          <div className="flex space-x-4">
            <a href="#" className="bg-slate-100 p-3 rounded-full text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="bg-slate-100 p-3 rounded-full text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a href="#" className="bg-slate-100 p-3 rounded-full text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} BIO NEX STAR. Barcha huquqlar himoyalangan.</p>
        <div className="space-x-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-blue-600">Maxfiylik siyosati</a>
          <a href="#" className="hover:text-blue-600">Foydalanish shartlari</a>
        </div>
      </div>
    </footer>
  );
}
