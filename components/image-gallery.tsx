"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export function ImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const openFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFullscreen(true);
  };

  const closeFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFullscreen(false);
  };

  if (images.length === 0) {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div
          className="relative aspect-[16/10] w-full bg-muted group cursor-pointer overflow-hidden"
          onClick={openFullscreen}
        >
          <div className="relative w-full h-full">
            <Image
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1} of ${images.length}`}
              fill
              className={`object-contain transition-opacity duration-300 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              priority={currentIndex === 0}
              loading={currentIndex === 0 ? "eager" : "lazy"}
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious(e);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext(e);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={openFullscreen}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10 cursor-pointer"
            aria-label="View fullscreen"
          >
            <ZoomIn className="h-5 w-5" />
          </button>

          {/* Photo Counter */}
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentIndex(idx);
                    setTimeout(() => setIsTransitioning(false), 300);
                  }
                }}
                className={`relative flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 transition-all ${
                  idx === currentIndex
                    ? "border-primary scale-105"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          {/* Close Button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-50 cursor-pointer"
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation in Fullscreen */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-50 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-50 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Fullscreen Image */}
          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              fill
              className={`object-contain transition-opacity duration-300 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
              sizes="100vw"
            />
          </div>

          {/* Photo Counter in Fullscreen */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
