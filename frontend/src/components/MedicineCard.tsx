import { Link } from 'react-router-dom';
import { Tag, Building2, ExternalLink } from 'lucide-react';
import { formatPrice } from '../utils/format';
import type { Medicine } from '../types';
import { getImageUrl } from '../types';

interface MedicineProps {
  medicine: Medicine;
}

export default function MedicineCard({ medicine }: MedicineProps) {
  const primaryImage = medicine.images?.find((img) => img.isPrimary)?.url;
  const imageUrl = getImageUrl(primaryImage);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group flex flex-col h-full relative">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {medicine.discountPrice && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            CHEGIRMA
          </span>
        )}
        {medicine.prescriptionRequired && (
          <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            RETSEPT
          </span>
        )}
        {medicine.ageLimit && (
          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {medicine.ageLimit}
          </span>
        )}
      </div>

      {/* Image */}
      <div className="h-48 w-full bg-slate-50 p-6 relative overflow-hidden flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={medicine.name} 
          className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
          <Tag size={12} />
          <span>{medicine.category?.name || 'Kategoriya'}</span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
          {medicine.name}
        </h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {medicine.internationalName || medicine.activeSubstance}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
          <div>
            {medicine.discountPrice ? (
              <>
                <span className="text-xs text-slate-400 line-through block">{formatPrice(medicine.price)}</span>
                <span className="text-lg font-bold text-blue-600">{formatPrice(medicine.discountPrice)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-slate-800 block mt-4">{formatPrice(medicine.price)}</span>
            )}
          </div>
          <Link
            to={`/medicine/${medicine.id}`}
            className="flex items-center justify-center bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white p-2.5 rounded-xl transition-colors"
            title="Batafsil"
          >
            <ExternalLink size={18} />
          </Link>
        </div>
        
        {medicine.manufacturer && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-4">
            <Building2 size={12} />
            <span className="truncate">{medicine.manufacturer.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
