'use client';

import { useState, useEffect, useCallback } from 'react';

interface ImageGalleryProps {
  images: { url: string }[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Nếu không có ảnh, return null hoặc placeholder
  if (!images || images.length === 0) {
    return (
      <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500 font-medium rounded-2xl">
        Chưa có hình ảnh
      </div>
    );
  }

  // Hàm mở Lightbox
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    // Khóa cuộn trang web khi mở ảnh
    document.body.style.overflow = 'hidden';
  };

  // Hàm đóng Lightbox
  const closeLightbox = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Next / Prev logic
  const showNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const showPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // Bắt sự kiện bàn phím (Mũi tên + ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showNext, showPrev]);

  return (
    <>
      {/* --- GRID LAYOUT (3 ẢNH) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] rounded-2xl overflow-hidden shadow-sm">
        {/* Ảnh 1: Lớn nhất (Chiếm 3/4) */}
        <div 
          className="md:col-span-3 relative group cursor-pointer h-full"
          onClick={() => openLightbox(0)}
        >
          <img 
            src={images[0].url} 
            alt="Main Property" 
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
        </div>

        {/* Cột bên phải: Chứa ảnh 2 và 3 */}
        <div className="hidden md:flex flex-col gap-2 h-full">
          {/* Ảnh 2 */}
          {images[1] && (
            <div 
              className="relative h-1/2 cursor-pointer group overflow-hidden"
              onClick={() => openLightbox(1)}
            >
              <img 
                src={images[1].url} 
                alt="Sub 1" 
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105" 
              />
            </div>
          )}

          {/* Ảnh 3 (Hoặc lớp phủ nếu còn nhiều ảnh) */}
          {images[2] && (
            <div 
              className="relative h-1/2 cursor-pointer group overflow-hidden"
              onClick={() => openLightbox(2)}
            >
              <img 
                src={images[2].url} 
                alt="Sub 2" 
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105" 
              />
              
              {/* Nếu có nhiều hơn 3 ảnh -> Hiện lớp phủ +Số lượng */}
              {images.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl backdrop-blur-[2px] transition hover:bg-black/70">
                  +{images.length - 3} ảnh
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- LIGHTBOX (MODAL ZOOM) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Nút đóng (X) */}
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Nút Prev (<) */}
          <button 
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            className="absolute left-4 md:left-10 text-white/70 hover:text-white z-50 p-3 bg-white/10 rounded-full hover:bg-white/20 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Ảnh chính trong Lightbox */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-20">
            <img 
              src={images[currentIndex].url} 
              alt="Full view" 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-sm animate-in zoom-in-95 duration-300"
            />
            
            {/* Bộ đếm số trang (1/5) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-4 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Nút Next (>) */}
          <button 
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            className="absolute right-4 md:right-10 text-white/70 hover:text-white z-50 p-3 bg-white/10 rounded-full hover:bg-white/20 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}