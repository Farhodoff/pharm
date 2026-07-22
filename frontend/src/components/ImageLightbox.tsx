import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../types';

interface LightboxImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const currentImage = images[currentIndex];
  const totalImages = images.length;
  const hasMultiple = totalImages > 1;

  const goNext = useCallback(() => {
    if (currentIndex < totalImages - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, totalImages, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          if (hasMultiple) goNext();
          break;
        case 'ArrowLeft':
          if (hasMultiple) goPrev();
          break;
      }
    };
    document.addEventListener('keydown', handler);
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev, hasMultiple]);

  // Handle click outside image to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 backdrop-blur-sm"
        aria-label="Yopish"
      >
        <X size={24} />
      </button>

      {/* Counter */}
      {hasMultiple && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {totalImages}
        </div>
      )}

      {/* Previous button */}
      {hasMultiple && currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 backdrop-blur-sm"
          aria-label="Oldingi rasm"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Next button */}
      {hasMultiple && currentIndex < totalImages - 1 && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 backdrop-blur-sm"
          aria-label="Keyingi rasm"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center p-4">
        <img
          src={getImageUrl(currentImage.url)}
          alt=""
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 select-none"
          draggable={false}
        />
      </div>

      {/* Thumbnail strip at bottom */}
      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => onNavigate(idx)}
              className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? 'border-white scale-110 shadow-lg'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <img
                src={getImageUrl(img.url)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
