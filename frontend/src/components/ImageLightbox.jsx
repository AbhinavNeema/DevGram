import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageLightbox = ({ images = [], activeIndex = 0, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (activeIndex === null || activeIndex === undefined || activeIndex < 0 || !images || images.length === 0) {
    return null;
  }

  const currentItem = images[activeIndex];
  const currentUrl = typeof currentItem === 'string' ? currentItem : currentItem?.url;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-50 border border-white/10 hover:scale-105"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev?.();
          }}
          aria-label="Previous image"
          className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-50 border border-white/10 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          aria-label="Next image"
          className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-50 border border-white/10 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Image container */}
      <div
        className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentUrl}
          alt={`Preview ${activeIndex + 1}`}
          className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
        />

        {images.length > 1 && (
          <div className="mt-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-300">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
