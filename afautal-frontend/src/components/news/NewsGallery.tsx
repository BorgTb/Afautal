"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface NewsGalleryImage {
  url: string;
  alt?: string | null;
  type?: "image" | "video";
}

interface NewsGalleryProps {
  images: NewsGalleryImage[];
}

export default function NewsGallery({ images }: NewsGalleryProps) {
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasManyImages = images.length > 1;
  const currentImage = images[currentIndex] ?? images[0];

  if (!currentImage) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!hasManyImages) return;
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!hasManyImages) return;
    touchEndXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (!hasManyImages) return;

    const startX = touchStartXRef.current;
    const endX = touchEndXRef.current;

    if (startX === null || endX === null) return;

    const SWIPE_THRESHOLD = 42;
    const deltaX = startX - endX;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    if (deltaX > 0) {
      handleNext();
      return;
    }

    handlePrev();
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <div className="relative flex h-[240px] w-full items-center justify-center overflow-hidden bg-slate-50 sm:h-[320px] lg:h-[400px]">
        {currentImage.type === "video" ? (
          <video
            key={currentImage.url}
            src={currentImage.url || "/hero-noticia.mp4"}
            className="h-full w-full animate-[gallery-fade_0.35s_ease-out] object-contain"
            controls
            autoPlay
            muted
          />
        ) : (
          <img
            key={currentImage.url}
            src={currentImage.url}
            alt={currentImage.alt ?? "Imagen de la noticia"}
            className="h-full w-full animate-[gallery-fade_0.35s_ease-out] object-contain"
          />
        )}

        {hasManyImages && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Ver imagen anterior"
              className="absolute left-1 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg transition-all duration-200 hover:border-slate-300 hover:text-[#BF0F0F] sm:left-2"
            >
              <ChevronLeft className="h-7 w-7" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Ver imagen siguiente"
              className="absolute right-1 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg transition-all duration-200 hover:border-slate-300 hover:text-[#BF0F0F] sm:right-2"
            >
              <ChevronRight className="h-7 w-7" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {hasManyImages && (
        <p className="mt-3 text-center text-sm text-slate-500">
          {currentIndex + 1} / {images.length}
        </p>
      )}
    </div>
  );
}