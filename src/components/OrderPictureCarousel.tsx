import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Plus, Image as ImageIcon } from 'lucide-react';

interface OrderPictureCarouselProps {
  images?: string[];
  title?: string;
  compact?: boolean;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  className?: string;
  allowZoom?: boolean;
  allowUpload?: boolean;
  onAddImage?: (url: string) => void;
  onRemoveImage?: (index: number) => void;
  onImageClick?: (index: number) => void;
}

export function OrderPictureCarousel({
  images = [],
  title = 'Order Render',
  compact = false,
  aspectRatio = 'video',
  className = '',
  allowZoom = true,
  allowUpload = false,
  onAddImage,
  onRemoveImage,
  onImageClick
}: OrderPictureCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showAddUrlInput, setShowAddUrlInput] = useState(false);

  const safeImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
  ];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handleImageAreaClick = (e: React.MouseEvent) => {
    if (allowZoom) {
      e.stopPropagation();
      setIsLightboxOpen(true);
    }
    if (onImageClick) {
      onImageClick(currentIndex);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImageUrl.trim() && onAddImage) {
      onAddImage(newImageUrl.trim());
      setNewImageUrl('');
      setShowAddUrlInput(false);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'wide': return 'aspect-[21/9]';
      case 'auto': return 'h-48';
      case 'video':
      default:
        return compact ? 'aspect-[16/10]' : 'aspect-video';
    }
  };

  return (
    <>
      <div className={`relative group/carousel overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur-md ${className}`}>
        {/* Main Image Container */}
        <div 
          onClick={handleImageAreaClick}
          className={`relative w-full ${getAspectClass()} cursor-pointer select-none overflow-hidden flex items-center justify-center bg-zinc-950`}
        >
          <img 
            src={safeImages[currentIndex]} 
            alt={`${title} - view ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Liquid Glass Subtle Indicators - No big arrows, no distracting hover overlays */}
          {safeImages.length > 1 && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 z-10 select-none pointer-events-auto"
            >
              {safeImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex 
                      ? 'w-4 bg-[#ff943c]' 
                      : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Invisible click targets on left and right edges for effortless browsing without distracting arrows */}
          {safeImages.length > 1 && (
            <>
              <div 
                onClick={handlePrev}
                className="absolute left-0 top-0 bottom-0 w-1/4 cursor-w-resize z-10"
                title="Previous photo"
              />
              <div 
                onClick={handleNext}
                className="absolute right-0 top-0 bottom-0 w-1/4 cursor-e-resize z-10"
                title="Next photo"
              />
            </>
          )}

          {allowZoom && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 text-white/70 hover:text-white backdrop-blur-md border border-white/15 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 flex items-center justify-center shadow-sm"
              title="Expand image"
            >
              <Maximize2 size={11} />
            </button>
          )}
        </div>

        {/* Thumbnail Strip (only for non-compact or modal view) */}
        {!compact && safeImages.length > 1 && (
          <div className="flex items-center gap-1.5 p-2 bg-black/40 backdrop-blur-md border-t border-white/10 overflow-x-auto scrollbar-none">
            {safeImages.map((img, idx) => (
              <button
                type="button"
                key={idx}
                onClick={(e) => handleThumbnailClick(e, idx)}
                className={`relative shrink-0 w-12 h-10 rounded-lg overflow-hidden border transition-all ${
                  idx === currentIndex 
                    ? 'border-[#ff943c] ring-1 ring-[#ff943c]' 
                    : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}

            {allowUpload && onAddImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddUrlInput(!showAddUrlInput);
                }}
                className="shrink-0 w-12 h-10 rounded-lg border border-dashed border-white/20 hover:border-[#ff943c] flex items-center justify-center text-zinc-400 hover:text-white transition-colors bg-white/5"
                title="Add Image URL"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        )}

        {/* Inline URL Add input */}
        {showAddUrlInput && allowUpload && onAddImage && (
          <form onSubmit={handleAddUrl} className="p-2 border-t border-white/10 bg-black/60 backdrop-blur-md flex gap-2">
            <input 
              type="url"
              placeholder="Paste CAD image link..."
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              className="flex-1 bg-white/5 border border-white/15 px-2.5 py-1 text-xs text-white rounded-lg focus:outline-none focus:border-[#ff943c]"
            />
            <button 
              type="submit" 
              className="px-3 py-1 bg-[#ff943c] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#ffaa55]"
            >
              Add
            </button>
          </form>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
            <span className="text-xs font-mono text-zinc-400">
              {currentIndex + 1} of {safeImages.length}
            </span>
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div 
            className="relative max-w-5xl max-h-[80vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={safeImages[currentIndex]} 
              alt={title} 
              className="max-w-full max-h-[78vh] object-contain rounded-lg border border-zinc-800 shadow-2xl"
            />

            {safeImages.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/90 text-white hover:bg-[#ff943c] transition-colors border border-zinc-800 shadow-xl"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/90 text-white hover:bg-[#ff943c] transition-colors border border-zinc-800 shadow-xl"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnail Strip */}
          {safeImages.length > 1 && (
            <div 
              className="mt-4 flex items-center gap-2 max-w-xl overflow-x-auto p-2 bg-zinc-900/80 rounded-xl border border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {safeImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-14 h-14 shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                    idx === currentIndex ? 'border-[#ff943c] scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
